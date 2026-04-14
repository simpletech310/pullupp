'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EVENT_GRADIENTS } from '@/lib/utils/constants';
import { formatCurrency } from '@/lib/utils/format';

const VENUE_TYPES = ['All', 'Event Space', 'Rooftop', 'Gallery', 'Warehouse', 'Studio', 'Outdoor'] as const;

const MOCK_VENUES = [
  {
    id: 'v1',
    name: 'The Velvet Room',
    type: 'Event Space',
    capacity: 350,
    hourlyRate: 250,
    rating: 4.8,
    reviews: 124,
    gradient: 0,
  },
  {
    id: 'v2',
    name: 'Skyline Rooftop',
    type: 'Rooftop',
    capacity: 200,
    hourlyRate: 400,
    rating: 4.9,
    reviews: 89,
    gradient: 1,
  },
  {
    id: 'v3',
    name: 'Creative Co-Op',
    type: 'Gallery',
    capacity: 120,
    hourlyRate: 150,
    rating: 4.6,
    reviews: 67,
    gradient: 2,
  },
  {
    id: 'v4',
    name: 'Warehouse 22',
    type: 'Warehouse',
    capacity: 500,
    hourlyRate: 350,
    rating: 4.7,
    reviews: 201,
    gradient: 3,
  },
  {
    id: 'v5',
    name: 'Studio 54 ATL',
    type: 'Studio',
    capacity: 80,
    hourlyRate: 120,
    rating: 4.5,
    reviews: 45,
    gradient: 4,
  },
  {
    id: 'v6',
    name: 'Garden Pavilion',
    type: 'Outdoor',
    capacity: 400,
    hourlyRate: 300,
    rating: 4.8,
    reviews: 156,
    gradient: 5,
  },
];

export default function VenuesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  const filtered = MOCK_VENUES.filter(v => {
    const matchesType = selectedType === 'All' || v.type === selectedType;
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="font-display font-bold text-xl">Venues</h2>
        <p className="text-text-secondary text-sm">Find the perfect space</p>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <Input
          placeholder="Search venues..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          }
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {VENUE_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`
              px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200
              ${selectedType === type
                ? 'bg-orange text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                : 'bg-surface border border-border text-text-secondary hover:border-border-light'
              }
            `}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Venue Grid */}
      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(venue => (
          <Card
            key={venue.id}
            hoverable
            onClick={() => router.push(`/venues/${venue.id}`)}
          >
            <div
              className="aspect-[16/7] w-full p-4 flex flex-col justify-end relative"
              style={{ background: EVENT_GRADIENTS[venue.gradient] }}
            >
              <Badge variant="default" className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm border-0 text-white">
                {venue.type}
              </Badge>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-sm mb-1">{venue.name}</h4>
              <div className="flex items-center gap-1 text-xs text-text-secondary mb-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="font-medium">{venue.rating}</span>
                <span className="text-text-muted">({venue.reviews})</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-3">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Up to {venue.capacity} guests
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange font-semibold text-sm">
                  {formatCurrency(venue.hourlyRate)}/hr
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="px-4 py-12 text-center">
          <p className="text-text-muted text-sm">No venues found</p>
        </div>
      )}
    </div>
  );
}
