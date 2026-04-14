import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kxouhgcqzigpxhhkvbjw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4b3VoZ2NxemlncHhoaGt2Ymp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEyODIzMSwiZXhwIjoyMDkxNzA0MjMxfQ.9YIU44aXDxcbFwoomFEOFMWCs12-PF8t-Ni_RnMF4RU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const accounts = [
  {
    email: 'artist@pullupp.com',
    password: 'PullUpp2024!',
    name: 'Maya Blue',
    role: 'artist',
    avatar_url: 'https://kxouhgcqzigpxhhkvbjw.supabase.co/storage/v1/object/public/avatars/maya-blue.png',
  },
  {
    email: 'venue@pullupp.com',
    password: 'PullUpp2024!',
    name: 'Jordan Reeves',
    role: 'venue_owner',
    avatar_url: null,
  },
  {
    email: 'organizer@pullupp.com',
    password: 'PullUpp2024!',
    name: 'Taylor Knox',
    role: 'organizer',
    avatar_url: null,
  },
];

async function main() {
  console.log('👤 Creating test accounts...\n');

  for (const account of accounts) {
    console.log(`Creating ${account.role}: ${account.email}`);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { name: account.name, role: account.role },
    });

    if (authError) {
      console.error(`  ✗ Auth error: ${authError.message}`);
      // Try to find existing user
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', account.email)
        .single();
      if (existing) {
        console.log(`  → User exists, updating role to ${account.role}`);
        await supabase.from('profiles').update({
          role: account.role,
          name: account.name,
          ...(account.avatar_url ? { avatar_url: account.avatar_url } : {}),
        }).eq('id', existing.id);
        console.log(`  ✓ Updated\n`);
      }
      continue;
    }

    const userId = authData.user.id;
    console.log(`  ✓ Auth user created: ${userId}`);

    // Update profile with correct role (trigger creates it as 'guest' from metadata sometimes)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: account.role,
        name: account.name,
        ...(account.avatar_url ? { avatar_url: account.avatar_url } : {}),
        onboarding_complete: true,
      })
      .eq('id', userId);

    if (profileError) {
      // Profile may not exist yet if trigger didn't fire, insert it
      const { error: insertError } = await supabase.from('profiles').insert({
        id: userId,
        email: account.email,
        name: account.name,
        role: account.role,
        avatar_color_index: Math.floor(Math.random() * 8),
        ...(account.avatar_url ? { avatar_url: account.avatar_url } : {}),
        onboarding_complete: true,
      });
      if (insertError) console.error(`  ✗ Profile error: ${insertError.message}`);
      else console.log(`  ✓ Profile inserted`);
    } else {
      console.log(`  ✓ Profile updated with role: ${account.role}`);
    }

    // For artist role, create an artist record
    if (account.role === 'artist') {
      const { error: artistError } = await supabase.from('artists').insert({
        user_id: userId,
        name: account.name,
        type: 'Singer',
        genre: ['R&B', 'Soul'],
        bio: 'Soulful vocalist from Atlanta bringing R&B vibes to every stage.',
        flat_rate: 500,
        pricing_mode: 'flat',
        images: ['https://kxouhgcqzigpxhhkvbjw.supabase.co/storage/v1/object/public/avatars/maya-blue.png'],
        gradient_index: 2,
        is_active: true,
      });
      if (artistError && !artistError.message.includes('duplicate')) {
        console.error(`  ✗ Artist record: ${artistError.message}`);
      } else {
        console.log(`  ✓ Artist record created`);
      }
    }

    // For venue_owner, create a venue record
    if (account.role === 'venue_owner') {
      const { error: venueError } = await supabase.from('venues').insert({
        owner_id: userId,
        name: 'The Loft ATL',
        type: 'Loft',
        capacity: 150,
        standing_capacity: 150,
        seated_capacity: 80,
        address: '456 Peachtree St NE',
        city: 'Atlanta',
        state: 'GA',
        zip: '30308',
        hourly_rate: 200,
        pricing_mode: 'hourly',
        images: ['https://kxouhgcqzigpxhhkvbjw.supabase.co/storage/v1/object/public/venue-images/creative-coop.png'],
        gradient_index: 1,
        amenities: ['WiFi', 'Sound System', 'Bar', 'Parking'],
        is_active: true,
      });
      if (venueError && !venueError.message.includes('duplicate')) {
        console.error(`  ✗ Venue record: ${venueError.message}`);
      } else {
        console.log(`  ✓ Venue record created`);
      }
    }

    console.log();
  }

  console.log('✅ Done!\n');
  console.log('─────────────────────────────────');
  console.log('TEST ACCOUNTS');
  console.log('─────────────────────────────────');
  for (const a of accounts) {
    console.log(`${a.role.toUpperCase().replace('_', ' ')}`);
    console.log(`  Email:    ${a.email}`);
    console.log(`  Password: ${a.password}`);
    console.log();
  }
}

main().catch(console.error);
