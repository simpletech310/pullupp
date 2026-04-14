'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/format';
import { SERVICE_FEE_PERCENT } from '@/lib/utils/constants';

type BookingStatus = 'pending' | 'confirmed' | 'negotiating' | 'completed' | 'cancelled';

interface TimelineEvent {
  label: string;
  date: string;
  completed: boolean;
}

interface BookingDetail {
  id: string;
  title: string;
  type: 'Venue' | 'Artist';
  eventName: string;
  date: string;
  hours: string;
  location: string;
  status: BookingStatus;
  proposedAmount: number;
  finalAmount: number | null;
  deposit: number;
  counterparty: string;
  timeline: TimelineEvent[];
  currentOffer: number | null;
}

const STATUS_CONFIG: Record<BookingStatus, { variant: 'warning' | 'teal' | 'orange' | 'success' | 'error'; label: string; bg: string }> = {
  pending: { variant: 'warning', label: 'Pending', bg: 'bg-warning/10 border-warning/20' },
  confirmed: { variant: 'teal', label: 'Confirmed', bg: 'bg-teal/10 border-teal/20' },
  negotiating: { variant: 'orange', label: 'Negotiating', bg: 'bg-orange/10 border-orange/20' },
  completed: { variant: 'success', label: 'Completed', bg: 'bg-success/10 border-success/20' },
  cancelled: { variant: 'error', label: 'Cancelled', bg: 'bg-error/10 border-error/20' },
};

