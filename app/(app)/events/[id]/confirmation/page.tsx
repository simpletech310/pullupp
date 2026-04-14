'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EVENT_GRADIENTS } from '@/lib/utils/constants';
import { formatDateTime, formatCurrency } from '@/lib/utils/format';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/auth-provider';
import { QRCodeSVG } from 'qrcode.react';

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
  const { user } = useAuthContext();
  const eventId = params.id as string;
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    event: any;
    tier: any;
    quantity: number;
    total: number;
    customerEmail: string | null;
    confirmationCode: string | null;
    orderId: string | null;
    ticketQrCodes: string[];
    sessionId: string;
  } | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    async function fetchConfirmation() {
      try {
        const res = await fetch(`/api/public/confirmation?session_id=${sessionId}`);
        if (!res.ok) throw new Error('Failed to load confirmation');
        const json = await res.json();
        setData(json);
        if (json.customerEmail) setEmail(json.customerEmail);
      } catch {
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    }
    fetchConfirmation();
  }, [sessionId]);

  useEffect(() => {
    if (loading) return;
    const t1 = setTimeout(() => setShowCheck(true), 200);
    const t2 = setTimeout(() => setShowContent(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [loading]);

  const sendTicketEmail = async () => {
    if (!email || !data) return;
    setSendingEmail(true);
    try {
      const res = await fetch('/api/public/send-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          eventTitle: data.event?.title || 'Event',
          eventDate: data.event ? formatDateTime(data.event.date, data.event.start_time) : '',
          venueName: data.event?.venue?.name || '',
          venueCity: data.event?.venue?.city || '',
          tierName: data.tier?.name || 'General Admission',
          quantity: data.quantity,
          total: data.total,
          confirmationCode: data.confirmationCode || undefined,
          sessionId: data.sessionId,
          ticketQrCodes: data.ticketQrCodes || [],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEmailSent(true);
        toast.success('Ticket sent to ' + email);
      } else {
        toast.error(json.error || 'Failed to send email');
      }
    } catch {
      toast.error('Failed to send email');
    }
    setSendingEmail(false);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 bg-background">
        <div className="w-10 h-10 border-2 border-secondary-container border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-on-surface-variant">Loading your order...</p>
      </div>
    );
  }

  // ── No session / fallback ──
  if (!sessionId || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 bg-background">
        <div className="text-4xl mb-3">🎫</div>
        <h2 className="font-headline font-bold text-lg text-on-surface">
          {sessionId ? 'Order Confirmed!' : 'No order found'}
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          {sessionId ? 'Your tickets have been confirmed.' : 'Check your tickets page.'}
        </p>
        <Button variant="primary" className="mt-4" onClick={() => router.push(user ? '/tickets' : '/home')}>
          {user ? 'View My Tickets' : 'Back to Home'}
        </Button>
      </div>
    );
  }

  const { event, tier, quantity, total, customerEmail, confirmationCode } = data;
  const code = confirmationCode || data.sessionId.slice(-8).toUpperCase();
  const gradient = event ? EVENT_GRADIENTS[(event.gradient ?? 0) % EVENT_GRADIENTS.length] : EVENT_GRADIENTS[0];
  const isGuest = !user;

  return (
    <div className="bg-background min-h-screen pb-32">
      <div className="max-w-lg mx-auto px-4 pt-10">

        {/* ── Success Header ── */}
        <div className="flex flex-col items-center mb-8">
          <div
            className={`w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center shadow-[0_0_32px_rgba(4,180,162,0.4)] transition-all duration-500 ${
              showCheck ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-all duration-300 delay-200 ${showCheck ? 'opacity-100' : 'opacity-0'}`}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className={`mt-5 text-center transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="font-headline font-bold text-2xl text-secondary-container">Booking Confirmed!</h1>
            <p className="text-sm text-on-surface-variant mt-1">Your tickets have been confirmed</p>
          </div>
        </div>

        {/* ── Digital Ticket Card ── */}
        <div className={`transition-all duration-500 delay-100 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="glass-card rounded-[32px] overflow-hidden mx-0 shadow-2xl border border-white/5">

            {/* Event image header */}
            <div
              className="relative h-40 flex items-end"
              style={{
                background: event?.cover_images?.[0]
                  ? `url(${event.cover_images[0]}) center/cover no-repeat`
                  : gradient,
              }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative z-10 p-5 w-full">
                <span className="text-[9px] uppercase tracking-widest text-white/60 font-bold block mb-1">
                  {tier?.name || 'General Admission'}
                </span>
                <h2 className="font-headline font-extrabold text-xl text-primary-container leading-tight line-clamp-2">
                  {event?.title || 'Event'}
                </h2>
              </div>
            </div>

            {/* Ticket body */}
            <div className="p-5 bg-surface-container-high">
              {/* Date / Venue row */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-outline mb-1">Date &amp; Time</p>
                  <p className="font-headline font-bold text-sm text-on-surface">
                    {event ? formatDateTime(event.date, event.start_time) : '—'}
                  </p>
                </div>
                {event?.venue && (
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-outline mb-1">Venue</p>
                    <p className="font-headline font-bold text-sm text-on-surface">
                      {event.venue.name}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">{event.venue.city}</p>
                  </div>
                )}
              </div>

              {/* Details grid: zone / qty / total */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-surface-container rounded-xl p-3 text-center">
                  <p className="text-[9px] uppercase tracking-widest text-outline mb-1">Zone</p>
                  <p className="font-headline font-bold text-lg text-on-surface truncate">{tier?.name?.split(' ')[0] || 'GA'}</p>
                </div>
                <div className="bg-surface-container rounded-xl p-3 text-center">
                  <p className="text-[9px] uppercase tracking-widest text-outline mb-1">Qty</p>
                  <p className="font-headline font-bold text-lg text-on-surface">{quantity}</p>
                </div>
                <div className="bg-surface-container rounded-xl p-3 text-center">
                  <p className="text-[9px] uppercase tracking-widest text-outline mb-1">Total</p>
                  <p className="font-headline font-bold text-lg text-primary-container">{formatCurrency(total)}</p>
                </div>
              </div>

              {/* Perforated divider */}
              <div className="relative my-5 flex items-center">
                {/* Left cutout */}
                <div className="absolute -left-8 w-7 h-7 rounded-full bg-background" />
                {/* Right cutout */}
                <div className="absolute -right-8 w-7 h-7 rounded-full bg-background" />
                {/* Dashed line */}
                <div className="w-full border-t-2 border-dashed border-white/10" />
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3">
                {data?.ticketQrCodes?.[0] ? (
                  <div className="p-4 bg-white rounded-2xl shadow-lg">
                    <QRCodeSVG
                      value={data.ticketQrCodes[0]}
                      size={148}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="M"
                    />
                  </div>
                ) : (
                  <div className="w-44 h-44 rounded-2xl bg-surface-container-highest border border-white/10 flex flex-col items-center justify-center gap-2">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-outline animate-pulse">
                      <path d="M23 6V1h-5M1 6V1h5M23 18v5h-5M1 18v5h5"/>
                      <rect x="5" y="5" width="14" height="14" rx="1" strokeDasharray="3 3"/>
                    </svg>
                    <span className="text-xs text-outline">Generating...</span>
                  </div>
                )}
                <span className="text-xs text-on-surface-variant font-mono tracking-wide">Scan at door</span>
                {data?.ticketQrCodes && data.ticketQrCodes.length > 1 && (
                  <span className="text-xs text-primary-container">
                    +{data.ticketQrCodes.length - 1} more ticket{data.ticketQrCodes.length > 2 ? 's' : ''} in your email
                  </span>
                )}
              </div>

              {/* Confirmation Code */}
              <div className="mt-5 bg-surface-container rounded-xl px-4 py-3 text-center">
                <p className="text-[9px] uppercase tracking-widest text-outline mb-1">Confirmation Code</p>
                <p className="font-mono font-bold text-xl text-on-surface tracking-widest">{code}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(code); toast.success('Code copied!'); }}
                  className="text-xs text-primary-container mt-1 hover:underline"
                >
                  Copy code
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className={`mt-5 space-y-3 transition-all duration-500 delay-150 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {event?.venue && (
            <div className="glass-card rounded-2xl p-4 border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary-container">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-outline mb-0.5">Location</p>
                <p className="text-sm font-bold text-on-surface truncate">{event.venue.name}</p>
                {event.venue.city && <p className="text-xs text-on-surface-variant">{event.venue.city}</p>}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-outline shrink-0">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          )}

          <div className="glass-card rounded-2xl p-4 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-container">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-widest text-outline mb-0.5">Event Guidelines</p>
              <p className="text-sm font-bold text-on-surface">View Entry Rules</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-outline shrink-0">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        {/* ── Email section ── */}
        <div className={`mt-5 transition-all duration-500 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="glass-card border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary-container">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <h3 className="font-headline font-semibold text-sm text-on-surface">
                {isGuest ? 'Email your ticket' : 'Send a copy to your email'}
              </h3>
            </div>
            {isGuest && (
              <p className="text-xs text-on-surface-variant mb-3">
                No account needed — enter your email to receive your ticket for check-in.
              </p>
            )}
            {emailSent ? (
              <div className="flex items-center gap-2 py-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-secondary-container">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <p className="text-sm text-secondary-container">Ticket sent to {email}</p>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={sendTicketEmail}
                  disabled={!email || sendingEmail}
                  loading={sendingEmail}
                >
                  Send
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className={`mt-5 space-y-3 transition-all duration-500 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {user && (
            <Button variant="primary" size="lg" fullWidth onClick={() => router.push('/tickets')}>
              View My Tickets
            </Button>
          )}
          <Button variant={user ? 'ghost' : 'primary'} size="lg" fullWidth onClick={() => router.push('/home')}>
            Back to Home
          </Button>
        </div>
      </div>

      {/* ── Share FAB ── */}
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({ title: event?.title || 'My Ticket', text: `Confirmation: ${code}` });
          } else {
            navigator.clipboard.writeText(code);
            toast.success('Confirmation code copied!');
          }
        }}
        className="fixed bottom-8 right-6 w-14 h-14 bg-secondary-container rounded-full flex items-center justify-center shadow-[0_0_16px_rgba(4,180,162,0.3)] hover:opacity-90 transition-opacity active:scale-95 z-40"
        aria-label="Share ticket"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>
    </div>
  );
}
