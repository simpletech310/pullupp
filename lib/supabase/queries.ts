import { createClient } from './client';

// ═══════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════

export async function getPublishedEvents(filters?: {
  category?: string;
  search?: string;
  limit?: number;
}) {
  const supabase = createClient();
  let query = supabase
    .from('events')
    .select(
      `
      *,
      organizer:profiles!organizer_id(id, name, avatar_url, avatar_color_index),
      venue:venues(id, name, address, city, state),
      ticket_tiers(id, name, price, remaining, quantity)
    `,
    )
    .eq('status', 'published')
    .order('date', { ascending: true });

  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function getEventById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('events')
    .select(
      `
      *,
      organizer:profiles!organizer_id(id, name, email, avatar_url, avatar_color_index, role),
      venue:venues(id, name, type, address, city, state, zip, capacity, amenities, images, gradient_index, hourly_rate),
      ticket_tiers(id, name, price, perks, quantity, remaining, sort_order),
      event_addons(id, name, price, type, gradient_index),
      event_artists(
        artist:artists(id, name, type, genre, bio, images, gradient_index, user_id)
      )
    `,
    )
    .eq('id', id)
    .single();

  return { data, error };
}

// ═══════════════════════════════════════════
// VENUES
// ═══════════════════════════════════════════

export async function getVenues(filters?: {
  search?: string;
  type?: string;
  city?: string;
  limit?: number;
}) {
  const supabase = createClient();
  let query = supabase
    .from('venues')
    .select(
      `
      *,
      owner:profiles!owner_id(id, name, avatar_url, avatar_color_index)
    `,
    )
    .eq('is_active', true)
    .order('rating', { ascending: false });

  if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
  if (filters?.type) query = query.eq('type', filters.type);
  if (filters?.city) query = query.eq('city', filters.city);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function getVenueById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('venues')
    .select(
      `
      *,
      owner:profiles!owner_id(id, name, email, avatar_url, avatar_color_index, role),
      venue_extras(id, name, price, category)
    `,
    )
    .eq('id', id)
    .single();

  return { data, error };
}

// ═══════════════════════════════════════════
// ARTISTS
// ═══════════════════════════════════════════

export async function getArtists(filters?: {
  genre?: string;
  search?: string;
  type?: string;
  limit?: number;
}) {
  const supabase = createClient();
  let query = supabase
    .from('artists')
    .select(
      `
      *,
      user:profiles!user_id(id, name, avatar_url, avatar_color_index)
    `,
    )
    .eq('is_active', true)
    .order('follower_count', { ascending: false });

  if (filters?.genre) query = query.ilike('genre', `%${filters.genre}%`);
  if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
  if (filters?.type) query = query.eq('type', filters.type);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function getArtistById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('artists')
    .select(
      `
      *,
      user:profiles!user_id(id, name, email, avatar_url, avatar_color_index, role),
      event_artists(
        event:events(id, title, date, start_time, end_time, category, gradient_index, venue:venues(name, city, state))
      )
    `,
    )
    .eq('id', id)
    .single();

  return { data, error };
}

// ═══════════════════════════════════════════
// TICKETS & ORDERS
// ═══════════════════════════════════════════

export async function getUserTickets(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      event:events(id, title, date, start_time, end_time, category, gradient_index, venue:venues(name, address, city, state)),
      tickets(id, qr_code, status, checked_in_at, tier:ticket_tiers(id, name, price, perks)),
      order_addons(id, quantity, price, addon:event_addons(name, type))
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

// ═══════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════

export async function getUserBookings(
  userId: string,
  direction: 'sent' | 'received',
) {
  const supabase = createClient();
  const column = direction === 'sent' ? 'requester_id' : 'provider_id';
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      *,
      requester:profiles!requester_id(id, name, avatar_url, avatar_color_index, role),
      provider:profiles!provider_id(id, name, avatar_url, avatar_color_index, role),
      venue:venues(id, name, type),
      artist:artists(id, name, type, genre)
    `,
    )
    .eq(column, userId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

export async function getBookingById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      *,
      requester:profiles!requester_id(id, name, email, avatar_url, avatar_color_index, role),
      provider:profiles!provider_id(id, name, email, avatar_url, avatar_color_index, role),
      venue:venues(id, name, type, address, city, state, hourly_rate),
      artist:artists(id, name, type, genre, hourly_rate, flat_rate),
      booking_timeline(id, label, occurred_at, is_active, sort_order)
    `,
    )
    .eq('id', id)
    .single();

  return { data, error };
}

// ═══════════════════════════════════════════
// CONVERSATIONS & MESSAGES
// ═══════════════════════════════════════════

