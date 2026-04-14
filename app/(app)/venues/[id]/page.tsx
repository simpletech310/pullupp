'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EVENT_GRADIENTS } from '@/lib/utils/constants';
import { formatCurrency } from '@/lib/utils/format';

const VENUE_DATA = {
  id: 'v1',
  name: 'The Velvet Room',
  type: 'Event Space',
  rating: 4.8,
  reviews: 124,
  address: '456 Peachtree St NE, Atlanta, GA 30308',
  description: 'A premium event space featuring exposed brick walls, industrial-chic lighting, and floor-to-ceiling windows overlooking the Atlanta skyline. Perfect for concerts, corporate events, and private celebrations.',
  capacityStanding: 350,
  capacitySeated: 200,
  hourlyRate: 250,
  pricingMode: 'Hourly',
  amenities: [
    { name: 'WiFi', icon: 'wifi' },
    { name: 'Sound System', icon: 'speaker' },
    { name: 'Stage', icon: 'stage' },
    { name: 'Parking', icon: 'parking' },
    { name: 'Kitchen', icon: 'kitchen' },
    { name: 'Green Room', icon: 'room' },
    { name: 'Lighting Rig', icon: 'light' },
    { name: 'ADA Access', icon: 'accessible' },
    { name: 'Bar Area', icon: 'bar' },
    { name: 'AC/Heating', icon: 'climate' },
    { name: 'Security', icon: 'shield' },
    { name: 'Coat Check', icon: 'coat' },
  ],
  equipmentPackages: [
    { name: 'Basic Sound', price: 150, includes: 'PA system, 2 mics, mixer' },
    { name: 'Full Production', price: 450, includes: 'PA, lights, fog machine, 4 mics, monitor speakers' },
    { name: 'DJ Setup', price: 200, includes: 'CDJs, mixer, booth monitors, lighting' },
  ],
  houseRules: [
    'No smoking inside the venue',
    'Music must end by 2:00 AM',
    'Maximum occupancy must be observed at all times',
    'Venue must be left in its original condition',
    'Outside catering requires prior approval',
    'Security required for events over 200 guests',
  ],
  paymentTerms: '50% deposit required at booking. Remaining balance due 7 days before event.',
  cancellationPolicy: 'Full refund if cancelled 30+ days before event. 50% refund for 14-29 days. No refund within 14 days.',
  insuranceRequirements: 'General liability insurance of $1M minimum required for events over 100 guests. Certificate of insurance must be provided 14 days before event.',
  galleryCount: 5,
};

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />,
  speaker: <><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><circle cx="12" cy="14" r="4" /><line x1="12" y1="6" x2="12.01" y2="6" /></>,
  stage: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 2l-4 5-4-5" /></>,
  parking: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 17V7h4a3 3 0 0 1 0 6H9" /></>,
  kitchen: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  room: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
  light: <><line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></>,
  accessible: <><circle cx="16.5" cy="3.5" r="1.5" /><path d="M7 22l2-8h6l2 8M14 10l-2 2-3-3 2-2" /></>,
  bar: <><path d="M8 22h8M12 11v11M20 2H4l4 9h8l4-9z" /></>,
  climate: <><path d="M12 9a4 4 0 0 0-2 7.5M12 3v2M6.6 18.4l-1.4 1.4M20 12h2M2 12h2M19.4 5l-1.4 1.4M17.4 18.4l1.4 1.4M4.6 5L6 6.4" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
  coat: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 2l4 4-4 4-4-4 4-4z" /></>,
};

