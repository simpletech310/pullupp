'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EVENT_GRADIENTS } from '@/lib/utils/constants';
import { formatDate, formatCurrency } from '@/lib/utils/format';

type DateFilter = 'all' | 'this_week' | 'this_month';
type SortOption = 'date' | 'price' | 'popular';

const ALL_EVENTS = [
  { id: '1', title: 'Midnight Groove', category: 'music', date: '2026-04-18', time: '9:00 PM', venue: 'The Velvet Room', price: 35, attendees: 230, gradient: 0 },
  { id: '2', title: 'Laugh Factory Live', category: 'comedy', date: '2026-04-20', time: '8:00 PM', venue: 'Skyline Rooftop', price: 25, attendees: 180, gradient: 1 },
  { id: '3', title: 'Canvas & Cocktails', category: 'art', date: '2026-04-22', time: '7:00 PM', venue: 'Creative Co-Op', price: 45, attendees: 90, gradient: 2 },
  { id: '4', title: 'Street Eats Festival', category: 'food', date: '2026-04-25', time: '12:00 PM', venue: 'Garden Pavilion', price: 15, attendees: 420, gradient: 3 },
  { id: '5', title: 'Tech Connect Mixer', category: 'networking', date: '2026-04-28', time: '6:00 PM', venue: 'Studio 54 ATL', price: 20, attendees: 150, gradient: 4 },
  { id: '6', title: 'Summer Vibes Festival', category: 'music', date: '2026-05-01', time: '3:00 PM', venue: 'The Grand Hall', price: 55, attendees: 500, gradient: 5 },
  { id: '7', title: 'Jazz Under the Stars', category: 'music', date: '2026-05-10', time: '8:00 PM', venue: 'Skyline Rooftop', price: 40, attendees: 200, gradient: 6 },
  { id: '8', title: 'Hip Hop Showcase', category: 'music', date: '2026-05-15', time: '9:00 PM', venue: 'Warehouse 22', price: 30, attendees: 310, gradient: 7 },
  { id: '9', title: 'Stand Up Saturdays', category: 'comedy', date: '2026-04-19', time: '9:00 PM', venue: 'The Velvet Room', price: 20, attendees: 120, gradient: 8 },
  { id: '10', title: 'Improv Night', category: 'comedy', date: '2026-05-02', time: '7:30 PM', venue: 'Creative Co-Op', price: 15, attendees: 85, gradient: 9 },
  { id: '11', title: 'Gallery Walk', category: 'art', date: '2026-04-26', time: '6:00 PM', venue: 'Art District', price: 10, attendees: 200, gradient: 10 },
  { id: '12', title: 'Food Truck Rally', category: 'food', date: '2026-05-05', time: '11:00 AM', venue: 'Central Park', price: 0, attendees: 600, gradient: 11 },
  { id: '13', title: 'Yoga in the Park', category: 'wellness', date: '2026-04-20', time: '7:00 AM', venue: 'Piedmont Park', price: 10, attendees: 75, gradient: 1 },
  { id: '14', title: 'Basketball Tournament', category: 'sports', date: '2026-05-08', time: '10:00 AM', venue: 'City Gym', price: 25, attendees: 300, gradient: 0 },
  { id: '15', title: 'Shakespeare in the Park', category: 'theater', date: '2026-05-12', time: '7:00 PM', venue: 'Amphitheater', price: 35, attendees: 250, gradient: 2 },
];

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');

  const filteredEvents = useMemo(() => {
    let events = ALL_EVENTS.filter((e) => e.category === slug.toLowerCase());

    // Date filter
    const now = new Date('2026-04-13');
    if (dateFilter === 'this_week') {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      events = events.filter((e) => {
        const d = new Date(e.date);
        return d >= now && d <= weekEnd;
      });
    } else if (dateFilter === 'this_month') {
      events = events.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }

    // Sort
    if (sortBy === 'date') {
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'price') {
      events.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'popular') {
      events.sort((a, b) => b.attendees - a.attendees);
    }

    return events;
  }, [slug, dateFilter, sortBy]);

  const dateFilterOptions: { value: DateFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'date', label: 'Date' },
    { value: 'price', label: 'Price' },
    { value: 'popular', label: 'Popular' },
  ];

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-1">
        <button
          onClick={() => router.back()}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface-hover transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h2 className="font-display font-bold text-xl">{categoryName}</h2>
          <p className="text-text-secondary text-xs">{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pt-3 pb-2 space-y-3">
        {/* Date filter */}
        <div>
          <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Date</label>
          <div className="flex gap-2">
            {dateFilterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateFilter(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  dateFilter === opt.value
                    ? 'bg-orange text-white shadow-[0_0_12px_rgba(255,107,53,0.25)]'
                    : 'bg-surface border border-border text-text-secondary hover:border-border-light'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {/* Sort */}
        <div>
          <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Sort by</label>
          <div className="flex gap-2">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  sortBy === opt.value
                    ? 'bg-teal text-white shadow-[0_0_12px_rgba(20,184,166,0.25)]'
                    : 'bg-surface border border-border text-text-secondary hover:border-border-light'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event cards */}
      <div className="px-4 pt-2">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-base mb-1">No events found</h3>
            <p className="text-text-secondary text-sm max-w-[240px]">
              There are no {categoryName.toLowerCase()} events matching your filters. Try broadening your search.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                hoverable
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <div
                  className="h-[140px] p-4 flex flex-col justify-end relative"
                  style={{ background: EVENT_GRADIENTS[event.gradient % EVENT_GRADIENTS.length] }}
                >
                  <Badge variant="default" className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm border-0 text-white">
                    {categoryName}
                  </Badge>
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
                      {event.price === 0 ? 'Free' : `From ${formatCurrency(event.price)}`}
                    </span>
                    <span className="text-text-muted text-xs">
                      {event.attendees} attending
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
