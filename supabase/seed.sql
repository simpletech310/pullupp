-- PullUpp Seed Data
-- Run with: PGPASSWORD='...' psql -h db.xxx.supabase.co -p 5432 -U postgres -d postgres -f supabase/seed.sql
-- Idempotent: uses ON CONFLICT DO NOTHING throughout

BEGIN;

-- ═══════════════════════════════════════════
-- Temporarily disable FK from profiles -> auth.users
-- ═══════════════════════════════════════════
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- ═══════════════════════════════════════════
-- PROFILES (8 users)
-- ═══════════════════════════════════════════
INSERT INTO profiles (id, name, email, role, avatar_color_index, onboarding_complete) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin User',      'admin@pullupp.com',    'superadmin',  0, true),
  ('00000000-0000-0000-0000-000000000002', 'Marcus Thompson', 'marcus@pullupp.com',   'organizer',   1, true),
  ('00000000-0000-0000-0000-000000000003', 'Sarah Chen',      'sarah@pullupp.com',    'venue_owner', 2, true),
  ('00000000-0000-0000-0000-000000000004', 'DJ Nova',         'djnova@pullupp.com',   'artist',      3, true),
  ('00000000-0000-0000-0000-000000000005', 'Maya Blue',       'maya@pullupp.com',     'artist',      4, true),
  ('00000000-0000-0000-0000-000000000006', 'James Wilson',    'james@pullupp.com',    'guest',       5, true),
  ('00000000-0000-0000-0000-000000000007', 'Tasha Reign',     'tasha@pullupp.com',    'artist',      6, true),
  ('00000000-0000-0000-0000-000000000008', 'Chris Park',      'chris@pullupp.com',    'organizer',   7, true),
  ('00000000-0000-0000-0000-000000000009', 'SoulWave',        'soulwave@pullupp.com', 'artist',      0, true),
  ('00000000-0000-0000-0000-000000000010', 'Kai Rhythm',      'kai@pullupp.com',      'artist',      1, true),
  ('00000000-0000-0000-0000-000000000011', 'Lena Park',       'lena@pullupp.com',     'artist',      2, true)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════
-- VENUES (6)
-- ═══════════════════════════════════════════
INSERT INTO venues (id, owner_id, name, type, capacity, standing_capacity, seated_capacity, sqft, address, city, state, zip, hourly_rate, deposit, cleaning_fee, pricing_mode, rating, review_count, amenities, rules, gradient_index, latitude, longitude) VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003',
   'The Velvet Room', 'Lounge', 300, 300, 150, 3500,
   '123 Peachtree St NE', 'Atlanta', 'GA', '30303',
   200.00, 500.00, 150.00, 'set', 4.7, 42,
   ARRAY['Sound System', 'Stage', 'Bar', 'VIP Section', 'Coat Check', 'Green Room'],
   ARRAY['No smoking indoors', 'Must end by 2am', 'Security required for 100+ guests'],
   0, 33.7490, -84.3880),

  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003',
   'Skyline Rooftop', 'Rooftop', 250, 250, 120, 4000,
   '456 Piedmont Ave NE', 'Atlanta', 'GA', '30308',
   350.00, 750.00, 200.00, 'set', 4.9, 67,
   ARRAY['Open Air', 'City Views', 'Bar', 'Lounge Seating', 'Heaters', 'String Lights'],
   ARRAY['Weather-dependent', 'Noise ordinance after 11pm', 'No glass near railing'],
   1, 33.7725, -84.3655),

  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003',
   'Creative Co-Op', 'Studio', 100, 80, 60, 1800,
   '789 Edgewood Ave SE', 'Atlanta', 'GA', '30312',
   75.00, 150.00, 50.00, 'negotiable', 4.5, 28,
   ARRAY['Projector', 'WiFi', 'Whiteboard', 'Kitchen Access', 'Parking'],
   ARRAY['No open flames', 'Clean up required'],
   2, 33.7537, -84.3715),

  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003',
   'Garden Pavilion', 'Outdoor', 500, 500, 300, 8000,
   '321 Freedom Pkwy', 'Atlanta', 'GA', '30307',
   400.00, 1000.00, 250.00, 'set', 4.8, 53,
   ARRAY['Covered Stage', 'Power Outlets', 'Restrooms', 'Parking Lot', 'Catering Kitchen', 'Garden Lighting'],
   ARRAY['No fireworks', 'Amplified music until 10pm', 'Permit required for 200+ guests'],
   3, 33.7630, -84.3575),

  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003',
   'Studio 54 ATL', 'Event Space', 200, 200, 100, 2800,
   '54 Broad St SW', 'Atlanta', 'GA', '30303',
   250.00, 600.00, 100.00, 'set', 4.6, 35,
   ARRAY['DJ Booth', 'Dance Floor', 'LED Lighting', 'Fog Machine', 'VIP Lounge', 'Photo Booth'],
   ARRAY['21+ after 10pm', 'Dress code enforced', 'No outside drinks'],
   4, 33.7488, -84.3915),

  ('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003',
   'The Grand Hall', 'Hall', 800, 800, 500, 12000,
   '100 Centennial Olympic Park Dr', 'Atlanta', 'GA', '30313',
   500.00, 1500.00, 350.00, 'set', 4.9, 89,
   ARRAY['Grand Stage', 'Orchestra Pit', 'Balcony', 'Full Kitchen', 'Loading Dock', 'Dressing Rooms', 'PA System'],
   ARRAY['Insurance required', 'Load-in by appointment', 'No confetti'],
   5, 33.7605, -84.3930)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════
