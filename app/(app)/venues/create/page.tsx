'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { createVenue } from '@/lib/supabase/mutations';
import { useAuthContext } from '@/providers/auth-provider';

const VENUE_TYPES = ['Lounge', 'Rooftop', 'Studio', 'Outdoor', 'Hall', 'Bar', 'Theater'] as const;

const AMENITIES = [
  'Sound System', 'Stage', 'Lighting', 'Bar', 'Kitchen',
  'Parking', 'WiFi', 'Green Room', 'DJ Booth', 'Projector',
] as const;

const STEPS = ['Basic Info', 'Capacity & Pricing', 'Amenities & Policies'] as const;

export default function CreateVenuePage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(false);
  const [errorToast, setErrorToast] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [venueType, setVenueType] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [totalCapacity, setTotalCapacity] = useState('');
  const [standingCapacity, setStandingCapacity] = useState('');
  const [seatedCapacity, setSeatedCapacity] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [deposit, setDeposit] = useState('');
  const [pricingMode, setPricingMode] = useState<'fixed' | 'negotiable'>('fixed');

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [cancellationPolicy, setCancellationPolicy] = useState('');

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setErrorToast(false);

    const { data: venue, error } = await createVenue({
      owner_id: user.id,
      name,
      type: venueType,
      description,
      address,
      city,
      state,
      capacity: Number(totalCapacity) || 0,
      standing_capacity: standingCapacity ? Number(standingCapacity) : null,
      seated_capacity: seatedCapacity ? Number(seatedCapacity) : null,
      hourly_rate: Number(hourlyRate) || 0,
      deposit: Number(deposit) || 0,
      pricing_mode: pricingMode,
      amenities: selectedAmenities,
      cancellation_policy: cancellationPolicy || null,
      is_active: true,
    });

    setSubmitting(false);

    if (error || !venue) {
      setErrorToast(true);
      setTimeout(() => setErrorToast(false), 3000);
      return;
    }

    setToast(true);
    setTimeout(() => {
      setToast(false);
      router.push(`/venues/${venue.id}`);
    }, 2000);
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="pb-8">
      {/* Orange progress bar */}
      <div className="h-1 bg-surface">
        <div
          className="h-full bg-orange transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : router.back()}
          className="flex items-center gap-1.5 text-text-secondary text-sm mb-3 hover:text-text-primary transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <h1 className="font-display font-bold text-xl">List Your Venue</h1>
        <p className="text-text-secondary text-sm mt-1">
          Step {step + 1} of {STEPS.length} &mdash; {STEPS[step]}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 px-4 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`
              w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300
              ${i <= step ? 'bg-orange text-white' : 'bg-surface border border-border text-text-muted'}
            `}>
              {i < step ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${i < step ? 'bg-orange' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 - Basic Info */}
      {step === 0 && (
        <div className="px-4 flex flex-col gap-4">
          <Input
            label="Venue Name"
            placeholder="e.g. The Velvet Room"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Venue Type
            </label>
            <select
              value={venueType}
              onChange={e => setVenueType(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-body focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-colors duration-200 appearance-none"
            >
              <option value="" className="bg-surface">Select type</option>
              {VENUE_TYPES.map(t => (
                <option key={t} value={t} className="bg-surface">{t}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your venue, its vibe, and what makes it special..."
              rows={4}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-body placeholder:text-text-muted focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-colors duration-200 resize-none"
            />
          </div>

          <Input
            label="Address"
            placeholder="123 Main Street"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              placeholder="Atlanta"
              value={city}
              onChange={e => setCity(e.target.value)}
            />
            <Input
              label="State"
              placeholder="GA"
              value={state}
              onChange={e => setState(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 2 - Capacity & Pricing */}
      {step === 1 && (
        <div className="px-4 flex flex-col gap-4">
          <Input
            label="Total Capacity"
            type="number"
            placeholder="300"
            value={totalCapacity}
            onChange={e => setTotalCapacity(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Standing Capacity"
              type="number"
              placeholder="250"
              value={standingCapacity}
              onChange={e => setStandingCapacity(e.target.value)}
            />
            <Input
              label="Seated Capacity"
              type="number"
              placeholder="150"
              value={seatedCapacity}
              onChange={e => setSeatedCapacity(e.target.value)}
            />
          </div>

          <Input
            label="Hourly Rate ($)"
            type="number"
            placeholder="200"
            value={hourlyRate}
            onChange={e => setHourlyRate(e.target.value)}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />

          <Input
            label="Deposit Amount ($)"
            type="number"
            placeholder="500"
            value={deposit}
            onChange={e => setDeposit(e.target.value)}
          />

          {/* Pricing Mode Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Pricing Mode
            </label>
            <div className="flex bg-surface border border-border rounded-xl p-1">
              <button
                onClick={() => setPricingMode('fixed')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  pricingMode === 'fixed'
                    ? 'bg-orange text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Fixed
              </button>
              <button
                onClick={() => setPricingMode('negotiable')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  pricingMode === 'negotiable'
                    ? 'bg-orange text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Negotiable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 - Amenities & Policies */}
      {step === 2 && (
        <div className="px-4 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(amenity => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`
                    px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200
                    ${selectedAmenities.includes(amenity)
                      ? 'bg-teal/15 text-teal border border-teal/30'
                      : 'bg-surface border border-border text-text-secondary hover:border-border-light'
                    }
                  `}
                >
                  {selectedAmenities.includes(amenity) && (
                    <span className="mr-1">&#10003;</span>
                  )}
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Cancellation Policy
            </label>
            <textarea
              value={cancellationPolicy}
              onChange={e => setCancellationPolicy(e.target.value)}
              placeholder="Describe your cancellation terms (e.g., Full refund if cancelled 7+ days before the event...)"
              rows={4}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-body placeholder:text-text-muted focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-colors duration-200 resize-none"
            />
          </div>

          {/* Cover Photos Upload Placeholder */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Cover Photos
            </label>
            <Card className="border-dashed !border-border-light">
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm text-text-secondary font-semibold">Upload Photos</p>
                  <p className="text-xs text-text-muted mt-0.5">JPG, PNG up to 5MB each</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="px-4 mt-8 flex gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep(step - 1)}
            className="flex-1"
          >
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            size="lg"
            fullWidth={step === 0}
            onClick={() => setStep(step + 1)}
            className={step > 0 ? 'flex-1' : ''}
          >
            Next
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleSubmit}
            loading={submitting}
            className="flex-1"
          >
            Submit Listing
          </Button>
        )}
      </div>

      {/* Error Toast */}
      {errorToast && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-error text-white px-5 py-3.5 rounded-xl text-sm font-semibold text-center shadow-lg shadow-error/20">
            Failed to create venue. Please try again.
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-teal text-white px-5 py-3.5 rounded-xl text-sm font-semibold text-center shadow-lg shadow-teal/20">
            Venue listed successfully!
          </div>
        </div>
      )}
    </div>
  );
}
