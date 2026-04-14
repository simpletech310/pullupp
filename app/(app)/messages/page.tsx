'use client';

import { useRouter } from 'next/navigation';
import { AVATAR_COLORS } from '@/lib/utils/constants';
import { formatTimeAgo, getInitials } from '@/lib/utils/format';

type ContextType = 'venue_booking' | 'artist_booking' | 'direct';

interface Conversation {
  id: string;
  contactName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  context: ContextType;
  avatarColorIndex: number;
  online: boolean;
}

const CONTEXT_CONFIG: Record<ContextType, { label: string; variant: 'teal' | 'orange' | 'default' }> = {
  venue_booking: { label: 'Venue Booking', variant: 'teal' },
  artist_booking: { label: 'Artist Booking', variant: 'orange' },
  direct: { label: 'Direct', variant: 'default' },
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    contactName: 'Marcus Chen',
    lastMessage: 'The Velvet Room is available on June 5th. Want me to hold it for you?',
    timestamp: '2026-04-13T10:30:00Z',
    unread: 2,
    context: 'venue_booking',
    avatarColorIndex: 0,
    online: true,
  },
  {
    id: 'conv-2',
    contactName: 'DJ Nova',
    lastMessage: 'My set runs about 90 minutes. I can bring my own sound system if needed.',
    timestamp: '2026-04-13T08:15:00Z',
    unread: 0,
    context: 'artist_booking',
    avatarColorIndex: 1,
    online: true,
  },
  {
    id: 'conv-3',
    contactName: 'Sarah Williams',
    lastMessage: 'Hey! Are you going to the Midnight Groove event next week?',
    timestamp: '2026-04-12T22:45:00Z',
    unread: 1,
    context: 'direct',
    avatarColorIndex: 2,
    online: false,
  },
  {
    id: 'conv-4',
    contactName: 'Skyline Rooftop',
    lastMessage: 'Deposit received. Your booking for May 18th is confirmed!',
    timestamp: '2026-04-12T16:00:00Z',
    unread: 0,
    context: 'venue_booking',
    avatarColorIndex: 3,
    online: false,
  },
  {
    id: 'conv-5',
    contactName: 'Lena Park',
    lastMessage: 'I can do the acoustic set for $400. Does that work with your budget?',
    timestamp: '2026-04-11T14:20:00Z',
    unread: 3,
    context: 'artist_booking',
    avatarColorIndex: 4,
    online: true,
  },
  {
    id: 'conv-6',
    contactName: 'Jordan Blake',
    lastMessage: 'Thanks for the invite! I just bought my tickets.',
    timestamp: '2026-04-10T09:00:00Z',
    unread: 0,
    context: 'direct',
    avatarColorIndex: 5,
    online: false,
  },
];

function ContextBadge({ context }: { context: ContextType }) {
  const config = CONTEXT_CONFIG[context];
  const colorClasses: Record<string, string> = {
    teal: 'bg-teal/15 text-teal',
    orange: 'bg-orange/15 text-orange',
    default: 'bg-surface-alt text-text-muted',
  };
  return (
    <span className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${colorClasses[config.variant]}`}>
      {config.label}
    </span>
  );
}

export default function MessagesPage() {
  const router = useRouter();

  if (MOCK_CONVERSATIONS.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-20 text-center">
        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-base mb-1">No messages yet</h3>
        <p className="text-text-secondary text-sm max-w-[240px]">
          Start a conversation by booking a venue or artist, or message someone directly.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="px-4 pt-4 pb-3">
        <h2 className="font-display font-bold text-xl">Messages</h2>
      </div>

      <div className="flex flex-col">
        {MOCK_CONVERSATIONS.map((conv) => {
          const avatarColor = AVATAR_COLORS[conv.avatarColorIndex % AVATAR_COLORS.length];
          return (
            <button
              key={conv.id}
              onClick={() => router.push(`/messages/${conv.id}`)}
              className="flex items-start gap-3 px-4 py-3.5 hover:bg-surface-hover active:bg-surface transition-colors text-left w-full border-b border-border/40 last:border-b-0"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: avatarColor }}
                >
                  {getInitials(conv.contactName)}
                </div>
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-success border-2 border-bg" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={`font-semibold text-sm truncate ${conv.unread > 0 ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {conv.contactName}
                  </span>
                  <span className="text-[11px] text-text-muted shrink-0">
                    {formatTimeAgo(conv.timestamp)}
                  </span>
                </div>
                <p className={`text-xs truncate mb-1.5 ${conv.unread > 0 ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
                  {conv.lastMessage}
                </p>
                <div className="flex items-center justify-between">
                  <ContextBadge context={conv.context} />
                  {conv.unread > 0 && (
                    <span className="min-w-[20px] h-5 rounded-full bg-orange text-white text-[10px] font-bold flex items-center justify-center px-1.5">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
