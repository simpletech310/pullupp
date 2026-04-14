'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { SERVICE_FEE_PERCENT } from '@/lib/utils/constants';
import { getBookingById } from '@/lib/supabase/queries';

type BookingStatus = 'pending' | 'confirmed' | 'negotiating' | 'completed' | 'cancelled';

interface TimelineEntry {
  id: string;
  label: string;
  occurred_at: string;
  is_active: boolean;
  sort_order: number;
}

interface BookingData {
  id: string;
  status: BookingStatus;
  type: 'venue' | 'artist';
  event_name: string;
  date: string;
  hours: number;
  proposed_amount: number;
  deposit_amount: number;
  notes: string | null;
  requester: { name: string; email: string } | null;
  provider: { name: string; email: string } | null;
  venue: { name: string; type: string; address: string; city: string; state: string; hourly_rate: number } | null;
  artist: { name: string; type: string; genre: string; hourly_rate: number } | null;
  booking_timeline: TimelineEntry[];
}

const STATUS_CONFIG: Record<BookingStatus, { variant: 'warning' | 'teal' | 'orange' | 'success' | 'error'; label: string; dot: string }> = {
  pending:     { variant: 'warning',  label: 'Pending',     dot: 'bg-warning' },
  confirmed:   { variant: 'teal',     label: 'Confirmed',   dot: 'bg-secondary-container' },
  negotiating: { variant: 'orange',   label: 'Negotiating', dot: 'bg-primary-container' },
  completed:   { variant: 'success',  label: 'Completed',   dot: 'bg-secondary' },
  cancelled:   { variant: 'error',    label: 'Cancelled',   dot: 'bg-error' },
};

