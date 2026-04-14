'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/badge';
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

function TicketQRCode({ value }: { value: string }) {
  return (
    <div className="w-28 h-28 mx-auto bg-white rounded-xl p-2 flex items-center justify-center">
      <QRCodeSVG
        value={value}
        size={96}
        bgColor="white"
        fgColor="#111111"
        level="M"
      />
    </div>
  );
}

function PerforatedDivider() {
  return (
    <div className="relative flex items-center my-4">
      {/* Left notch */}
      <div className="absolute -left-5 w-5 h-5 rounded-full bg-[#0F0F13]" />
      {/* Dashed line */}
      <div className="w-full border-t-2 border-dashed border-[#2A2A38]" />
      {/* Right notch */}
      <div className="absolute -right-5 w-5 h-5 rounded-full bg-[#0F0F13]" />
    </div>
  );
}

function TicketCard({ ticket, isPast }: { ticket: Ticket; isPast: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const tierVariant = ticket.tierName === 'VIP' ? 'orange' : ticket.tierName === 'Early Bird' ? 'teal' : 'default';

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`
        relative bg-surface border border-border rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-300 ease-in-out
        ${isPast ? 'opacity-50 grayscale-[40%]' : 'hover:border-border-light hover:-translate-y-0.5'}
      `}
    >
      {/* Gradient strip */}
      <div
        className="h-2"
        style={{ background: EVENT_GRADIENTS[ticket.gradientIndex % EVENT_GRADIENTS.length] }}
      />

      <div className="px-5 pt-4 pb-2">
        {/* Event title and tier */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display font-bold text-lg leading-tight">{ticket.eventTitle}</h3>
          <Badge variant={tierVariant}>{ticket.tierName}</Badge>
        </div>

        {/* Date & time */}
        <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{formatDateTime(ticket.date, ticket.time)}</span>
        </div>

        {/* Venue */}
        <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{ticket.venueName}</span>
        </div>

        {expanded && (
          <div className="text-text-muted text-xs ml-[22px] mb-2">{ticket.venueAddress}</div>
        )}

        {/* Countdown for upcoming */}
        {!isPast && (
          <div className="mt-2 mb-1">
            <span className="text-orange text-xs font-semibold">
              {getEventCountdown(ticket.date)}
            </span>
          </div>
        )}
        {isPast && (
          <div className="mt-2 mb-1">
            <span className="text-text-muted text-xs">Event ended</span>
          </div>
        )}
      </div>

      {/* Perforated divider + QR section */}
      {expanded && (
        <div className="px-5 pb-5">
          <PerforatedDivider />

          {/* QR Code */}
          <TicketQRCode value={ticket.confirmationCode} />

          {/* Confirmation code */}
          <div className="text-center mt-3">
            <p className="text-text-muted text-xs uppercase tracking-widest mb-1">Confirmation</p>
            <p className="font-mono text-sm text-text-primary tracking-wider">{ticket.confirmationCode}</p>
          </div>
        </div>
      )}

      {/* Expand hint */}
      <div className="flex justify-center pb-3">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-text-muted transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
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
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="font-display font-bold text-xl">My Tickets</h2>
        <p className="text-text-secondary text-sm mt-0.5">Your event wallet</p>
      </div>

      {/* Tab bar */}
      <div className="flex px-4 mb-4 border-b border-border">
        {(['upcoming', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 pb-3 text-sm font-semibold capitalize transition-colors duration-200 relative
              ${activeTab === tab ? 'text-text-primary' : 'text-text-muted'}
            `}
          >
            {tab === 'upcoming' ? `Upcoming (${UPCOMING_TICKETS.length})` : `Past (${PAST_TICKETS.length})`}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-orange rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tickets list */}
      {tickets.length > 0 ? (
        <div className="flex flex-col gap-4 px-4">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} isPast={isPast} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2" />
              <path d="M13 17v2" />
              <path d="M13 11v2" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-base mb-1">No tickets yet</h3>
          <p className="text-text-muted text-sm max-w-[240px]">
            When you purchase event tickets, they will appear here in your wallet.
          </p>
        </div>
      )}
    </div>
  );
}
