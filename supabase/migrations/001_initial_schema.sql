-- PullUpp Database Schema
-- Supabase PostgreSQL with RLS

-- ═══════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════

CREATE TYPE user_role AS ENUM ('guest', 'organizer', 'venue_owner', 'artist', 'superadmin');
CREATE TYPE event_visibility AS ENUM ('public', 'private', 'invite-only');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE booking_type AS ENUM ('venue', 'artist');
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'declined', 'cancelled', 'completed');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'refunded', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('active', 'used', 'cancelled', 'refunded');
CREATE TYPE pricing_mode AS ENUM ('set', 'negotiable');
CREATE TYPE tip_context AS ENUM ('profile', 'live', 'event');
CREATE TYPE stream_status AS ENUM ('idle', 'active', 'ended');
CREATE TYPE check_in_method AS ENUM ('scan', 'manual');
CREATE TYPE follow_type AS ENUM ('artist', 'venue');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

-- ═══════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
$$;

-- ═══════════════════════════════════════════
-- PROFILES (extends auth.users)
-- ═══════════════════════════════════════════

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'guest',
  avatar_url TEXT,
  avatar_color_index INT NOT NULL DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_connect_id TEXT,
  stripe_connect_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  interests TEXT[] NOT NULL DEFAULT '{}',
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  ban_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Superadmin can update any profile" ON profiles FOR UPDATE USING (is_superadmin());
CREATE POLICY "Superadmin can delete profiles" ON profiles FOR DELETE USING (is_superadmin());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role, avatar_color_index)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'guest'),
    FLOOR(RANDOM() * 8)::INT
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════
-- EVENTS
-- ═══════════════════════════════════════════

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Music',
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  venue_id UUID,
  manual_venue_name TEXT,
  cover_images TEXT[] NOT NULL DEFAULT '{}',
  gradient_index INT NOT NULL DEFAULT 0,
  visibility event_visibility NOT NULL DEFAULT 'public',
  status event_status NOT NULL DEFAULT 'draft',
  capacity INT NOT NULL DEFAULT 100,
  attendee_count INT NOT NULL DEFAULT 0,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurring_pattern TEXT,
  age_restriction TEXT,
  dress_code TEXT,
  social_links JSONB NOT NULL DEFAULT '{}',
  reactions JSONB NOT NULL DEFAULT '{"fire": 0, "heart": 0, "hundred": 0, "clap": 0}',
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  flag_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published events are viewable by everyone" ON events FOR SELECT
  USING (status = 'published' OR organizer_id = auth.uid() OR is_superadmin());
CREATE POLICY "Organizers can create events" ON events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id AND get_user_role() IN ('organizer', 'superadmin'));
CREATE POLICY "Organizers can update own events" ON events FOR UPDATE
  USING (organizer_id = auth.uid() OR is_superadmin());
CREATE POLICY "Organizers can delete own events" ON events FOR DELETE
  USING (organizer_id = auth.uid() OR is_superadmin());

CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════
-- TICKET TIERS
-- ═══════════════════════════════════════════

CREATE TABLE ticket_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  perks TEXT[] NOT NULL DEFAULT '{}',
  quantity INT NOT NULL DEFAULT 100,
  remaining INT NOT NULL DEFAULT 100,
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ticket tiers viewable with event" ON ticket_tiers FOR SELECT USING (true);
CREATE POLICY "Event organizer manages tiers" ON ticket_tiers FOR ALL
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_id AND (events.organizer_id = auth.uid() OR is_superadmin())));

-- ═══════════════════════════════════════════
-- EVENT ADD-ONS
-- ═══════════════════════════════════════════

CREATE TABLE event_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'merch',
  gradient_index INT NOT NULL DEFAULT 0
);

ALTER TABLE event_addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Addons viewable with event" ON event_addons FOR SELECT USING (true);
CREATE POLICY "Event organizer manages addons" ON event_addons FOR ALL
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_id AND (events.organizer_id = auth.uid() OR is_superadmin())));

-- ═══════════════════════════════════════════
-- PROMO CODES
-- ═══════════════════════════════════════════

CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type discount_type NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_uses INT NOT NULL DEFAULT 100,
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  UNIQUE(event_id, code)
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event organizer manages promo codes" ON promo_codes FOR ALL
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_id AND (events.organizer_id = auth.uid() OR is_superadmin())));

-- ═══════════════════════════════════════════
-- VENUES
-- ═══════════════════════════════════════════

CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Event Space',
  capacity INT NOT NULL DEFAULT 100,
  standing_capacity INT,
  seated_capacity INT,
  sqft INT,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Atlanta',
  state TEXT NOT NULL DEFAULT 'GA',
  zip TEXT NOT NULL DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images TEXT[] NOT NULL DEFAULT '{}',
  gradient_index INT NOT NULL DEFAULT 0,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
  cleaning_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  pricing_mode pricing_mode NOT NULL DEFAULT 'set',
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  rules TEXT[] NOT NULL DEFAULT '{}',
  cancellation_policy TEXT,
  deposit_terms TEXT,
  payment_terms TEXT,
  insurance_requirements TEXT,
  has_video_tour BOOLEAN NOT NULL DEFAULT FALSE,
  video_tour_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active venues viewable by everyone" ON venues FOR SELECT
  USING (is_active = TRUE OR owner_id = auth.uid() OR is_superadmin());
CREATE POLICY "Venue owners can create venues" ON venues FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND get_user_role() IN ('venue_owner', 'superadmin'));
CREATE POLICY "Venue owners can update own venues" ON venues FOR UPDATE
  USING (owner_id = auth.uid() OR is_superadmin());
CREATE POLICY "Venue owners can delete own venues" ON venues FOR DELETE
  USING (owner_id = auth.uid() OR is_superadmin());

-- FK from events to venues (deferred since venues created after events)
ALTER TABLE events ADD CONSTRAINT events_venue_id_fkey
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL;

CREATE TRIGGER venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════
-- VENUE EXTRAS
-- ═══════════════════════════════════════════

CREATE TABLE venue_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'OTHER'
);

ALTER TABLE venue_extras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Extras viewable with venue" ON venue_extras FOR SELECT USING (true);
CREATE POLICY "Venue owner manages extras" ON venue_extras FOR ALL
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_id AND (venues.owner_id = auth.uid() OR is_superadmin())));

-- ═══════════════════════════════════════════
-- VENUE AVAILABILITY
-- ═══════════════════════════════════════════

CREATE TABLE venue_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  booking_id UUID,
  UNIQUE(venue_id, date)
);

ALTER TABLE venue_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Availability viewable by everyone" ON venue_availability FOR SELECT USING (true);
CREATE POLICY "Venue owner manages availability" ON venue_availability FOR ALL
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_id AND (venues.owner_id = auth.uid() OR is_superadmin())));

-- ═══════════════════════════════════════════
-- ARTISTS
-- ═══════════════════════════════════════════

CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Musician',
  genre TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  flat_rate DECIMAL(10,2),
  pricing_mode pricing_mode NOT NULL DEFAULT 'set',
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  gig_count INT NOT NULL DEFAULT 0,
  follower_count INT NOT NULL DEFAULT 0,
  tip_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  tip_count INT NOT NULL DEFAULT 0,
  songs TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  gradient_index INT NOT NULL DEFAULT 0,
  is_live BOOLEAN NOT NULL DEFAULT FALSE,
  current_stream_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active artists viewable by everyone" ON artists FOR SELECT
  USING (is_active = TRUE OR user_id = auth.uid() OR is_superadmin());
CREATE POLICY "Artist can update own profile" ON artists FOR UPDATE
  USING (user_id = auth.uid() OR is_superadmin());
CREATE POLICY "Artist users can create artist profile" ON artists FOR INSERT
  WITH CHECK (auth.uid() = user_id AND get_user_role() IN ('artist', 'superadmin'));
CREATE POLICY "Superadmin can delete artists" ON artists FOR DELETE
  USING (is_superadmin());

CREATE TRIGGER artists_updated_at BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════
-- EVENT ARTISTS (junction)
-- ═══════════════════════════════════════════

CREATE TABLE event_artists (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, artist_id)
);

ALTER TABLE event_artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event artists viewable" ON event_artists FOR SELECT USING (true);
CREATE POLICY "Event organizer manages event artists" ON event_artists FOR ALL
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_id AND (events.organizer_id = auth.uid() OR is_superadmin())));

