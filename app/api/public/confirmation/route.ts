import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return Response.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    // Fetch Stripe session for payment status and customer info
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    if (session.payment_status !== 'paid') {
      return Response.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const metadata = session.metadata || {};
    const eventId = metadata.event_id;
    const tierId = metadata.tier_id;
    const quantity = parseInt(metadata.quantity || '1', 10);

    if (!eventId) {
      return Response.json({ error: 'Invalid session' }, { status: 400 });
    }

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Fetch event + tier in parallel
    const [eventRes, tierRes] = await Promise.all([
      db.from('events').select(`
        id, title, date, start_time, end_time, gradient,
        venue:venues(name, address, city, state)
      `).eq('id', eventId).single(),
      tierId
        ? db.from('ticket_tiers').select('id, name, price').eq('id', tierId).single()
        : Promise.resolve({ data: null }),
    ]);

    // Check if webhook already created an order
    const { data: order } = await db
      .from('orders')
      .select('id, confirmation_code, quantity, total, customer_email')
      .eq('stripe_checkout_session_id', sessionId)
      .single();

    // Fetch ticket QR codes for this order
    let ticketQrCodes: string[] = [];
    if (order?.id) {
      const { data: tickets } = await db
        .from('tickets')
        .select('qr_code')
        .eq('order_id', order.id);
      if (tickets) ticketQrCodes = tickets.map((t: any) => t.qr_code).filter(Boolean);
    }

    return Response.json({
      event: eventRes.data,
      tier: tierRes.data,
      quantity,
      total: (session.amount_total || 0) / 100,
      customerEmail: session.customer_details?.email || order?.customer_email || null,
      confirmationCode: order?.confirmation_code || null,
      orderId: order?.id || null,
      ticketQrCodes,
      sessionId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
