import { createClient } from '@/lib/supabase/client';

// ── Event Creation ──

interface CreateEventInput {
  organizer_id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  start_time: string;
  end_time: string;
  visibility: string;
  status: string;
  capacity: number;
  gradient_index: number;
  age_restriction: string | null;
  dress_code: string | null;
  venue_id?: string | null;
  manual_venue_name?: string | null;
  social_links?: Record<string, string>;
  is_recurring?: boolean;
  recurring_pattern?: string | null;
  tiers?: { name: string; price: number; quantity: number; perks: string }[];
  addons?: { name: string; price: number; type: string }[];
  promoCodes?: { code: string; discount: number; maxUses: number }[];
  artistIds?: string[];
}

export async function createEvent(input: CreateEventInput) {
  const supabase = createClient();

  // 1. Insert the event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      organizer_id: input.organizer_id,
      title: input.title,
      description: input.description,
      category: input.category,
      date: input.date,
      start_time: input.start_time,
      end_time: input.end_time,
      visibility: input.visibility,
      status: input.status,
      capacity: input.capacity,
      gradient_index: input.gradient_index,
      age_restriction: input.age_restriction,
      dress_code: input.dress_code,
      venue_id: input.venue_id || null,
      manual_venue_name: input.manual_venue_name || null,
      social_links: input.social_links || {},
      is_recurring: input.is_recurring || false,
      recurring_pattern: input.recurring_pattern || null,
    })
    .select()
    .single();

  if (eventError || !event) {
    return { data: null, error: eventError };
  }

  // 2. Insert ticket tiers
  if (input.tiers && input.tiers.length > 0) {
    const tierRows = input.tiers.map((tier, i) => ({
      event_id: event.id,
      name: tier.name,
      price: tier.price,
      quantity: tier.quantity,
      remaining: tier.quantity,
      perks: tier.perks ? tier.perks.split(',').map((p: string) => p.trim()) : [],
      sort_order: i,
    }));
    const { error: tiersError } = await supabase.from('ticket_tiers').insert(tierRows);
    if (tiersError) console.error('Failed to insert tiers:', tiersError);
  }

  // 3. Insert add-ons
  if (input.addons && input.addons.length > 0) {
    const addonRows = input.addons.map((addon) => ({
      event_id: event.id,
      name: addon.name,
      price: addon.price,
      type: addon.type,
      gradient_index: Math.floor(Math.random() * 12),
    }));
    const { error: addonsError } = await supabase.from('event_addons').insert(addonRows);
    if (addonsError) console.error('Failed to insert addons:', addonsError);
  }

  // 4. Insert promo codes
  if (input.promoCodes && input.promoCodes.length > 0) {
    const promoRows = input.promoCodes.map((pc) => ({
      event_id: event.id,
      code: pc.code,
      discount_type: 'percentage' as const,
      discount_value: pc.discount,
      max_uses: pc.maxUses,
      used_count: 0,
    }));
    const { error: promosError } = await supabase.from('promo_codes').insert(promoRows);
    if (promosError) console.error('Failed to insert promo codes:', promosError);
  }

  // 5. Link artists
  if (input.artistIds && input.artistIds.length > 0) {
    const artistRows = input.artistIds.map((artistId) => ({
      event_id: event.id,
      artist_id: artistId,
    }));
    const { error: artistsError } = await supabase.from('event_artists').insert(artistRows);
    if (artistsError) console.error('Failed to link artists:', artistsError);
  }

  return { data: event, error: null };
}

// ── Venue Creation ──

interface CreateVenueInput {
  owner_id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
  standing_capacity?: number | null;
  seated_capacity?: number | null;
  hourly_rate: number;
  deposit: number;
  pricing_mode: string;
  amenities: string[];
  cancellation_policy?: string | null;
  is_active: boolean;
}

export async function createVenue(input: CreateVenueInput) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('venues')
    .insert({
      owner_id: input.owner_id,
      name: input.name,
      type: input.type,
      description: input.description || '',
      address: input.address,
      city: input.city,
      state: input.state,
      capacity: input.capacity,
      standing_capacity: input.standing_capacity || null,
      seated_capacity: input.seated_capacity || null,
      hourly_rate: input.hourly_rate,
      deposit: input.deposit,
      pricing_mode: input.pricing_mode === 'negotiable' ? 'negotiable' : 'set',
      amenities: input.amenities,
      cancellation_policy: input.cancellation_policy || null,
      is_active: input.is_active,
      gradient_index: Math.floor(Math.random() * 12),
    })
    .select()
    .single();

  return { data, error };
}

// ── Check-in ──

export async function checkInTicket(
  ticketId: string,
  method: 'scan' | 'manual',
  checkedInBy: string,
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tickets')
    .update({
      status: 'used',
      checked_in_at: new Date().toISOString(),
      checked_in_by: checkedInBy,
      check_in_method: method,
    })
    .eq('id', ticketId)
    .select()
    .single();

  return { data, error };
}

export async function bulkCheckInTickets(
  ticketIds: string[],
  checkedInBy: string,
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tickets')
    .update({
      status: 'used',
      checked_in_at: new Date().toISOString(),
      checked_in_by: checkedInBy,
      check_in_method: 'manual' as const,
    })
    .in('id', ticketIds)
    .select();

  return { data, error };
}

// ── Booking Request ──

interface CreateBookingInput {
  type: 'venue' | 'artist';
  requester_id: string;
  provider_id: string;
  venue_id?: string | null;
  artist_id?: string | null;
  event_name: string;
  date: string;
  hours: number;
  hourly_rate: number;
  proposed_amount: number;
  deposit_amount: number;
  notes?: string | null;
}

