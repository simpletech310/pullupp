'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils/format';

type BookingStatus = 'pending' | 'confirmed' | 'negotiating' | 'completed' | 'cancelled';
type BookingType = 'Venue' | 'Artist';
type TabKey = 'sent' | 'received';

interface Booking {
  id: string;
  type: BookingType;
  name: string;
  date: string;
  hours: string;
  amount: number;
  status: BookingStatus;
  counterparty: string;
}

const STATUS_CONFIG: Record<BookingStatus, { variant: 'warning' | 'teal' | 'orange' | 'success' | 'error'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  confirmed: { variant: 'teal', label: 'Confirmed' },
  negotiating: { variant: 'orange', label: 'Negotiating' },
  completed: { variant: 'success', label: 'Completed' },
  cancelled: { variant: 'error', label: 'Cancelled' },
};

const TYPE_CONFIG: Record<BookingType, { variant: 'purple' | 'teal' }> = {
  Venue: { variant: 'purple' },
  Artist: { variant: 'teal' },
};

const SENT_BOOKINGS: Booking[] = [
  { id: '1', type: 'Venue', name: 'The Velvet Room - Midnight Groove', date: '2026-04-25', hours: '8PM - 2AM', amount: 1200, status: 'confirmed', counterparty: 'The Velvet Room' },
  { id: '2', type: 'Artist', name: 'DJ Flex for Summer Vibes', date: '2026-05-01', hours: '9PM - 1AM', amount: 800, status: 'negotiating', counterparty: 'DJ Flex' },
  { id: '3', type: 'Venue', name: 'Skyline Rooftop - Comedy Night', date: '2026-05-10', hours: '7PM - 11PM', amount: 950, status: 'pending', counterparty: 'Skyline Rooftop' },
  { id: '4', type: 'Artist', name: 'Maya Art Installation', date: '2026-04-15', hours: '12PM - 6PM', amount: 500, status: 'completed', counterparty: 'Maya Studios' },
  { id: '5', type: 'Venue', name: 'Studio 54 - Product Launch', date: '2026-03-20', hours: '6PM - 10PM', amount: 1500, status: 'cancelled', counterparty: 'Studio 54 ATL' },
];

const RECEIVED_BOOKINGS: Booking[] = [
  { id: '6', type: 'Venue', name: 'Art Gallery Opening', date: '2026-04-28', hours: '6PM - 10PM', amount: 800, status: 'pending', counterparty: 'Maya Studios' },
  { id: '7', type: 'Venue', name: 'Tech Mixer', date: '2026-05-02', hours: '5PM - 9PM', amount: 950, status: 'confirmed', counterparty: 'StartupATL' },
  { id: '8', type: 'Venue', name: 'Jazz Night', date: '2026-05-15', hours: '8PM - 12AM', amount: 1100, status: 'negotiating', counterparty: 'Smooth Jazz Collective' },
];

const ALL_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'negotiating', 'completed', 'cancelled'];

export default function BookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('sent');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  const bookings = activeTab === 'sent' ? SENT_BOOKINGS : RECEIVED_BOOKINGS;
  const filtered = statusFilter === 'all' ? bookings : bookings.filter(b => b.status === statusFilter);

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="font-display font-bold text-xl">Bookings</h1>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-surface border border-border rounded-xl p-1">
          {(['sent', 'received'] as TabKey[]).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setStatusFilter('all'); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-orange text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="px-4 mb-4">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as BookingStatus | 'all')}
          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary font-body focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-colors duration-200 appearance-none"
        >
          <option value="all" className="bg-surface">All Statuses</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s} className="bg-surface capitalize">
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
      </div>

      {/* Bookings List */}
      <div className="px-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-full bg-surface-alt flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p className="text-text-secondary text-sm">No bookings found</p>
            <p className="text-text-muted text-xs">
              {statusFilter !== 'all'
                ? `No ${STATUS_CONFIG[statusFilter].label.toLowerCase()} bookings`
                : activeTab === 'sent'
                  ? 'You haven\'t sent any booking requests yet'
                  : 'You haven\'t received any booking requests yet'
              }
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(booking => (
              <Card
                key={booking.id}
                hoverable
                onClick={() => router.push(`/bookings/${booking.id}`)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={TYPE_CONFIG[booking.type].variant}>
                        {booking.type}
                      </Badge>
                      <Badge variant={STATUS_CONFIG[booking.status].variant}>
                        {STATUS_CONFIG[booking.status].label}
                      </Badge>
                    </div>
                    <span className="text-orange font-semibold text-sm">
                      {formatCurrency(booking.amount)}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm mb-1.5">{booking.name}</h4>

                  <div className="flex items-center gap-4 text-xs text-text-muted mb-2">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {formatDate(booking.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {booking.hours}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {activeTab === 'sent' ? 'To' : 'From'}: {booking.counterparty}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