-- VENUE EXTRAS
-- ═══════════════════════════════════════════
INSERT INTO venue_extras (id, venue_id, name, price, category) VALUES
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'Extra Security Guard', 50.00, 'STAFFING'),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'Premium Sound Package', 150.00, 'EQUIPMENT'),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002', 'Heater Rental', 75.00, 'EQUIPMENT'),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002', 'Photography Package', 200.00, 'SERVICE'),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000004', 'Tent Rental', 300.00, 'EQUIPMENT'),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000004', 'Portable Restrooms', 200.00, 'FACILITY'),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000006', 'Stage Lighting Upgrade', 250.00, 'EQUIPMENT'),
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000006', 'Grand Piano', 100.00, 'EQUIPMENT');

-- ═══════════════════════════════════════════
-- EVENTS (12)
-- ═══════════════════════════════════════════
INSERT INTO events (id, organizer_id, title, description, category, date, start_time, end_time, venue_id, gradient_index, visibility, status, capacity, attendee_count) VALUES
  -- Event 1: Midnight Groove
  ('e0000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000002',
   'Midnight Groove',
   'An electrifying night of house music and deep beats. Featuring top DJs spinning until the early hours. Drink specials all night.',
   'Music', '2026-05-15', '22:00', '03:00',
   'a0000000-0000-0000-0000-000000000001',
   0, 'public', 'published', 300, 87),

  -- Event 2: Laugh Factory Live
  ('e0000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000002',
   'Laugh Factory Live',
   'A hilarious evening of stand-up comedy featuring the hottest comedians from Atlanta and beyond. Two-drink minimum.',
   'Comedy', '2026-05-22', '20:00', '23:00',
   'a0000000-0000-0000-0000-000000000003',
   1, 'public', 'published', 100, 45),

  -- Event 3: Canvas & Cocktails
  ('e0000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000008',
   'Canvas & Cocktails',
   'Sip, paint, and socialize! All supplies included. No experience necessary. Guided painting session with a professional artist.',
   'Art', '2026-05-29', '18:00', '21:00',
   'a0000000-0000-0000-0000-000000000003',
   2, 'public', 'published', 60, 32),

  -- Event 4: Street Eats Festival
  ('e0000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000002',
   'Street Eats Festival',
   'Atlanta''s biggest food truck festival! Over 20 vendors, live music, and family-friendly activities. Rain or shine.',
   'Food', '2026-06-05', '11:00', '20:00',
   'a0000000-0000-0000-0000-000000000004',
   3, 'public', 'published', 500, 210),

  -- Event 5: Tech Connect Mixer
  ('e0000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000008',
   'Tech Connect Mixer',
   'Network with Atlanta''s top tech professionals. Lightning talks, open bar, and plenty of opportunities to connect.',
   'Networking', '2026-06-12', '18:00', '21:00',
   'a0000000-0000-0000-0000-000000000002',
   4, 'public', 'published', 150, 78),

  -- Event 6: Summer Vibes Festival
  ('e0000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000002',
   'Summer Vibes Festival',
   'The ultimate summer music festival featuring multiple stages, art installations, and food vendors. A full day of unforgettable experiences.',
   'Music', '2026-06-20', '12:00', '23:00',
   'a0000000-0000-0000-0000-000000000004',
   5, 'public', 'published', 500, 340),

  -- Event 7: Jazz Under the Stars
  ('e0000000-0000-0000-0000-000000000007',
   '00000000-0000-0000-0000-000000000008',
   'Jazz Under the Stars',
   'An intimate evening of smooth jazz on the rooftop. Craft cocktails and gourmet appetizers included with VIP tickets.',
   'Music', '2026-06-27', '19:00', '23:00',
   'a0000000-0000-0000-0000-000000000002',
   6, 'public', 'published', 200, 125),

  -- Event 8: Hip Hop Showcase
  ('e0000000-0000-0000-0000-000000000008',
   '00000000-0000-0000-0000-000000000002',
   'Hip Hop Showcase',
   'Emerging hip hop artists take the stage for an explosive night of bars, beats, and culture. Hosted by DJ Nova.',
   'Music', '2026-07-03', '21:00', '02:00',
   'a0000000-0000-0000-0000-000000000005',
   7, 'public', 'published', 200, 95),

  -- Event 9: Open Mic Night
  ('e0000000-0000-0000-0000-000000000009',
   '00000000-0000-0000-0000-000000000008',
   'Open Mic Night',
   'Your time to shine! Sign up to perform comedy, poetry, music, or anything creative. Supportive crowd guaranteed.',
   'Comedy', '2026-07-10', '19:00', '22:00',
   'a0000000-0000-0000-0000-000000000003',
   8, 'public', 'published', 80, 28),

  -- Event 10: Gallery Opening
  ('e0000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000008',
   'Gallery Opening',
   'Exclusive opening night for emerging Atlanta artists. Wine reception, artist talks, and live painting demonstrations.',
   'Art', '2026-07-17', '17:00', '21:00',
   'a0000000-0000-0000-0000-000000000003',
   9, 'public', 'published', 100, 55),

  -- Event 11: Wine & Paint
  ('e0000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000002',
   'Wine & Paint',
   'An elevated paint night with premium wines and a professional art instructor. Perfect for date night or girls night out.',
   'Art', '2026-07-24', '18:30', '21:30',
   'a0000000-0000-0000-0000-000000000001',
   10, 'public', 'published', 50, 38),

  -- Event 12: Startup Pitch Night
  ('e0000000-0000-0000-0000-000000000012',
   '00000000-0000-0000-0000-000000000008',
   'Startup Pitch Night',
   'Watch 10 startups pitch to a panel of VCs and angel investors. Networking reception follows. Could you find the next unicorn?',
   'Networking', '2026-07-31', '18:00', '22:00',
   'a0000000-0000-0000-0000-000000000006',
   11, 'public', 'published', 300, 180)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════