export async function createBookingRequest(input: CreateBookingInput) {
  const supabase = createClient();

  // 1. Insert booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      type: input.type,
      requester_id: input.requester_id,
      provider_id: input.provider_id,
      venue_id: input.venue_id || null,
      artist_id: input.artist_id || null,
      event_name: input.event_name,
      date: input.date,
      hours: input.hours,
      hourly_rate: input.hourly_rate,
      proposed_amount: input.proposed_amount,
      deposit_amount: input.deposit_amount,
      status: 'pending',
      notes: input.notes || null,
    })
    .select()
    .single();

  if (bookingError || !booking) {
    return { data: null, error: bookingError };
  }

  // 2. Create initial timeline entry
  await supabase.from('booking_timeline').insert({
    booking_id: booking.id,
    label: 'Request submitted',
    occurred_at: new Date().toISOString(),
    is_active: true,
    sort_order: 0,
  });

  // 3. Create conversation between requester and provider
  const { data: conversation } = await supabase
    .from('conversations')
    .insert({
      booking_id: booking.id,
      context: `Booking request for ${input.event_name}`,
    })
    .select()
    .single();

  if (conversation) {
    await supabase.from('conversation_participants').insert([
      { conversation_id: conversation.id, user_id: input.requester_id, unread_count: 0 },
      { conversation_id: conversation.id, user_id: input.provider_id, unread_count: 1 },
    ]);
  }

  return { data: booking, error: null };
}

// ── Admin Mutations ──

export async function adminBanUser(userId: string, banned: boolean, reason?: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_banned: banned,
      ban_reason: banned ? (reason || 'Banned by admin') : null,
    })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

export async function adminChangeRole(userId: string, newRole: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

export async function adminUpdateEventStatus(eventId: string, status: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('events')
    .update({ status, is_flagged: status === 'flagged' })
    .eq('id', eventId)
    .select()
    .single();

  return { data, error };
}

export async function adminUpdateVenueStatus(venueId: string, isActive: boolean, isFlagged: boolean) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('venues')
    .update({ is_active: isActive, is_flagged: isFlagged })
    .eq('id', venueId)
    .select()
    .single();

  return { data, error };
}

export async function adminToggleArtistVerified(artistId: string, verified: boolean) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('artists')
    .update({ is_active: verified })
    .eq('id', artistId)
    .select()
    .single();

  return { data, error };
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>,
) {
  const supabase = createClient();

  const { error } = await supabase.from('admin_audit_log').insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    details: details || null,
  });

  if (error) console.error('Failed to log admin action:', error);
}

export async function adminSaveSettings(settings: Record<string, unknown>) {
  const supabase = createClient();

  // Upsert each setting key-value pair
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value: JSON.stringify(value),
  }));

  const { error } = await supabase
    .from('platform_settings')
    .upsert(rows, { onConflict: 'key' });

  return { error };
}

export async function adminGetSettings() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('platform_settings')
    .select('*');

  if (error || !data) return { data: null, error };

  const settings: Record<string, string> = {};
  for (const row of data) {
    settings[row.key] = row.value;
  }

  return { data: settings, error: null };
}

// ═══════════════════════════════════════════
// SOCIAL ACTIONS
// ═══════════════════════════════════════════

export async function toggleSaveEvent(userId: string, eventId: string) {
  const supabase = createClient();

  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_events')
    .select('user_id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('saved_events')
      .delete()
      .eq('user_id', userId)
      .eq('event_id', eventId);
    return { saved: false, error };
  } else {
    const { error } = await supabase
      .from('saved_events')
      .insert({ user_id: userId, event_id: eventId });
    return { saved: true, error };
  }
}

export async function toggleFollow(userId: string, followedType: 'artist' | 'venue', targetId: string) {
  const supabase = createClient();

  const column = followedType === 'artist' ? 'artist_id' : 'venue_id';

  const { data: existing } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', userId)
    .eq('followed_type', followedType)
    .eq(column, targetId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', userId)
      .eq('followed_type', followedType)
      .eq(column, targetId);
    return { following: false, error };
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: userId, followed_type: followedType, [column]: targetId });
    return { following: true, error };
  }
}

export async function sendMessage(conversationId: string, senderId: string, text: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, text })
    .select()
    .single();
  return { data, error };
}

export async function updateBookingStatus(bookingId: string, status: string, userId: string, counterAmount?: number) {
  const supabase = createClient();

  const updateData: Record<string, unknown> = { status };
  if (counterAmount !== undefined) updateData.final_amount = counterAmount;

  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)
    .select()
    .single();

  if (!error) {
    await supabase.from('booking_timeline').insert({
      booking_id: bookingId,
      label: status === 'accepted' ? 'Booking Accepted' : status === 'declined' ? 'Booking Declined' : `Counter offer: $${counterAmount}`,
      occurred_at: new Date().toISOString(),
    });
  }

  return { data, error };
}

export async function joinGroup(userId: string, groupId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('group_members')
    .insert({ user_id: userId, group_id: groupId });
  if (!error) {
    await supabase.rpc('increment_group_members', { gid: groupId });
  }
  return { error };
}

export async function leaveGroup(userId: string, groupId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('user_id', userId)
    .eq('group_id', groupId);
  return { error };
}

export async function updateProfile(userId: string, updates: { name?: string; interests?: string[]; avatar_url?: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}
