'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useAuthContext } from '@/providers/auth-provider';
import { formatCurrency } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';
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

interface ProviderOption {
  id: string;
  name: string;
  hourly_rate: number | null;
  flat_rate?: number | null;
  genre?: string | null;
  type?: string | null;
  user_id?: string | null;
}

type BookingType = 'venue' | 'artist';

export default function BookingRequestPage() {
  const router = useRouter();
  const { user, profile } = useAuthContext();

  const [bookingType, setBookingType] = useState<BookingType>('venue');
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [hours, setHours] = useState<number>(3);
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch providers when booking type changes
  useEffect(() => {
    setProvidersLoading(true);
    setSelectedProvider('');

    const supabase = createClient();

    if (bookingType === 'venue') {
      supabase
        .from('venues')
        .select('id, name, hourly_rate, type')
        .eq('is_verified', true)
        .order('name')
        .limit(50)
        .then(({ data }) => {
          setProviders(
            (data || []).map(v => ({
              id: v.id,
              name: v.name,
              hourly_rate: v.hourly_rate,
              type: v.type,
            })),
          );
          setProvidersLoading(false);
        });
    } else {
      supabase
        .from('artists')
        .select('id, name, hourly_rate, flat_rate, genre, user_id')
        .eq('is_active', true)
        .order('name')
        .limit(50)
        .then(({ data }) => {
          setProviders(
            (data || []).map(a => ({
              id: a.id,
              name: a.name,
              hourly_rate: a.hourly_rate,
              flat_rate: a.flat_rate,
              genre: a.genre,
              user_id: a.user_id,
            })),
          );
          setProvidersLoading(false);
        });
    }
  }, [bookingType]);

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

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
    if (selectedProviderData?.hourly_rate) return selectedProviderData.hourly_rate * hours;
    return 0;
  }, [budgetAmount, selectedProviderData, hours]);

  const depositAmount = Math.round(estimatedTotal * 0.25);

  const handleSubmit = async () => {
    if (!eventName || !selectedProvider || !selectedDate) return;

    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: bookingType,
          requester_id: profile?.id || user?.id,
          provider_id: selectedProviderData?.user_id || selectedProvider,
          venue_id: bookingType === 'venue' ? selectedProvider : null,
          artist_id: bookingType === 'artist' ? selectedProvider : null,
          event_name: eventName,
          date: format(selectedDate, 'yyyy-MM-dd'),
          hours,
          hourly_rate: selectedProviderData?.hourly_rate || 0,
          proposed_amount: estimatedTotal,
          deposit_amount: depositAmount,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Booking creation failed:', err);
      }
    } catch (err) {
      console.error('Booking request error:', err);
    }

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
          className="p-2 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="font-headline font-bold text-xl text-on-surface">Request Booking</h1>
      </div>

      <div className="px-4 space-y-5">
        {/* Booking Type Toggle */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold font-body mb-2 block">
            Type
          </label>
          <div className="flex bg-surface-container rounded-xl p-1">
            {(['venue', 'artist'] as const).map(type => (
              <button
                key={type}
                onClick={() => {
                  setBookingType(type);
                  setProviderDropdownOpen(false);
                  setBudgetAmount(0);
                }}
                className={`
                  flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                  ${bookingType === type
                    ? 'bg-primary-container text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                    : 'text-on-surface-variant'
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
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
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
          <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold font-body mb-2 block">
            Select {bookingType === 'venue' ? 'Venue' : 'Artist'}
          </label>
          <div className="relative">
            <button
              onClick={() => !providersLoading && setProviderDropdownOpen(!providerDropdownOpen)}
              disabled={providersLoading}
              className={`
                w-full rounded-xl px-4 py-3 text-sm text-left transition-all duration-200
                focus:outline-none flex items-center justify-between
                glass-card border
                ${selectedProvider
                  ? 'border-primary-container/40 shadow-[0_0_12px_rgba(255,107,53,0.2)]'
                  : 'border-white/5'
                }
                ${!selectedProvider ? 'text-outline' : 'text-on-surface'}
                ${providersLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {providersLoading
                ? `Loading ${bookingType === 'venue' ? 'venues' : 'artists'}...`
                : selectedProviderData?.name || `Choose a ${bookingType}...`
              }
              {providersLoading ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin text-outline">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform text-outline ${providerDropdownOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </button>

            {providerDropdownOpen && providers.length > 0 && (
              <div className="absolute z-20 mt-1 w-full glass-card border border-white/5 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                {providers.map(provider => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider.id);
                      setProviderDropdownOpen(false);
                      if (!budgetAmount && provider.hourly_rate) {
                        setBudgetAmount(provider.hourly_rate * hours);
                      }
                    }}
                    className={`
                      w-full px-4 py-3 text-sm text-left hover:bg-surface-container-high transition-colors
                      flex items-center justify-between
                      ${selectedProvider === provider.id ? 'text-primary-container font-semibold' : 'text-on-surface'}
                    `}
                  >
                    <div>
                      <span>{provider.name}</span>
                      {(provider.genre || provider.type) && (
                        <span className="block text-xs text-outline mt-0.5">
                          {provider.genre || provider.type}
                        </span>
                      )}
                    </div>
                    {provider.hourly_rate ? (
                      <span className="text-outline text-xs">{formatCurrency(provider.hourly_rate)}/hr</span>
                    ) : null}
                  </button>
                ))}
                {providers.length === 0 && (
                  <div className="px-4 py-3 text-sm text-outline text-center">
                    No {bookingType === 'venue' ? 'venues' : 'artists'} available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Event Name */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold font-body mb-2 block">
            Event Name
          </label>
          <Input
            placeholder="e.g. Summer Rooftop Party"
            value={eventName}
            onChange={e => setEventName(e.target.value)}
          />
        </div>

        {/* Date Picker Calendar */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold font-body mb-2 block">
            Date
          </label>
          <div className="glass-card rounded-xl border border-white/5 p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="font-headline font-semibold text-sm text-on-surface">
                {format(calendarMonth, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[10px] font-semibold text-outline py-1">
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
                      ${!isCurrentMonth ? 'text-outline/30' : ''}
                      ${isPast ? 'text-outline/40 cursor-not-allowed' : ''}
                      ${isCurrentMonth && !isPast && !isSelected ? 'hover:bg-surface-container-high text-on-surface' : ''}
                      ${isSelected ? 'bg-primary-container text-white shadow-[0_0_12px_rgba(255,107,53,0.3)]' : ''}
                      ${isCurrentDay && !isSelected ? 'border border-primary-container/50 text-primary-container' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="mt-3 pt-3 border-t border-white/5 text-sm text-on-surface-variant text-center font-body">
                Selected: <span className="text-on-surface font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hours */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold font-body mb-2 block">
            Hours
          </label>
          <Input
            type="number"
            min={1}
            max={24}
            value={hours}
            onChange={e => setHours(parseInt(e.target.value) || 1)}
          />
        </div>

        {/* Budget / Offer Amount */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold font-body mb-2 block">
            Budget / Offer Amount
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-outline font-semibold">$</div>
            <input
              type="number"
              min={0}
              step={25}
              value={budgetAmount || ''}
              onChange={e => setBudgetAmount(parseFloat(e.target.value) || 0)}
              placeholder={
                selectedProviderData?.hourly_rate
                  ? `${selectedProviderData.hourly_rate * hours}`
                  : '0'
              }
              className="
                w-full glass-card border border-white/5 rounded-xl pl-8 pr-4 py-3
                text-sm text-on-surface font-body
                placeholder:text-outline
                focus:outline-none focus:border-primary-container/40 focus:ring-1 focus:ring-primary-container/20
                transition-colors duration-200
              "
            />
          </div>
          {estimatedTotal > 0 && (
            <p className="text-xs text-on-surface-variant mt-1.5 font-body">
              Offer: <span className="text-primary-container font-semibold">{formatCurrency(estimatedTotal)}</span>
              {selectedProviderData?.hourly_rate && budgetAmount === 0 && (
                <span className="text-outline"> (based on {formatCurrency(selectedProviderData.hourly_rate)}/hr x {hours}hrs)</span>
              )}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold font-body mb-2 block">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any special requests or details..."
            rows={3}
            className="
              w-full glass-card border border-white/5 rounded-xl px-4 py-3
              text-sm text-on-surface font-body
              placeholder:text-outline
              focus:outline-none focus:border-primary-container/40 focus:ring-1 focus:ring-primary-container/20
              transition-colors duration-200 resize-none
            "
          />
        </div>

        {/* Estimated Total Card */}
        {estimatedTotal > 0 && (
          <div className="glass-card rounded-xl border border-white/5 p-4">
            <h3 className="font-body font-semibold text-xs mb-3 text-on-surface-variant uppercase tracking-wide">Estimate</h3>
            <div className="space-y-2 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">
                  {selectedProviderData?.name || 'Provider'} ({hours} hrs)
                </span>
                <span className="text-on-surface">{formatCurrency(estimatedTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Platform fee (5%)</span>
                <span className="text-on-surface">{formatCurrency(estimatedTotal * 0.05)}</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between font-semibold">
                <span className="text-on-surface">Total</span>
                <span className="text-primary-container">{formatCurrency(estimatedTotal * 1.05)}</span>
              </div>
              <div className="flex justify-between text-xs text-outline pt-1">
                <span>Deposit due on acceptance</span>
                <span>{formatCurrency(depositAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          disabled={!canSubmit || submitting}
          onClick={handleSubmit}
          className={`
            w-full kinetic-gradient text-white font-bold py-4 rounded-2xl uppercase tracking-widest
            shadow-[0_0_16px_rgba(255,107,53,0.3)] transition-opacity duration-200
            ${(!canSubmit || submitting) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]'}
          `}
        >
          {submitting ? 'Sending...' : 'Send Request'}
        </button>
      </div>
    </div>
  );
}
