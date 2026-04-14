'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EVENT_GRADIENTS, EVENT_CATEGORIES, AVATAR_COLORS } from '@/lib/utils/constants';
import { formatDate, formatCompactNumber, formatCurrency } from '@/lib/utils/format';
import { toast } from 'sonner';

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [events, setEvents] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial data load
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        const [eventsRes, venuesRes, artistsRes] = await Promise.all([
          fetch('/api/public/events?limit=20'),
          fetch('/api/public/venues'),
          fetch('/api/public/artists'),
        ]);
        setEvents(eventsRes.ok ? await eventsRes.json() : []);
        setVenues(venuesRes.ok ? await venuesRes.json() : []);
        setArtists(artistsRes.ok ? await artistsRes.json() : []);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ search: query });
        if (selectedCategory !== 'All') params.set('category', selectedCategory);
        const res = await fetch(`/api/public/events?${params}`);
        setEvents(res.ok ? await res.json() : []);
      } catch {
        toast.error('Search failed');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  // Category filter (non-search mode)
  useEffect(() => {
    if (query.trim()) return;
    async function fetchFiltered() {
      try {
        const params = new URLSearchParams({ limit: '20' });
        if (selectedCategory !== 'All') params.set('category', selectedCategory);
        const res = await fetch(`/api/public/events?${params}`);
        setEvents(res.ok ? await res.json() : []);
      } catch {
        toast.error('Failed to filter events');
      }
    }
    fetchFiltered();
  }, [selectedCategory, query]);

  const isSearching = query.trim().length > 0;
  const filteredEvents = events;
  const trendingEvents = events.slice(0, 4);

  if (loading) {
    return (
      <div className="pb-24">
        {/* Ambient orb */}
        <div className="fixed -top-40 -right-40 w-[500px] h-[500px] bg-primary-container/5 blur-[120px] -z-10 rounded-full pointer-events-none" />

        <div className="px-4 pt-5 pb-4">
          <h2 className="font-headline font-bold text-2xl text-on-surface">Discover</h2>
          <p className="text-on-surface-variant text-sm mt-1 font-body">Find your next experience</p>
        </div>

        {/* Search bar skeleton */}
        <div className="px-4 mb-4">
          <div className="bg-surface-container-high animate-shimmer rounded-xl h-14" />
        </div>

        {/* Filter pills skeleton */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 w-20 bg-surface-container-high animate-shimmer rounded-full shrink-0" />
          ))}
        </div>

        {/* Card skeletons */}
        <div className="px-4 grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface-container-high animate-shimmer rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] w-full" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-surface-container-highest rounded w-3/4" />
                <div className="h-3 bg-surface-container-highest rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Ambient orb */}
      <div className="fixed -top-40 -right-40 w-[500px] h-[500px] bg-primary-container/5 blur-[120px] -z-10 rounded-full pointer-events-none" />

      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h2 className="font-headline font-bold text-2xl text-on-surface">Discover</h2>
        <p className="text-on-surface-variant text-sm mt-1 font-body">Find your next experience</p>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-4">
        <div className="glass-card rounded-xl h-14 flex items-center px-4 gap-3 border border-white/5 focus-within:border-primary-container/40 transition-colors">
          <span className="text-on-surface-variant shrink-0">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, venues, artists..."
            className="flex-1 bg-transparent text-sm text-on-surface font-body placeholder:text-on-surface-variant/60 focus:outline-none min-w-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 px-4 pb-5 overflow-x-auto scrollbar-hide">
        {EVENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`
              px-4 py-2.5 rounded-full text-sm font-body font-semibold whitespace-nowrap transition-all duration-200 shrink-0
              ${selectedCategory === cat
                ? 'bg-primary-container text-white shadow-[0_0_16px_rgba(255,107,53,0.3)] scale-[1.03]'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {isSearching ? (
        /* ── Search results ── */
        <div className="px-4">
          <p className="text-on-surface-variant text-xs font-body mb-4">
            {filteredEvents.length} result{filteredEvents.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredEvents.map((event, i) => (
                <div
                  key={event.id}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="bg-surface-container rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200 active:scale-[0.98]"
                >
                  <div
                    className="aspect-[4/3] relative w-full"
                    style={{ background: EVENT_GRADIENTS[(event.gradient_index ?? i) % EVENT_GRADIENTS.length] }}
                  >
                    <span className="absolute top-2 left-2 bg-secondary-container text-white px-2.5 py-0.5 rounded-full font-body text-xs font-black uppercase tracking-wide">
                      {event.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <h4 className="font-headline font-semibold text-xs text-on-surface mb-1 line-clamp-1">{event.title}</h4>
                    <p className="text-on-surface-variant text-xs font-body mb-0.5">{formatDate(event.date)}</p>
                    <p className="text-on-surface-variant text-xs font-body line-clamp-1">{event.venue?.name || event.venue}</p>
                    {event.ticket_tiers?.[0]?.price != null && (
                      <p className="text-primary-container text-xs font-body font-bold mt-1.5">{formatCurrency(event.ticket_tiers[0].price)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 text-on-surface-variant">
                <SearchIcon size={22} />
              </div>
              <h3 className="font-headline font-semibold text-base text-on-surface mb-2">No results found</h3>
              <p className="text-on-surface-variant text-sm font-body max-w-[200px]">
                Try adjusting your search or browse categories above.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ── Browse mode ── */
        <>
          {/* Trending Events */}
          {trendingEvents.length > 0 && (
            <div className="px-4 mb-7">
              <h3 className="font-headline font-bold text-xl mb-4 text-on-surface">Trending Events</h3>
              <div className="grid grid-cols-2 gap-3">
                {trendingEvents.map((event, i) => (
                  <div
                    key={event.id}
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="bg-surface-container rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200 active:scale-[0.98]"
                  >
                    <div
                      className="aspect-[4/3] relative w-full"
                      style={{ background: EVENT_GRADIENTS[(event.gradient_index ?? i) % EVENT_GRADIENTS.length] }}
                    >
                      <span className="absolute top-2 left-2 glass-panel text-white text-xs font-body font-black px-2.5 py-0.5 rounded-full border border-white/10">
                        #{i + 1}
                      </span>
                      {event.category && (
                        <span className="absolute bottom-2 left-2 bg-secondary-container text-white px-2.5 py-0.5 rounded-full font-body text-xs font-black uppercase tracking-wide">
                          {event.category}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-headline font-semibold text-xs text-on-surface mb-1 line-clamp-1">{event.title}</h4>
                      <p className="text-on-surface-variant text-xs font-body mb-0.5">{formatDate(event.date)}</p>
                      <p className="text-primary-container text-xs font-body font-bold">{formatCurrency(event.price ?? 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Venues */}
          {venues.length > 0 && (
            <div className="mb-7">
              <h3 className="font-headline font-bold text-xl mb-4 px-4 text-on-surface">Popular Venues</h3>
              <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
                {venues.map((venue, i) => (
                  <div
                    key={venue.id}
                    onClick={() => router.push(`/venues/${venue.id}`)}
                    className="flex-none w-48 glass-card rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/5 hover:border-white/15 transition-all duration-200 active:scale-[0.98]"
                  >
                    <div
                      className="h-24 w-full"
                      style={{ background: EVENT_GRADIENTS[(i + 3) % EVENT_GRADIENTS.length] }}
                    />
                    <div className="p-3">
                      <h4 className="font-headline font-semibold text-xs text-on-surface mb-0.5 line-clamp-1">{venue.name}</h4>
                      <p className="text-on-surface-variant text-xs font-body mb-2">{venue.type}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-on-surface-variant text-xs font-body">
                          {formatCompactNumber(venue.capacity ?? 0)} cap
                        </span>
                        <span className="flex items-center gap-0.5 text-warning text-xs font-body">
                          <StarIcon />
                          {venue.rating ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Artists */}
          {artists.length > 0 && (
            <div className="mb-6">
              <h3 className="font-headline font-bold text-xl mb-4 px-4 text-on-surface">Featured Artists</h3>
              <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide pb-1">
                {artists.map((artist, i) => (
                  <div
                    key={artist.id}
                    onClick={() => router.push(`/artists/${artist.id}`)}
                    className="w-32 flex flex-col items-center gap-2 cursor-pointer group shrink-0"
                  >
                    <div
                      className="w-[72px] h-[72px] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]})`,
                      }}
                    >
                      <span className="text-white font-headline font-bold text-lg">
                        {getInitials(artist.name)}
                      </span>
                    </div>
                    <h4 className="font-headline font-semibold text-xs text-on-surface text-center line-clamp-1 w-full">{artist.name}</h4>
                    <p className="text-on-surface-variant text-xs font-body text-center -mt-1">{artist.genre}</p>
                    <p className="text-on-surface-variant text-xs font-body text-center -mt-1">
                      {formatCompactNumber(artist.followers ?? 0)} followers
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All results empty state */}
          {events.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 text-on-surface-variant">
                <SearchIcon size={22} />
              </div>
              <h3 className="font-headline font-semibold text-base text-on-surface mb-2">Nothing here yet</h3>
              <p className="text-on-surface-variant text-sm font-body max-w-[220px]">
                Events will appear here once they are published.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
