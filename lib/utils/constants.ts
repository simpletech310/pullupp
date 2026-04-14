export const EVENT_GRADIENTS = [
  'linear-gradient(135deg, #FF6B35, #FF8F5E, #E55A28)',
  'linear-gradient(135deg, #14B8A6, #2DD4BF, #0D9488)',
  'linear-gradient(135deg, #8B5CF6, #A78BFA, #7C3AED)',
  'linear-gradient(135deg, #EC4899, #F472B6, #DB2777)',
  'linear-gradient(135deg, #F59E0B, #FBBF24, #D97706)',
  'linear-gradient(135deg, #06B6D4, #22D3EE, #0891B2)',
  'linear-gradient(135deg, #EF4444, #F87171, #DC2626)',
  'linear-gradient(135deg, #10B981, #34D399, #059669)',
  'linear-gradient(135deg, #6366F1, #818CF8, #4F46E5)',
  'linear-gradient(135deg, #F97316, #FB923C, #EA580C)',
  'linear-gradient(135deg, #84CC16, #A3E635, #65A30D)',
  'linear-gradient(135deg, #E879F9, #F0ABFC, #D946EF)',
] as const;

export const AVATAR_COLORS = [
  '#FF6B35', '#14B8A6', '#8B5CF6', '#F59E0B',
  '#EF4444', '#06B6D4', '#EC4899', '#10B981',
] as const;

export const EVENT_CATEGORIES = [
  'All', 'Music', 'Comedy', 'Art', 'Food', 'Networking', 'Sports', 'Theater', 'Wellness',
] as const;

export const USER_ROLES = ['guest', 'organizer', 'venue_owner', 'artist', 'superadmin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_CONFIG = {
  guest: { label: 'Guest', color: '#FF6B35', icon: 'ticket', description: 'Browse events, buy tickets, enjoy' },
  organizer: { label: 'Event Organizer', color: '#14B8A6', icon: 'calendar', description: 'Create events, sell tickets, book venues & artists' },
  venue_owner: { label: 'Venue Owner', color: '#8B5CF6', icon: 'building', description: 'List your venue space, accept bookings' },
  artist: { label: 'Artist', color: '#EC4899', icon: 'music', description: 'Showcase talent, get booked, earn tips' },
  superadmin: { label: 'Super Admin', color: '#EF4444', icon: 'shield', description: 'Platform administration' },
} as const;

export const SERVICE_FEE_PERCENT = 0.05; // 5% platform fee
export const TIP_PRESETS = [5, 10, 20, 50] as const;
