'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuthContext } from '@/providers/auth-provider';
import { formatCurrency } from '@/lib/utils/format';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
} from 'date-fns';

// Mock providers for search
const MOCK_VENUES = [
  { id: 'v1', name: 'The Velvet Room', hourlyRate: 150 },
  { id: 'v2', name: 'Skyline Rooftop', hourlyRate: 250 },
  { id: 'v3', name: 'Creative Co-Op', hourlyRate: 100 },
  { id: 'v4', name: 'Garden Pavilion', hourlyRate: 200 },
  { id: 'v5', name: 'The Grand Hall', hourlyRate: 350 },
];

const MOCK_ARTISTS = [
  { id: 'a1', name: 'DJ Nova', hourlyRate: 200 },
  { id: 'a2', name: 'Sarah Keys (Piano)', hourlyRate: 150 },
  { id: 'a3', name: 'The Groove Collective', hourlyRate: 500 },
  { id: 'a4', name: 'Marcus Cole (Comedy)', hourlyRate: 175 },
  { id: 'a5', name: 'Luna Strings Quartet', hourlyRate: 400 },
];

type BookingType = 'venue' | 'artist';

export default function BookingRequestPage() {
  const router = useRouter();
  const { profile } = useAuthContext();

  const [bookingType, setBookingType] = useState<BookingType>('venue');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [hours, setHours] = useState<number>(3);
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const providers = bookingType === 'venue' ? MOCK_VENUES : MOCK_ARTISTS;
  const selectedProviderData = providers.find((p) => p.id === selectedProvider);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [calendarMonth]);

  // Estimated total
  const estimatedTotal = useMemo(() => {
    if (budgetAmount > 0) return budgetAmount;
    if (selectedProviderData) return selectedProviderData.hourlyRate * hours;
    return 0;
  }, [budgetAmount, selectedProviderData, hours]);

  const depositAmount = Math.round(estimatedTotal * 0.25);

  const handleSubmit = async () => {
    if (!eventName || !selectedProvider || !selectedDate) return;

    setSubmitting(true);
    // TODO: POST to /api/bookings endpoint
    // For now, simulate a delay and redirect
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    router.push('/bookings');
  };

  const canSubmit = eventName && selectedProvider && selectedDate && hours > 0;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-surface-hover transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-xl">Request Booking</h1>
      </div>

      <div className="px-4 space-y-5">
        {/* Booking Type Toggle */}
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
            Type
          </label>
          <div className="flex gap-2">
            {(['venue', 'artist'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setBookingType(type);
                  setSelectedProvider('');
                  setProviderDropdownOpen(false);
                }}
                className={`
                  flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${bookingType === type
                    ? 'bg-orange text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                    : 'bg-surface border border-border text-text-secondary hover:border-border-light'
                  }
                `}
              >
                {type === 'venue' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                    Venue
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                    </svg>
                    Artist
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Provider Select */}
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
            Select {bookingType === 'venue' ? 'Venue' : 'Artist'}
          </label>
          <div className="relative">
            <button
              onClick={() => setProviderDropdownOpen(!providerDropdownOpen)}
              className={`
                w-full bg-surface border border-border rounded-xl px-4 py-3
                text-sm text-left transition-colors duration-200
                focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30
                flex items-center justify-between
                ${!selectedProvider ? 'text-text-muted' : 'text-text-primary'}
              `}
            >
              {selectedProviderData?.name || `Choose a ${bookingType}...`}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${providerDropdownOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {providerDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-bg-elevated border border-border rounded-xl shadow-lg overflow-hidden">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider.id);
                      setProviderDropdownOpen(false);
                      if (!budgetAmount) {
                        setBudgetAmount(provider.hourlyRate * hours);
                      }
                    }}
                    className={`
                      w-full px-4 py-3 text-sm text-left hover:bg-surface-hover transition-colors
                      flex items-center justify-between
                      ${selectedProvider === provider.id ? 'text-orange font-semibold' : 'text-text-primary'}
                    `}
                  >
                    <span>{provider.name}</span>
                    <span className="text-text-muted text-xs">{formatCurrency(provider.hourlyRate)}/hr</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Event Name */}
        <Input
          label="Event Name"
          placeholder="e.g. Summer Rooftop Party"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />

        {/* Date Picker Calendar */}
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
            Date
          </label>
          <Card className="p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="font-semibold text-sm">
                {format(calendarMonth, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-center text-[10px] font-semibold text-text-muted py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const isCurrentMonth = isSameMonth(day, calendarMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isPast = isBefore(day, new Date()) && !isToday(day);
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={i}
                    disabled={isPast || !isCurrentMonth}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-150
                      ${!isCurrentMonth ? 'text-text-muted/30' : ''}
                      ${isPast ? 'text-text-muted/40 cursor-not-allowed' : ''}
                      ${isCurrentMonth && !isPast && !isSelected ? 'hover:bg-surface-hover text-text-primary' : ''}
                      ${isSelected ? 'bg-orange text-white shadow-[0_0_12px_rgba(255,107,53,0.3)]' : ''}
                      ${isCurrentDay && !isSelected ? 'border border-orange/50 text-orange' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="mt-3 pt-3 border-t border-border text-sm text-text-secondary text-center">
                Selected: <span className="text-text-primary font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Hours */}
        <Input
          label="Hours"
          type="number"
          min={1}
          max={24}
          value={hours}
          onChange={(e) => setHours(parseInt(e.target.value) || 1)}
        />

        {/* Budget / Offer Amount */}
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
            Budget / Offer Amount
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-semibold">$</div>
            <input
              type="number"
              min={0}
              step={25}
              value={budgetAmount || ''}
              onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
              placeholder={selectedProviderData ? `${selectedProviderData.hourlyRate * hours}` : '0'}
              className="
                w-full bg-surface border border-border rounded-xl pl-8 pr-4 py-3
                text-sm text-text-primary font-body
                placeholder:text-text-muted
                focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30
                transition-colors duration-200
              "
            />
          </div>
          {estimatedTotal > 0 && (
            <p className="text-xs text-text-secondary mt-1.5">
              Offer: <span className="text-orange font-semibold">{formatCurrency(estimatedTotal)}</span>
              {selectedProviderData && budgetAmount === 0 && (
                <span className="text-text-muted"> (based on {formatCurrency(selectedProviderData.hourlyRate)}/hr x {hours}hrs)</span>
              )}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests or details..."
            rows={3}
            className="
              w-full bg-surface border border-border rounded-xl px-4 py-3
              text-sm text-text-primary font-body
              placeholder:text-text-muted
              focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30
              transition-colors duration-200 resize-none
            "
          />
        </div>

        {/* Estimated Total Card */}
        {estimatedTotal > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">Estimate</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">
                  {selectedProviderData?.name || 'Provider'} ({hours} hrs)
                </span>
                <span className="text-text-primary">{formatCurrency(estimatedTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Platform fee (5%)</span>
                <span className="text-text-primary">{formatCurrency(estimatedTotal * 0.05)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-orange">{formatCurrency(estimatedTotal * 1.05)}</span>
              </div>
              <div className="flex justify-between text-xs text-text-muted pt-1">
                <span>Deposit due on acceptance</span>
                <span>{formatCurrency(depositAmount)}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Submit */}
        <Button
          fullWidth
          size="lg"
          disabled={!canSubmit}
          loading={submitting}
          onClick={handleSubmit}
        >
          Send Request
        </Button>
      </div>
    </div>
  );
}
