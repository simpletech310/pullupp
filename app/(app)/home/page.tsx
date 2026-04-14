'use client';

import { useAuthContext } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EVENT_GRADIENTS, EVENT_CATEGORIES } from '@/lib/utils/constants';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getPublishedEvents } from '@/lib/supabase/queries';
import { toggleSaveEvent } from '@/lib/supabase/mutations';

export default function HomePage() {
  const { profile, user } = useAuthContext();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const filter = selectedFilter === 'All' ? {} : { category: selectedFilter };
        const { data } = await getPublishedEvents(filter);
        setEvents(data || []);
      } catch (err) {
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [selectedFilter]);

  const handleSave = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    if (!user?.id) {
      toast.error('Sign in to save events');
      return;
    }
    try {
      const result = await toggleSaveEvent(user.id, eventId);
      setSavedEvents(prev => {
        const next = new Set(prev);
        if (result?.saved) next.add(eventId);
        else next.delete(eventId);
        return next;
      });
      toast.success(result?.saved ? 'Event saved' : 'Event unsaved');
    } catch {
      toast.error('Failed to save event');
    }
  };

  const trendingEvents = events.slice(0, 4);

  if (loading) {
    return (
      <div className="pb-24">
        <div className="px-4 pt-4 pb-3">
          <h2 className="font-display font-bold text-xl">
            Hey, {profile?.name?.split(' ')[0] || 'there'}
          </h2>
          <p className="text-text-secondary text-sm">Discover what&apos;s happening</p>
        </div>
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {EVENT_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`
                px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200
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
        <div className="px-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
              <div className="h-[140px] bg-surface-alt" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-surface-alt rounded w-3/4" />
                <div className="h-3 bg-surface-alt rounded w-1/2" />
                <div className="h-3 bg-surface-alt rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
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
              px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200
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

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-base mb-1">No events yet</h3>
          <p className="text-text-muted text-sm max-w-[240px]">
            There are no events to show right now. Check back soon!
          </p>
        </div>
      ) : (
        <>
          {/* Trending Section */}
          {trendingEvents.length > 0 && (
            <div className="px-4 mb-4">
              <h3 className="font-display font-semibold text-base mb-3">Trending</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {trendingEvents.map((event, i) => (
                  <div
                    key={event.id}
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="relative shrink-0 w-[180px] rounded-2xl overflow-hidden cursor-pointer group"
                  >
                    <div
                      className="aspect-[4/3] w-full p-3 flex flex-col justify-end"
                      style={{ background: EVENT_GRADIENTS[(event.gradient ?? i) % EVENT_GRADIENTS.length] }}
                    >
                      <div className="absolute top-2 left-2">
                        <span className="bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                          #{i + 1}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-white drop-shadow-lg">{event.title}</h4>
                      <p className="text-white/80 text-xs mt-0.5">{formatDate(event.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Events */}
          <div className="px-4">
            <h3 className="font-display font-semibold text-base mb-3">All Events</h3>
            <div className="flex flex-col gap-3">
              {events.map((event, i) => (
                <Card
                  key={event.id}
                  hoverable
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <div
                    className="aspect-[16/7] w-full p-4 flex flex-col justify-end relative"
                    style={{ background: EVENT_GRADIENTS[(event.gradient ?? i) % EVENT_GRADIENTS.length] }}
                  >
                    <Badge variant="default" className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm border-0 text-white">
                      {event.category}
                    </Badge>
                    {/* Save button */}
                    <button
                      onClick={(e) => handleSave(e, event.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors w-11 h-11 flex items-center justify-center"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={savedEvents.has(event.id) ? 'white' : 'none'} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                    <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {formatDate(event.date)} {event.time && `at ${event.time}`}
                    </div>
                    <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-3">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {event.venue?.name || event.venue || 'TBA'}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-orange font-semibold text-sm">
                        From {formatCurrency(event.price ?? 0)}
                      </span>
                      <span className="text-text-muted text-xs">
                        {event.attendees ?? 0} attending
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

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
