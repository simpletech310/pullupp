import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';

const OPENAI_API_KEY = 'REDACTED';
const SUPABASE_URL = 'https://kxouhgcqzigpxhhkvbjw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4b3VoZ2NxemlncHhoaGt2Ymp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEyODIzMSwiZXhwIjoyMDkxNzA0MjMxfQ.9YIU44aXDxcbFwoomFEOFMWCs12-PF8t-Ni_RnMF4RU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function generateImage(prompt, size = '1024x1024') {
  console.log(`  Generating: ${prompt.slice(0, 60)}...`);
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size, quality: 'standard' }),
  });
  const data = await res.json();
  if (!data.data?.[0]?.url) throw new Error(JSON.stringify(data));
  return data.data[0].url;
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function uploadToSupabase(buffer, bucket, filename) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, { contentType: 'image/png', upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

async function ensureBuckets() {
  for (const bucket of ['event-images', 'venue-images', 'avatars']) {
    const { error } = await supabase.storage.createBucket(bucket, { public: true });
    if (error && !error.message.includes('already exists')) {
      console.warn(`Bucket ${bucket}: ${error.message}`);
    }
  }
}

async function generateAndUpload(prompt, bucket, filename, size = '1024x1024') {
  try {
    const imageUrl = await generateImage(prompt, size);
    const buffer = await downloadBuffer(imageUrl);
    const publicUrl = await uploadToSupabase(buffer, bucket, filename);
    console.log(`  ✓ ${filename} → ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error(`  ✗ ${filename}: ${err.message}`);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const artists = [
  {
    id: '00900000-0000-0000-0000-000000000009',
    filename: 'dj-nova.png',
    prompt: 'Professional photo of a stunning Black female DJ performing at a high-end nightclub, hands on turntables, colorful LED lights behind her, wearing stylish sequin outfit, confident expression, bokeh background, shot on Canon 5D, editorial music photography style, photorealistic',
  },
  {
    id: '01000000-0000-0000-0000-000000000010',
    filename: 'soulwave.png',
    prompt: 'Professional music artist photo of a young Black male R&B singer, moody studio lighting, wearing a designer leather jacket, microphone in hand, dramatic shadows, intense expression, album cover quality, photorealistic portrait photography',
  },
  {
    id: '01100000-0000-0000-0000-000000000011',
    filename: 'kai-rhythm.png',
    prompt: 'Professional photo of a young Black male hip hop artist, urban street background at golden hour, wearing Supreme hoodie and gold chain, confident pose, hands in front, shallow depth of field, magazine editorial style, photorealistic',
  },
  {
    id: null,
    filename: 'marcus-cole.png',
    prompt: 'Professional photo of a distinguished Black male jazz musician holding a saxophone, dimly lit jazz club background with warm amber lighting, wearing a tailored suit, soulful expression, performance photography, photorealistic',
  },
  {
    id: null,
    filename: 'maya-blue.png',
    prompt: 'Professional photo of a beautiful Black female R&B singer performing on stage, spotlight on her, wearing a stunning blue sequin gown, singing into a vintage microphone, concert photography, dramatic stage lighting, photorealistic',
  },
  {
    id: null,
    filename: 'lena-park.png',
    prompt: 'Professional headshot of an elegant Korean-American female pop singer, clean studio background, wearing a modern outfit, bright smile, high fashion aesthetic, professional music industry photo, photorealistic portrait',
  },
  {
    id: null,
    filename: 'dj-spice.png',
    prompt: 'Professional photo of a charismatic Latino male DJ at a festival mainstage, massive crowd behind him, wearing streetwear, fists raised, confetti in the air, festival lighting, action shot, photorealistic concert photography',
  },
  {
    id: null,
    filename: 'comedy-king.png',
    prompt: 'Professional photo of a funny Black male stand-up comedian on stage, spotlight on him, laughing audience visible in background, wearing a sharp blazer, microphone in hand, comedy club setting, photorealistic performance photography',
  },
];

const events = [
  {
    filename: 'rnb-night.png',
    size: '1792x1024',
    prompt: 'Stunning professional event flyer for "R&B Night" at an upscale Atlanta nightclub. Deep purple and gold color scheme. Silhouette of couple dancing, rose petals, champagne glasses. Bold stylish typography "R&B NIGHT" in gold. Subtitle "Vibes Only • Every Friday". Atmospheric, sexy, luxurious club aesthetic. Professional graphic design quality.',
  },
  {
    filename: 'karaoke-night.png',
    size: '1792x1024',
    prompt: 'Vibrant professional event flyer for "Karaoke Night" at a trendy bar. Bright neon pink, yellow, and electric blue colors. Microphone graphic, music notes, spotlight beams. Bold playful typography "KARAOKE NIGHT" with "Sing Your Heart Out" tagline. Fun energetic party atmosphere. Professional graphic design.',
  },
  {
    filename: 'girls-night.png',
    size: '1792x1024',
    prompt: 'Glamorous professional event flyer for "Girls Night Out" at an upscale lounge. Hot pink, rose gold, and champagne color scheme. Champagne bottles, stiletto heels, flowers, luxury elements. Elegant cursive typography "Girls Night Out" with "No Boys Allowed" tagline. Chic, luxurious, feminine aesthetic. Professional graphic design.',
  },
  {
    filename: 'game-night.png',
    size: '1792x1024',
    prompt: 'Fun professional event flyer for "Game Night" at a social lounge. Electric blue, orange, and bright green colors. Playing cards, dice, game controllers, trivia elements. Bold blocky typography "GAME NIGHT" with "Play Win Repeat" tagline. Competitive fun social energy. Professional graphic design.',
  },
  {
    filename: 'comedy-show.png',
    size: '1792x1024',
    prompt: 'Bold professional event flyer for "Comedy Night Live" at a comedy club. Deep red, gold, and black color scheme. Laughing comedy mask graphic, spotlight beams, microphone silhouette. Strong typography "COMEDY NIGHT LIVE" with "Laugh Until It Hurts" tagline. Professional entertainment flyer design.',
  },
  {
    filename: 'jazz-evening.png',
    size: '1792x1024',
    prompt: 'Sophisticated professional event flyer for "Jazz & Wine Evening" at an upscale venue. Deep navy blue, gold, and ivory color scheme. Saxophone silhouette, wine glass, musical notes, Art Deco design elements. Elegant typography "JAZZ & WINE" with "An Evening of Soul" tagline. Refined, classy aesthetic. Professional graphic design.',
  },
  {
    filename: 'hip-hop-night.png',
    size: '1792x1024',
    prompt: 'Hype professional event flyer for "Hip Hop Night" at an Atlanta club. Black, red, and gold color scheme. Graffiti-style design elements, city skyline silhouette, crown graphic. Bold urban typography "HIP HOP NIGHT" with "ATL Stand Up" tagline. Street culture, powerful energy. Professional graphic design.',
  },
  {
    filename: 'pool-party.png',
    size: '1792x1024',
    prompt: 'Vibrant professional event flyer for a Summer Pool Party at a luxury Atlanta hotel. Turquoise, coral, and bright yellow color scheme. Palm trees, inflatable flamingos, sunglasses, tropical elements. Bold summer typography "POOL PARTY" with "Summer Vibes Only" tagline. Fun tropical luxury aesthetic. Professional graphic design.',
  },
  {
    filename: 'art-gala.png',
    size: '1792x1024',
    prompt: 'Elegant professional event flyer for "Art Gala Opening Night" at a contemporary gallery. Black, white, and gold color scheme. Abstract art brushstrokes, gallery frame elements, champagne glasses. Sophisticated serif typography "ART GALA" with "Opening Night" tagline. High-end art world aesthetic. Professional graphic design.',
  },
  {
    filename: 'networking-mixer.png',
    size: '1792x1024',
    prompt: 'Professional event flyer for "Professional Networking Mixer" for Black professionals in Atlanta. Navy blue, gold, and white color scheme. Handshake graphic, city skyline, clean geometric design. Modern typography "NETWORKING MIXER" with "Connect Grow Thrive" tagline. Professional corporate but vibrant. Clean graphic design.',
  },
  {
    filename: 'birthday-bash.png',
    size: '1792x1024',
    prompt: 'Celebration professional event flyer for a "Birthday Bash" nightclub event. Black, gold, and hot pink color scheme. Confetti, balloons, birthday cake, champagne explosion. Festive bold typography "BIRTHDAY BASH" with "The Turn Up Starts Here" tagline. Party energy, luxury celebration. Professional graphic design.',
  },
  {
    filename: 'food-festival.png',
    size: '1792x1024',
    prompt: 'Vibrant professional event flyer for "ATL Food Festival" outdoor event. Warm orange, green, and cream color scheme. Delicious food photography collage, chef hat, fork and knife graphics. Appetizing typography "ATL FOOD FESTIVAL" with "Eat Drink Celebrate" tagline. Appetizing, festive, community energy. Professional graphic design.',
  },
];

const venues = [
  {
    filename: 'velvet-room.png',
    prompt: 'Professional interior photography of an upscale nightclub called The Velvet Room. Deep red velvet booths, crystal chandeliers, dark wood bar with backlit bottles, dance floor with dynamic LED lighting, intimate VIP areas, sophisticated and sensual atmosphere. High-end nightclub interior design. Photorealistic.',
  },
  {
    filename: 'skyline-rooftop.png',
    prompt: 'Professional photography of a stunning rooftop bar lounge in Atlanta at dusk. City skyline panoramic view, modern furniture, string lights creating warm ambiance, bar area with colorful cocktails, well-dressed guests socializing, infinity edge feel. Premium rooftop venue. Photorealistic.',
  },
  {
    filename: 'creative-coop.png',
    prompt: 'Professional interior photography of a modern creative event space and art gallery. Industrial chic design with exposed brick, gallery white walls with contemporary art, flexible open floor plan, warm Edison bulb lighting, wooden floors, creative community space feel. Photorealistic.',
  },
  {
    filename: 'garden-pavilion.png',
    prompt: 'Professional photography of a beautiful outdoor garden event pavilion in Atlanta. Lush greenery, string lights hanging overhead, elegant white pavilion structure, floral arrangements, bistro seating area, romantic golden hour lighting, outdoor wedding and event venue feel. Photorealistic.',
  },
  {
    filename: 'grand-hall.png',
    prompt: 'Professional interior photography of a grand elegant ballroom event venue. Soaring ceilings with ornate chandeliers, marble floors, floor-to-ceiling windows with draping curtains, round banquet tables with white linens and centerpieces, warm sophisticated lighting. Black tie event venue. Photorealistic.',
  },
  {
    filename: 'underground-atl.png',
    prompt: 'Professional interior photography of a trendy underground Atlanta club and live music venue. Exposed concrete walls with colorful murals, intimate stage area, bar with neon signs, eclectic furniture, intimate red lighting, urban cultural hub feel. Live music venue. Photorealistic.',
  },
];

async function updateDatabase(urls) {
  console.log('\n📦 Updating database with image URLs...');

  // Update artist avatar_url
  const artistUpdates = [
    { filename: 'dj-nova.png', name: 'DJ Nova' },
    { filename: 'soulwave.png', name: 'SoulWave' },
    { filename: 'kai-rhythm.png', name: 'Kai Rhythm' },
    { filename: 'marcus-cole.png', name: 'Marcus Cole' },
    { filename: 'maya-blue.png', name: 'Maya Blue' },
    { filename: 'lena-park.png', name: 'Lena Park' },
    { filename: 'dj-spice.png', name: 'DJ Spice' },
    { filename: 'comedy-king.png', name: 'King Komedy' },
  ];

  for (const { filename, name } of artistUpdates) {
    const url = urls[filename];
    if (!url) continue;
    const { error } = await supabase.from('artists').update({ avatar_url: url }).eq('name', name);
    if (error) console.warn(`  Artist ${name}: ${error.message}`);
    else console.log(`  ✓ Artist ${name} avatar updated`);
  }

  // Update event cover images
  const eventUpdates = [
    { filename: 'rnb-night.png', keywords: ['R&B', 'RnB', 'Soul'] },
    { filename: 'karaoke-night.png', keywords: ['Karaoke'] },
    { filename: 'girls-night.png', keywords: ['Girls', 'Ladies'] },
    { filename: 'game-night.png', keywords: ['Game'] },
    { filename: 'comedy-show.png', keywords: ['Comedy'] },
    { filename: 'jazz-evening.png', keywords: ['Jazz'] },
    { filename: 'hip-hop-night.png', keywords: ['Hip Hop', 'Hiphop'] },
    { filename: 'pool-party.png', keywords: ['Pool', 'Summer'] },
    { filename: 'art-gala.png', keywords: ['Art', 'Gallery', 'Gala'] },
    { filename: 'networking-mixer.png', keywords: ['Network', 'Professional', 'Mixer'] },
    { filename: 'birthday-bash.png', keywords: ['Birthday', 'Bash', 'Celebration'] },
    { filename: 'food-festival.png', keywords: ['Food', 'Festival', 'Culinary'] },
  ];

  const { data: allEvents } = await supabase.from('events').select('id, title');
  if (allEvents) {
    for (const { filename, keywords } of eventUpdates) {
      const url = urls[filename];
      if (!url) continue;
      const match = allEvents.find(e => keywords.some(k => e.title.toLowerCase().includes(k.toLowerCase())));
      if (match) {
        const { error } = await supabase.from('events').update({ cover_image_url: url }).eq('id', match.id);
        if (error) console.warn(`  Event ${match.title}: ${error.message}`);
        else console.log(`  ✓ Event "${match.title}" cover updated`);
      }
    }
    // Distribute remaining event images to events without covers
    const { data: uncovered } = await supabase.from('events').select('id, title').is('cover_image_url', null);
    const eventUrls = Object.entries(urls).filter(([k]) => eventUpdates.some(e => e.filename === k)).map(([, v]) => v);
    if (uncovered) {
      for (let i = 0; i < uncovered.length; i++) {
        const url = eventUrls[i % eventUrls.length];
        await supabase.from('events').update({ cover_image_url: url }).eq('id', uncovered[i].id);
        console.log(`  ✓ Event "${uncovered[i].title}" cover set`);
      }
    }
  }

  // Update venue images
  const venueUpdates = [
    { filename: 'velvet-room.png', name: 'The Velvet Room' },
    { filename: 'skyline-rooftop.png', name: 'Skyline Rooftop' },
    { filename: 'creative-coop.png', name: 'Creative Co-Op' },
    { filename: 'garden-pavilion.png', name: 'Garden Pavilion' },
    { filename: 'grand-hall.png', name: 'The Grand Hall' },
    { filename: 'underground-atl.png', name: 'Underground ATL' },
  ];

  for (const { filename, name } of venueUpdates) {
    const url = urls[filename];
    if (!url) continue;
    const { error } = await supabase.from('venues').update({ cover_image_url: url }).ilike('name', `%${name.split(' ')[1]}%`);
    if (error) console.warn(`  Venue ${name}: ${error.message}`);
    else console.log(`  ✓ Venue ${name} image updated`);
  }

  // Also update profile avatars for artists
  for (const { filename, name } of artistUpdates) {
    const url = urls[filename];
    if (!url) continue;
    const { data: artist } = await supabase.from('artists').select('user_id').eq('name', name).single();
    if (artist?.user_id) {
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', artist.user_id);
      console.log(`  ✓ Profile avatar updated for ${name}`);
    }
  }
}

async function main() {
  console.log('🎨 PullUpp Image Generator\n');
  await ensureBuckets();
  console.log('✓ Storage buckets ready\n');

  const urls = {};

  // Generate artist photos
  console.log('📸 Generating artist photos...');
  for (const artist of artists) {
    const url = await generateAndUpload(artist.prompt, 'avatars', artist.filename);
    if (url) urls[artist.filename] = url;
    await sleep(2000);
  }

  // Generate event flyers
  console.log('\n🎪 Generating event flyers...');
  for (const event of events) {
    const url = await generateAndUpload(event.prompt, 'event-images', event.filename, event.size);
    if (url) urls[event.filename] = url;
    await sleep(2000);
  }

  // Generate venue photos
  console.log('\n🏛️  Generating venue photos...');
  for (const venue of venues) {
    const url = await generateAndUpload(venue.prompt, 'venue-images', venue.filename);
    if (url) urls[venue.filename] = url;
    await sleep(2000);
  }

  // Update database
  await updateDatabase(urls);

  console.log('\n✅ Done! All images generated and database updated.');
  console.log('\nGenerated URLs:');
  for (const [k, v] of Object.entries(urls)) {
    console.log(`  ${k}: ${v}`);
  }
}

main().catch(console.error);
