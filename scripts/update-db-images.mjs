import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kxouhgcqzigpxhhkvbjw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4b3VoZ2NxemlncHhoaGt2Ymp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEyODIzMSwiZXhwIjoyMDkxNzA0MjMxfQ.9YIU44aXDxcbFwoomFEOFMWCs12-PF8t-Ni_RnMF4RU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BASE = 'https://kxouhgcqzigpxhhkvbjw.supabase.co/storage/v1/object/public';

const artistImages = {
  'DJ Nova':     `${BASE}/avatars/dj-nova.png`,
  'SoulWave':    `${BASE}/avatars/soulwave.png`,
  'Kai Rhythm':  `${BASE}/avatars/kai-rhythm.png`,
  'Marcus Cole': `${BASE}/avatars/marcus-cole.png`,
  'Maya Blue':   `${BASE}/avatars/maya-blue.png`,
  'Lena Park':   `${BASE}/avatars/lena-park.png`,
  'DJ Spice':    `${BASE}/avatars/dj-spice.png`,
  'King Komedy': `${BASE}/avatars/comedy-king.png`,
};

const eventImages = [
  { keywords: ['R&B', 'RnB', 'Soul', 'Velvet'],  url: `${BASE}/event-images/rnb-night.png` },
  { keywords: ['Karaoke'],                          url: `${BASE}/event-images/karaoke-night.png` },
  { keywords: ['Girls', 'Ladies'],                  url: `${BASE}/event-images/girls-night.png` },
  { keywords: ['Game'],                             url: `${BASE}/event-images/game-night.png` },
  { keywords: ['Comedy'],                           url: `${BASE}/event-images/comedy-show.png` },
  { keywords: ['Jazz'],                             url: `${BASE}/event-images/jazz-evening.png` },
  { keywords: ['Hip Hop', 'Showcase'],              url: `${BASE}/event-images/hip-hop-night.png` },
  { keywords: ['Pool', 'Summer', 'Festival'],       url: `${BASE}/event-images/pool-party.png` },
  { keywords: ['Art', 'Gallery', 'Gala'],           url: `${BASE}/event-images/art-gala.png` },
  { keywords: ['Network', 'Connect', 'Mixer'],      url: `${BASE}/event-images/networking-mixer.png` },
  { keywords: ['Birthday', 'Bash', 'Celebration'],  url: `${BASE}/event-images/birthday-bash.png` },
  { keywords: ['Food', 'Eats', 'Culinary'],         url: `${BASE}/event-images/food-festival.png` },
];

const venueImages = {
  'Velvet':    `${BASE}/venue-images/velvet-room.png`,
  'Skyline':   `${BASE}/venue-images/skyline-rooftop.png`,
  'Creative':  `${BASE}/venue-images/creative-coop.png`,
  'Garden':    `${BASE}/venue-images/garden-pavilion.png`,
  'Grand':     `${BASE}/venue-images/grand-hall.png`,
  'Underground': `${BASE}/venue-images/underground-atl.png`,
};

async function main() {
  console.log('🖼️  Updating database with real image URLs...\n');

  // --- Artists ---
  console.log('🎤 Updating artists...');
  const { data: artists } = await supabase.from('artists').select('id, name, user_id');
  for (const artist of artists || []) {
    const url = artistImages[artist.name];
    if (!url) continue;
    // images is a jsonb array
    const { error } = await supabase.from('artists').update({ images: [url] }).eq('id', artist.id);
    if (error) console.warn(`  ✗ ${artist.name}: ${error.message}`);
    else console.log(`  ✓ ${artist.name}`);

    // Also update profile avatar
    if (artist.user_id) {
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', artist.user_id);
    }
  }

  // --- Events ---
  console.log('\n🎪 Updating events...');
  const { data: events } = await supabase.from('events').select('id, title');
  const usedUrls = new Set();

  for (const event of events || []) {
    const match = eventImages.find(e =>
      e.keywords.some(k => event.title.toLowerCase().includes(k.toLowerCase()))
    );
    const url = match?.url || eventImages[0].url;
    usedUrls.add(url);
    // cover_images is a jsonb array
    const { error } = await supabase.from('events').update({ cover_images: [url] }).eq('id', event.id);
    if (error) console.warn(`  ✗ "${event.title}": ${error.message}`);
    else console.log(`  ✓ "${event.title}"`);
  }

  // --- Venues ---
  console.log('\n🏛️  Updating venues...');
  const { data: venues } = await supabase.from('venues').select('id, name');
  const venueKeys = Object.keys(venueImages);
  for (let i = 0; i < (venues || []).length; i++) {
    const venue = venues[i];
    const key = venueKeys.find(k => venue.name.toLowerCase().includes(k.toLowerCase()));
    const url = key ? venueImages[key] : venueImages[venueKeys[i % venueKeys.length]];
    const { error } = await supabase.from('venues').update({ images: [url] }).eq('id', venue.id);
    if (error) console.warn(`  ✗ "${venue.name}": ${error.message}`);
    else console.log(`  ✓ "${venue.name}"`);
  }

  console.log('\n✅ All done! Images are now live in the database.');
}

main().catch(console.error);