export async function getUserConversations(userId: string) {
  const supabase = createClient();

  // Get conversation IDs user participates in
  const { data: participations, error: partError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, unread_count, last_read_at')
    .eq('user_id', userId);

  if (partError || !participations?.length) {
    return { data: [], error: partError };
  }

  const conversationIds = participations.map((p) => p.conversation_id);

  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(
      `
      *,
      conversation_participants(
        user_id,
        unread_count,
        user:profiles!user_id(id, name, avatar_url, avatar_color_index)
      ),
      messages(id, text, sender_id, created_at)
    `,
    )
    .in('id', conversationIds)
    .order('updated_at', { ascending: false });

  // Attach last message and unread count for the requesting user
  const enriched = (conversations || []).map((conv) => {
    const sortedMessages = (conv.messages || []).sort(
      (a: { created_at: string }, b: { created_at: string }) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const lastMessage = sortedMessages[0] || null;
    const participation = participations.find(
      (p) => p.conversation_id === conv.id,
    );
    const otherParticipant = (conv.conversation_participants || []).find(
      (p: { user_id: string }) => p.user_id !== userId,
    );

    return {
      ...conv,
      last_message: lastMessage,
      unread_count: participation?.unread_count || 0,
      other_participant: otherParticipant?.user || null,
    };
  });

  return { data: enriched, error };
}

export async function getConversationMessages(conversationId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .select(
      `
      *,
      sender:profiles!sender_id(id, name, avatar_url, avatar_color_index)
    `,
    )
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return { data: data || [], error };
}

// ═══════════════════════════════════════════
// FOLLOWS
// ═══════════════════════════════════════════

export async function getUserFollows(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('follows')
    .select(
      `
      *,
      artist:artists(id, name, type, genre, images, gradient_index, user_id),
      venue:venues(id, name, type, images, gradient_index, city, state)
    `,
    )
    .eq('follower_id', userId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

// ═══════════════════════════════════════════
// SAVED EVENTS
// ═══════════════════════════════════════════

export async function getUserSavedEvents(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('saved_events')
    .select(
      `
      *,
      event:events(
        id, title, description, date, start_time, end_time, category, gradient_index, status, capacity, attendee_count,
        organizer:profiles!organizer_id(id, name, avatar_url),
        venue:venues(name, city, state),
        ticket_tiers(id, name, price, remaining)
      )
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

// ═══════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════

export async function getUserNotifications(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  return { data: data || [], error };
}

// ═══════════════════════════════════════════
// TIPS
// ═══════════════════════════════════════════

export async function getUserTipHistory(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tips')
    .select(
      `
      *,
      artist:artists(id, name, type, genre, images, gradient_index, user_id)
    `,
    )
    .eq('tipper_id', userId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

// ═══════════════════════════════════════════
// ARTIST DASHBOARD
// ═══════════════════════════════════════════

export async function getArtistDashboardData(artistUserId: string) {
  const supabase = createClient();

  // Get artist record
  const { data: artist, error: artistError } = await supabase
    .from('artists')
    .select('*')
    .eq('user_id', artistUserId)
    .single();

  if (artistError || !artist) {
    return { data: null, error: artistError };
  }

  // Get recent tips
  const { data: recentTips } = await supabase
    .from('tips')
    .select(
      `
      *,
      tipper:profiles!tipper_id(id, name, avatar_url, avatar_color_index)
    `,
    )
    .eq('artist_id', artist.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get upcoming gigs via event_artists
  const { data: upcomingGigs } = await supabase
    .from('event_artists')
    .select(
      `
      event:events(id, title, date, start_time, end_time, category, gradient_index, status,
        venue:venues(name, city, state)
      )
    `,
    )
    .eq('artist_id', artist.id);

  // Get follower count from follows table
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('followed_type', 'artist')
    .eq('artist_id', artist.id);

  // Get bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      `
      *,
      requester:profiles!requester_id(id, name, avatar_url)
    `,
    )
    .eq('provider_id', artistUserId)
    .eq('type', 'artist')
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    data: {
      artist,
      recentTips: recentTips || [],
      upcomingGigs: (upcomingGigs || [])
        .map((g: any) => Array.isArray(g.event) ? g.event[0] : g.event)
        .filter(
          (e: any) =>
            e && e.status === 'published' && new Date(e.date) >= new Date(),
        ),
      followerCount: followerCount || 0,
      bookings: bookings || [],
    },
    error: null,
  };
}

// ═══════════════════════════════════════════
// VENUE DASHBOARD
// ═══════════════════════════════════════════

export async function getVenueDashboardData(venueOwnerId: string) {
  const supabase = createClient();

  // Get owner's venues
  const { data: venues, error: venuesError } = await supabase
    .from('venues')
    .select('*')
    .eq('owner_id', venueOwnerId);

  if (venuesError || !venues?.length) {
    return { data: null, error: venuesError };
  }

  const venueIds = venues.map((v) => v.id);

  // Get bookings for all venues
  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      `
      *,
      requester:profiles!requester_id(id, name, avatar_url, avatar_color_index),
      venue:venues(id, name)
    `,
    )
    .eq('provider_id', venueOwnerId)
    .eq('type', 'venue')
    .order('created_at', { ascending: false })
    .limit(20);

  // Get events at these venues
  const { data: events } = await supabase
    .from('events')
    .select(
      `
      id, title, date, start_time, status, attendee_count, capacity,
      organizer:profiles!organizer_id(id, name)
    `,
    )
    .in('venue_id', venueIds)
    .order('date', { ascending: true });

  // Calculate revenue from completed bookings
  const completedBookings = (bookings || []).filter(
    (b) => b.status === 'completed',
  );
  const totalRevenue = completedBookings.reduce(
    (sum, b) => sum + Number(b.final_amount || b.proposed_amount || 0),
    0,
  );

  // Get follower counts
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('followed_type', 'venue')
    .in('venue_id', venueIds);

  return {
    data: {
      venues,
      bookings: bookings || [],
      upcomingEvents: (events || []).filter(
        (e) => e.status === 'published' && new Date(e.date) >= new Date(),
      ),
      totalRevenue,
      followerCount: followerCount || 0,
    },
    error: null,
  };
}

// ═══════════════════════════════════════════
// GROUPS
// ═══════════════════════════════════════════

export async function getGroups(search?: string) {
  const supabase = createClient();
  let query = supabase
    .from('groups')
    .select('*')
    .order('member_count', { ascending: false });

  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  return { data: data || [], error };
}

// ═══════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════

export async function getAdminStats() {
  const supabase = createClient();

  const [users, events, venues, artists, orders, bookings] = await Promise.all(
    [
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('venues')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('artists')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true }),
    ],
  );

  // Get revenue from completed orders
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total')
    .eq('status', 'completed');

  const totalRevenue = (revenueData || []).reduce(
    (sum, o) => sum + Number(o.total || 0),
    0,
  );

  return {
    data: {
      userCount: users.count || 0,
      eventCount: events.count || 0,
      venueCount: venues.count || 0,
      artistCount: artists.count || 0,
      orderCount: orders.count || 0,
      bookingCount: bookings.count || 0,
      totalRevenue,
    },
    error: null,
  };
}

export async function getAdminUsers(filters?: {
  search?: string;
  role?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`,
    );
  }
  if (filters?.role) query = query.eq('role', filters.role);
  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);

  const { data, count, error } = await query;
  return { data: data || [], count: count || 0, error };
}

export async function getAdminUserById(id: string) {
  const supabase = createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) {
    return { data: null, error };
  }

  // Get activity stats
  const [eventCount, orderCount, bookingCount, tipCount] = await Promise.all([
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('organizer_id', id),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .or(`requester_id.eq.${id},provider_id.eq.${id}`),
    supabase
      .from('tips')
      .select('*', { count: 'exact', head: true })
      .eq('tipper_id', id),
  ]);

  return {
    data: {
      ...profile,
      stats: {
        eventCount: eventCount.count || 0,
        orderCount: orderCount.count || 0,
        bookingCount: bookingCount.count || 0,
        tipCount: tipCount.count || 0,
      },
    },
    error: null,
  };
}

export async function getAdminEvents(filters?: {
  search?: string;
  status?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();
  let query = supabase
    .from('events')
    .select(
      `
      *,
      organizer:profiles!organizer_id(id, name, email),
      venue:venues(id, name)
    `,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false });

  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);

  const { data, count, error } = await query;
  return { data: data || [], count: count || 0, error };
}

