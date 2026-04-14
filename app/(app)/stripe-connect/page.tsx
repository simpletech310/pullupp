'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/providers/auth-provider';

const FAQ_ITEMS = [
  {
    question: 'How do payouts work?',
    answer: 'Once your Stripe account is connected, earnings from ticket sales, bookings, and tips are automatically transferred to your bank account. Stripe handles all the payment processing securely.',
  },
  {
    question: 'What are the fees?',
    answer: 'PullUpp charges a 5% platform fee on transactions. Stripe also charges standard processing fees (2.9% + $0.30 per transaction). These are deducted automatically before payouts.',
  },
  {
    question: 'When will I receive my money?',
    answer: 'Payouts are processed on a rolling basis. For most accounts, funds arrive in your bank account within 2-7 business days after a transaction. You can check your payout schedule in your Stripe dashboard.',
  },
  {
    question: 'Is my financial information secure?',
    answer: 'Yes. Stripe is PCI-DSS Level 1 compliant, the highest level of certification. PullUpp never stores your bank details directly -- all sensitive information is handled securely by Stripe.',
  },
  {
    question: 'Can I use Stripe Connect internationally?',
    answer: 'Stripe supports businesses in 40+ countries. Check Stripe\'s documentation for the full list of supported countries and currencies.',
  },
];

export default function StripeConnectPage() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const isConnected = profile?.stripe_connect_onboarded || false;

  const allowedRoles = ['organizer', 'venue_owner', 'artist'];
  const hasAccess = profile && allowedRoles.includes(profile.role);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/create-connect-account', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to start Stripe onboarding');
      }
    } catch {
      toast.error('Failed to connect to Stripe');
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="px-4 pt-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface border border-border flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="font-display font-bold text-lg mb-2">Access Restricted</h2>
        <p className="text-text-secondary text-sm mb-6">
          Stripe Connect is available for organizers, venue owners, and artists. Switch your role in Settings to get started.
        </p>
        <Button variant="secondary" onClick={() => router.push('/settings')}>
          Go to Settings
        </Button>
      </div>
    );
  }

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
        <h1 className="font-display font-bold text-xl">Get Paid with Stripe</h1>
      </div>

      <div className="px-4 space-y-5">
        {/* Intro Card */}
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-sm mb-1">Stripe Connect</h2>
              <p className="text-text-secondary text-xs leading-relaxed">
                Connect your Stripe account to receive payments directly. Whether you earn from ticket sales, venue bookings, or tips, Stripe handles it all securely.
              </p>
            </div>
          </div>
        </Card>

        {/* Connected / Not Connected State */}
        {isConnected ? (
          <>
            {/* Connected Status */}
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">Account Connected</h3>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <p className="text-text-muted text-xs mt-0.5">Your Stripe account is ready to receive payments</p>
                </div>
              </div>

              {/* Account Info Placeholder */}
              <div className="bg-surface rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Account</span>
                  <span className="text-text-primary font-medium">
                    {profile?.stripe_connect_id || 'acct_***connected'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Status</span>
                  <span className="text-success font-medium">Charges enabled</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Payouts</span>
                  <span className="text-success font-medium">Enabled</span>
                </div>
              </div>
            </Card>

            {/* Stripe Dashboard Link */}
            <Button
              fullWidth
              variant="secondary"
              size="lg"
              onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Go to Stripe Dashboard
            </Button>
          </>
        ) : (
          <>
            {/* Benefits List */}
            <div className="space-y-3">
              {[
                { icon: 'dollar', text: 'Receive payments from ticket sales' },
                { icon: 'calendar', text: 'Get paid for venue bookings' },
                { icon: 'heart', text: 'Accept tips from fans and attendees' },
                { icon: 'shield', text: 'Secure, PCI-compliant processing' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-orange/10 flex items-center justify-center">
                    {item.icon === 'dollar' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange">
                        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    )}
                    {item.icon === 'calendar' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    )}
                    {item.icon === 'heart' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    )}
                    {item.icon === 'shield' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-text-primary">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Connect Button */}
            <Button
              fullWidth
              size="lg"
              loading={loading}
              onClick={handleConnect}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Connect with Stripe
            </Button>
          </>
        )}

        {/* FAQ Section */}
        <div>
          <h3 className="font-display font-semibold text-base mb-3">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-medium text-text-primary pr-4">{item.question}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 text-text-muted transition-transform duration-200 ${expandedFaq === index ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
