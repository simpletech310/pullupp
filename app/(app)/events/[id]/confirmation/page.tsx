'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { EVENT_GRADIENTS } from '@/lib/utils/constants';
import { formatDateTime } from '@/lib/utils/format';

const EVENTS_DATA: Record<string, {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  gradient: number;
  venue: { name: string; address: string; city: string; state: string };
}> = {
  '1': {
    id: '1', title: 'Midnight Groove', date: '2026-05-15',
    startTime: '9:00 PM', endTime: '2:00 AM', gradient: 0,
    venue: { name: 'The Velvet Room', address: '123 Peachtree St NE', city: 'Atlanta', state: 'GA' },
  },
  '2': {
    id: '2', title: 'Laugh Factory Live', date: '2026-05-18',
    startTime: '8:00 PM', endTime: '10:30 PM', gradient: 1,
    venue: { name: 'Skyline Rooftop', address: '456 Ponce de Leon Ave', city: 'Atlanta', state: 'GA' },
  },
  '3': {
    id: '3', title: 'Canvas & Cocktails', date: '2026-05-20',
    startTime: '7:00 PM', endTime: '10:00 PM', gradient: 2,
    venue: { name: 'Creative Co-Op', address: '789 Auburn Ave NE', city: 'Atlanta', state: 'GA' },
  },
  '4': {
    id: '4', title: 'Street Eats Festival', date: '2026-05-22',
    startTime: '12:00 PM', endTime: '8:00 PM', gradient: 3,
    venue: { name: 'Garden Pavilion', address: '101 Centennial Olympic Park Dr', city: 'Atlanta', state: 'GA' },
  },
  '5': {
    id: '5', title: 'Tech Connect Mixer', date: '2026-05-25',
    startTime: '6:00 PM', endTime: '9:00 PM', gradient: 4,
    venue: { name: 'Studio 54 ATL', address: '54 Techwood Dr NW', city: 'Atlanta', state: 'GA' },
  },
};

function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const event = EVENTS_DATA[eventId];

  const sessionId = searchParams.get('session_id');
  const tierName = searchParams.get('tier') || 'General Admission';
  const qty = parseInt(searchParams.get('qty') || '1', 10);

  const [showCheck, setShowCheck] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [orderData, setOrderData] = useState<{
    confirmation_code: string;
    tier_name: string;
    quantity: number;
    total: number;
    tickets: { id: string; code: string }[];
  } | null>(null);
  const [orderLoading, setOrderLoading] = useState(!!sessionId);

  const confirmationCode = useMemo(() => orderData?.confirmation_code || generateConfirmationCode(), [orderData]);

  // Fetch order data from Supabase when session_id is present
  useEffect(() => {
    if (!sessionId) return;
    async function fetchOrder() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: order } = await supabase
          .from('orders')
          .select('*, tickets(*)')
          .eq('stripe_session_id', sessionId)
          .single();
        if (order) {
          setOrderData({
            confirmation_code: order.confirmation_code || generateConfirmationCode(),
            tier_name: order.tier_name || tierName,
            quantity: order.quantity || qty,
            total: order.total || 0,
            tickets: order.tickets || [],
          });
        }
      } catch {
        // If fetch fails, continue with URL params
      }
      setOrderLoading(false);
    }
    fetchOrder();
  }, [sessionId, tierName, qty]);

  useEffect(() => {
    const delay = orderLoading ? 0 : 200;
    const t1 = setTimeout(() => setShowCheck(true), delay);
    const t2 = setTimeout(() => setShowContent(true), delay + 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [orderLoading]);

  const displayTier = orderData?.tier_name || tierName;
  const displayQty = orderData?.quantity || qty;

  if (orderLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-10 h-10 border-2 border-orange border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-text-secondary">Loading your order...</p>
      </div>
    );
  }

  if (!event && !orderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-4xl mb-3">🎫</div>
        <h2 className="font-display font-bold text-lg text-text-primary">
          {sessionId ? 'Order Confirmed!' : 'Event not found'}
        </h2>
        {sessionId ? (
          <div className="text-center mt-2">
            <p className="text-sm text-text-secondary">Your tickets have been confirmed.</p>
            <Button variant="primary" className="mt-4" onClick={() => router.push('/tickets')}>View My Tickets</Button>
          </div>
        ) : (
          <Button variant="ghost" className="mt-4" onClick={() => router.push('/home')}>Go Home</Button>
        )}
      </div>
    );
  }

  const gradient = EVENT_GRADIENTS[event.gradient % EVENT_GRADIENTS.length];

  return (
    <div className="px-4 py-8 max-w-lg mx-auto">
      {/* Success Animation */}
      <div className="flex flex-col items-center mb-8">
        <div className={`w-20 h-20 rounded-full bg-success/15 border-2 border-success flex items-center justify-center transition-all duration-500 ${
          showCheck ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-all duration-300 delay-200 ${showCheck ? 'opacity-100' : 'opacity-0'}`}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div className={`mt-5 text-center transition-all duration-500 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h1 className="font-display font-bold text-2xl text-text-primary">You're in!</h1>
          <p className="text-sm text-text-secondary mt-1">Your tickets have been confirmed</p>
        </div>
      </div>

      {/* Event Info */}
      <div className={`text-center mb-6 transition-all duration-500 delay-100 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <h2 className="font-display font-bold text-lg text-text-primary">{event.title}</h2>
        <p className="text-sm text-text-secondary mt-1">{formatDateTime(event.date, event.startTime)}</p>
        <p className="text-xs text-text-muted mt-0.5">{event.venue.name} &middot; {event.venue.city}, {event.venue.state}</p>
      </div>

      {/* Ticket Card */}
      <div className={`transition-all duration-500 delay-200 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg">
          {/* Gradient Strip */}
          <div className="h-3" style={{ background: gradient }} />

          <div className="p-5">
            {/* Ticket Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-display font-bold text-base text-text-primary">{event.title}</p>
                <p className="text-xs text-text-secondary mt-0.5">{formatDateTime(event.date, event.startTime)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted uppercase tracking-wide">Qty</p>
                <p className="font-display font-bold text-lg text-orange">{displayQty}</p>
              </div>
            </div>

            {/* Tier */}
            <div className="bg-surface-alt rounded-xl px-3 py-2 mb-4">
              <p className="text-xs text-text-muted uppercase tracking-wide">Tier</p>
              <p className="text-sm font-semibold text-text-primary">{displayTier}</p>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex justify-center mb-4">
              <div className="w-36 h-36 rounded-xl bg-surface-alt border border-border flex flex-col items-center justify-center gap-2">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="3" height="3" />
                  <line x1="21" y1="14" x2="21" y2="14.01" />
                  <line x1="21" y1="21" x2="21" y2="21.01" />
                  <line x1="17" y1="17" x2="17" y2="17.01" />
                  <line x1="21" y1="17" x2="21" y2="17.01" />
                  <line x1="17" y1="21" x2="17" y2="21.01" />
                </svg>
                <span className="text-xs text-text-muted font-mono">QR</span>
              </div>
            </div>

            {/* Perforated Divider */}
            <div className="relative my-4">
              <div className="border-t-2 border-dashed border-border" />
              <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background" />
              <div className="absolute -right-7 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background" />
            </div>

            {/* Confirmation Code */}
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wide">Confirmation Code</p>
              <p className="font-mono font-bold text-lg text-text-primary tracking-widest mt-1">{confirmationCode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={`mt-8 space-y-3 transition-all duration-500 delay-300 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => router.push('/tickets')}
        >
          View My Tickets
        </Button>
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={() => router.push('/home')}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
