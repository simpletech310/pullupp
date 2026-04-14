'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { AVATAR_COLORS } from '@/lib/utils/constants';
import { getInitials } from '@/lib/utils/format';

interface ChatMessage {
  id: string;
  text: string;
  sent: boolean;
  timestamp: string;
  date: string;
}

const CONTACTS: Record<string, { name: string; colorIndex: number; online: boolean }> = {
  'conv-1': { name: 'Marcus Chen', colorIndex: 0, online: true },
  'conv-2': { name: 'DJ Nova', colorIndex: 1, online: true },
  'conv-3': { name: 'Sarah Williams', colorIndex: 2, online: false },
  'conv-4': { name: 'Skyline Rooftop', colorIndex: 3, online: false },
  'conv-5': { name: 'Lena Park', colorIndex: 4, online: true },
  'conv-6': { name: 'Jordan Blake', colorIndex: 5, online: false },
};

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', text: 'Hey! I saw your venue listing for The Velvet Room. Is it available on June 5th for a music event?', sent: true, timestamp: '2:30 PM', date: 'April 11' },
  { id: '2', text: 'Hi there! Let me check the calendar real quick.', sent: false, timestamp: '2:32 PM', date: 'April 11' },
  { id: '3', text: 'Good news - June 5th is open! What kind of event are you planning?', sent: false, timestamp: '2:34 PM', date: 'April 11' },
  { id: '4', text: 'A live music showcase. Expecting around 200 people. We would need the full sound system and lighting rig.', sent: true, timestamp: '2:40 PM', date: 'April 11' },
  { id: '5', text: 'That sounds great. The full package with sound and lighting runs $2,500 for the evening. Includes setup and breakdown.', sent: false, timestamp: '2:45 PM', date: 'April 11' },
  { id: '6', text: 'That works for our budget. Do you offer any deals on bar packages?', sent: true, timestamp: '3:00 PM', date: 'April 11' },
  { id: '7', text: 'We do! Our premium open bar package is $1,200 for up to 250 guests. Includes craft cocktails.', sent: false, timestamp: '3:05 PM', date: 'April 11' },
  { id: '8', text: 'Perfect. Let me confirm with my team and get back to you tomorrow.', sent: true, timestamp: '3:15 PM', date: 'April 11' },
  { id: '9', text: 'Sounds good! I will tentatively hold the date for you.', sent: false, timestamp: '3:17 PM', date: 'April 11' },
  { id: '10', text: 'Hey Marcus, my team is on board! We would like to go ahead with the booking.', sent: true, timestamp: '10:00 AM', date: 'April 12' },
  { id: '11', text: 'Awesome! I will send over the contract and deposit details shortly.', sent: false, timestamp: '10:05 AM', date: 'April 12' },
  { id: '12', text: 'The deposit is 30% of the total - $750. I can send a payment link through the app.', sent: false, timestamp: '10:08 AM', date: 'April 12' },
  { id: '13', text: 'That works. Send it over and I will get it taken care of today.', sent: true, timestamp: '10:15 AM', date: 'April 12' },
  { id: '14', text: 'The Velvet Room is available on June 5th. Want me to hold it for you?', sent: false, timestamp: '10:30 AM', date: 'Today' },
  { id: '15', text: 'Yes please! I will send the deposit this afternoon.', sent: true, timestamp: '10:35 AM', date: 'Today' },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2.5 bg-surface rounded-2xl rounded-bl-md w-fit">
      <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const contact = CONTACTS[id] || { name: 'Unknown', colorIndex: 0, online: false };
  const avatarColor = AVATAR_COLORS[contact.colorIndex % AVATAR_COLORS.length];

  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [showTyping, setShowTyping] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => setShowTyping(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: inputValue.trim(),
      sent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      date: 'Today',
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setShowTyping(true);
    setTimeout(() => setShowTyping(false), 2500);
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  messages.forEach((msg) => {
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === msg.date) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: msg.date, messages: [msg] });
    }
  });

  return (
    <div className="flex flex-col h-[100dvh] bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 h-14 px-4">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: avatarColor }}
            >
              {getInitials(contact.name)}
            </div>
            {contact.online && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-bg" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-sm truncate">{contact.name}</h1>
            <p className="text-[11px] text-text-muted">
              {contact.online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <span className="text-[11px] text-text-muted bg-surface px-3 py-1 rounded-full">
                {group.date}
              </span>
            </div>
            {group.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-2 ${msg.sent ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 ${
                    msg.sent
                      ? 'bg-orange/90 text-white rounded-2xl rounded-br-md'
                      : 'bg-surface border border-border/50 text-text-primary rounded-2xl rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${msg.sent ? 'text-white/60' : 'text-text-muted'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
        {showTyping && (
          <div className="flex justify-start mb-2">
            <TypingIndicator />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 bg-bg border-t border-border/50 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Type a message..."
            className="flex-1 bg-surface border border-border rounded-full px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-colors font-body"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="w-10 h-10 rounded-full bg-orange text-white flex items-center justify-center shrink-0 hover:bg-orange-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
