'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { EVENT_GRADIENTS } from '@/lib/utils/constants';
import { formatDateTime, getEventCountdown } from '@/lib/utils/format';

interface Ticket {
  id: string;
  eventTitle: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  tierName: string;
  confirmationCode: string;
  gradientIndex: number;
}

const UPCOMING_TICKETS: Ticket[] = [
  {
    id: 't1',
    eventTitle: 'Midnight Groove',
    date: '2026-05-15',
    time: '9:00 PM',
    venueName: 'The Velvet Room',
    venueAddress: '245 Peachtree St NE, Atlanta, GA',
    tierName: 'VIP',
    confirmationCode: 'PU-MG-7291',
    gradientIndex: 0,
  },
  {
    id: 't2',
    eventTitle: 'Laugh Factory Live',
    date: '2026-05-18',
    time: '8:00 PM',
    venueName: 'Skyline Rooftop',
    venueAddress: '100 Marietta St NW, Atlanta, GA',
    tierName: 'General',
    confirmationCode: 'PU-LF-4058',
    gradientIndex: 1,
  },
  {
    id: 't3',
    eventTitle: 'Canvas & Cocktails',
    date: '2026-05-20',
    time: '7:00 PM',
    venueName: 'Creative Co-Op',
    venueAddress: '550 Edgewood Ave SE, Atlanta, GA',
    tierName: 'Early Bird',
    confirmationCode: 'PU-CC-1634',
    gradientIndex: 2,
  },
  {
    id: 't4',
    eventTitle: 'Summer Vibes Festival',
    date: '2026-06-01',
    time: '3:00 PM',
    venueName: 'The Grand Hall',
    venueAddress: '800 Whitehall St SW, Atlanta, GA',
    tierName: 'VIP',
    confirmationCode: 'PU-SV-8823',
    gradientIndex: 5,
  },
];

const PAST_TICKETS: Ticket[] = [
  {
    id: 'p1',
    eventTitle: 'Jazz Under the Stars',
    date: '2026-03-20',
    time: '8:00 PM',
    venueName: 'Skyline Rooftop',
    venueAddress: '100 Marietta St NW, Atlanta, GA',
    tierName: 'General',
    confirmationCode: 'PU-JS-3190',
    gradientIndex: 6,
  },
  {
    id: 'p2',
    eventTitle: 'Hip Hop Showcase',
    date: '2026-02-14',
    time: '9:00 PM',
    venueName: 'Warehouse 22',
    venueAddress: '22 MLK Jr Dr SW, Atlanta, GA',
    tierName: 'VIP',
    confirmationCode: 'PU-HH-5547',
    gradientIndex: 7,
  },
];

