'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SERVICE_FEE_PERCENT } from '@/lib/utils/constants';
import { formatCurrency } from '@/lib/utils/format';

export default function PurchasePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<{ type: string; value: number } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/public/events/${eventId}`);
        if (!res.ok) throw new Error('Event not found');
        const data = await res.json();
        setEvent(data);
      } catch {
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  const tiers = event?.ticket_tiers ?? [];
  const addons = event?.event_addons ?? [];
  const selectedTier = tiers.find((t: any) => t.id === selectedTierId);

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
      setPromoError('Failed to validate promo code');
    }
    setPromoLoading(false);
  };

  const orderSummary = useMemo(() => {
    if (!selectedTier) return null;
    const tierTotal = selectedTier.price * quantity;
    const addonsTotal = addons
      .filter((a: any) => selectedAddons.has(a.id))
      .reduce((sum: number, a: any) => sum + a.price, 0);
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
  }, [selectedTier, quantity, selectedAddons, promoApplied, promoDiscount, addons]);

  const handlePurchase = async () => {
    if (!selectedTier || !orderSummary) return;
    setPurchasing(true);
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
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to create checkout');
      }
    } catch {
      toast.error('Payment failed');
    }
    setPurchasing(false);
  };

  if (loading) {
    return (
      <div className="pb-24 animate-pulse">
        <div className="sticky top-0 h-16 bg-surface-container border-b border-white/5" />
        <div className="px-4 py-5 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-container-high rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-4xl mb-3">🎫</div>
        <h2 className="font-headline font-bold text-lg text-on-surface">Event not found</h2>
        <p className="text-sm text-on-surface-variant mt-1">This event doesn't exist or has been removed.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="pb-48">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-11 h-11 rounded-xl bg-surface-container border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-headline font-bold text-base text-on-surface truncate">{event.title}</h1>
          <p className="text-xs text-on-surface-variant">Select tickets</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Tier Selection */}
        <section>
          <h2 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wide mb-3">Choose Your Tier</h2>
          <div className="space-y-3">
            {tiers
              .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((tier: any) => {
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
                          : 'hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'border-orange bg-orange' : 'border-white/10'
                        }`}>
                          {isSelected && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <h3 className="font-headline font-bold text-on-surface">{tier.name}</h3>
                      </div>
                      <div className="text-right">
                        <span className="font-headline font-bold text-lg text-primary-container">{formatCurrency(tier.price)}</span>
                        {soldOut ? (
                          <Badge variant="error" className="ml-2">Sold Out</Badge>
                        ) : (
                          <p className="text-xs text-outline">{tier.remaining} left</p>
                        )}
                      </div>
                    </div>
                    {tier.perks?.length > 0 && (
                      <ul className="space-y-1 ml-7">
                        {tier.perks.map((perk: string, i: number) => (
                          <li key={i} className="text-xs text-on-surface-variant flex items-center gap-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {perk}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                );
              })}
          </div>
        </section>

        {/* Quantity Stepper */}
        {selectedTier && (
          <section>
            <h2 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wide mb-3">Quantity</h2>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-on-surface font-semibold">{selectedTier.name}</p>
                  <p className="text-xs text-on-surface-variant">{formatCurrency(selectedTier.price)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-11 h-11 rounded-xl bg-surface-container-high border border-white/5 flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <span className="font-headline font-bold text-lg text-on-surface w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(10, selectedTier.remaining, q + 1))}
                    disabled={quantity >= Math.min(10, selectedTier.remaining)}
                    className="w-11 h-11 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center text-primary-container hover:bg-orange/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
        {addons.length > 0 && selectedTier && (
          <section>
            <h2 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wide mb-3">Add-ons</h2>
            <div className="space-y-2">
              {addons.map((addon: any) => {
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
                        <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-sm">
                          {addon.type === 'food' ? '🍽' : '🛍'}
                        </div>
                        <div>
                          <p className="text-sm text-on-surface font-semibold">{addon.name}</p>
                          <p className="text-xs text-on-surface-variant">+{formatCurrency(addon.price)}</p>
                        </div>
                      </div>
                      <div className={`w-11 h-6 rounded-full transition-colors duration-200 relative cursor-pointer ${
                        isActive ? 'bg-teal' : 'bg-surface-container-high border border-white/5'
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
            <h2 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wide mb-3">Promo Code</h2>
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
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface-container/95 backdrop-blur-xl border-t border-white/5">
          <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">{selectedTier.name} x {quantity}</span>
                <span className="text-on-surface">{formatCurrency(orderSummary.tierTotal)}</span>
              </div>
              {addons
                .filter((a: any) => selectedAddons.has(a.id))
                .map((addon: any) => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">{addon.name}</span>
                    <span className="text-on-surface">{formatCurrency(addon.price)}</span>
                  </div>
                ))
              }
              <div className="border-t border-white/5 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="text-on-surface">{formatCurrency(orderSummary.subtotal)}</span>
                </div>
              </div>
              {orderSummary.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-success">Promo ({promoDiscount?.type === 'percentage' ? `${promoDiscount.value}% off` : 'discount'})</span>
                  <span className="text-success">-{formatCurrency(orderSummary.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Service Fee (5%)</span>
                <span className="text-on-surface">{formatCurrency(orderSummary.serviceFee)}</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between">
                <span className="font-headline font-bold text-on-surface">Total</span>
                <span className="font-headline font-bold text-lg text-primary-container">{formatCurrency(orderSummary.total)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handlePurchase}
              loading={purchasing}
              disabled={purchasing}
            >
              Pay {formatCurrency(orderSummary.total)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
