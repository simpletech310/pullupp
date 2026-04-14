'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatTimeAgo } from '@/lib/utils/format';

const STATS = {
  totalTips: 4580,
  followers: 12400,
  upcomingGigs: 3,
  streams: 28,
};

const RECENT_TIPS = [
  { id: 't1', tipper: 'Alex M.', amount: 50, date: '2026-04-12T18:30:00', context: 'Midnight Groove' },
  { id: 't2', tipper: 'Jordan K.', amount: 20, date: '2026-04-12T15:10:00', context: 'Direct tip' },
  { id: 't3', tipper: 'Sam W.', amount: 10, date: '2026-04-11T22:45:00', context: 'Live stream' },
  { id: 't4', tipper: 'Riley T.', amount: 5, date: '2026-04-11T20:00:00', context: 'Summer Vibes Festival' },
  { id: 't5', tipper: 'Casey D.', amount: 20, date: '2026-04-10T19:30:00', context: 'Direct tip' },
];

const EARNINGS_BARS = [
  { label: 'Mon', value: 85 },
  { label: 'Tue', value: 120 },
  { label: 'Wed', value: 45 },
  { label: 'Thu', value: 200 },
  { label: 'Fri', value: 310 },
  { label: 'Sat', value: 480 },
  { label: 'Sun', value: 260 },
];

const MAX_BAR = Math.max(...EARNINGS_BARS.map(b => b.value));

export default function ArtistDashboardPage() {
  const router = useRouter();

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="font-display font-bold text-xl">Your Dashboard</h2>
        <p className="text-text-secondary text-sm">Track your performance</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard value={formatCurrency(STATS.totalTips)} label="Total Tips" color="text-orange" />
          <StatCard value={STATS.followers.toLocaleString()} label="Followers" color="text-teal" />
          <StatCard value={STATS.upcomingGigs} label="Upcoming Gigs" />
          <StatCard value={STATS.streams} label="Streams" color="text-purple-400" />
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="px-4 mb-6">
        <h3 className="font-display font-semibold text-base mb-3">This Week&apos;s Earnings</h3>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-end justify-between gap-2 h-32">
            {EARNINGS_BARS.map(bar => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-text-muted font-medium">
                  ${bar.value}
                </span>
                <div className="w-full flex justify-center">
                  <div
                    className="w-full max-w-[28px] rounded-t-md bg-orange/80 transition-all duration-500"
                    style={{ height: `${(bar.value / MAX_BAR) * 80}px` }}
                  />
                </div>
                <span className="text-[10px] text-text-muted">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tips */}
      <div className="px-4 mb-6">
        <h3 className="font-display font-semibold text-base mb-3">Recent Tips</h3>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {RECENT_TIPS.map((tip, i) => (
            <div
              key={tip.id}
              className={`flex items-center gap-3 p-3.5 ${i < RECENT_TIPS.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="w-9 h-9 rounded-full bg-orange/15 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tip.tipper}</p>
                <p className="text-text-muted text-xs truncate">{tip.context} &middot; {formatTimeAgo(tip.date)}</p>
              </div>
              <span className="text-orange font-semibold text-sm shrink-0">+{formatCurrency(tip.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h3 className="font-display font-semibold text-base mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => router.push('/live/go-live')}
            className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-border-light transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-error/15 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="text-xs font-medium text-text-secondary">Go Live</span>
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-border-light transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-teal/15 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-text-secondary">Edit Profile</span>
          </button>
          <button
            onClick={() => router.push('/bookings')}
            className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-border-light transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/15 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="text-xs font-medium text-text-secondary">Bookings</span>
          </button>
        </div>
      </div>

      {/* Payout Section */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-semibold text-base mb-3">Payout</h3>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-text-secondary text-xs">Available Balance</p>
              <p className="font-display font-bold text-2xl text-orange mt-0.5">{formatCurrency(1245)}</p>
            </div>
            <Badge variant="success">Stripe Connected</Badge>
          </div>
          <Button variant="primary" fullWidth onClick={() => router.push('/stripe-connect')}>
            Withdraw to Bank
          </Button>
        </div>
      </div>
    </div>
  );
}
