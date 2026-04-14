'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { EVENT_GRADIENTS, EVENT_CATEGORIES } from '@/lib/utils/constants';
import { formatCurrency } from '@/lib/utils/format';
import { createEvent } from '@/lib/supabase/mutations';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/providers/auth-provider';

// ── Step definitions ──
const STEPS = [
  { label: 'Details' },
  { label: 'Settings' },
  { label: 'Tickets' },
  { label: 'Add-ons' },
  { label: 'Venue' },
  { label: 'Entertainment' },
];

// ── Types ──
interface PromoCode {
  id: string;
  code: string;
  discount: number;
  maxUses: number;
}

interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
  perks: string;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
  type: 'merch' | 'food';
}

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [step, setStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // ── Real venues & artists from Supabase ──
  const [dbVenues, setDbVenues] = useState<{ id: string; name: string; city: string; state: string; capacity: number; hourly_rate: number; gradient_index: number }[]>([]);
  const [dbArtists, setDbArtists] = useState<{ id: string; name: string; genre: string; hourly_rate: number; gradient_index: number }[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('venues').select('id, name, city, state, capacity, hourly_rate, gradient_index').eq('is_active', true).then(({ data }) => {
      if (data) setDbVenues(data);
      setLoadingVenues(false);
    });
    supabase.from('artists').select('id, name, genre, hourly_rate, gradient_index').eq('is_active', true).then(({ data }) => {
      if (data) setDbArtists(data);
      setLoadingArtists(false);
    });
  }, []);

  // ── Step 1: Details ──
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Music');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedCovers, setSelectedCovers] = useState<number[]>([]);
  const [visibility, setVisibility] = useState<'Public' | 'Private' | 'Invite-Only'>('Public');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<'Weekly' | 'Bi-weekly' | 'Monthly'>('Weekly');

  // ── Step 2: Settings ──
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('');
  const [newPromoMaxUses, setNewPromoMaxUses] = useState('');
  const [earlyBird, setEarlyBird] = useState(false);
  const [earlyBirdDate, setEarlyBirdDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [waitlist, setWaitlist] = useState(false);
  const [ageRestriction, setAgeRestriction] = useState<'None' | '18+' | '21+'>('None');
  const [dressCode, setDressCode] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');

  // ── Step 3: Tickets ──
  const [tickets, setTickets] = useState<TicketTier[]>([]);
  const [editingTicket, setEditingTicket] = useState<TicketTier | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketName, setTicketName] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState('');
  const [ticketPerks, setTicketPerks] = useState('');

  // ── Step 4: Add-ons ──
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [showAddOnForm, setShowAddOnForm] = useState(false);
  const [addOnName, setAddOnName] = useState('');
  const [addOnPrice, setAddOnPrice] = useState('');
  const [addOnType, setAddOnType] = useState<'merch' | 'food'>('merch');

  // ── Step 5: Venue ──
  const [venueMode, setVenueMode] = useState<'browse' | 'manual'>('browse');
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [manualVenueName, setManualVenueName] = useState('');
  const [manualVenueAddress, setManualVenueAddress] = useState('');

  // ── Step 6: Entertainment ──
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);

  // ── Cover photo gradients ──
  const COVER_GRADIENTS = [0, 2, 4, 8];

  // ── Handlers ──
  function addPromoCode() {
    if (!newPromoCode || !newPromoDiscount) return;
    setPromoCodes(prev => [...prev, {
      id: crypto.randomUUID(),
      code: newPromoCode.toUpperCase(),
      discount: Number(newPromoDiscount),
      maxUses: Number(newPromoMaxUses) || 100,
    }]);
    setNewPromoCode('');
    setNewPromoDiscount('');
    setNewPromoMaxUses('');
  }

  function removePromoCode(id: string) {
    setPromoCodes(prev => prev.filter(p => p.id !== id));
  }

  function openTicketForm(ticket?: TicketTier) {
    if (ticket) {
      setEditingTicket(ticket);
      setTicketName(ticket.name);
      setTicketPrice(String(ticket.price));
      setTicketQuantity(String(ticket.quantity));
      setTicketPerks(ticket.perks);
    } else {
      setEditingTicket(null);
      setTicketName('');
      setTicketPrice('');
      setTicketQuantity('');
      setTicketPerks('');
    }
    setShowTicketForm(true);
  }

  function saveTicket() {
    if (!ticketName || !ticketPrice || !ticketQuantity) return;
    const tier: TicketTier = {
      id: editingTicket?.id || crypto.randomUUID(),
      name: ticketName,
      price: Number(ticketPrice),
      quantity: Number(ticketQuantity),
      perks: ticketPerks,
    };
    if (editingTicket) {
      setTickets(prev => prev.map(t => t.id === editingTicket.id ? tier : t));
    } else {
      setTickets(prev => [...prev, tier]);
    }
    setShowTicketForm(false);
  }

  function removeTicket(id: string) {
    setTickets(prev => prev.filter(t => t.id !== id));
  }

  function saveAddOn() {
    if (!addOnName || !addOnPrice) return;
    setAddOns(prev => [...prev, {
      id: crypto.randomUUID(),
      name: addOnName,
      price: Number(addOnPrice),
      type: addOnType,
    }]);
    setShowAddOnForm(false);
    setAddOnName('');
    setAddOnPrice('');
  }

  function removeAddOn(id: string) {
    setAddOns(prev => prev.filter(a => a.id !== id));
  }

  function toggleArtist(id: string) {
    setSelectedArtists(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  }

  async function handlePublish() {
    if (!user) return;
    setPublishing(true);
    setPublishError(null);

    const { data: event, error } = await createEvent({
      organizer_id: user.id,
      title,
      description,
      category,
      date,
      start_time: startTime,
      end_time: endTime,
      visibility: visibility.toLowerCase(),
      status: 'published',
      capacity: Number(capacity) || 0,
      gradient_index: selectedCovers[0] ?? Math.floor(Math.random() * 12),
      age_restriction: ageRestriction === 'None' ? null : ageRestriction,
      dress_code: dressCode || null,
      venue_id: venueMode === 'browse' ? selectedVenue : null,
      manual_venue_name: venueMode === 'manual' ? manualVenueName : null,
      social_links: {
        ...(instagram ? { instagram } : {}),
        ...(twitter ? { twitter } : {}),
        ...(website ? { website } : {}),
      },
      is_recurring: isRecurring,
      recurring_pattern: isRecurring ? recurringPattern : null,
      tiers: tickets.map(t => ({ name: t.name, price: t.price, quantity: t.quantity, perks: t.perks })),
      addons: addOns.map(a => ({ name: a.name, price: a.price, type: a.type })),
      promoCodes: promoCodes.map(pc => ({ code: pc.code, discount: pc.discount, maxUses: pc.maxUses })),
      artistIds: selectedArtists,
    });

    setPublishing(false);

    if (error || !event) {
      setPublishError('Failed to create event. Please try again.');
      return;
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.push(`/events/${event.id}`);
    }, 2000);
  }

  // ── Progress Bar ──
  function ProgressBar() {
    return (
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i <= step
                      ? 'bg-orange shadow-[0_0_8px_rgba(255,107,53,0.4)]'
                      : 'bg-surface-alt border border-border'
                  }`}
                />
                <span className={`text-[9px] mt-1 whitespace-nowrap ${
                  i <= step ? 'text-orange font-semibold' : 'text-text-muted'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-[2px] mx-1 mt-[-10px] transition-colors duration-300 ${
                  i < step ? 'bg-orange' : 'bg-border'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Step 1: Details ──
  function StepDetails() {
    return (
      <div className="px-4 flex flex-col gap-4 animate-fade-in">
        <Input label="Event Title" placeholder="e.g. Midnight Groove" value={title} onChange={e => setTitle(e.target.value)} />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell guests what to expect..."
            rows={3}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-body placeholder:text-text-muted focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-colors duration-200 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-body focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-colors duration-200 appearance-none"
          >
            {EVENT_CATEGORIES.filter(c => c !== 'All').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
          <Input label="End Time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>

        {/* Cover Photos */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Cover Photo</label>
          <div className="grid grid-cols-4 gap-2">
            {COVER_GRADIENTS.map(gIdx => (
              <button
                key={gIdx}
                onClick={() => setSelectedCovers(prev =>
                  prev.includes(gIdx) ? prev.filter(c => c !== gIdx) : [...prev, gIdx]
                )}
                className={`aspect-square rounded-xl transition-all duration-200 ${
                  selectedCovers.includes(gIdx)
                    ? 'ring-2 ring-orange ring-offset-2 ring-offset-bg scale-95'
                    : 'hover:scale-95'
                }`}
                style={{ background: EVENT_GRADIENTS[gIdx] }}
              />
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Visibility</label>
          <div className="flex gap-2">
            {(['Public', 'Private', 'Invite-Only'] as const).map(v => (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  visibility === v
                    ? 'bg-orange text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                    : 'bg-surface border border-border text-text-secondary hover:border-border-light'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Recurring */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Recurring Event</label>
            <button
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${
                isRecurring ? 'bg-orange' : 'bg-surface-alt border border-border'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                isRecurring ? 'translate-x-5.5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          {isRecurring && (
            <div className="flex gap-2">
              {(['Weekly', 'Bi-weekly', 'Monthly'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setRecurringPattern(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    recurringPattern === p
                      ? 'bg-teal text-white'
                      : 'bg-surface border border-border text-text-secondary'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Step 2: Settings ──
  function StepSettings() {
    return (
      <div className="px-4 flex flex-col gap-4 animate-fade-in">
        {/* Promo Codes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Promo Codes</label>
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="CODE" value={newPromoCode} onChange={e => setNewPromoCode(e.target.value)} />
            <Input placeholder="% off" type="number" value={newPromoDiscount} onChange={e => setNewPromoDiscount(e.target.value)} />
            <Input placeholder="Max uses" type="number" value={newPromoMaxUses} onChange={e => setNewPromoMaxUses(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" onClick={addPromoCode}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Code
          </Button>
          {promoCodes.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              {promoCodes.map(pc => (
                <div key={pc.id} className="flex items-center justify-between bg-surface-alt rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="orange">{pc.code}</Badge>
                    <span className="text-xs text-text-secondary">{pc.discount}% off</span>
                    <span className="text-xs text-text-muted">({pc.maxUses} uses)</span>
                  </div>
                  <button onClick={() => removePromoCode(pc.id)} className="text-text-muted hover:text-error transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Early Bird */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Early Bird Pricing</label>
            <button
              onClick={() => setEarlyBird(!earlyBird)}
              className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${
                earlyBird ? 'bg-orange' : 'bg-surface-alt border border-border'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                earlyBird ? 'translate-x-5.5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          {earlyBird && (
            <Input label="Early Bird Deadline" type="date" value={earlyBirdDate} onChange={e => setEarlyBirdDate(e.target.value)} />
          )}
        </div>

        {/* Capacity & Waitlist */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input label="Capacity" type="number" placeholder="e.g. 500" value={capacity} onChange={e => setCapacity(e.target.value)} />
          </div>
          <div className="flex flex-col items-center gap-1 pb-1">
            <span className="text-[10px] text-text-muted">Waitlist</span>
            <button
              onClick={() => setWaitlist(!waitlist)}
              className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${
                waitlist ? 'bg-teal' : 'bg-surface-alt border border-border'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                waitlist ? 'translate-x-5.5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* Age Restriction */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Age Restriction</label>
          <div className="flex gap-2">
            {(['None', '18+', '21+'] as const).map(age => (
              <button
                key={age}
                onClick={() => setAgeRestriction(age)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  ageRestriction === age
                    ? 'bg-orange text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                    : 'bg-surface border border-border text-text-secondary hover:border-border-light'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        <Input label="Dress Code" placeholder="e.g. Smart Casual" value={dressCode} onChange={e => setDressCode(e.target.value)} />

        {/* Social Links */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Social Links</label>
          <Input placeholder="Instagram handle" value={instagram} onChange={e => setInstagram(e.target.value)}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>}
          />
          <Input placeholder="Twitter handle" value={twitter} onChange={e => setTwitter(e.target.value)}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>}
          />
          <Input placeholder="Website URL" value={website} onChange={e => setWebsite(e.target.value)}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
          />
        </div>
      </div>
    );
  }

  // ── Step 3: Tickets ──
  function StepTickets() {
    return (
      <div className="px-4 flex flex-col gap-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Ticket Tiers</label>
          <Button variant="outline" size="sm" onClick={() => openTicketForm()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Tier
          </Button>
        </div>

        {tickets.length === 0 && (
          <div className="bg-surface-alt rounded-2xl p-8 flex flex-col items-center gap-2 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
              <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <p className="text-text-muted text-sm">No ticket tiers yet</p>
            <p className="text-text-muted text-xs">Add your first tier to get started</p>
          </div>
        )}

        {tickets.map(t => (
          <Card key={t.id}>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-sm">{t.name}</h4>
                  <p className="text-orange font-bold text-lg">{formatCurrency(t.price)}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openTicketForm(t)} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-muted">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => removeTicket(t.id)} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-muted hover:text-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span>{t.quantity} available</span>
                {t.perks && <span className="text-text-muted">| {t.perks}</span>}
              </div>
            </div>
          </Card>
        ))}

        {/* Ticket Form Modal */}
        <Modal open={showTicketForm} onClose={() => setShowTicketForm(false)} title={editingTicket ? 'Edit Ticket Tier' : 'Add Ticket Tier'}>
          <div className="flex flex-col gap-3">
            <Input label="Tier Name" placeholder="e.g. VIP" value={ticketName} onChange={e => setTicketName(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Price ($)" type="number" placeholder="0" value={ticketPrice} onChange={e => setTicketPrice(e.target.value)} />
              <Input label="Quantity" type="number" placeholder="100" value={ticketQuantity} onChange={e => setTicketQuantity(e.target.value)} />
            </div>
            <Input label="Perks" placeholder="e.g. Front row, free drink" value={ticketPerks} onChange={e => setTicketPerks(e.target.value)} />
            <Button fullWidth onClick={saveTicket}>
              {editingTicket ? 'Save Changes' : 'Add Tier'}
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  // ── Step 4: Add-ons ──
  function StepAddOns() {
    return (
      <div className="px-4 flex flex-col gap-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Add-ons</label>
          <Button variant="outline" size="sm" onClick={() => { setAddOnName(''); setAddOnPrice(''); setShowAddOnForm(true); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Item
          </Button>
        </div>

        {addOns.length === 0 && (
          <div className="bg-surface-alt rounded-2xl p-8 flex flex-col items-center gap-2 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <p className="text-text-muted text-sm">No add-ons yet</p>
            <p className="text-text-muted text-xs">Sell merch or food alongside tickets</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {addOns.map(a => (
            <Card key={a.id}>
              <div className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <Badge variant={a.type === 'merch' ? 'purple' : 'teal'}>{a.type}</Badge>
                  <button onClick={() => removeAddOn(a.id)} className="text-text-muted hover:text-error transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
                <h4 className="font-semibold text-sm mt-2">{a.name}</h4>
                <p className="text-orange font-bold text-sm mt-1">{formatCurrency(a.price)}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Add-on Form Modal */}
        <Modal open={showAddOnForm} onClose={() => setShowAddOnForm(false)} title="Add Item">
          <div className="flex flex-col gap-3">
            <Input label="Item Name" placeholder="e.g. Event T-Shirt" value={addOnName} onChange={e => setAddOnName(e.target.value)} />
            <Input label="Price ($)" type="number" placeholder="0" value={addOnPrice} onChange={e => setAddOnPrice(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Type</label>
              <div className="flex gap-2">
                {(['merch', 'food'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setAddOnType(t)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all duration-200 ${
                      addOnType === t
                        ? t === 'merch' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'bg-teal/15 text-teal border border-teal/30'
                        : 'bg-surface border border-border text-text-secondary'
                    }`}
                  >
                    {t === 'merch' ? 'Merch' : 'Food & Drink'}
                  </button>
                ))}
              </div>
            </div>
            <Button fullWidth onClick={saveAddOn}>Add Item</Button>
          </div>
        </Modal>
      </div>
    );
  }

  // ── Step 5: Venue ──
  function StepVenue() {
    return (
      <div className="px-4 flex flex-col gap-4 animate-fade-in">
        {/* Mode toggle */}
        <div className="flex gap-2">
          {(['browse', 'manual'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setVenueMode(mode)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                venueMode === mode
                  ? 'bg-orange text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                  : 'bg-surface border border-border text-text-secondary hover:border-border-light'
              }`}
            >
              {mode === 'browse' ? 'Browse Venues' : 'Enter Manually'}
            </button>
          ))}
        </div>

        {venueMode === 'browse' ? (
          <div className="flex flex-col gap-3">
            {loadingVenues && <p className="text-text-muted text-sm text-center py-4">Loading venues...</p>}
            {!loadingVenues && dbVenues.length === 0 && <p className="text-text-muted text-sm text-center py-4">No venues available</p>}
            {dbVenues.map(venue => (
              <Card
                key={venue.id}
                hoverable
                onClick={() => setSelectedVenue(venue.id)}
                className={selectedVenue === venue.id ? 'ring-2 ring-orange border-orange' : ''}
              >
                <div
                  className="h-20 p-3 flex items-end"
                  style={{ background: EVENT_GRADIENTS[venue.gradient_index ?? 0] }}
                >
                  {selectedVenue === venue.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-orange flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm">{venue.name}</h4>
                  <div className="flex items-center gap-1 text-text-secondary text-xs mt-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {venue.city}, {venue.state}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-text-muted">Cap: {venue.capacity}</span>
                    <span className="text-orange font-semibold text-xs">{formatCurrency(venue.hourly_rate)}/hr</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Input label="Venue Name" placeholder="e.g. The Grand Ballroom" value={manualVenueName} onChange={e => setManualVenueName(e.target.value)} />
            <Input label="Address" placeholder="123 Main St, Atlanta, GA" value={manualVenueAddress} onChange={e => setManualVenueAddress(e.target.value)} />
          </div>
        )}
      </div>
    );
  }

  // ── Step 6: Entertainment ──
  function StepEntertainment() {
    return (
      <div className="px-4 flex flex-col gap-4 animate-fade-in">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Select Artists</label>
        <div className="grid grid-cols-2 gap-3">
          {loadingArtists && <p className="text-text-muted text-sm text-center py-4 col-span-2">Loading artists...</p>}
          {!loadingArtists && dbArtists.length === 0 && <p className="text-text-muted text-sm text-center py-4 col-span-2">No artists available</p>}
          {dbArtists.map(artist => {
            const isSelected = selectedArtists.includes(artist.id);
            return (
              <Card
                key={artist.id}
                hoverable
                onClick={() => toggleArtist(artist.id)}
                className={isSelected ? 'ring-2 ring-orange border-orange' : ''}
              >
                <div
                  className="h-24 relative flex items-center justify-center"
                  style={{ background: EVENT_GRADIENTS[artist.gradient_index ?? 0] }}
                >
                  {/* Avatar initial */}
                  <span className="text-white font-display font-bold text-2xl drop-shadow-lg">
                    {artist.name.split(' ').map(n => n[0]).join('')}
                  </span>
                  {isSelected && (
                    <div className="absolute inset-0 bg-orange/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm">{artist.name}</h4>
                  <p className="text-text-muted text-xs mt-0.5">{artist.genre}</p>
                  <p className="text-orange font-semibold text-xs mt-1">{formatCurrency(artist.hourly_rate)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Render current step ──
  function renderStep() {
    switch (step) {
      case 0: return <StepDetails />;
      case 1: return <StepSettings />;
      case 2: return <StepTickets />;
      case 3: return <StepAddOns />;
      case 4: return <StepVenue />;
      case 5: return <StepEntertainment />;
      default: return null;
    }
  }

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-surface-hover transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="font-display font-bold text-xl">Create Event</h2>
      </div>

      <ProgressBar />

      {/* Step content */}
      <div className="mt-2">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-bg-elevated border-t border-border">
        <div className="max-w-[480px] mx-auto flex gap-3 px-4 py-3">
          {step > 0 && (
            <Button variant="secondary" fullWidth onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button fullWidth onClick={() => setStep(s => s + 1)}>
              Next
            </Button>
          ) : (
            <Button fullWidth onClick={handlePublish} loading={publishing}>
              {publishing ? 'Publishing...' : 'Publish Event'}
            </Button>
          )}
        </div>
      </div>

      {/* Error Toast */}
      {publishError && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-error text-white px-5 py-3.5 rounded-xl text-sm font-semibold text-center shadow-lg shadow-error/20">
            {publishError}
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-bg-elevated rounded-2xl p-8 flex flex-col items-center gap-3 border border-border animate-slide-up mx-4">
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-lg">Event Published!</h3>
            <p className="text-text-secondary text-sm text-center">Your event is now live and ready for guests.</p>
          </div>
        </div>
      )}
    </div>
  );
}
