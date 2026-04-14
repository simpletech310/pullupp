import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createAdminClient();

  const { data, error } = await db
    .from('saved_events')
    .select(`
      id, created_at,
      event:events!event_id(id, title, date, start_time, category, cover_images, gradient_index, manual_venue_name, venue:venues(id, name, address, city))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data || []);
}