const MOCK_BOOKINGS: Record<string, BookingDetail> = {
  '1': {
    id: '1',
    title: 'Venue Booking - The Velvet Room',
    type: 'Venue',
    eventName: 'Midnight Groove',
    date: 'Fri, Apr 25, 2026',
    hours: '8:00 PM - 2:00 AM (6 hours)',
    location: '123 Peachtree St, Atlanta, GA',
    status: 'confirmed',
    proposedAmount: 1200,
    finalAmount: 1200,
    deposit: 500,
    counterparty: 'The Velvet Room',
    timeline: [
      { label: 'Request Sent', date: 'Apr 10, 2026', completed: true },
      { label: 'Viewed by Venue', date: 'Apr 10, 2026', completed: true },
      { label: 'Accepted', date: 'Apr 11, 2026', completed: true },
      { label: 'Payment Processed', date: 'Apr 12, 2026', completed: true },
    ],
    currentOffer: null,
  },
  '2': {
    id: '2',
    title: 'Artist Booking - DJ Flex',
    type: 'Artist',
    eventName: 'Summer Vibes Festival',
    date: 'Fri, May 1, 2026',
    hours: '9:00 PM - 1:00 AM (4 hours)',
    location: 'Skyline Rooftop, Atlanta, GA',
    status: 'negotiating',
    proposedAmount: 800,
    finalAmount: null,
    deposit: 300,
    counterparty: 'DJ Flex',
    timeline: [
      { label: 'Request Sent', date: 'Apr 8, 2026', completed: true },
      { label: 'Viewed by Artist', date: 'Apr 8, 2026', completed: true },
      { label: 'Counter Offer Received', date: 'Apr 9, 2026', completed: true },
      { label: 'Payment Processed', date: '', completed: false },
    ],
    currentOffer: 950,
  },
  '3': {
    id: '3',
    title: 'Venue Booking - Skyline Rooftop',
    type: 'Venue',
    eventName: 'Comedy Night',
    date: 'Sun, May 10, 2026',
    hours: '7:00 PM - 11:00 PM (4 hours)',
    location: '456 Midtown Ave, Atlanta, GA',
    status: 'pending',
    proposedAmount: 950,
    finalAmount: null,
    deposit: 400,
    counterparty: 'Skyline Rooftop',
    timeline: [
      { label: 'Request Sent', date: 'Apr 12, 2026', completed: true },
      { label: 'Viewed by Venue', date: '', completed: false },
      { label: 'Accepted', date: '', completed: false },
      { label: 'Payment Processed', date: '', completed: false },
    ],
    currentOffer: null,
  },
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const booking = MOCK_BOOKINGS[id as string] || MOCK_BOOKINGS['1'];
  const statusConfig = STATUS_CONFIG[booking.status];
  const platformFee = (booking.finalAmount ?? booking.proposedAmount) * SERVICE_FEE_PERCENT;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-text-secondary text-sm mb-3 hover:text-text-primary transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <h1 className="font-display font-bold text-xl">{booking.title}</h1>
      </div>

      {/* Status Banner */}
      <div className="px-4 mb-4">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${statusConfig.bg}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${
            booking.status === 'pending' ? 'bg-warning' :
            booking.status === 'confirmed' ? 'bg-teal' :
            booking.status === 'negotiating' ? 'bg-orange' :
            booking.status === 'completed' ? 'bg-success' :
            'bg-error'
          }`} />
          <span className="text-sm font-semibold">
            {statusConfig.label}
          </span>
          {booking.status === 'negotiating' && booking.currentOffer && (
            <span className="text-xs text-text-secondary ml-auto">
              Counter: {formatCurrency(booking.currentOffer)}
            </span>
          )}
        </div>
      </div>

      {/* Booking Info Card */}
      <div className="px-4 mb-4">
        <Card className="p-4">
          <h3 className="font-display font-semibold text-sm mb-3 text-text-secondary uppercase tracking-wide">Booking Details</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <span className="text-xs text-text-muted">Type</span>
              <Badge variant={booking.type === 'Venue' ? 'purple' : 'teal'}>{booking.type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-text-muted">Event</span>
              <span className="text-sm font-medium text-right">{booking.eventName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-text-muted">Date</span>
              <span className="text-sm text-right">{booking.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-text-muted">Hours</span>
              <span className="text-sm text-right">{booking.hours}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-text-muted">Location</span>
              <span className="text-sm text-right max-w-[60%]">{booking.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-text-muted">{booking.type === 'Venue' ? 'Venue' : 'Artist'}</span>
              <span className="text-sm font-medium text-right">{booking.counterparty}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <div className="px-4 mb-4">
        <Card className="p-4">
          <h3 className="font-display font-semibold text-sm mb-4 text-text-secondary uppercase tracking-wide">Timeline</h3>
          <div className="flex flex-col">
            {booking.timeline.map((event, i) => {
              const isLast = i === booking.timeline.length - 1;
              return (
                <div key={event.label} className="flex gap-3">
                  {/* Dot and line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${
                      event.completed ? 'bg-teal shadow-[0_0_8px_rgba(20,184,166,0.4)]' : 'bg-surface-alt border-2 border-border-light'
                    }`} />
                    {!isLast && (
                      <div className={`w-0.5 flex-1 min-h-[32px] ${
                        event.completed ? 'bg-teal/30' : 'bg-border'
                      }`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                    <p className={`text-sm font-medium ${event.completed ? 'text-text-primary' : 'text-text-muted'}`}>
                      {event.label}
                    </p>
                    {event.date ? (
                      <p className="text-xs text-text-muted mt-0.5">{event.date}</p>
                    ) : (
                      <p className="text-xs text-text-muted mt-0.5 italic">Waiting...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Pricing Section */}
      <div className="px-4 mb-4">
        <Card className="p-4">
          <h3 className="font-display font-semibold text-sm mb-3 text-text-secondary uppercase tracking-wide">Pricing</h3>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Proposed Amount</span>
              <span className="text-sm">{formatCurrency(booking.proposedAmount)}</span>
            </div>
            {booking.finalAmount && booking.finalAmount !== booking.proposedAmount && (
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Final Amount</span>
                <span className="text-sm font-semibold text-teal">{formatCurrency(booking.finalAmount)}</span>
              </div>
            )}
            {booking.currentOffer && (
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Current Offer</span>
                <span className="text-sm font-semibold text-orange">{formatCurrency(booking.currentOffer)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Deposit</span>
              <span className="text-sm">{formatCurrency(booking.deposit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Platform Fee (5%)</span>
              <span className="text-sm">{formatCurrency(platformFee)}</span>
            </div>
            <div className="border-t border-border pt-2.5 flex justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-sm font-bold text-orange">
                {formatCurrency((booking.finalAmount ?? booking.proposedAmount) + platformFee)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Negotiation UI */}
      {booking.status === 'negotiating' && booking.currentOffer && (
        <div className="px-4 mb-4">
          <Card className="p-4">
            <h3 className="font-display font-semibold text-sm mb-3 text-text-secondary uppercase tracking-wide">Negotiation</h3>
            <div className="bg-surface-alt rounded-xl p-3 mb-4">
              <p className="text-xs text-text-muted mb-1">Current offer from {booking.counterparty}</p>
              <p className="font-display font-bold text-xl text-orange">{formatCurrency(booking.currentOffer)}</p>
              <p className="text-xs text-text-muted mt-1">
                {booking.currentOffer > booking.proposedAmount ? '+' : ''}{formatCurrency(booking.currentOffer - booking.proposedAmount)} from your original offer
              </p>
            </div>
            <div className="flex gap-2.5">
              <Button
                variant="teal"
                size="md"
                className="flex-1"
                onClick={() => showToast('Offer accepted!')}
              >
                Accept
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => { setCounterAmount(''); setCounterModalOpen(true); }}
              >
                Counter
              </Button>
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                onClick={() => showToast('Offer declined')}
              >
                Decline
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 flex flex-col gap-2.5">
        {booking.status === 'pending' && (
          <Button
            variant="danger"
            size="lg"
            fullWidth
            onClick={() => showToast('Booking cancelled')}
          >
            Cancel Booking
          </Button>
        )}
        {booking.status === 'confirmed' && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => showToast('Redirecting to payment...')}
          >
            Pay Now
          </Button>
        )}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => router.push('/messages/1')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Message {booking.counterparty}
        </Button>
      </div>

      {/* Counter Offer Modal */}
      <Modal
        open={counterModalOpen}
        onClose={() => setCounterModalOpen(false)}
        title="Counter Offer"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            Current offer: {formatCurrency(booking.currentOffer ?? 0)}
          </p>
          <Input
            label="Your Counter Amount"
            type="number"
            placeholder="Enter amount"
            value={counterAmount}
            onChange={e => setCounterAmount(e.target.value)}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
                showToast(`Counter offer of ${formatCurrency(Number(counterAmount))} sent!`);
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
          <div className="bg-teal text-white px-5 py-3.5 rounded-xl text-sm font-semibold text-center shadow-lg shadow-teal/20">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
