'use client';

import { useAuthContext } from '@/providers/auth-provider';
import { EVENT_GRADIENTS, EVENT_CATEGORIES } from '@/lib/utils/constants';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
        const params = new URLSearchParams({ limit: '20' });
        if (selectedFilter !== 'All') params.set('category', selectedFilter);
        const res = await fetch(`/api/public/events?${params}`);
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
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

  const featuredEvent = events[0] ?? null;
  const happeningSoon = events.slice(1, 6);
  const genres = Array.from(new Set(events.map(e => e.category).filter(Boolean))).slice(0, 6);

  /* ── Loading skeleton ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="pb-24 overflow-x-hidden">
        {/* ambient orbs */}
        <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-primary-container/5 blur-[150px] rounded-full -z-10 pointer-events-none" />
        <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-secondary-container/5 blur-[150px] rounded-full -z-10 pointer-events-none" />

        {/* search bar skeleton */}
        <div className="px-4 pt-4 pb-4">
          <div className="glass-card rounded-2xl h-12 animate-shimmer" />
        </div>

        {/* category pills skeleton */}
        <div className="flex gap-2 px-4 pb-5 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-none h-9 w-20 rounded-full bg-surface-container animate-shimmer" />
          ))}
        </div>

        {/* hero skeleton */}
        <div className="px-4 mb-10">
          <div className="w-full aspect-[4/5] rounded-[32px] bg-surface-container animate-shimmer" />
        </div>

        {/* cards skeleton */}
        <div className="px-4 flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-none w-64 rounded-[24px] bg-surface-container animate-shimmer h-72" />
          ))}
        </div>
      </div>
    );
  }

  /* ── Main render ──────────────────────────────────────────── */
  return (
    <div className="pb-24 overflow-x-hidden">
      {/* Ambient orb decorations */}
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-primary-container/5 blur-[150px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-secondary-container/5 blur-[150px] rounded-full -z-10 pointer-events-none" />

      {/* ── Search bar ─────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-4">
        <button
          onClick={() => router.push('/search')}
          className="glass-card rounded-2xl w-full h-12 flex items-center gap-3 px-4 border border-white/5 text-left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant shrink-0">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="font-body text-sm text-on-surface-variant">Search events, artists…</span>
        </button>
      </div>

      {/* ── Category filter pills ──────────────────────────── */}
      <div className="flex gap-2 px-4 pb-5 overflow-x-auto scrollbar-hide">
        {EVENT_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`
              flex-none px-4 py-2 rounded-full font-body text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-200
              ${selectedFilter === cat
                ? 'bg-primary-container text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Empty state ────────────────────────────────────── */}
      {events.length === 0 && (
        <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-surface-container border border-white/5 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="font-headline font-semibold text-base text-on-surface mb-1">No events yet</h3>
          <p className="font-body text-on-surface-variant text-sm max-w-[240px]">
            There are no events to show right now. Check back soon!
          </p>
        </div>
      )}

      {events.length > 0 && (
        <>
          {/* ── HERO CARD ──────────────────────────────────── */}
          {featuredEvent && (
            <section className="relative mb-12 px-4 group">
              <div
                className="kinetic-gradient w-full aspect-[4/5] rounded-[32px] p-5 sm:p-8 flex flex-col justify-end relative overflow-hidden shadow-[0_0_40px_rgba(255,107,53,0.2)] cursor-pointer"
                onClick={() => router.push(`/events/${featuredEvent.id}`)}
              >
                {/* image overlay */}
                {featuredEvent.cover_images?.[0] && (
                  <img
                    src={featuredEvent.cover_images?.[0]}
                    alt={featuredEvent.title}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                  />
                )}

                {/* bottom gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-0" />

                {/* Featured badge */}
                <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full z-10">
                  <span className="font-body text-xs font-bold uppercase tracking-widest text-white">Featured Event</span>
                </div>

                {/* content */}
                <div className="relative z-10">
                  <h2 className="font-headline text-3xl sm:text-5xl font-extrabold leading-[0.9] tracking-tighter text-white mb-4 uppercase italic break-words">
                    {featuredEvent.title}
                  </h2>
                  <div className="flex flex-wrap gap-3 items-center mt-6">
                    {/* date chip */}
                    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="font-body text-xs font-semibold text-white">
                        {formatDate(featuredEvent.date)}
                      </span>
                    </div>
                    {/* price chip */}
                    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                      <span className="font-body text-xs font-semibold text-white">
                        From {formatCurrency(featuredEvent.price ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Happening Soon ─────────────────────────────── */}
          {happeningSoon.length > 0 && (
            <section className="mb-10">
              {/* section header */}
              <div className="px-4 mb-5">
                <p className="font-body text-xs font-black uppercase tracking-[0.2em] text-primary-container mb-1">
                  Don&apos;t Miss Out
                </p>
                <h3 className="font-headline text-2xl font-extrabold text-on-surface">
                  Happening Soon
                </h3>
              </div>

              {/* horizontal scroll of glass cards */}
              <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide pb-2">
                {happeningSoon.map((event, i) => (
                  <div
                    key={event.id}
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="flex-none w-[72vw] max-w-[280px] glass-card rounded-[24px] overflow-hidden shadow-lg border border-white/5 cursor-pointer"
                  >
                    {/* image area */}
                    <div className="relative h-40 bg-surface-container-high">
                      {event.cover_images?.[0] ? (
                        <img src={event.cover_images?.[0]} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ background: EVENT_GRADIENTS[(event.gradient_index ?? i + 1) % EVENT_GRADIENTS.length] }}
                        />
                      )}
                      {/* gradient scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      {/* category badge */}
                      {event.category && (
                        <div className="absolute top-3 left-3 bg-secondary-container text-white px-3 py-1 rounded-full font-body text-xs font-black uppercase tracking-wide">
                          {event.category}
                        </div>
                      )}
                      {/* save button */}
                      <button
                        onClick={(e) => handleSave(e, event.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={savedEvents.has(event.id) ? 'white' : 'none'} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>

                    {/* info */}
                    <div className="p-5">
                      <h4 className="font-headline text-lg font-bold text-on-surface mb-1 line-clamp-1">{event.title}</h4>
                      <p className="font-body text-xs text-on-surface-variant mb-4 flex items-center gap-1 line-clamp-1">
                        📍 {event.venue?.name || event.venue || 'TBA'}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-primary-container font-body font-bold text-sm">
                          {formatCurrency(event.price ?? 0)}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/events/${event.id}`); }}
                          className="bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Explore Genres ─────────────────────────────── */}
          {genres.length > 0 && (
            <section className="px-4 mb-10">
              <div className="mb-5">
                <p className="font-body text-xs font-black uppercase tracking-[0.2em] text-secondary-container mb-1">
                  Find Your Vibe
                </p>
                <h3 className="font-headline text-2xl font-extrabold text-on-surface">
                  Explore Genres
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {genres.map((genre, i) => {
                  // find the first event with this genre to pull an image
                  const sample = events.find(e => e.category === genre);
                  return (
                    <button
                      key={genre}
                      onClick={() => setSelectedFilter(genre)}
                      className="h-32 rounded-3xl bg-surface-container-high flex flex-col justify-end p-4 relative overflow-hidden group text-left"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                      {sample?.cover_images?.[0] ? (
                        <img
                          src={sample.image_url}
                          alt={genre}
                          className="absolute inset-0 w-full h-full object-cover grayscale group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 grayscale group-hover:scale-110 transition-transform duration-500"
                          style={{ background: EVENT_GRADIENTS[i % EVENT_GRADIENTS.length] }}
                        />
                      )}
                      <span className="relative z-20 font-headline font-bold text-white uppercase text-lg italic tracking-tighter">
                        {genre}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── FAB for organizers ─────────────────────────────── */}
      {profile?.role === 'organizer' && (
        <button
          onClick={() => router.push('/events/create')}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary-container text-white shadow-lg shadow-primary-container/30 flex items-center justify-center hover:opacity-90 transition-opacity z-30"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
