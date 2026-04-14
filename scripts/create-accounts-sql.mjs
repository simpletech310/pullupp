const PAT = 'sbp_964d13c5b3752a6290317a0d02df8d7ae2f03255';
const PROJECT = 'kxouhgcqzigpxhhkvbjw';

async function sql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (data.message) throw new Error(data.message);
  return data;
}

const accounts = [
  { email: 'artist@pullupp.com',    password: 'PullUpp2024!', name: 'Maya Blue',     role: 'artist',      avatar: 'https://kxouhgcqzigpxhhkvbjw.supabase.co/storage/v1/object/public/avatars/maya-blue.png' },
  { email: 'venue@pullupp.com',     password: 'PullUpp2024!', name: 'Jordan Reeves', role: 'venue_owner', avatar: null },
  { email: 'organizer@pullupp.com', password: 'PullUpp2024!', name: 'Taylor Knox',   role: 'organizer',   avatar: null },
];

async function main() {
  console.log('👤 Creating test accounts via SQL...\n');

  for (const acct of accounts) {
    console.log(`Creating ${acct.role}: ${acct.email}`);
    try {
      const rows = await sql(`
        DO $$
        DECLARE new_id uuid;
        BEGIN
          -- Insert auth user (no ON CONFLICT since email uniqueness is by index)
          INSERT INTO auth.users (
            id, instance_id, email, encrypted_password,
            email_confirmed_at, raw_user_meta_data,
            created_at, updated_at, role, aud,
            confirmation_token, recovery_token, email_change_token_new, email_change
          ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            '${acct.email}',
            crypt('${acct.password}', gen_salt('bf')),
            NOW(),
            '{"name":"${acct.name}","role":"${acct.role}"}'::jsonb,
            NOW(), NOW(), 'authenticated', 'authenticated',
            '', '', '', ''
          )
          ON CONFLICT DO NOTHING
          RETURNING id INTO new_id;

          -- If user already existed, fetch their id
          IF new_id IS NULL THEN
            SELECT id INTO new_id FROM auth.users WHERE email = '${acct.email}';
            UPDATE auth.users
              SET encrypted_password = crypt('${acct.password}', gen_salt('bf')),
                  email_confirmed_at = NOW()
              WHERE id = new_id;
          END IF;

          -- Upsert profile
          INSERT INTO profiles (id, email, name, role, avatar_color_index, onboarding_complete${acct.avatar ? ', avatar_url' : ''})
          VALUES (new_id, '${acct.email}', '${acct.name}', '${acct.role}'::user_role, floor(random()*8)::int, true${acct.avatar ? `, '${acct.avatar}'` : ''})
          ON CONFLICT (id) DO UPDATE SET
            role = '${acct.role}'::user_role,
            name = '${acct.name}',
            onboarding_complete = true
            ${acct.avatar ? `, avatar_url = '${acct.avatar}'` : ''};
        END $$;
      `);
      console.log(`  ✓ Done\n`);
    } catch (err) {
      console.error(`  ✗ ${err.message}\n`);
    }
  }

  // Artist record
  console.log('Creating artist record...');
  try {
    await sql(`
      INSERT INTO artists (user_id, name, type, genre, bio, flat_rate, pricing_mode, images, gradient_index, is_active)
      SELECT p.id, 'Maya Blue', 'Singer', ARRAY['R&B','Soul'],
        'Soulful vocalist from Atlanta.', 500, 'set',
        ARRAY['https://kxouhgcqzigpxhhkvbjw.supabase.co/storage/v1/object/public/avatars/maya-blue.png'],
        2, true
      FROM profiles p WHERE p.email = 'artist@pullupp.com'
      ON CONFLICT (user_id) DO NOTHING;
    `);
    console.log('  ✓ Artist record\n');
  } catch (err) { console.error(`  ✗ ${err.message}\n`); }

  // Venue record
  console.log('Creating venue record...');
  try {
    await sql(`
      INSERT INTO venues (owner_id, name, type, capacity, standing_capacity, seated_capacity,
        address, city, state, zip, hourly_rate, pricing_mode, images, gradient_index, amenities, is_active)
      SELECT p.id, 'The Loft ATL', 'Loft', 150, 150, 80,
        '456 Peachtree St NE', 'Atlanta', 'GA', '30308',
        200, 'set',
        ARRAY['https://kxouhgcqzigpxhhkvbjw.supabase.co/storage/v1/object/public/venue-images/creative-coop.png'],
        1, ARRAY['WiFi','Sound System','Bar','Parking'], true
      FROM profiles p WHERE p.email = 'venue@pullupp.com';
    `);
    console.log('  ✓ Venue record\n');
  } catch (err) { console.error(`  ✗ ${err.message}\n`); }

  console.log('═══════════════════════════════════════');
  console.log('           TEST ACCOUNTS               ');
  console.log('═══════════════════════════════════════');
  for (const a of accounts) {
    console.log(`\n${a.role.toUpperCase().replace('_',' ')}`);
    console.log(`  Email:    ${a.email}`);
    console.log(`  Password: ${a.password}`);
  }
  console.log('\n═══════════════════════════════════════');
}

main().catch(console.error);
