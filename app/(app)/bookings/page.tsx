'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { getUserBookings } from '@/lib/supabase/queries';
import { useAuthContext } from '@/providers/auth-provider';

type BookingStatus = 'pending' | 'confirmed' | 'negotiating' | 'completed' | 'cancelled';
type BookingType = 'venue' | 'artist';
type TabKey = 'sent' | 'received';

interface Booking {
  id: string;
  type: BookingType;
  event_name: string;
  date: string;
  hours: number;
  proposed_amount: number;
  status: BookingStatus;
  artist?: { name: string } | null;
  venue?: { name: string } | null;
}

const STATUS_CONFIG: Record<BookingStatus, { variant: 'warning' | 'teal' | 'orange' | 'success' | 'error'; label: string; dot: string }> = {
  pending:     { variant: 'warning',  label: 'Pending',     dot: 'bg-warning' },
  confirmed:   { variant: 'teal',     label: 'Confirmed',   dot: 'bg-secondary-container' },
  negotiating: { variant: 'orange',   label: 'Negotiating', dot: 'bg-primary-container' },
  completed:   { variant: 'success',  label: 'Completed',   dot: 'bg-secondary' },
  cancelled:   { variant: 'error',    label: 'Cancelled',   dot: 'bg-error' },
};

const TYPE_CONFIG: Record<BookingType, { variant: 'purple' | 'teal'; label: string }> = {
  venue:  { variant: 'purple', label: 'Venue' },
  artist: { variant: 'teal',   label: 'Artist' },
};

const ALL_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'negotiating', 'completed', 'cancelled'];

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl border border-white/5 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-14 bg-surface-container-high rounded-full" />
          <div className="h-5 w-20 bg-surface-container-high rounded-full" />
        </div>
        <div className="h-5 w-16 bg-surface-container-high rounded-md" />
      </div>
      <div className="h-4 w-3/4 bg-surface-container-high rounded mb-2" />
      <div className="flex gap-4 mb-2">
        <div className="h-3 w-20 bg-surface-container-high rounded" />
        <div className="h-3 w-16 bg-surface-container-high rounded" />
      </div>
      <div className="h-3 w-32 bg-surface-container-high rounded" />
    </div>
  );
}

export default function BookingsPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabKey>('sent');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    getUserBookings(user.id, activeTab).then(({ data }) => {
      setBookings((data as Booking[]) || []);
      setLoading(false);
    });
  }, [user?.id, activeTab]);

  const filtered = statusFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === statusFilter);

  const getCounterpartyName = (booking: Booking) =>
    booking.type === 'venue' ? booking.venue?.name : booking.artist?.name;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="font-headline font-bold text-3xl tracking-tight text-on-surface">Bookings</h1>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-surface-container border border-white/5 rounded-xl p-1">
          {(['sent', 'received'] as TabKey[]).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setStatusFilter('all'); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-on-surface-variant'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              statusFilter === 'all'
                ? 'bg-primary-container text-white'
                : 'bg-surface-container border border-white/5 text-on-surface-variant'
            }`}
          >
            All
          </button>
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 capitalize ${
                statusFilter === s
                  ? 'bg-primary-container text-white'
                  : 'bg-surface-container border border-white/5 text-on-surface-variant'
              }`}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="px-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="bg-surface-container-high w-14 h-14 rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-outline">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p className="text-on-surface-variant text-sm font-body">No bookings found</p>
            <p className="text-outline text-xs font-body text-center">
              {statusFilter !== 'all'
                ? `No ${STATUS_CONFIG[statusFilter as BookingStatus].label.toLowerCase()} bookings`
                : activeTab === 'sent'
                  ? "You haven't sent any booking requests yet"
                  : "You haven't received any booking requests yet"
              }
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(booking => {
              const typeConfig = TYPE_CONFIG[booking.type] || TYPE_CONFIG.venue;
              const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const counterparty = getCounterpartyName(booking);

              return (
                <div
                  key={booking.id}
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                  className="glass-card rounded-2xl border border-white/5 cursor-pointer active:scale-[0.98] transition-transform p-4"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={typeConfig.variant}>
                        {typeConfig.label}
                      </Badge>
                      <Badge variant={statusConfig.variant}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <span className="text-primary-container font-semibold text-sm">
                      {formatCurrency(booking.proposed_amount)}
                    </span>
                  </div>

                  {/* Event name */}
                  <h4 className="font-headline font-bold text-sm mb-1.5 text-on-surface">{booking.event_name}</h4>

                  {/* Date / hours */}
                  <div className="flex items-center gap-4 text-xs text-outline mb-2">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {formatDate(booking.date)}
                    </span>
                    {booking.hours > 0 && (
                      <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {booking.hours} hrs
                      </span>
                    )}
                  </div>

                  {/* Counterparty */}
                  {counterparty && (
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {activeTab === 'sent' ? 'To' : 'From'}: {counterparty}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Booking FAB */}
      <button
        onClick={() => router.push('/bookings/request')}
        className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-primary-container rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.3)] active:scale-95 transition-all duration-150"
        aria-label="New Booking"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
