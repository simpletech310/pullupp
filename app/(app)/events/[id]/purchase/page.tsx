'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SERVICE_FEE_PERCENT } from '@/lib/utils/constants';
import { formatCurrency } from '@/lib/utils/format';

const EVENTS_DATA: Record<string, {
  id: string;
  title: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  gradient: number;
  venue: { name: string; address: string; city: string; state: string };
  tiers: { id: string; name: string; price: number; perks: string[]; remaining: number; total: number }[];
  addons: { id: string; name: string; price: number; type: string }[];
}> = {
  '1': {
    id: '1', title: 'Midnight Groove', category: 'Music', date: '2026-05-15',
    startTime: '9:00 PM', endTime: '2:00 AM', gradient: 0,
    venue: { name: 'The Velvet Room', address: '123 Peachtree St NE', city: 'Atlanta', state: 'GA' },
    tiers: [
      { id: 't1', name: 'General Admission', price: 35, perks: ['Entry to venue', 'Access to main floor'], remaining: 50, total: 200 },
      { id: 't2', name: 'VIP', price: 75, perks: ['Priority entry', 'VIP lounge access', 'Complimentary drink'], remaining: 15, total: 50 },
      { id: 't3', name: 'VVIP Table', price: 150, perks: ['Private table for 4', 'Bottle service', 'Meet & greet with artists', 'Dedicated server'], remaining: 5, total: 10 },
    ],
    addons: [
      { id: 'ad1', name: 'Event T-Shirt', price: 25, type: 'merch' },
      { id: 'ad2', name: 'Glow Sticks Pack', price: 8, type: 'merch' },
      { id: 'ad3', name: 'Food & Drink Voucher', price: 15, type: 'food' },
    ],
  },
  '2': {
    id: '2', title: 'Laugh Factory Live', category: 'Comedy', date: '2026-05-18',
    startTime: '8:00 PM', endTime: '10:30 PM', gradient: 1,
    venue: { name: 'Skyline Rooftop', address: '456 Ponce de Leon Ave', city: 'Atlanta', state: 'GA' },
    tiers: [
      { id: 't4', name: 'General', price: 25, perks: ['Entry', 'Seated section'], remaining: 60, total: 200 },
      { id: 't5', name: 'Front Row', price: 50, perks: ['Front row seats', 'Free appetizer'], remaining: 8, total: 30 },
    ],
    addons: [
      { id: 'ad4', name: 'Comedy Special DVD', price: 15, type: 'merch' },
      { id: 'ad5', name: 'Nachos Plate', price: 12, type: 'food' },
    ],
  },
  '3': {
    id: '3', title: 'Canvas & Cocktails', category: 'Art', date: '2026-05-20',
    startTime: '7:00 PM', endTime: '10:00 PM', gradient: 2,
    venue: { name: 'Creative Co-Op', address: '789 Auburn Ave NE', city: 'Atlanta', state: 'GA' },
    tiers: [
      { id: 't6', name: 'Standard', price: 45, perks: ['All painting supplies', 'One cocktail included', 'Take home your canvas'], remaining: 10, total: 80 },
      { id: 't7', name: 'Premium', price: 70, perks: ['All supplies + premium materials', 'Unlimited cocktails', 'Artist-signed print'], remaining: 5, total: 20 },
    ],
    addons: [
      { id: 'ad6', name: 'Extra Canvas', price: 10, type: 'merch' },
      { id: 'ad7', name: 'Charcuterie Board', price: 18, type: 'food' },
    ],
  },
  '4': {
    id: '4', title: 'Street Eats Festival', category: 'Food', date: '2026-05-22',
    startTime: '12:00 PM', endTime: '8:00 PM', gradient: 3,
    venue: { name: 'Garden Pavilion', address: '101 Centennial Olympic Park Dr', city: 'Atlanta', state: 'GA' },
    tiers: [
      { id: 't8', name: 'General Entry', price: 15, perks: ['Festival access', '3 tasting tokens'], remaining: 100, total: 400 },
      { id: 't9', name: 'Foodie Pass', price: 40, perks: ['Festival access', '10 tasting tokens', 'Priority lines', 'Recipe booklet'], remaining: 30, total: 100 },
    ],
    addons: [
      { id: 'ad8', name: 'Extra Tasting Tokens (5)', price: 10, type: 'food' },
      { id: 'ad9', name: 'Festival Tote Bag', price: 12, type: 'merch' },
    ],
  },
  '5': {
    id: '5', title: 'Tech Connect Mixer', category: 'Networking', date: '2026-05-25',
    startTime: '6:00 PM', endTime: '9:00 PM', gradient: 4,
    venue: { name: 'Studio 54 ATL', address: '54 Techwood Dr NW', city: 'Atlanta', state: 'GA' },
    tiers: [
      { id: 't10', name: 'Attendee', price: 20, perks: ['Networking access', 'Drinks & apps', 'Digital contact exchange'], remaining: 40, total: 150 },
      { id: 't11', name: 'Startup Demo', price: 50, perks: ['5-min demo slot', 'All attendee perks', 'Investor introductions'], remaining: 10, total: 20 },
    ],
    addons: [],
  },
};

