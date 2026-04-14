'use client';

import { useAuthContext } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EVENT_GRADIENTS, EVENT_CATEGORIES } from '@/lib/utils/constants';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Placeholder data until Supabase is connected
const PLACEHOLDER_EVENTS = [
  { id: '1', title: 'Midnight Groove', category: 'Music', date: '2026-05-15', time: '9:00 PM', venue: 'The Velvet Room', price: 35, attendees: 230, gradient: 0 },
  { id: '2', title: 'Laugh Factory Live', category: 'Comedy', date: '2026-05-18', time: '8:00 PM', venue: 'Skyline Rooftop', price: 25, attendees: 180, gradient: 1 },
  { id: '3', title: 'Canvas & Cocktails', category: 'Art', date: '2026-05-20', time: '7:00 PM', venue: 'Creative Co-Op', price: 45, attendees: 90, gradient: 2 },
  { id: '4', title: 'Street Eats Festival', category: 'Food', date: '2026-05-22', time: '12:00 PM', venue: 'Garden Pavilion', price: 15, attendees: 420, gradient: 3 },
  { id: '5', title: 'Tech Connect Mixer', category: 'Networking', date: '2026-05-25', time: '6:00 PM', venue: 'Studio 54 ATL', price: 20, attendees: 150, gradient: 4 },
  { id: '6', title: 'Summer Vibes Festival', category: 'Music', date: '2026-06-01', time: '3:00 PM', venue: 'The Grand Hall', price: 55, attendees: 500, gradient: 5 },
  { id: '7', title: 'Jazz Under the Stars', category: 'Music', date: '2026-06-05', time: '8:00 PM', venue: 'Skyline Rooftop', price: 40, attendees: 200, gradient: 6 },
  { id: '8', title: 'Hip Hop Showcase', category: 'Music', date: '2026-06-10', time: '9:00 PM', venue: 'Warehouse 22', price: 30, attendees: 310, gradient: 7 },
];

export default function HomePage() {
  const { profile } = useAuthContext();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredEvents = selectedFilter === 'All'
    ? PLACEHOLDER_EVENTS
    : PLACEHOLDER_EVENTS.filter(e => e.category === selectedFilter);

  return (
    <div className="pb-4">
      {/* Greeting */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="font-display font-bold text-xl">
          Hey, {profile?.name?.split(' ')[0] || 'there'}
        </h2>
        <p className="text-text-secondary text-sm">Discover what&apos;s happening</p>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {EVENT_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`
              px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200
              ${selectedFilter === cat
                ? 'bg-orange text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                : 'bg-surface border border-border text-text-secondary hover:border-border-light'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Trending Section */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-semibold text-base mb-3">Trending</h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {PLACEHOLDER_EVENTS.slice(0, 4).map((event, i) => (
            <div
              key={event.id}
              onClick={() => router.push(`/events/${event.id}`)}
              className="relative shrink-0 w-[200px] rounded-2xl overflow-hidden cursor-pointer group"
            >
              <div
                className="h-[140px] p-3 flex flex-col justify-end"
                style={{ background: EVENT_GRADIENTS[event.gradient] }}
              >
                <div className="absolute top-2 left-2">
                  <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    #{i + 1}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-white drop-shadow-lg">{event.title}</h4>
                <p className="text-white/80 text-[11px] mt-0.5">{formatDate(event.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Events */}
      <div className="px-4">
        <h3 className="font-display font-semibold text-base mb-3">All Events</h3>
        <div className="flex flex-col gap-3">
          {filteredEvents.map(event => (
            <Card
              key={event.id}
              hoverable
              onClick={() => router.push(`/events/${event.id}`)}
            >
              <div
                className="h-[140px] p-4 flex flex-col justify-end relative"
                style={{ background: EVENT_GRADIENTS[event.gradient] }}
              >
                <Badge variant="default" className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm border-0 text-white">
                  {event.category}
                </Badge>
                {/* Save button */}
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {formatDate(event.date)} at {event.time}
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-3">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {event.venue}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange font-semibold text-sm">
                    From {formatCurrency(event.price)}
                  </span>
                  <span className="text-text-muted text-xs">
                    {event.attendees} attending
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* FAB for organizers */}
      {profile?.role === 'organizer' && (
        <button
          onClick={() => router.push('/events/create')}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-orange text-white shadow-lg shadow-orange/30 flex items-center justify-center hover:bg-orange-light transition-colors z-30"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