export async function getAdminTransactions(filters?: {
  type?: 'orders' | 'tips' | 'all';
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();
  const transactionType = filters?.type || 'all';

  const results: {
    orders: Array<Record<string, unknown>>;
    tips: Array<Record<string, unknown>>;
  } = { orders: [], tips: [] };

  if (transactionType === 'all' || transactionType === 'orders') {
    let orderQuery = supabase
      .from('orders')
      .select(
        `
        *,
        user:profiles!user_id(id, name, email),
        event:events(id, title)
      `,
      )
      .order('created_at', { ascending: false });

    if (filters?.status) orderQuery = orderQuery.eq('status', filters.status);
    if (filters?.limit) orderQuery = orderQuery.limit(filters.limit);

    const { data } = await orderQuery;
    results.orders = (data || []).map((o) => ({
      ...o,
      transaction_type: 'order',
    }));
  }

  if (transactionType === 'all' || transactionType === 'tips') {
    let tipQuery = supabase
      .from('tips')
      .select(
        `
        *,
        tipper:profiles!tipper_id(id, name, email),
        artist:artists(id, name)
      `,
      )
      .order('created_at', { ascending: false });

    if (filters?.limit) tipQuery = tipQuery.limit(filters.limit);

    const { data } = await tipQuery;
    results.tips = (data || []).map((t) => ({
      ...t,
      transaction_type: 'tip',
    }));
  }

  // Combine and sort by date
  const combined = [...results.orders, ...results.tips].sort(
    (a, b) =>
      new Date(b.created_at as string).getTime() -
      new Date(a.created_at as string).getTime(),
  );

  return { data: combined, error: null };
}
