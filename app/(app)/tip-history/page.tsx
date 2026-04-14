'use client';

import { useRouter } from 'next/navigation';
import { AVATAR_COLORS } from '@/lib/utils/constants';
import { formatCurrency, formatTimeAgo } from '@/lib/utils/format';

const MOCK_TIPS = [
  { id: 'th1', artistName: 'DJ Nova', artistId: 'a1', amount: 50, date: '2026-04-12T18:30:00', context: 'At Midnight Groove', colorIndex: 0 },
  { id: 'th2', artistName: 'Maya Blue', artistId: 'a5', amount: 20, date: '2026-04-11T21:15:00', context: 'Direct tip', colorIndex: 4 },
  { id: 'th3', artistName: 'Kai Rhythm', artistId: 'a3', amount: 10, date: '2026-04-10T23:00:00', context: 'During live stream', colorIndex: 2 },
  { id: 'th4', artistName: 'DJ Spice', artistId: 'a8', amount: 100, date: '2026-04-09T20:45:00', context: 'At Summer Vibes Festival', colorIndex: 7 },
  { id: 'th5', artistName: 'SoulWave', artistId: 'a2', amount: 5, date: '2026-04-08T19:30:00', context: 'Direct tip', colorIndex: 1 },
  { id: 'th6', artistName: 'Lena Park', artistId: 'a6', amount: 20, date: '2026-04-07T22:10:00', context: 'At Laugh Factory Live', colorIndex: 5 },
  { id: 'th7', artistName: 'DJ Nova', artistId: 'a1', amount: 10, date: '2026-04-06T17:00:00', context: 'During live stream', colorIndex: 0 },
  { id: 'th8', artistName: 'Marcus Cole', artistId: 'a4', amount: 50, date: '2026-04-05T21:30:00', context: 'At Jazz Under the Stars', colorIndex: 3 },
  { id: 'th9', artistName: 'Chef Kwame', artistId: 'a7', amount: 5, date: '2026-04-04T16:20:00', context: 'Direct tip', colorIndex: 6 },
  { id: 'th10', artistName: 'DJ Spice', artistId: 'a8', amount: 20, date: '2026-04-03T23:45:00', context: 'During live stream', colorIndex: 7 },
];

const TOTAL_TIPS = MOCK_TIPS.reduce((sum, t) => sum + t.amount, 0);

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getContextIcon(context: string) {
  if (context.startsWith('At ')) {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-outline">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }
  if (context.includes('live stream')) {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-outline">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-outline">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export default function TipHistoryPage() {
  const router = useRouter();

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h2 className="font-headline font-bold text-xl">Tip History</h2>
      </div>

      {/* Total Stat */}
      <div className="px-4 mb-4">
        <div className="bg-surface-container border border-white/5 rounded-2xl p-4 text-center">
          <p className="text-on-surface-variant text-xs uppercase tracking-wide mb-1">Total Tips Sent</p>
          <p className="font-headline font-bold text-3xl text-primary-container">{formatCurrency(TOTAL_TIPS)}</p>
          <p className="text-outline text-xs mt-1">{MOCK_TIPS.length} tips total</p>
        </div>
      </div>

      {/* Tip List */}
      <div className="px-4">
        <div className="flex flex-col gap-2">
          {MOCK_TIPS.map(tip => {
            const color = AVATAR_COLORS[tip.colorIndex % AVATAR_COLORS.length];

            return (
              <div
                key={tip.id}
                className="bg-surface-container border border-white/5 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:border-white/10 transition-colors"
                onClick={() => router.push(`/artists/${tip.artistId}`)}
              >
                {/* Artist Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-headline font-bold text-xs shrink-0"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
                >
                  {getInitials(tip.artistName)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{tip.artistName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {getContextIcon(tip.context)}
                    <span className="text-outline text-xs truncate">{tip.context}</span>
                  </div>
                </div>

                {/* Amount + Date */}
                <div className="text-right shrink-0">
                  <p className="text-primary-container font-semibold text-sm">{formatCurrency(tip.amount)}</p>
                  <p className="text-outline text-xs mt-0.5">{formatTimeAgo(tip.date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
