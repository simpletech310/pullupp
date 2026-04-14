'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EVENT_GRADIENTS, EVENT_CATEGORIES, AVATAR_COLORS } from '@/lib/utils/constants';
import { formatDate, formatCompactNumber } from '@/lib/utils/format';
import { toast } from 'sonner';
import { getPublishedEvents, getVenues, getArtists } from '@/lib/supabase/queries';

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        const [eventsData, venuesData, artistsData] = await Promise.all([
          getPublishedEvents({}),
          getVenues(),
          getArtists(),
        ]);
        setEvents(eventsData?.data || []);
        setVenues(venuesData?.data || []);
        setArtists(artistsData?.data || []);
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
        const filter: any = { search: query };
        if (selectedCategory !== 'All') filter.category = selectedCategory;
        const { data } = await getPublishedEvents(filter);
        setEvents(data || []);
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
        const filter = selectedCategory === 'All' ? {} : { category: selectedCategory };
        const { data } = await getPublishedEvents(filter);
        setEvents(data || []);
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
      <div className="pb-4">
        <div className="px-4 pt-4 pb-3">
          <h2 className="font-display font-bold text-xl">Discover</h2>
          <p className="text-text-secondary text-sm mt-0.5">Find your next experience</p>
        </div>
        <div className="px-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
              <div className="h-24 bg-surface-alt" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-surface-alt rounded w-3/4" />
                <div className="h-3 bg-surface-alt rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="font-display font-bold text-xl">Discover</h2>
        <p className="text-text-secondary text-sm mt-0.5">Find your next experience</p>
      </div>

      {/* Search input */}
      <div className="px-4 mb-4">
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, venues, artists..."
            className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm text-text-primary font-body placeholder:text-text-muted focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-colors duration-200"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {EVENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`
              px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200
              ${selectedCategory === cat
                ? 'bg-orange text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                : 'bg-surface border border-border text-text-secondary hover:border-border-light'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {isSearching ? (
        /* Search results */
        <div className="px-4">
          <p className="text-text-muted text-xs mb-3">
            {filteredEvents.length} result{filteredEvents.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredEvents.map((event, i) => (
                <Card
                  key={event.id}
                  hoverable
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <div
                    className="h-24 p-3 flex flex-col justify-end relative"
                    style={{ background: EVENT_GRADIENTS[(event.gradient ?? i) % EVENT_GRADIENTS.length] }}
                  >
                    <Badge variant="default" className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm border-0 text-white text-[9px]">
                      {event.category}
                    </Badge>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-xs mb-1 line-clamp-1">{event.title}</h4>
                    <p className="text-text-muted text-[11px] mb-1">{formatDate(event.date)}</p>
                    <p className="text-text-muted text-[11px] line-clamp-1">{event.venue?.name || event.venue}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-3">
                <SearchIcon />
              </div>
              <h3 className="font-display font-semibold text-sm mb-1">No results found</h3>
              <p className="text-text-muted text-xs max-w-[200px]">
                Try adjusting your search or browse categories above.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Browse mode */
        <>
          {/* Trending Events */}
          {trendingEvents.length > 0 && (
            <div className="px-4 mb-6">
              <h3 className="font-display font-semibold text-base mb-3">Trending Events</h3>
              <div className="grid grid-cols-2 gap-3">
                {trendingEvents.map((event, i) => (
                  <Card
                    key={event.id}
                    hoverable
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    <div
                      className="h-24 p-3 flex flex-col justify-end relative"
                      style={{ background: EVENT_GRADIENTS[(event.gradient ?? i) % EVENT_GRADIENTS.length] }}
                    >
                      <div className="absolute top-2 left-2">
                        <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          #{i + 1}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-xs mb-1 line-clamp-1">{event.title}</h4>
                      <p className="text-text-muted text-[11px] mb-0.5">{formatDate(event.date)}</p>
                      <p className="text-orange text-[11px] font-semibold">${event.price ?? 0}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Popular Venues */}
          {venues.length > 0 && (
            <div className="mb-6">
              <h3 className="font-display font-semibold text-base mb-3 px-4">Popular Venues</h3>
              <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
                {venues.map((venue, i) => (
                  <div
                    key={venue.id}
                    onClick={() => router.push(`/venues/${venue.id}`)}
                    className="shrink-0 w-[160px] bg-surface border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-border-light hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div
                      className="h-16"
                      style={{ background: EVENT_GRADIENTS[(i + 3) % EVENT_GRADIENTS.length] }}
                    />
                    <div className="p-3">
                      <h4 className="font-semibold text-xs mb-0.5 line-clamp-1">{venue.name}</h4>
                      <p className="text-text-muted text-[10px] mb-2">{venue.type}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary text-[10px]">
                          {formatCompactNumber(venue.capacity ?? 0)} cap
                        </span>
                        <span className="flex items-center gap-0.5 text-warning text-[10px]">
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
            <div className="mb-4">
              <h3 className="font-display font-semibold text-base mb-3 px-4">Featured Artists</h3>
              <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
                {artists.map((artist, i) => (
                  <div
                    key={artist.id}
                    onClick={() => router.push(`/artists/${artist.id}`)}
                    className="shrink-0 w-[120px] flex flex-col items-center cursor-pointer group"
                  >
                    <div
                      className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200 shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]})`,
                      }}
                    >
                      <span className="text-white font-display font-bold text-lg">
                        {getInitials(artist.name)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-center line-clamp-1 mb-0.5">{artist.name}</h4>
                    <p className="text-text-muted text-[10px] text-center mb-0.5">{artist.genre}</p>
                    <p className="text-text-secondary text-[10px]">
                      {formatCompactNumber(artist.followers ?? 0)} followers
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
