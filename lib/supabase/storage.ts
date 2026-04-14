import { createClient } from './client';

export async function uploadImage(bucket: string, file: File, path: string) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const filePath = `${path}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) return { url: null, error };

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { url: publicUrl, error: null };
}

export async function uploadEventImage(file: File, eventId: string) {
  return uploadImage('event-images', file, eventId);
}

export async function uploadVenueImage(file: File, venueId: string) {
  return uploadImage('venue-images', file, venueId);
}

export async function uploadAvatar(file: File, userId: string) {
  return uploadImage('avatars', file, userId);
}
