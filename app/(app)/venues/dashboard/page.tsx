'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, StatCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';

const MOCK_BOOKINGS = [
  { id: '1', event: 'Midnight Groove', organizer: 'DJ Flex', date: '2026-04-25', hours: '8PM - 2AM', amount: 1200, status: 'confirmed' as const },
  { id: '2', event: 'Art Gallery Opening', organizer: 'Maya Studios', date: '2026-04-28', hours: '6PM - 10PM', amount: 800, status: 'pending' as const },
  { id: '3', event: 'Tech Mixer', organizer: 'StartupATL', date: '2026-05-02', hours: '5PM - 9PM', amount: 950, status: 'confirmed' as const },
  { id: '4', event: 'Comedy Night', organizer: 'LaunchPad Comedy', date: '2026-05-10', hours: '7PM - 11PM', amount: 700, status: 'pending' as const },
];

const STATUS_BADGE: Record<string, { variant: 'teal' | 'warning'; label: string }> = {
  confirmed: { variant: 'teal', label: 'Confirmed' },
  pending: { variant: 'warning', label: 'Pending' },
};

// Calendar helpers
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// Mock booked/blocked dates for April 2026
const BOOKED_DAYS = [15, 18, 22, 25, 28];
const BLOCKED_DAYS = [7, 8, 14];

export default function VenueDashboardPage() {
  const router = useRouter();
  const [calendarMonth, setCalendarMonth] = useState(3); // April (0-indexed)
  const [calendarYear] = useState(2026);

  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === calendarYear && today.getMonth() === calendarMonth;

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="font-display font-bold text-xl">Your Venue</h1>
        <p className="text-text-secondary text-sm mt-0.5">The Velvet Room</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <StatCard value="24" label="Total Bookings" color="text-orange" />
          <StatCard value="$18.4k" label="Revenue" color="text-teal" />
          <StatCard value="4.8" label="Avg Rating" color="text-warning" />
          <StatCard value="6" label="Upcoming" color="text-purple-400" />
        </div>
      </div>

      {/* Availability Calendar */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-base">Availability</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCalendarMonth(m => Math.max(0, m - 1))}
              className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-secondary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-text-primary min-w-[120px] text-center">
              {MONTH_NAMES[calendarMonth]} {calendarYear}
            </span>
            <button
              onClick={() => setCalendarMonth(m => Math.min(11, m + 1))}
              className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-secondary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <Card className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-text-muted uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isBooked = BOOKED_DAYS.includes(day);
              const isBlocked = BLOCKED_DAYS.includes(day);
              const isToday = isCurrentMonth && today.getDate() === day;

              return (
                <div
                  key={day}
                  className={`
                    h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-colors
                    ${isBooked
                      ? 'bg-teal/20 text-teal border border-teal/30'
                      : isBlocked
                        ? 'bg-error/10 text-error/50 line-through'
                        : isToday
                          ? 'bg-orange/20 text-orange border border-orange/30'
                          : 'text-text-secondary hover:bg-surface-hover'
                    }
                  `}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-teal/40" />
              <span className="text-[11px] text-text-muted">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-surface-alt border border-border" />
              <span className="text-[11px] text-text-muted">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-error/30" />
              <span className="text-[11px] text-text-muted">Blocked</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <div className="px-4 mb-5">
        <h3 className="font-display font-semibold text-base mb-3">Upcoming Bookings</h3>
        <div className="flex flex-col gap-3">
          {MOCK_BOOKINGS.map(booking => (
            <Card
              key={booking.id}
              hoverable
              onClick={() => router.push(`/bookings/${booking.id}`)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{booking.event}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">{booking.organizer}</p>
                  </div>
                  <Badge variant={STATUS_BADGE[booking.status].variant}>
                    {STATUS_BADGE[booking.status].label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {booking.hours}
                  </span>
                  <span className="text-orange font-semibold ml-auto">
                    {formatCurrency(booking.amount)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4">
        <h3 className="font-display font-semibold text-base mb-3">Quick Actions</h3>
        <div className="flex flex-col gap-2.5">
          <Button variant="secondary" size="lg" fullWidth onClick={() => router.push('/venues/create')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Listing
          </Button>
          <Button variant="secondary" size="lg" fullWidth>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Block Dates
          </Button>
          <Button variant="outline" size="lg" fullWidth onClick={() => router.push('/bookings')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            View All Bookings
          </Button>
        </div>
      </div>
    </div>
  );
}