function DigitalPassCard({ ticket, isPast }: { ticket: Ticket; isPast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const gradient = EVENT_GRADIENTS[ticket.gradientIndex % EVENT_GRADIENTS.length];

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`glass-card rounded-[32px] overflow-hidden shadow-2xl border border-white/5 cursor-pointer transition-all duration-300 ${isPast ? 'opacity-60 grayscale-[30%]' : ''}`}
    >
      {/* Hero image section — gradient stand-in */}
      <div className="relative h-48 w-full">
        <div
          className="absolute inset-0"
          style={{ background: gradient }}
        />
        {/* Bottom fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f1f23] via-[#1f1f23]/20 to-transparent" />

        {/* PullUpp Verified badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-secondary-container">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
          </svg>
          <span className="text-[10px] font-bold text-on-surface tracking-wide">PullUpp Verified</span>
        </div>

        {/* Countdown overlay */}
        {!isPast && (
          <div className="absolute bottom-4 left-5">
            <span className="text-xs font-semibold text-white/90 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
              {getEventCountdown(ticket.date)}
            </span>
          </div>
        )}
        {isPast && (
          <div className="absolute bottom-4 left-5">
            <span className="text-xs font-semibold text-white/60 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
              Event ended
            </span>
          </div>
        )}
      </div>

      {/* Event info */}
      <div className="px-8 pt-6 pb-2 text-center">
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-outline mb-1">
          {ticket.tierName} · {ticket.venueName}
        </p>
        <h3 className="text-3xl font-headline font-extrabold text-primary-container leading-none mb-3">
          {ticket.eventTitle}
        </h3>
        <div className="flex items-center justify-center gap-4 text-sm font-medium text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDateTime(ticket.date, ticket.time)}
          </span>
        </div>
      </div>

      {/* Perforated divider */}
      <div className="relative h-8 flex items-center px-2 mt-2">
        {/* Left semicircle cutout */}
        <div className="absolute -left-4 w-8 h-8 rounded-full bg-background" />
        {/* Dashed line */}
        <div className="w-full border-t-2 border-dashed border-white/10 mx-4" />
        {/* Right semicircle cutout */}
        <div className="absolute -right-4 w-8 h-8 rounded-full bg-background" />
      </div>

      {/* QR section */}
      <div className="px-8 py-6 flex flex-col items-center">
        <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)]">
          <QRCodeSVG
            value={ticket.confirmationCode}
            size={120}
            bgColor="white"
            fgColor="#111111"
            level="M"
          />
        </div>
        <p className="text-[10px] font-bold text-outline tracking-widest uppercase mt-4">Scan at Entrance</p>
        <p className="font-mono text-sm text-on-surface tracking-wider mt-1">{ticket.confirmationCode}</p>
      </div>

      {/* Ticket details grid */}
      <div className="bg-surface-container-high/50 p-8 grid grid-cols-3 gap-4 border-t border-white/5">
        <div className="text-center">
          <p className="text-[9px] uppercase font-bold text-outline tracking-wider mb-1">Tier</p>
          <p className="text-lg font-headline font-bold text-on-surface">{ticket.tierName}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] uppercase font-bold text-outline tracking-wider mb-1">Venue</p>
          <p className="text-sm font-headline font-bold text-on-surface leading-tight">{ticket.venueName}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] uppercase font-bold text-outline tracking-wider mb-1">Time</p>
          <p className="text-lg font-headline font-bold text-on-surface">{ticket.time}</p>
        </div>
      </div>

      {/* Expand hint */}
      <div className="flex justify-center py-3 bg-surface-container-high/50">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-outline transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const tickets = activeTab === 'upcoming' ? UPCOMING_TICKETS : PAST_TICKETS;
  const isPast = activeTab === 'past';

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">My Tickets</h1>
          <p className="text-on-surface-variant text-sm mt-0.5 font-body">Your event wallet</p>
        </div>
        {/* Live Now badge */}
        {UPCOMING_TICKETS.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container/15 border border-primary-container/30">
            <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse-dot" />
            <span className="text-[10px] font-bold text-primary-container uppercase tracking-wide">Live Now</span>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="px-4 mb-6">
        <div className="flex bg-surface-container border border-white/5 rounded-xl p-1">
          {(['upcoming', 'past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-on-surface-variant'
              }`}
            >
              {tab === 'upcoming' ? `Upcoming (${UPCOMING_TICKETS.length})` : `Past (${PAST_TICKETS.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets list */}
      {tickets.length > 0 ? (
        <div className="flex flex-col gap-6 px-4">
          {tickets.map((ticket) => (
            <div key={ticket.id}>
              <DigitalPassCard ticket={ticket} isPast={isPast} />

              {/* Quick actions below ticket */}
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl hover:bg-surface-container-high cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Share Ticket</p>
                      <p className="text-xs text-outline">Send to a friend</p>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-outline">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl hover:bg-surface-container-high cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Get Directions</p>
                      <p className="text-xs text-outline">{ticket.venueAddress}</p>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-outline">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="bg-surface-container-high w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-outline">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2" />
              <path d="M13 17v2" />
              <path d="M13 11v2" />
            </svg>
          </div>
          <h3 className="font-headline font-semibold text-base mb-1 text-on-surface">No tickets yet</h3>
          <p className="text-outline text-sm max-w-[240px] font-body">
            When you purchase event tickets, they will appear here in your wallet.
          </p>
        </div>
      )}

      {/* FAB Share */}
      <button
        className="fixed bottom-24 right-6 z-30 w-14 h-14 bg-primary-container rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.3)] active:scale-95 transition-all duration-150"
        aria-label="Share Tickets"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>
    </div>
  );
}