-- TICKET TIERS (2-3 per event)
-- ═══════════════════════════════════════════
INSERT INTO ticket_tiers (id, event_id, name, price, perks, quantity, remaining, sort_order) VALUES
  -- Midnight Groove
  ('10000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'General Admission', 25.00, ARRAY['Entry', 'Dance Floor Access'], 200, 140, 0),
  ('10000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'VIP', 60.00, ARRAY['Entry', 'VIP Section', 'Free Drink', 'Skip the Line'], 80, 55, 1),
  ('10000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'VVIP', 120.00, ARRAY['Entry', 'VIP Section', 'Open Bar', 'Meet & Greet', 'Merch Bag'], 20, 12, 2),

  -- Laugh Factory Live
  ('10000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'General Admission', 20.00, ARRAY['Entry', 'Standard Seating'], 70, 35, 0),
  ('10000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002', 'VIP', 45.00, ARRAY['Entry', 'Front Row', 'Free Drink', 'Photo Op'], 30, 20, 1),

  -- Canvas & Cocktails
  ('10000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000003', 'Standard', 35.00, ARRAY['Entry', 'Art Supplies', 'One Cocktail'], 40, 18, 0),
  ('10000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000003', 'Premium', 55.00, ARRAY['Entry', 'Premium Supplies', 'Two Cocktails', 'Take-Home Easel'], 20, 10, 1),

  -- Street Eats Festival
  ('10000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000004', 'General Admission', 10.00, ARRAY['Entry', 'Festival Map'], 400, 230, 0),
  ('10000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000004', 'Tasting Pass', 35.00, ARRAY['Entry', '5 Tasting Vouchers', 'Souvenir Cup'], 80, 50, 1),
  ('10000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000004', 'VIP Foodie', 75.00, ARRAY['Entry', 'Unlimited Tastings', 'Chef Meet & Greet', 'VIP Tent'], 20, 10, 2),

  -- Tech Connect Mixer
  ('10000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000005', 'General', 15.00, ARRAY['Entry', 'One Drink Ticket'], 100, 42, 0),
  ('10000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000005', 'VIP', 40.00, ARRAY['Entry', 'Open Bar', 'Speaker Dinner', 'LinkedIn Premium Trial'], 50, 30, 1),

  -- Summer Vibes Festival
  ('10000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000006', 'General Admission', 45.00, ARRAY['Entry', 'All Stages Access'], 350, 110, 0),
  ('10000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000006', 'VIP', 95.00, ARRAY['Entry', 'VIP Viewing Area', 'Drink Vouchers', 'Fast Lane'], 120, 40, 1),
  ('10000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000006', 'VVIP', 200.00, ARRAY['Entry', 'Backstage Access', 'Open Bar', 'Artist Meet & Greet', 'Gift Bag'], 30, 10, 2),

  -- Jazz Under the Stars
  ('10000000-0000-0000-0000-000000000016', 'e0000000-0000-0000-0000-000000000007', 'General', 30.00, ARRAY['Entry', 'Standing Room'], 120, 55, 0),
  ('10000000-0000-0000-0000-000000000017', 'e0000000-0000-0000-0000-000000000007', 'VIP Lounge', 75.00, ARRAY['Entry', 'Reserved Seating', 'Cocktail & Appetizers', 'Complimentary Wine'], 60, 25, 1),
  ('10000000-0000-0000-0000-000000000018', 'e0000000-0000-0000-0000-000000000007', 'Starlight Table', 150.00, ARRAY['Entry', 'Private Table', 'Bottle Service', 'Priority Seating'], 20, 15, 2),

  -- Hip Hop Showcase
  ('10000000-0000-0000-0000-000000000019', 'e0000000-0000-0000-0000-000000000008', 'General Admission', 20.00, ARRAY['Entry', 'Dance Floor'], 150, 75, 0),
  ('10000000-0000-0000-0000-000000000020', 'e0000000-0000-0000-0000-000000000008', 'VIP', 50.00, ARRAY['Entry', 'VIP Section', 'Free Drink', 'Backstage Peek'], 50, 30, 1),

  -- Open Mic Night
  ('10000000-0000-0000-0000-000000000021', 'e0000000-0000-0000-0000-000000000009', 'Audience', 10.00, ARRAY['Entry'], 60, 40, 0),
  ('10000000-0000-0000-0000-000000000022', 'e0000000-0000-0000-0000-000000000009', 'Performer', 5.00, ARRAY['Entry', 'Stage Time', 'Free Drink'], 20, 12, 1),

  -- Gallery Opening
  ('10000000-0000-0000-0000-000000000023', 'e0000000-0000-0000-0000-000000000010', 'General', 15.00, ARRAY['Entry', 'Wine Reception'], 70, 30, 0),
  ('10000000-0000-0000-0000-000000000024', 'e0000000-0000-0000-0000-000000000010', 'Collector VIP', 50.00, ARRAY['Entry', 'Private Viewing', 'Artist Meet & Greet', 'Champagne'], 30, 15, 1),

  -- Wine & Paint
  ('10000000-0000-0000-0000-000000000025', 'e0000000-0000-0000-0000-000000000011', 'Standard', 40.00, ARRAY['Entry', 'Paint Supplies', 'Two Wine Glasses'], 35, 10, 0),
  ('10000000-0000-0000-0000-000000000026', 'e0000000-0000-0000-0000-000000000011', 'Premium', 65.00, ARRAY['Entry', 'Premium Supplies', 'Wine Flight', 'Canvas to Keep'], 15, 7, 1),

  -- Startup Pitch Night
  ('10000000-0000-0000-0000-000000000027', 'e0000000-0000-0000-0000-000000000012', 'General', 20.00, ARRAY['Entry', 'Networking Reception'], 200, 80, 0),
  ('10000000-0000-0000-0000-000000000028', 'e0000000-0000-0000-0000-000000000012', 'Investor VIP', 75.00, ARRAY['Entry', 'Reserved Seating', 'Investor Lounge', 'Deal Flow Access'], 80, 55, 1),
  ('10000000-0000-0000-0000-000000000029', 'e0000000-0000-0000-0000-000000000012', 'Pitcher Pass', 50.00, ARRAY['Entry', 'Pitch Slot', 'Mentorship Session'], 20, 15, 2)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════
-- EVENT ADD-ONS (1-3 per event)
-- ═══════════════════════════════════════════
INSERT INTO event_addons (id, event_id, name, price, type, gradient_index) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Glow Sticks Pack', 5.00, 'merch', 0),
  ('d0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Event T-Shirt', 25.00, 'merch', 1),
  ('d0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 'Comedy Special DVD', 15.00, 'merch', 2),
  ('d0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000003', 'Extra Canvas', 10.00, 'merch', 3),
  ('d0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000003', 'Premium Brush Set', 20.00, 'merch', 4),
  ('d0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000004', 'Foodie Tote Bag', 12.00, 'merch', 5),
  ('d0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000004', 'Extra Tasting Tokens (3)', 10.00, 'food', 6),
  ('d0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000004', 'Festival Poster', 8.00, 'merch', 7),
  ('d0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000006', 'Festival Hat', 18.00, 'merch', 0),
  ('d0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000006', 'Water Bottle', 8.00, 'merch', 1),
  ('d0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000006', 'Meal Voucher', 15.00, 'food', 2),
  ('d0000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000007', 'Jazz Vinyl Record', 22.00, 'merch', 3),
  ('d0000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000008', 'Hip Hop Snapback', 20.00, 'merch', 4),
  ('d0000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000008', 'Artist Mixtape USB', 10.00, 'merch', 5),
  ('d0000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000010', 'Art Print', 30.00, 'merch', 6),
  ('d0000000-0000-0000-0000-000000000016', 'e0000000-0000-0000-0000-000000000011', 'Wine Glass Set', 18.00, 'merch', 7),
  ('d0000000-0000-0000-0000-000000000017', 'e0000000-0000-0000-0000-000000000012', 'Pitch Deck Template', 15.00, 'merch', 0)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════
-- PROMO CODES (for first 3 events)
-- ═══════════════════════════════════════════
INSERT INTO promo_codes (id, event_id, code, discount_type, discount_value, max_uses, used_count, expires_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'PULLUPP', 'percentage', 10.00, 100, 12, '2026-05-15 22:00:00+00'),
  ('b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'EARLYBIRD', 'percentage', 15.00, 50, 8, '2026-05-10 00:00:00+00'),
  ('b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 'PULLUPP', 'percentage', 10.00, 100, 5, '2026-05-22 20:00:00+00'),
  ('b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'EARLYBIRD', 'percentage', 15.00, 50, 3, '2026-05-18 00:00:00+00'),
  ('b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000003', 'PULLUPP', 'percentage', 10.00, 100, 7, '2026-05-29 18:00:00+00'),
  ('b0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000003', 'EARLYBIRD', 'percentage', 15.00, 50, 4, '2026-05-25 00:00:00+00')
ON CONFLICT (event_id, code) DO NOTHING;

-- ═══════════════════════════════════════════
-- ARTISTS (6)
-- ═══════════════════════════════════════════
INSERT INTO artists (id, user_id, name, type, genre, bio, hourly_rate, flat_rate, pricing_mode, rating, review_count, gig_count, follower_count, tip_total, tip_count, songs, gradient_index) VALUES
  ('f0000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000004',
   'DJ Nova', 'DJ', 'House / Electronic',
   'Atlanta''s premier house DJ bringing deep grooves and infectious energy to every set. Residencies at top clubs across the Southeast.',
   150.00, 800.00, 'negotiable', 4.8, 56, 120, 2400, 3200.00, 180,
   ARRAY['Midnight Drive', 'Neon Pulse', 'Bass Cathedral', 'Summer Rain', 'Electric Soul'],
   0),

  ('f0000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000005',
   'Maya Blue', 'Singer', 'R&B / Neo-Soul',
   'Neo-soul vocalist blending vintage warmth with modern production. Featured on NPR Tiny Desk and headlined sold-out shows across Georgia.',
   200.00, 1200.00, 'negotiable', 4.9, 78, 85, 5200, 8500.00, 420,
   ARRAY['Indigo Nights', 'Honey & Gold', 'Velvet Moon', 'Still Waters', 'Bloom'],
   1),

  ('f0000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000007',
   'Tasha Reign', 'Singer', 'Pop / Dance',
   'High-energy pop vocalist and performer known for electrifying live shows. Dance-pop anthems that keep the crowd moving all night.',
   175.00, 1000.00, 'set', 4.7, 45, 65, 3800, 4100.00, 210,
   ARRAY['Crown Me', 'Neon Queen', 'Heartbreak Highway', 'Rise Up', 'Glitter Storm'],
   2),

  ('f0000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000009',
   'SoulWave', 'Band', 'Jazz / Funk',
   'Five-piece jazz funk ensemble bringing the groove to Atlanta since 2019. Influences range from Herbie Hancock to Anderson .Paak.',
   250.00, 1500.00, 'set', 4.8, 62, 95, 1800, 2100.00, 95,
   ARRAY['Riverside Funk', 'Golden Hour', 'City Lights', 'Pocket Change', 'Smooth Operator'],
   3),

  ('f0000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000010',
   'Kai Rhythm', 'Producer / DJ', 'Hip Hop / Trap',
   'Producer and DJ crafting hard-hitting beats with melodic undertones. Credits include placements with major ATL artists.',
   125.00, 700.00, 'negotiable', 4.6, 38, 55, 1500, 1800.00, 88,
   ARRAY['Trap Symphony', 'ATL Nights', 'Bounce Back', 'Street Dreams', 'Drip Season'],
   4),

  ('f0000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000011',
   'Lena Park', 'Singer', 'Acoustic / Indie',
   'Acoustic singer-songwriter with a voice that stops you in your tracks. Intimate performances that feel like a conversation with a friend.',
   100.00, 500.00, 'negotiable', 4.9, 92, 110, 3200, 5600.00, 310,
   ARRAY['Paper Planes', 'Morning Light', 'Wildflower', 'Ghost Town', 'Compass Rose'],
   5)
ON CONFLICT (id) DO NOTHING;

-- Extra inserts below
INSERT INTO profiles (id, name, email, role, avatar_color_index, onboarding_complete) VALUES
  ('00000000-0000-0000-0000-000000000009', 'SoulWave',   'soulwave@pullupp.com',  'artist', 3, true),
  ('00000000-0000-0000-0000-000000000010', 'Kai Rhythm', 'kai@pullupp.com',       'artist', 4, true),
  ('00000000-0000-0000-0000-000000000011', 'Lena Park',  'lena@pullupp.com',      'artist', 5, true)
ON CONFLICT (id) DO NOTHING;

-- Re-insert artists with proper user_ids
INSERT INTO artists (id, user_id, name, type, genre, bio, hourly_rate, flat_rate, pricing_mode, rating, review_count, gig_count, follower_count, tip_total, tip_count, songs, gradient_index) VALUES
  ('f0000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000009',
   'SoulWave', 'Band', 'Jazz / Funk',
   'Five-piece jazz funk ensemble bringing the groove to Atlanta since 2019. Influences range from Herbie Hancock to Anderson .Paak.',
   250.00, 1500.00, 'set', 4.8, 62, 95, 1800, 2100.00, 95,
   ARRAY['Riverside Funk', 'Golden Hour', 'City Lights', 'Pocket Change', 'Smooth Operator'],
   3),

  ('f0000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000010',
   'Kai Rhythm', 'Producer / DJ', 'Hip Hop / Trap',
   'Producer and DJ crafting hard-hitting beats with melodic undertones. Credits include placements with major ATL artists.',
   125.00, 700.00, 'negotiable', 4.6, 38, 55, 1500, 1800.00, 88,
   ARRAY['Trap Symphony', 'ATL Nights', 'Bounce Back', 'Street Dreams', 'Drip Season'],
   4),

  ('f0000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000011',
   'Lena Park', 'Singer', 'Acoustic / Indie',
   'Acoustic singer-songwriter with a voice that stops you in your tracks. Intimate performances that feel like a conversation with a friend.',
   100.00, 500.00, 'negotiable', 4.9, 92, 110, 3200, 5600.00, 310,
   ARRAY['Paper Planes', 'Morning Light', 'Wildflower', 'Ghost Town', 'Compass Rose'],
   5)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════
-- EVENT ARTISTS (junction)
-- ═══════════════════════════════════════════
INSERT INTO event_artists (event_id, artist_id) VALUES
  -- Midnight Groove: DJ Nova, Kai Rhythm
  ('e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000005'),
  -- Summer Vibes Festival: DJ Nova, Maya Blue, Tasha Reign, SoulWave
  ('e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000003'),
  ('e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000004'),
  -- Jazz Under the Stars: SoulWave, Lena Park
  ('e0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000004'),
  ('e0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000006'),
  -- Hip Hop Showcase: DJ Nova, Kai Rhythm
  ('e0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000005'),
  -- Open Mic Night: Lena Park
  ('e0000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000006'),
  -- Gallery Opening: Maya Blue
  ('e0000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000002'),
  -- Wine & Paint: Lena Park (background music)
  ('e0000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000006'),
  -- Street Eats Festival: Tasha Reign, SoulWave
  ('e0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000003'),
  ('e0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000004')
ON CONFLICT (event_id, artist_id) DO NOTHING;

-- ═══════════════════════════════════════════
-- GROUPS (6)
-- ═══════════════════════════════════════════
INSERT INTO groups (id, name, description, category, gradient_index, member_count) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'ATL House Heads',    'For lovers of house, techno, and electronic music in Atlanta. Share events, mixes, and connect with fellow ravers.', 'Music', 0, 142),
  ('c0000000-0000-0000-0000-000000000002', 'Comedy Night Crew',  'Atlanta''s comedy community. Find open mics, shows, and connect with other comedy fans and performers.', 'Comedy', 1, 89),
  ('c0000000-0000-0000-0000-000000000003', 'Foodie Squad',       'Exploring Atlanta''s food scene one bite at a time. Food truck alerts, restaurant reviews, and culinary events.', 'Food', 2, 234),
  ('c0000000-0000-0000-0000-000000000004', 'Art Collective',     'Supporting Atlanta''s visual arts community. Gallery openings, workshops, and artist collaborations.', 'Art', 3, 167),
  ('c0000000-0000-0000-0000-000000000005', 'Tech Networkers',    'Connecting Atlanta''s tech community. Meetups, hackathons, job opportunities, and startup events.', 'Tech', 4, 312),
  ('c0000000-0000-0000-0000-000000000006', 'Live Music Lovers',  'Never miss a live show in Atlanta. Concert alerts, reviews, and a community of music enthusiasts.', 'Music', 5, 428)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════
-- GROUP MEMBERS (seed some members)
-- ═══════════════════════════════════════════
INSERT INTO group_members (group_id, user_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004'),
  ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006'),
  ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006'),
  ('c0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006'),
  ('c0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005'),
  ('c0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000008'),
  ('c0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004'),
  ('c0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005'),
  ('c0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007')
ON CONFLICT (group_id, user_id) DO NOTHING;

-- ═══════════════════════════════════════════
-- Re-add FK from profiles -> auth.users
-- (commented out: enable when linking to real auth users)
-- ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey
--   FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
-- ═══════════════════════════════════════════

COMMIT;
