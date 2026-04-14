import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBookingRequest } from '@/lib/supabase/mutations';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const {
    type,
    requester_id,
    provider_id,
    venue_id,
    artist_id,
    event_name,
    date,
    hours,
    hourly_rate,
    proposed_amount,
    deposit_amount,
    notes,
  } = body;

  if (requester_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!requester_id || !provider_id || !event_name || !date) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const result = await createBookingRequest({
    type,
    requester_id,
    provider_id,
    venue_id,
    artist_id,
    event_name,
    date,
    hours,
    hourly_rate,
    proposed_amount,
    deposit_amount,
    notes,
  });

  if (result.error) {
    return Response.json({ error: 'Failed to create booking' }, { status: 500 });
  }

  return Response.json({ booking: result.data });
}
