import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ valid: false, reason: 'Unauthorized' }, { status: 401 });

  const { id: eventId } = await params;
  const body = await request.json();
  const { qrCode } = body;

  if (!qrCode) {
    return Response.json({ valid: false, reason: 'Missing QR code' }, { status: 400 });
  }

  const db = createAdminClient();

  // Look up ticket by qr_code UUID
  const { data: ticket, error } = await db
    .from('tickets')
    .select('id, status, event_id, tier:ticket_tiers!tier_id(name), user:profiles!user_id(name, email), order:orders!order_id(customer_email)')
    .eq('qr_code', qrCode)
    .eq('event_id', eventId)
    .single();

  if (error || !ticket) {
    return Response.json({ valid: false, reason: 'Ticket not found' });
  }

  if (ticket.status === 'used') {
    const name = (ticket.user as any)?.name || (ticket.order as any)?.customer_email || 'Guest';
    const tier = (ticket.tier as any)?.name || 'General';
    return Response.json({ valid: false, reason: 'already_used', name, tier });
  }

  if (ticket.status !== 'active') {
    return Response.json({ valid: false, reason: 'Ticket is not active' });
  }

  // Mark ticket as used
  const { error: updateError } = await db
    .from('tickets')
    .update({ status: 'used', checked_in_at: new Date().toISOString() })
    .eq('id', ticket.id);

  if (updateError) {
    console.error('Error checking in ticket:', updateError);
    return Response.json({ valid: false, reason: 'Failed to check in ticket' }, { status: 500 });
  }

  const name = (ticket.user as any)?.name || (ticket.order as any)?.customer_email || 'Guest';
  const tier = (ticket.tier as any)?.name || 'General';

  return Response.json({ valid: true, name, tier, ticketId: ticket.id });
}
