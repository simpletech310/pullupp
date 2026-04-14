'use client';

import { Card } from '@/components/ui/card';

const STATS = [
  {
    label: 'Total Users',
    value: '1,247',
    change: '+12%',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Total Events',
    value: '89',
    change: '+8%',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Revenue',
    value: '$34,500',
    change: '+23%',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: 'Active Streams',
    value: '3',
    change: '+2',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
];

const ACTIVITY = [
  { text: 'New user registered', detail: 'marcus.j@email.com', time: '2 min ago', type: 'user' },
  { text: 'Event published', detail: 'Rooftop Jazz Night', time: '8 min ago', type: 'event' },
  { text: 'Tip sent', detail: '$25 to DJ Nova', time: '15 min ago', type: 'tip' },
  { text: 'Booking confirmed', detail: 'The Velvet Room - Apr 20', time: '22 min ago', type: 'booking' },
  { text: 'New user registered', detail: 'sarah.k@email.com', time: '35 min ago', type: 'user' },
  { text: 'Event cancelled', detail: 'Beach Bonfire Bash', time: '1 hr ago', type: 'event' },
  { text: 'Tip sent', detail: '$10 to Luna Keys', time: '1 hr ago', type: 'tip' },
  { text: 'Venue approved', detail: 'Skyline Terrace', time: '2 hr ago', type: 'venue' },
  { text: 'Ticket purchased', detail: '2x Underground Beats', time: '2 hr ago', type: 'ticket' },
  { text: 'New user registered', detail: 'alex.w@email.com', time: '3 hr ago', type: 'user' },
];

const ALERTS = [
  { text: '3 events pending review', severity: 'warning' as const },
  { text: '1 user reported', severity: 'error' as const },
  { text: '2 venues awaiting approval', severity: 'warning' as const },
];

function activityIcon(type: string) {
  switch (type) {
    case 'user': return <span className="w-8 h-8 rounded-full bg-teal/15 text-secondary-container flex items-center justify-center text-sm shrink-0">U</span>;
    case 'event': return <span className="w-8 h-8 rounded-full bg-primary-container/15 text-primary-container flex items-center justify-center text-sm shrink-0">E</span>;
    case 'tip': return <span className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center text-sm shrink-0">$</span>;
    case 'booking': return <span className="w-8 h-8 rounded-full bg-success/15 text-success flex items-center justify-center text-sm shrink-0">B</span>;
    case 'venue': return <span className="w-8 h-8 rounded-full bg-warning/15 text-warning flex items-center justify-center text-sm shrink-0">V</span>;
    case 'ticket': return <span className="w-8 h-8 rounded-full bg-teal/15 text-secondary-container flex items-center justify-center text-sm shrink-0">T</span>;
    default: return <span className="w-8 h-8 rounded-full bg-surface-container-high text-outline flex items-center justify-center text-sm shrink-0">?</span>;
  }
}

export default function AdminOverviewPage() {
  return (
    <div className="p-8 max-w-7xl">
      <h1 className="font-headline font-bold text-2xl mb-6">Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
                {stat.icon}
              </div>
              <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
            <div className="font-headline font-bold text-2xl text-on-surface">{stat.value}</div>
            <div className="text-xs text-on-surface-variant mt-1">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h2 className="font-headline font-bold text-lg mb-4">Recent Activity</h2>
            <div className="space-y-1">
              {ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  {activityIcon(item.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface font-medium">{item.text}</p>
                    <p className="text-xs text-outline truncate">{item.detail}</p>
                  </div>
                  <span className="text-xs text-outline whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Alerts */}
        <div>
          <Card className="p-5">
            <h2 className="font-headline font-bold text-lg mb-4">Quick Alerts</h2>
            <div className="space-y-3">
              {ALERTS.map((alert, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    alert.severity === 'error'
                      ? 'bg-error/5 border-error/20'
                      : 'bg-warning/5 border-warning/20'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    alert.severity === 'error' ? 'bg-error' : 'bg-warning'
                  }`} />
                  <span className="text-sm text-on-surface">{alert.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