function SkeletonDetail() {
  return (
    <div className="pb-8 animate-pulse">
      <div className="px-4 pt-4 pb-2">
        <div className="h-4 w-12 bg-surface-container-high rounded mb-3" />
        <div className="h-6 w-2/3 bg-surface-container-high rounded" />
      </div>
      <div className="px-4 mb-4">
        <div className="h-12 bg-surface-container-high rounded-xl" />
      </div>
      <div className="px-4 mb-4">
        <div className="h-48 bg-surface-container-high rounded-2xl" />
      </div>
      <div className="px-4 mb-4">
        <div className="h-36 bg-surface-container-high rounded-2xl" />
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getBookingById(id as string).then(({ data }) => {
      setBooking(data as BookingData | null);
      setLoading(false);
    });
  }, [id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  if (loading) return <SkeletonDetail />;

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 gap-3">
        <p className="text-on-surface-variant text-sm font-body">Booking not found</p>
        <Button variant="secondary" size="sm" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const counterparty = booking.type === 'venue' ? booking.venue?.name : booking.artist?.name;
  const platformFee = booking.proposed_amount * SERVICE_FEE_PERCENT;
  const sortedTimeline = [...(booking.booking_timeline || [])].sort((a, b) => a.sort_order - b.sort_order);

  const location = booking.venue
    ? [booking.venue.address, booking.venue.city, booking.venue.state].filter(Boolean).join(', ')
    : null;

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-on-surface-variant text-sm mb-3 hover:text-on-surface transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <h1 className="font-headline font-bold text-xl text-on-surface">
          {booking.type === 'venue' ? 'Venue' : 'Artist'} Booking
          {counterparty ? ` — ${counterparty}` : ''}
        </h1>
      </div>

      {/* Status Banner */}
      <div className="px-4 mb-4">
        <div className="glass-card rounded-xl border border-white/5 flex items-center gap-3 px-4 py-3">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusConfig.dot}`} />
          <span className="text-sm font-semibold text-on-surface">{statusConfig.label}</span>
        </div>
      </div>

      {/* Booking Info Card */}
      <div className="px-4 mb-4">
        <div className="glass-card p-4 rounded-2xl border border-white/5">
          <h3 className="font-body font-semibold text-xs mb-3 text-on-surface-variant uppercase tracking-wide">Booking Details</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <span className="text-xs text-outline">Type</span>
              <Badge variant={booking.type === 'venue' ? 'purple' : 'teal'}>
                {booking.type === 'venue' ? 'Venue' : 'Artist'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-outline">Event</span>
              <span className="text-sm text-on-surface font-medium text-right">{booking.event_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-outline">Date</span>
              <span className="text-sm text-on-surface text-right">{formatDate(booking.date)}</span>
            </div>
            {booking.hours > 0 && (
              <div className="flex justify-between">
                <span className="text-xs text-outline">Hours</span>
                <span className="text-sm text-on-surface text-right">{booking.hours} hrs</span>
              </div>
            )}
            {location && (
              <div className="flex justify-between">
                <span className="text-xs text-outline">Location</span>
                <span className="text-sm text-on-surface text-right max-w-[60%]">{location}</span>
              </div>
            )}
            {counterparty && (
              <div className="flex justify-between">
                <span className="text-xs text-outline">{booking.type === 'venue' ? 'Venue' : 'Artist'}</span>
                <span className="text-sm text-on-surface font-medium text-right">{counterparty}</span>
              </div>
            )}
            {booking.requester && (
              <div className="flex justify-between">
                <span className="text-xs text-outline">Requester</span>
                <span className="text-sm text-on-surface text-right">{booking.requester.name}</span>
              </div>
            )}
            {booking.notes && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-outline">Notes</span>
                <span className="text-sm text-on-surface-variant">{booking.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      {sortedTimeline.length > 0 && (
        <div className="px-4 mb-4">
          <div className="glass-card p-4 rounded-2xl border border-white/5">
            <h3 className="font-body font-semibold text-xs mb-4 text-on-surface-variant uppercase tracking-wide">Timeline</h3>
            <div className="flex flex-col">
              {sortedTimeline.map((entry, i) => {
                const isLast = i === sortedTimeline.length - 1;
                return (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${
                        entry.is_active
                          ? 'bg-secondary-container shadow-[0_0_8px_rgba(4,180,162,0.4)]'
                          : 'bg-surface-container-high border-2 border-outline-variant'
                      }`} />
                      {!isLast && (
                        <div className={`w-0.5 flex-1 min-h-[32px] ${
                          entry.is_active ? 'bg-secondary-container/30' : 'bg-outline-variant/40'
                        }`} />
                      )}
                    </div>
                    <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                      <p className={`text-sm font-medium ${entry.is_active ? 'text-on-surface' : 'text-outline'}`}>
                        {entry.label}
                      </p>
                      {entry.occurred_at ? (
                        <p className="text-xs text-outline mt-0.5">{formatDate(entry.occurred_at)}</p>
                      ) : (
                        <p className="text-xs text-outline mt-0.5 italic">Waiting...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Section */}
      <div className="px-4 mb-4">
        <div className="glass-card p-4 rounded-2xl border border-white/5">
          <h3 className="font-body font-semibold text-xs mb-3 text-on-surface-variant uppercase tracking-wide">Pricing</h3>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">Proposed Amount</span>
              <span className="text-sm text-on-surface">{formatCurrency(booking.proposed_amount)}</span>
            </div>
            {booking.deposit_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Deposit</span>
                <span className="text-sm text-on-surface">{formatCurrency(booking.deposit_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-on-surface-variant">Platform Fee (5%)</span>
              <span className="text-sm text-on-surface">{formatCurrency(platformFee)}</span>
            </div>
            <div className="border-t border-white/5 pt-2.5 flex justify-between">
              <span className="text-sm font-semibold text-on-surface">Total</span>
              <span className="text-sm font-bold text-primary-container">
                {formatCurrency(booking.proposed_amount + platformFee)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Negotiation UI */}
      {booking.status === 'negotiating' && (
        <div className="px-4 mb-4">
          <div className="glass-card p-4 rounded-2xl border border-white/5">
            <h3 className="font-body font-semibold text-xs mb-3 text-on-surface-variant uppercase tracking-wide">Negotiation</h3>
            <div className="bg-surface-container-high rounded-xl p-3 mb-4">
              <p className="text-xs text-outline mb-1">Pending negotiation with {counterparty}</p>
              <p className="font-headline font-bold text-xl text-primary-container">{formatCurrency(booking.proposed_amount)}</p>
              <p className="text-xs text-outline mt-1">Current proposed amount</p>
            </div>
            <div className="flex gap-2.5">
              <button
                className="bg-secondary-container text-white flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                onClick={() => showToast('Coming soon')}
              >
                Accept
              </button>
              <button
                className="bg-surface-container-high text-on-surface flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                onClick={() => { setCounterAmount(''); setCounterModalOpen(true); }}
              >
                Counter
              </button>
              <button
                className="bg-error-container/20 text-error border border-error/20 flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                onClick={() => showToast('Coming soon')}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 flex flex-col gap-2.5">
        {booking.status === 'pending' && (
          <Button
            variant="danger"
            size="lg"
            fullWidth
            onClick={() => showToast('Coming soon')}
          >
            Cancel Booking
          </Button>
        )}
        {booking.status === 'confirmed' && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => showToast('Coming soon')}
          >
            Pay Now
          </Button>
        )}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => router.push('/messages')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Message {counterparty || 'Provider'}
        </Button>
      </div>

      {/* Counter Offer Modal */}
      <Modal
        open={counterModalOpen}
        onClose={() => setCounterModalOpen(false)}
        title="Counter Offer"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-on-surface-variant font-body">
            Current offer: {formatCurrency(booking.proposed_amount)}
          </p>
          <Input
            label="Your Counter Amount"
            type="number"
            placeholder="Enter amount"
            value={counterAmount}
            onChange={e => setCounterAmount(e.target.value)}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
          <div className="flex gap-2.5 pt-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={() => setCounterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={() => {
                setCounterModalOpen(false);
                showToast('Coming soon');
              }}
            >
              Send Counter
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-secondary-container text-white px-5 py-3.5 rounded-xl text-sm font-semibold text-center shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