export default function VenueDetailPage() {
  const router = useRouter();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const venue = VENUE_DATA;

  return (
    <div className="pb-24">
      {/* Gallery */}
      <div className="relative">
        <div
          className="aspect-[16/9] min-h-[180px] flex items-center justify-center"
          style={{ background: EVENT_GRADIENTS[galleryIndex % EVENT_GRADIENTS.length] }}
        >
          <span className="text-white/60 text-sm font-medium">Gallery Photo {galleryIndex + 1}</span>
        </div>
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-3 rounded-full bg-black/30 backdrop-blur-sm text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        {/* Gallery dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {Array.from({ length: venue.galleryCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setGalleryIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === galleryIndex ? 'bg-white w-4' : 'bg-white/50'}`}
            />
          ))}
        </div>
        {/* Swipe areas */}
        <button
          onClick={() => setGalleryIndex(Math.max(0, galleryIndex - 1))}
          className="absolute left-0 top-0 bottom-0 w-1/3"
          aria-label="Previous photo"
        />
        <button
          onClick={() => setGalleryIndex(Math.min(venue.galleryCount - 1, galleryIndex + 1))}
          className="absolute right-0 top-0 bottom-0 w-1/3"
          aria-label="Next photo"
        />
      </div>

      {/* Venue Info */}
      <div className="px-4 pt-4">
        <div className="flex items-start justify-between mb-1">
          <h1 className="font-display font-bold text-xl">{venue.name}</h1>
          <Badge variant="purple">{venue.type}</Badge>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="font-semibold">{venue.rating}</span>
            <span className="text-text-muted">({venue.reviews} reviews)</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {venue.address}
        </div>
        <p className="text-text-secondary text-sm leading-relaxed mb-4">{venue.description}</p>
      </div>

      {/* Capacity */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-semibold text-base mb-3">Capacity</h3>
        <div className="flex gap-3">
          <Card className="flex-1 p-4">
            <div className="text-orange font-display font-bold text-2xl">{venue.capacityStanding}</div>
            <div className="text-xs text-text-secondary mt-1">Standing</div>
          </Card>
          <Card className="flex-1 p-4">
            <div className="text-teal font-display font-bold text-2xl">{venue.capacitySeated}</div>
            <div className="text-xs text-text-secondary mt-1">Seated</div>
          </Card>
        </div>
      </div>

      {/* Pricing */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-semibold text-base mb-3">Pricing</h3>
        <Card className="p-4">
          <div className="flex items-baseline gap-1">
            <span className="text-orange font-display font-bold text-2xl">{formatCurrency(venue.hourlyRate)}</span>
            <span className="text-text-secondary text-sm">/hour</span>
          </div>
          <Badge variant="default" className="mt-2">{venue.pricingMode}</Badge>
        </Card>
      </div>

      {/* Amenities */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-semibold text-base mb-3">Amenities</h3>
        <div className="grid grid-cols-3 gap-2">
          {venue.amenities.map(amenity => (
            <Card key={amenity.name} className="p-3 flex flex-col items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal">
                {AMENITY_ICONS[amenity.icon] || <circle cx="12" cy="12" r="10" />}
              </svg>
              <span className="text-xs text-text-secondary text-center">{amenity.name}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* Equipment Packages */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-semibold text-base mb-3">Equipment Packages</h3>
        <div className="flex flex-col gap-3">
          {venue.equipmentPackages.map(pkg => (
            <Card key={pkg.name} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{pkg.name}</span>
                <span className="text-orange font-semibold text-sm">+{formatCurrency(pkg.price)}</span>
              </div>
              <p className="text-text-secondary text-xs">{pkg.includes}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Floor Plan Placeholder */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-semibold text-base mb-3">Floor Plan</h3>
        <div className="border-2 border-dashed border-border rounded-2xl h-[180px] flex flex-col items-center justify-center gap-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="12" y1="3" x2="12" y2="21" />
          </svg>
          <span className="text-text-muted text-xs">Floor plan coming soon</span>
        </div>
      </div>

      {/* Video Tour Placeholder */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-semibold text-base mb-3">Video Tour</h3>
        <div
          className="rounded-2xl h-[180px] flex flex-col items-center justify-center gap-2 relative overflow-hidden"
          style={{ background: EVENT_GRADIENTS[8] }}
        >
          <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
          <span className="text-white/80 text-xs font-medium">Watch Video Tour</span>
        </div>
      </div>

      {/* House Rules */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-semibold text-base mb-3">House Rules</h3>
        <Card className="p-4">
          <ul className="flex flex-col gap-2">
            {venue.houseRules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-orange mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v20M2 12h20" /></svg>
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Payment Terms */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-semibold text-base mb-3">Payment Terms</h3>
        <Card className="p-4">
          <p className="text-sm text-text-secondary">{venue.paymentTerms}</p>
        </Card>
      </div>

      {/* Cancellation Policy */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-semibold text-base mb-3">Cancellation Policy</h3>
        <Card className="p-4">
          <p className="text-sm text-text-secondary">{venue.cancellationPolicy}</p>
        </Card>
      </div>

      {/* Insurance */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-semibold text-base mb-3">Insurance Requirements</h3>
        <Card className="p-4">
          <p className="text-sm text-text-secondary">{venue.insuranceRequirements}</p>
        </Card>
      </div>

      {/* Sticky bottom buttons */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-bg/80 backdrop-blur-md border-t border-border flex gap-3 z-20">
        <Button
          variant={isFollowing ? 'secondary' : 'outline'}
          onClick={() => setIsFollowing(!isFollowing)}
          className="shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isFollowing ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={() => router.push(`/bookings/request?type=venue&id=${venue.id}`)}
        >
          Book Venue
        </Button>
      </div>
    </div>
  );
}
