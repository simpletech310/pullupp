import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      venue:venues(id, name, type, address, city, state, zip, capacity, amenities, images, gradient_index, hourly_rate),
      ticket_tiers(id, name, price, perks, quantity, remaining, sort_order),
      event_addons(id, name, price, type, gradient_index),
      event_artists(
        artist:artists(id, name, type, genre, bio, images, gradient_index, user_id)
      )
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 404 });
  return Response.json(data);
}
