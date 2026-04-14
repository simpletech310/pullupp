import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '20');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const today = new Date().toISOString().split('T')[0];

  let query = supabase
    .from('events')
    .select(`
      id, title, description, category, date, start_time,
      cover_images, gradient_index, visibility,
      manual_venue_name,
      venue:venues(id, name, address, city),
      ticket_tiers(id, name, price, remaining, quantity)
    `)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(limit);

  if (category && category !== 'All') query = query.eq('category', category);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data || []);
}
