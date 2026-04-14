export type UserRole = 'guest' | 'organizer' | 'venue_owner' | 'artist' | 'superadmin';
export type EventVisibility = 'public' | 'private' | 'invite-only';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type BookingType = 'venue' | 'artist';
export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
export type OrderStatus = 'pending' | 'completed' | 'refunded' | 'cancelled';
export type TicketStatus = 'active' | 'used' | 'cancelled' | 'refunded';
export type PricingMode = 'set' | 'negotiable';
export type TipContext = 'profile' | 'live' | 'event';
export type StreamStatus = 'idle' | 'active' | 'ended';
export type CheckInMethod = 'scan' | 'manual';
export type FollowType = 'artist' | 'venue';
export type DiscountType = 'percentage' | 'fixed';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  avatar_color_index: number;
  stripe_customer_id: string | null;
  stripe_connect_id: string | null;
  stripe_connect_onboarded: boolean;
  interests: string[];
  onboarding_complete: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  start_time: string;
  end_time: string | null;
  venue_id: string | null;
  manual_venue_name: string | null;
  cover_images: string[];
  gradient_index: number;
  visibility: EventVisibility;
  status: EventStatus;
  capacity: number;
  attendee_count: number;
  is_recurring: boolean;
  recurring_pattern: string | null;
  age_restriction: string | null;
  dress_code: string | null;
  social_links: Record<string, string>;
  reactions: Record<string, number>;
  is_flagged: boolean;
  flag_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  organizer?: Profile;
  venue?: Venue;
  ticket_tiers?: TicketTier[];
  event_addons?: EventAddon[];
  event_artists?: { artist: Artist }[];
}

export interface TicketTier {
  id: string;
  event_id: string;
  name: string;
  price: number;
  perks: string[];
  quantity: number;
  remaining: number;
  sort_order: number;
}

export interface EventAddon {
  id: string;
  event_id: string;
  name: string;
  price: number;
  type: string;
  gradient_index: number;
}

export interface PromoCode {
  id: string;
  event_id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
}

export interface Venue {
  id: string;
  owner_id: string;
  name: string;
  type: string;
  capacity: number;
  standing_capacity: number | null;
  seated_capacity: number | null;
  sqft: number | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  gradient_index: number;
  hourly_rate: number;
  deposit: number;
  cleaning_fee: number;
  pricing_mode: PricingMode;
  rating: number;
  review_count: number;
  amenities: string[];
  rules: string[];
  cancellation_policy: string | null;
  deposit_terms: string | null;
  payment_terms: string | null;
  insurance_requirements: string | null;
  has_video_tour: boolean;
  video_tour_url: string | null;
  is_active: boolean;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  owner?: Profile;
  venue_extras?: VenueExtra[];
}

export interface VenueExtra {
  id: string;
  venue_id: string;
  name: string;
  price: number;
  category: string;
}

export interface VenueAvailability {
  id: string;
  venue_id: string;
  date: string;
  is_available: boolean;
  booking_id: string | null;
}

export interface Artist {
  id: string;
  user_id: string;
  name: string;
  type: string;
  genre: string;
  bio: string;
  hourly_rate: number;
  flat_rate: number | null;
  pricing_mode: PricingMode;
  rating: number;
  review_count: number;
  gig_count: number;
  follower_count: number;
  tip_total: number;
  tip_count: number;
  songs: string[];
  images: string[];
  gradient_index: number;
  is_live: boolean;
  current_stream_id: string | null;
  is_active: boolean;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  user?: Profile;
}

export interface Order {
  id: string;
  user_id: string;
  event_id: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  status: OrderStatus;
  subtotal: number;
  service_fee: number;
  total: number;
  created_at: string;
  updated_at: string;
  // Joined
  event?: Event;
  tickets?: Ticket[];
  order_addons?: OrderAddon[];
}

export interface Ticket {
  id: string;
  order_id: string;
  event_id: string;
  user_id: string;
  tier_id: string;
  qr_code: string;
  status: TicketStatus;
  checked_in_at: string | null;
  checked_in_by: string | null;
  check_in_method: CheckInMethod | null;
  created_at: string;
  // Joined
  event?: Event;
  tier?: TicketTier;
}

export interface OrderAddon {
  id: string;
  order_id: string;
  addon_id: string;
  quantity: number;
  price: number;
}

export interface Booking {
  id: string;
  type: BookingType;
  requester_id: string;
  provider_id: string;
  event_id: string | null;
  venue_id: string | null;
  artist_id: string | null;
  event_name: string;
  date: string;
  hours: number;
  hourly_rate: number;
  proposed_amount: number;
  final_amount: number | null;
  deposit_amount: number | null;
  status: BookingStatus;
  stripe_payment_intent_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  requester?: Profile;
  provider?: Profile;
  venue?: Venue;
  artist?: Artist;
  booking_timeline?: BookingTimeline[];
}

export interface BookingTimeline {
  id: string;
  booking_id: string;
  label: string;
  occurred_at: string;
  is_active: boolean;
  sort_order: number;
}

export interface Conversation {
  id: string;
  booking_id: string | null;
  context: string | null;
  context_event: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  participants?: ConversationParticipant[];
  messages?: Message[];
  last_message?: Message;
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  unread_count: number;
  last_read_at: string | null;
  // Joined
  user?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: string;
  // Joined
  sender?: Profile;
}

export interface Tip {
  id: string;
  tipper_id: string;
  artist_id: string;
  amount: number;
  context: TipContext;
  message: string | null;
  stripe_payment_intent_id: string | null;
  stripe_transfer_id: string | null;
  created_at: string;
  // Joined
  artist?: Artist;
  tipper?: Profile;
}

export interface Follow {
  id: string;
  follower_id: string;
  followed_type: FollowType;
  artist_id: string | null;
  venue_id: string | null;
  created_at: string;
}

export interface SavedEvent {
  user_id: string;
  event_id: string;
  created_at: string;
}

export interface EventReaction {
  user_id: string;
  event_id: string;
  reaction_type: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  gradient_index: number;
  member_count: number;
  created_at: string;
}

export interface Stream {
  id: string;
  artist_id: string;
  mux_stream_id: string | null;
  mux_playback_id: string | null;
  mux_stream_key: string | null;
  title: string;
  status: StreamStatus;
  viewer_count: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  // Joined
  artist?: Artist;
}

export interface StreamChat {
  id: string;
  stream_id: string;
  user_id: string;
  message: string;
  created_at: string;
  // Joined
  user?: Profile;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
  // Joined
  admin?: Profile;
}
