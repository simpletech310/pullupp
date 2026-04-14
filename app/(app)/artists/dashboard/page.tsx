'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/providers/auth-provider';
import { getArtistDashboardData } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  formatCurrency,
  formatCompactNumber,
  formatTimeAgo,
  formatDate,
  getInitials,
} from '@/lib/utils/format';
import { EVENT_GRADIENTS, AVATAR_COLORS } from '@/lib/utils/constants';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Tipper {
  id: string;
  name: string;
  avatar_url: string | null;
  avatar_color_index: number;
}

interface Tip {
  id: string;
  amount: number;
  context: string | null;
  created_at: string;
  tipper: Tipper;
}

interface Venue {
  name: string;
  city: string;
  state: string;
}

interface Gig {
  id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  category: string;
  gradient_index: number;
  venue: Venue;
}

interface Requester {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface Booking {
  id: string;
  event_name: string;
  date: string;
  status: 'pending' | 'confirmed' | 'negotiating' | 'declined' | 'cancelled';
  proposed_amount: number | null;
  type: string;
  requester: Requester;
}

interface Artist {
  id: string;
  name: string;
  genre: string | null;
  tips_earned: number | null;
  hourly_rate: number | null;
  flat_rate: number | null;
  gradient_index: number;
}

interface DashboardData {
  artist: Artist;
  recentTips: Tip[];
  upcomingGigs: Gig[];
  followerCount: number;
  bookings: Booking[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildWeekBars(tips: Tip[]): { label: string; value: number }[] {
  const now = new Date();
  const bars: { label: string; value: number }[] = DAY_LABELS.map((label) => ({
    label,
    value: 0,
  }));

  tips.forEach((tip) => {
    const d = new Date(tip.created_at);
    const daysAgo = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysAgo < 7) {
      bars[d.getDay()].value += tip.amount;
    }
  });

  return bars;
}

function bookingStatusVariant(
  status: Booking['status'],
): 'warning' | 'teal' | 'orange' | 'error' | 'outline' {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'teal';
    case 'negotiating':
      return 'orange';
    case 'declined':
    case 'cancelled':
      return 'error';
    default:
      return 'outline';
  }
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-surface-container-high/50 ${className}`}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="pb-24 px-4 pt-4 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      {/* Chart */}
      <Skeleton className="h-48 rounded-2xl" />
      {/* Gigs */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-36" />
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      {/* Bookings */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-44" />
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Not-Artist state ─────────────────────────────────────────────────────────

function NotArtistState() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4 bg-background">
      <div className="w-16 h-16 rounded-full bg-primary-container/15 flex items-center justify-center mb-2">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ff6b35"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      <h2 className="font-headline font-bold text-xl text-on-surface">This page is for artists only</h2>
      <p className="text-on-surface-variant text-sm max-w-xs font-body">
        Update your profile role to access your artist dashboard.
      </p>
      <Button variant="primary" onClick={() => router.push('/profile')}>
        Edit Profile
      </Button>
    </div>
  );
}

// ─── Earnings Chart ───────────────────────────────────────────────────────────

function EarningsChart({ tips }: { tips: Tip[] }) {
  const bars = buildWeekBars(tips);
  const max = Math.max(...bars.map((b) => b.value), 1);
  const total = bars.reduce((sum, b) => sum + b.value, 0);

  return (
    <div className="bg-surface-container rounded-2xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-on-surface-variant text-xs font-body uppercase tracking-widest">Last 7 days</p>
        <span className="font-headline font-bold text-primary-container text-sm">
          {formatCurrency(total)}
        </span>
      </div>
      <div className="flex items-end justify-between gap-1.5 h-32">
        {bars.map((bar) => {
          const heightPx = Math.max((bar.value / max) * 96, bar.value > 0 ? 6 : 2);
          return (
            <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5">
              {bar.value > 0 && (
                <span className="text-[9px] text-primary-container font-semibold leading-none font-body">
                  ${bar.value}
                </span>
              )}
              <div className="w-full flex justify-center flex-1 items-end">
                <div
                  className={`w-full max-w-[28px] rounded-t-sm transition-colors ${
                    bar.value > 0
                      ? 'bg-primary-container/70 hover:bg-primary-container cursor-pointer'
                      : 'bg-surface-container-high'
                  }`}
                  style={{ height: `${heightPx}px` }}
                />
              </div>
              <span className="text-[10px] text-outline font-body">{bar.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Gig Card ─────────────────────────────────────────────────────────────────

function GigCard({ gig }: { gig: Gig }) {
  const router = useRouter();

  const gigDate = gig.date ? new Date(gig.date) : null;
  const monthLabel = gigDate
    ? gigDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    : '';
  const dayLabel = gigDate
    ? gigDate.getDate().toString()
    : '';

  return (
    <div
      onClick={() => router.push(`/events/${gig.id}`)}
      className="bg-surface-container-low hover:bg-surface-container p-5 rounded-xl flex items-center justify-between cursor-pointer transition-colors active:scale-[0.98]"
    >
      {/* Date box */}
      <div className="bg-surface-container-highest w-14 h-14 rounded-xl flex flex-col items-center justify-center border border-white/5 shrink-0 mr-4">
        <span className="text-xs font-body uppercase text-primary-container">{monthLabel}</span>
        <span className="text-xl font-black font-headline text-on-surface leading-none">{dayLabel}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-on-surface font-body truncate">{gig.title}</p>
        <p className="text-outline text-xs mt-0.5 font-body truncate">
          {gig.venue?.name ? `${gig.venue.name}` : ''}
          {gig.venue?.city ? `, ${gig.venue.city}` : ''}
        </p>
      </div>

      <div className="ml-3 shrink-0">
        <span className="bg-secondary-container/20 text-secondary text-[10px] font-bold rounded-lg px-2 py-1 font-body uppercase tracking-wide">
          {gig.category}
        </span>
      </div>
    </div>
  );
}

// ─── Booking Row ──────────────────────────────────────────────────────────────

function BookingRow({ booking }: { booking: Booking }) {
  const router = useRouter();
  const initials = getInitials(booking.requester?.name ?? 'U');

  return (
    <div
      onClick={() => router.push(`/bookings/${booking.id}`)}
      className="bg-surface-container-high rounded-2xl p-5 border border-white/5 cursor-pointer hover:border-white/10 transition-colors"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
          style={{ background: AVATAR_COLORS[(booking.requester?.name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length] }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface font-body truncate">{booking.requester?.name ?? 'Unknown'}</p>
          <p className="text-outline text-xs font-body truncate">{booking.event_name}</p>
        </div>
        <div className="shrink-0">
          <Badge variant={bookingStatusVariant(booking.status)}>
            {booking.status}
          </Badge>
        </div>
      </div>
      {booking.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/bookings/${booking.id}`); }}
            className="flex-1 bg-secondary-container text-white text-xs font-bold rounded-lg py-2.5 font-body"
          >
            Accept
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/bookings/${booking.id}`); }}
            className="flex-1 bg-surface-container-highest text-on-surface-variant text-xs font-bold rounded-lg py-2.5 font-body"
          >
            Decline
          </button>
        </div>
      )}
      {booking.proposed_amount != null && (
        <p className="text-xs text-on-surface-variant font-body mt-2">
          {formatCurrency(booking.proposed_amount)}
        </p>
      )}
    </div>
  );
}

// ─── Tip Row ──────────────────────────────────────────────────────────────────

function TipRow({ tip, last }: { tip: Tip; last: boolean }) {
  const initials = getInitials(tip.tipper?.name ?? 'U');
  const colorIdx = tip.tipper?.avatar_color_index ?? 0;
  const avatarColor = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];

  return (
    <div
      className={`flex items-center gap-3 p-3.5 ${!last ? 'border-b border-white/5' : ''}`}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
        style={{ background: avatarColor }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface font-body truncate">{tip.tipper?.name ?? 'Someone'}</p>
        <p className="text-outline text-xs font-body truncate">
          {tip.context ?? 'Direct tip'} &middot; {formatTimeAgo(tip.created_at)}
        </p>
      </div>
      <span className="text-secondary font-semibold text-sm shrink-0 font-body">
        +{formatCurrency(tip.amount)}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ArtistDashboardPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notArtist, setNotArtist] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      setLoading(true);
      const result = await getArtistDashboardData(user.id);
      if (!result.data) {
        setNotArtist(true);
      } else {
        setData(result.data as DashboardData);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  if (loading) return <DashboardSkeleton />;
  if (notArtist || !data) return <NotArtistState />;

  const { artist, recentTips, upcomingGigs, followerCount, bookings } = data;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const tipsEarned = artist.tips_earned ?? 0;

  return (
    <div className="pb-24 bg-background min-h-screen">
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-headline font-bold text-xl text-on-surface">Your Dashboard</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-on-surface-variant text-sm font-body truncate">{artist.name}</span>
              {artist.genre && (
                <Badge variant="orange">{artist.genre}</Badge>
              )}
            </div>
          </div>
          <Link
            href={`/artists/${artist.id}`}
            className="shrink-0 text-xs text-secondary font-semibold border border-secondary/30 bg-secondary-container/10 rounded-full px-3 py-1.5 hover:bg-secondary-container/20 transition-colors font-body"
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-3">
          {/* Tips Earned */}
          <div className="bg-surface-container-high p-4 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-primary-container/20 text-4xl leading-none font-headline select-none">$</div>
            <p className="text-3xl font-headline font-black text-on-surface">{formatCurrency(tipsEarned)}</p>
            <p className="text-xs font-body uppercase tracking-wider text-outline mt-1">Total Tips</p>
            <div className="mt-4 w-full h-1 bg-surface-container-lowest rounded-full overflow-hidden">
              <div className="h-full bg-primary-container rounded-full" style={{ width: '72%' }} />
            </div>
            <p className="text-secondary text-[10px] font-bold font-body mt-1">+12% this week</p>
          </div>

          {/* Followers */}
          <div className="bg-surface-container-high p-4 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-primary-container/20 text-4xl leading-none font-headline select-none">♡</div>
            <p className="text-3xl font-headline font-black text-on-surface">{formatCompactNumber(followerCount)}</p>
            <p className="text-xs font-body uppercase tracking-wider text-outline mt-1">Followers</p>
            <div className="mt-4 w-full h-1 bg-surface-container-lowest rounded-full overflow-hidden">
              <div className="h-full bg-secondary-container rounded-full" style={{ width: '58%' }} />
            </div>
            <p className="text-secondary text-[10px] font-bold font-body mt-1">+8% this month</p>
          </div>

          {/* Upcoming Gigs */}
          <div className="bg-surface-container-high p-4 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-primary-container/20 text-4xl leading-none font-headline select-none">◈</div>
            <p className="text-3xl font-headline font-black text-on-surface">{upcomingGigs.length}</p>
            <p className="text-xs font-body uppercase tracking-wider text-outline mt-1">Upcoming Gigs</p>
            <div className="mt-4 w-full h-1 bg-surface-container-lowest rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full"
                style={{ width: `${Math.min((upcomingGigs.length / 10) * 100, 100)}%` }}
              />
            </div>
            <p className="text-secondary text-[10px] font-bold font-body mt-1">Next 30 days</p>
          </div>

          {/* Pending Bookings */}
          <div className="bg-surface-container-high p-4 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-primary-container/20 text-4xl leading-none font-headline select-none">◎</div>
            <p className="text-3xl font-headline font-black text-on-surface">{pendingCount}</p>
            <p className="text-xs font-body uppercase tracking-wider text-outline mt-1">Pending Bookings</p>
            <div className="mt-4 w-full h-1 bg-surface-container-lowest rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full"
                style={{ width: `${Math.min((pendingCount / 5) * 100, 100)}%` }}
              />
            </div>
            <p className="text-secondary text-[10px] font-bold font-body mt-1">Needs review</p>
          </div>
        </div>
      </div>

      {/* ── Earnings Chart ── */}
      <div className="px-4 mb-6">
        <h3 className="font-headline font-semibold text-base text-on-surface mb-3">
          This Week&apos;s Earnings
        </h3>
        <EarningsChart tips={recentTips} />
      </div>

      {/* ── Upcoming Gigs ── */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline font-semibold text-base text-on-surface">Upcoming Gigs</h3>
          <Link href="/events" className="text-xs text-outline hover:text-on-surface-variant font-body transition-colors">
            See all
          </Link>
        </div>
        {upcomingGigs.length === 0 ? (
          <div className="bg-surface-container border border-white/5 rounded-xl p-6 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a98a80"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="text-sm text-on-surface-variant font-body font-medium">No upcoming gigs</p>
            <p className="text-xs text-outline font-body">You&apos;ll appear here when you&apos;re added to an event.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingGigs.slice(0, 3).map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </div>

      {/* ── Booking Requests ── */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline font-semibold text-base text-on-surface">Booking Requests</h3>
          <Link href="/bookings" className="text-xs text-outline hover:text-on-surface-variant font-body transition-colors">
            See all
          </Link>
        </div>
        {bookings.length === 0 ? (
          <div className="bg-surface-container border border-white/5 rounded-xl p-6 flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-on-surface-variant font-body font-medium">No booking requests yet</p>
            <p className="text-xs text-outline font-body">Organizers can book you once you&apos;re listed as an artist.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>

      {/* ── Recent Tips ── */}
      <div className="px-4 mb-6">
        <h3 className="font-headline font-semibold text-base text-on-surface mb-3">Recent Tips</h3>
        {recentTips.length === 0 ? (
          <div className="bg-surface-container border border-white/5 rounded-xl p-6 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ff6b35"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <p className="text-sm text-on-surface-variant font-body font-medium">No tips yet</p>
            <p className="text-xs text-outline font-body">Tips from fans will show up here.</p>
          </div>
        ) : (
          <div className="bg-surface-container border border-white/5 rounded-2xl overflow-hidden">
            {recentTips.slice(0, 5).map((tip, i) => (
              <TipRow
                key={tip.id}
                tip={tip}
                last={i === Math.min(recentTips.length, 5) - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div className="px-4 mb-6">
        <h3 className="font-headline font-semibold text-base text-on-surface mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => router.push('/live/go-live')}
            className="bg-surface-container border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-white/10 transition-colors active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="text-xs font-body font-medium text-on-surface-variant">Go Live</span>
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="bg-surface-container border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-white/10 transition-colors active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-secondary-container/15 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#04b4a2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <span className="text-xs font-body font-medium text-on-surface-variant">Edit Profile</span>
          </button>
          <button
            onClick={() => router.push('/bookings')}
            className="bg-surface-container border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-white/10 transition-colors active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-primary-container/15 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ff6b35"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="text-xs font-body font-medium text-on-surface-variant">Bookings</span>
          </button>
        </div>
      </div>

      {/* ── Payout ── */}
      <div className="px-4">
        <h3 className="font-headline font-semibold text-base text-on-surface mb-3">Payout</h3>
        <div className="bg-surface-container border border-white/5 rounded-2xl p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-on-surface-variant text-xs font-body mb-0.5">Available Balance</p>
              <p className="font-headline font-bold text-2xl text-primary-container">
                {formatCurrency(tipsEarned)}
              </p>
              <p className="text-outline text-[11px] font-body mt-1">Placeholder — live balance via Stripe</p>
            </div>
            <Badge variant="teal">Stripe Connected</Badge>
          </div>
          <Button variant="primary" fullWidth onClick={() => router.push('/stripe-connect')}>
            Withdraw to Bank
          </Button>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container/90 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around py-3 px-4 pb-safe">
          <button
            onClick={() => router.push('/artists/dashboard')}
            className="flex flex-col items-center gap-1 text-primary-container"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span className="text-[10px] font-body font-bold uppercase tracking-wide">Dashboard</span>
          </button>
          <button
            onClick={() => router.push('/bookings')}
            className="flex flex-col items-center gap-1 text-outline hover:text-on-surface-variant transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-[10px] font-body font-bold uppercase tracking-wide">Bookings</span>
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center gap-1 text-outline hover:text-on-surface-variant transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-[10px] font-body font-bold uppercase tracking-wide">Profile</span>
          </button>
          <button
            onClick={() => router.push('/analytics')}
            className="flex flex-col items-center gap-1 text-outline hover:text-on-surface-variant transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span className="text-[10px] font-body font-bold uppercase tracking-wide">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
}