-- ═══════════════════════════════════════════
-- ORDERS
-- ═══════════════════════════════════════════

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  service_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders FOR SELECT
  USING (user_id = auth.uid() OR is_superadmin());
CREATE POLICY "Event organizer can view event orders" ON orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_id AND events.organizer_id = auth.uid()));
CREATE POLICY "Authenticated users can create orders" ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System/admin can update orders" ON orders FOR UPDATE
  USING (is_superadmin() OR user_id = auth.uid());

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════
-- TICKETS
-- ═══════════════════════════════════════════

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES ticket_tiers(id) ON DELETE CASCADE,
  qr_code TEXT NOT NULL UNIQUE,
  status ticket_status NOT NULL DEFAULT 'active',
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id),
  check_in_method check_in_method,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON tickets FOR SELECT
  USING (user_id = auth.uid() OR is_superadmin());
CREATE POLICY "Event organizer can view/update event tickets" ON tickets FOR SELECT
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_id AND events.organizer_id = auth.uid()));
CREATE POLICY "Event organizer can check in tickets" ON tickets FOR UPDATE
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_id AND events.organizer_id = auth.uid()));
CREATE POLICY "System can create tickets" ON tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- ORDER ADD-ONS
-- ═══════════════════════════════════════════

CREATE TABLE order_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES event_addons(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0
);

ALTER TABLE order_addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order addons" ON order_addons FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND (orders.user_id = auth.uid() OR is_superadmin())));
CREATE POLICY "System can create order addons" ON order_addons FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));

-- ═══════════════════════════════════════════
-- BOOKINGS
-- ═══════════════════════════════════════════

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type booking_type NOT NULL,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  hours INT NOT NULL DEFAULT 1,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  proposed_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  final_amount DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  status booking_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requester and provider can view bookings" ON bookings FOR SELECT
  USING (requester_id = auth.uid() OR provider_id = auth.uid() OR is_superadmin());
CREATE POLICY "Users can create booking requests" ON bookings FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Requester and provider can update bookings" ON bookings FOR UPDATE
  USING (requester_id = auth.uid() OR provider_id = auth.uid() OR is_superadmin());

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════
-- BOOKING TIMELINE
-- ═══════════════════════════════════════════

CREATE TABLE booking_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE booking_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Booking participants can view timeline" ON booking_timeline FOR SELECT
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND (bookings.requester_id = auth.uid() OR bookings.provider_id = auth.uid() OR is_superadmin())));
CREATE POLICY "Booking participants can add timeline entries" ON booking_timeline FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND (bookings.requester_id = auth.uid() OR bookings.provider_id = auth.uid())));

-- ═══════════════════════════════════════════
-- CONVERSATIONS & MESSAGES
-- ═══════════════════════════════════════════

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  context TEXT,
  context_event TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  unread_count INT NOT NULL DEFAULT 0,
  last_read_at TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT
  USING (EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid()) OR is_superadmin());
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own participations" ON conversation_participants FOR SELECT
  USING (user_id = auth.uid() OR is_superadmin());
CREATE POLICY "Users can join conversations" ON conversation_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own participation" ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid());

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view messages" ON messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()) OR is_superadmin());
CREATE POLICY "Conversation participants can send messages" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()));

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════
-- TIPS
-- ═══════════════════════════════════════════

CREATE TABLE tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  context tip_context NOT NULL DEFAULT 'profile',
  message TEXT,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tippers can view own tips" ON tips FOR SELECT
  USING (tipper_id = auth.uid() OR is_superadmin());
CREATE POLICY "Artists can view received tips" ON tips FOR SELECT
  USING (EXISTS (SELECT 1 FROM artists WHERE artists.id = artist_id AND artists.user_id = auth.uid()));
CREATE POLICY "Authenticated users can create tips" ON tips FOR INSERT
  WITH CHECK (auth.uid() = tipper_id);

-- ═══════════════════════════════════════════
-- FOLLOWS
-- ═══════════════════════════════════════════

CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  followed_type follow_type NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, followed_type, artist_id),
  UNIQUE(follower_id, followed_type, venue_id),
  CHECK (
    (followed_type = 'artist' AND artist_id IS NOT NULL AND venue_id IS NULL) OR
    (followed_type = 'venue' AND venue_id IS NOT NULL AND artist_id IS NULL)
  )
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own follows" ON follows FOR SELECT
  USING (follower_id = auth.uid() OR is_superadmin());
CREATE POLICY "Users can create follows" ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own follows" ON follows FOR DELETE
  USING (follower_id = auth.uid());

-- ═══════════════════════════════════════════
-- SAVED EVENTS
-- ═══════════════════════════════════════════

CREATE TABLE saved_events (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own saved events" ON saved_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can save events" ON saved_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave events" ON saved_events FOR DELETE USING (user_id = auth.uid());

-- ═══════════════════════════════════════════
-- EVENT REACTIONS
-- ═══════════════════════════════════════════

CREATE TABLE event_reactions (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  PRIMARY KEY (user_id, event_id, reaction_type)
);

ALTER TABLE event_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reactions" ON event_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react" ON event_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON event_reactions FOR DELETE USING (user_id = auth.uid());

-- ═══════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid() OR is_superadmin());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- ═══════════════════════════════════════════
-- GROUPS
-- ═══════════════════════════════════════════

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  gradient_index INT NOT NULL DEFAULT 0,
  member_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groups viewable by everyone" ON groups FOR SELECT USING (true);
CREATE POLICY "Superadmin can manage groups" ON groups FOR ALL USING (is_superadmin());

CREATE TABLE group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members viewable" ON group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON group_members FOR DELETE USING (user_id = auth.uid());

-- ═══════════════════════════════════════════
-- STREAMS (Mux Live)
-- ═══════════════════════════════════════════

CREATE TABLE streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  mux_stream_id TEXT,
  mux_playback_id TEXT,
  mux_stream_key TEXT,
  title TEXT NOT NULL DEFAULT '',
  status stream_status NOT NULL DEFAULT 'idle',
  viewer_count INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active streams viewable" ON streams FOR SELECT
  USING (status = 'active' OR EXISTS (SELECT 1 FROM artists WHERE artists.id = artist_id AND artists.user_id = auth.uid()) OR is_superadmin());
CREATE POLICY "Artist can manage own streams" ON streams FOR ALL
  USING (EXISTS (SELECT 1 FROM artists WHERE artists.id = artist_id AND artists.user_id = auth.uid()) OR is_superadmin());

-- FK from artists to streams
ALTER TABLE artists ADD CONSTRAINT artists_current_stream_fkey
  FOREIGN KEY (current_stream_id) REFERENCES streams(id) ON DELETE SET NULL;

-- ═══════════════════════════════════════════
-- STREAM CHAT
-- ═══════════════════════════════════════════

CREATE TABLE stream_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE stream_chat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stream chat viewable" ON stream_chat FOR SELECT USING (true);
CREATE POLICY "Authenticated users can chat" ON stream_chat FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- ADMIN AUDIT LOG
-- ═══════════════════════════════════════════

CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmin can view audit log" ON admin_audit_log FOR SELECT USING (is_superadmin());
CREATE POLICY "Superadmin can create audit entries" ON admin_audit_log FOR INSERT WITH CHECK (is_superadmin());

-- ═══════════════════════════════════════════
-- PLATFORM SETTINGS
-- ═══════════════════════════════════════════

CREATE TABLE platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings viewable by admin" ON platform_settings FOR SELECT USING (is_superadmin());
CREATE POLICY "Settings manageable by admin" ON platform_settings FOR ALL USING (is_superadmin());

-- ═══════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_venues_owner ON venues(owner_id);
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_artists_user ON artists(user_id);
CREATE INDEX idx_artists_genre ON artists(genre);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_event ON orders(event_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_qr ON tickets(qr_code);
CREATE INDEX idx_bookings_requester ON bookings(requester_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_tips_artist ON tips(artist_id);
CREATE INDEX idx_tips_tipper ON tips(tipper_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_streams_artist ON streams(artist_id);
CREATE INDEX idx_stream_chat_stream ON stream_chat(stream_id);

-- ═══════════════════════════════════════════
-- ENABLE REALTIME
-- ═══════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE stream_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
