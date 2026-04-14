import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(2000),
  category: z.string(),
  date: z.string(), // ISO date string
  start_time: z.string(),
  end_time: z.string(),
  visibility: z.enum(['public', 'private', 'invite-only']).default('public'),
  capacity: z.number().int().positive().optional(),
  age_restriction: z.string().nullable().optional(),
  dress_code: z.string().nullable().optional(),
});

export const createVenueSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.string(),
  description: z.string().max(2000).optional(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2).max(2),
  capacity: z.number().int().positive(),
  hourly_rate: z.number().positive(),
  deposit: z.number().min(0).optional(),
  pricing_mode: z.enum(['set', 'negotiable']).default('set'),
  amenities: z.array(z.string()).optional(),
});

export const checkoutSchema = z.object({
  eventId: z.string().min(1),
  tierId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
  addonIds: z.array(z.string()).optional(),
  promoCode: z.string().optional(),
});

export const tipPaymentSchema = z.object({
  artistId: z.string().uuid(),
  amount: z.number().int().min(100).max(50000), // cents
  context: z.enum(['profile', 'live', 'event']).optional(),
});

export const transferSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().positive(),
  destinationAccountId: z.string().min(1),
});

export const createStreamSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export const createUploadSchema = z.object({
  corsOrigin: z.string().url().optional(),
});

export const messageSchema = z.object({
  text: z.string().min(1).max(2000),
  conversationId: z.string().uuid(),
});

export const bookingRequestSchema = z.object({
  type: z.enum(['venue', 'artist']),
  provider_id: z.string().uuid(),
  event_name: z.string().min(3),
  date: z.string(),
  hours: z.number().positive(),
  proposed_amount: z.number().positive(),
  notes: z.string().max(1000).optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  interests: z.array(z.string()).optional(),
  avatar_url: z.string().url().optional(),
});

export const adminUserUpdateSchema = z.object({
  role: z.enum(['guest', 'organizer', 'venue_owner', 'artist', 'superadmin']).optional(),
  is_banned: z.boolean().optional(),
});
