'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    address: 'Downtown Arts District',
    amenities: ['Sound System', 'Bar', 'Parking'],
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
    address: 'Midtown, 12th Floor',
    amenities: ['City Views', 'Bar', 'Heaters'],
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
    address: 'West End Gallery Row',
    amenities: ['Projector', 'Natural Light', 'AV'],
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
    address: 'Industrial Quarter',
    amenities: ['Stage', 'Loading Dock', 'HVAC'],
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
    address: 'Buckhead Creative Hub',
    amenities: ['Recording Booth', 'Green Room'],
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
    address: 'Piedmont Park Area',
    amenities: ['Tent', 'Catering Kitchen', 'Parking'],
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
      <div className="px-4 pt-6 pb-4">
        <h2 className="font-headline font-bold text-3xl tracking-tight text-on-surface">Venues</h2>
        <p className="text-on-surface-variant text-sm mt-1">Find the perfect space</p>
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

      {/* Filter Pills */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {VENUE_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`
              px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200
              ${selectedType === type
                ? 'bg-primary-container text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                : 'bg-surface-container text-on-surface-variant'
              }
            `}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Venue List */}
      <div className="px-4 flex flex-col gap-3">
        {filtered.map(venue => (
          <div
            key={venue.id}
            onClick={() => router.push(`/venues/${venue.id}`)}
            className="glass-card rounded-2xl overflow-hidden border border-white/5 cursor-pointer active:scale-[0.98] transition-transform"
          >
            {/* Image / gradient area */}
            <div
              className="aspect-[16/7] relative w-full"
              style={{ background: EVENT_GRADIENTS[venue.gradient] }}
            >
              {/* Overlay gradient for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Category badge */}
              <span className="absolute top-3 left-3 bg-secondary-container text-white rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide">
                {venue.type}
              </span>

              {/* Rating + capacity bottom-right */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="text-white text-[10px] font-bold">{venue.rating}</span>
                  <span className="text-white/60 text-[10px]">({venue.reviews})</span>
                </span>
                <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span className="text-white text-[10px] font-bold">{venue.capacity}</span>
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h4 className="font-headline font-bold text-base text-on-surface mb-0.5">
                {venue.name}
              </h4>
              <p className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {venue.address}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-primary-container font-semibold text-sm">
                  {formatCurrency(venue.hourlyRate)}/hr
                </span>
                {/* Amenity chips */}
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {venue.amenities.slice(0, 2).map(amenity => (
                    <span
                      key={amenity}
                      className="bg-surface-container-highest text-on-surface-variant rounded-full px-2.5 py-1 text-[10px] font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="px-4 py-12 text-center">
          <p className="text-on-surface-variant text-sm">No venues found</p>
        </div>
      )}
    </div>
  );
}