export default function PurchasePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const event = EVENTS_DATA[eventId];

  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<{ type: string; value: number } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedTier = event?.tiers.find(t => t.id === selectedTierId);

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev);
      if (next.has(addonId)) next.delete(addonId);
      else next.add(addonId);
      return next;
    });
  };

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/stripe/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, eventId }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoApplied(true);
        setPromoDiscount({ type: data.discount_type, value: data.discount_value });
        setPromoError('');
      } else {
        setPromoApplied(false);
        setPromoDiscount(null);
        setPromoError(data.error || 'Invalid promo code');
      }
    } catch {
      setPromoApplied(false);
      setPromoDiscount(null);
      setPromoError('Failed to validate promo code');
    }
    setPromoLoading(false);
  };

  const orderSummary = useMemo(() => {
    if (!selectedTier) return null;
    const tierTotal = selectedTier.price * quantity;
    const addonsTotal = event.addons
      .filter(a => selectedAddons.has(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    const subtotal = tierTotal + addonsTotal;
    let discount = 0;
    if (promoApplied && promoDiscount) {
      if (promoDiscount.type === 'percentage') {
        discount = subtotal * (promoDiscount.value / 100);
      } else {
        discount = Math.min(promoDiscount.value, subtotal);
      }
    }
    const afterDiscount = subtotal - discount;
    const serviceFee = afterDiscount * SERVICE_FEE_PERCENT;
    const total = afterDiscount + serviceFee;
    return { tierTotal, addonsTotal, subtotal, discount, serviceFee, total };
  }, [selectedTier, quantity, selectedAddons, promoApplied, promoDiscount, event?.addons]);

  const handlePurchase = async () => {
    if (!selectedTier || !orderSummary) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          tierId: selectedTier.id,
          quantity,
          addonIds: Array.from(selectedAddons),
          promoCode: promoApplied ? promoCode : undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        toast.error(data.error || 'Failed to create checkout');
      }
    } catch {
      toast.error('Payment failed');
    }
    setLoading(false);
  };

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-4xl mb-3">🎫</div>
        <h2 className="font-display font-bold text-lg text-text-primary">Event not found</h2>
        <p className="text-sm text-text-secondary mt-1">This event doesn't exist or has been removed.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="pb-48">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-base text-text-primary truncate">{event.title}</h1>
          <p className="text-xs text-text-secondary">Select tickets</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Tier Selection */}
        <section>
          <h2 className="font-display font-bold text-sm text-text-primary uppercase tracking-wide mb-3">Choose Your Tier</h2>
          <div className="space-y-3">
            {event.tiers.map(tier => {
              const isSelected = selectedTierId === tier.id;
              const soldOut = tier.remaining === 0;
              return (
                <Card
                  key={tier.id}
                  onClick={soldOut ? undefined : () => {
                    setSelectedTierId(tier.id);
                    setQuantity(1);
                  }}
                  className={`p-4 transition-all duration-200 ${
                    isSelected
                      ? 'border-orange shadow-[0_0_20px_rgba(255,107,53,0.15)] ring-1 ring-orange/30'
                      : soldOut
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-border-light'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-orange bg-orange' : 'border-border-light'
                      }`}>
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-text-primary">{tier.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-bold text-lg text-orange">{formatCurrency(tier.price)}</span>
                      {soldOut ? (
                        <Badge variant="error" className="ml-2">Sold Out</Badge>
                      ) : (
                        <p className="text-[11px] text-text-muted">{tier.remaining} left</p>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-1 ml-7">
                    {tier.perks.map((perk, i) => (
                      <li key={i} className="text-xs text-text-secondary flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quantity Stepper */}
        {selectedTier && (
          <section>
            <h2 className="font-display font-bold text-sm text-text-primary uppercase tracking-wide mb-3">Quantity</h2>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary font-semibold">{selectedTier.name}</p>
                  <p className="text-xs text-text-secondary">{formatCurrency(selectedTier.price)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-9 h-9 rounded-xl bg-surface-alt border border-border flex items-center justify-center text-text-primary hover:bg-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <span className="font-display font-bold text-lg text-text-primary w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(10, selectedTier.remaining, q + 1))}
                    disabled={quantity >= Math.min(10, selectedTier.remaining)}
                    className="w-9 h-9 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange hover:bg-orange/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Add-ons */}
        {event.addons.length > 0 && selectedTier && (
          <section>
            <h2 className="font-display font-bold text-sm text-text-primary uppercase tracking-wide mb-3">Add-ons</h2>
            <div className="space-y-2">
              {event.addons.map(addon => {
                const isActive = selectedAddons.has(addon.id);
                return (
                  <Card
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-4 transition-all duration-200 cursor-pointer ${
                      isActive ? 'border-teal/50 bg-teal/5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-sm">
                          {addon.type === 'food' ? '🍽' : '🛍'}
                        </div>
                        <div>
                          <p className="text-sm text-text-primary font-semibold">{addon.name}</p>
                          <p className="text-xs text-text-secondary">+{formatCurrency(addon.price)}</p>
                        </div>
                      </div>
                      {/* Toggle Switch */}
                      <div className={`w-11 h-6 rounded-full transition-colors duration-200 relative cursor-pointer ${
                        isActive ? 'bg-teal' : 'bg-surface-alt border border-border'
                      }`}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          isActive ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Promo Code */}
        {selectedTier && (
          <section>
            <h2 className="font-display font-bold text-sm text-text-primary uppercase tracking-wide mb-3">Promo Code</h2>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={e => {
                    setPromoCode(e.target.value);
                    if (promoError) setPromoError('');
                    if (promoApplied) setPromoApplied(false);
                  }}
                  className={promoApplied ? 'border-success' : ''}
                />
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={applyPromo}
                disabled={!promoCode.trim() || promoLoading}
                loading={promoLoading}
              >
                Apply
              </Button>
            </div>
            {promoApplied && (
              <p className="text-xs text-success mt-2 flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {promoDiscount?.type === 'percentage' ? `${promoDiscount.value}% discount applied!` : promoDiscount ? `${formatCurrency(promoDiscount.value)} discount applied!` : 'Discount applied!'}
              </p>
            )}
            {promoError && (
              <p className="text-xs text-error mt-2">{promoError}</p>
            )}
          </section>
        )}
      </div>

      {/* Sticky Order Summary */}
      {selectedTier && orderSummary && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-xl border-t border-border">
          <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
            {/* Expandable Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">{selectedTier.name} x {quantity}</span>
                <span className="text-text-primary">{formatCurrency(orderSummary.tierTotal)}</span>
              </div>
              {event.addons
                .filter(a => selectedAddons.has(a.id))
                .map(addon => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{addon.name}</span>
                    <span className="text-text-primary">{formatCurrency(addon.price)}</span>
                  </div>
                ))
              }
              <div className="border-t border-border pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-primary">{formatCurrency(orderSummary.subtotal)}</span>
                </div>
              </div>
              {orderSummary.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-success">Promo ({promoDiscount?.type === 'percentage' ? `${promoDiscount.value}% off` : 'discount'})</span>
                  <span className="text-success">-{formatCurrency(orderSummary.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Service Fee (5%)</span>
                <span className="text-text-primary">{formatCurrency(orderSummary.serviceFee)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-display font-bold text-text-primary">Total</span>
                <span className="font-display font-bold text-lg text-orange">{formatCurrency(orderSummary.total)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handlePurchase}
              loading={loading}
              disabled={loading}
            >
              Pay {formatCurrency(orderSummary.total)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
