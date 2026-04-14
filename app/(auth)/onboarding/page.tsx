'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface Slide {
  icon: React.ReactNode;
  headline: string;
  subtitle: string;
  gradient: string;
}

const ROLE_SLIDES: Record<string, Slide[]> = {
  guest: [
    { icon: <span className="text-5xl">🎉</span>, headline: 'Discover Events', subtitle: 'Find concerts, art shows, food festivals, and more happening near you', gradient: 'from-orange/20 to-orange-dark/5' },
    { icon: <span className="text-5xl">🎫</span>, headline: 'Buy Tickets Instantly', subtitle: 'Secure your spot with a seamless checkout. VIP, general admission, and more', gradient: 'from-teal/20 to-teal-dark/5' },
    { icon: <span className="text-5xl">🎵</span>, headline: 'Follow Artists', subtitle: 'Stay updated with your favorite performers and never miss a show', gradient: 'from-purple-500/20 to-purple-800/5' },
    { icon: <span className="text-5xl">📺</span>, headline: 'Watch Live & Tip', subtitle: 'Experience live streams and support artists with tips in real-time', gradient: 'from-pink-500/20 to-pink-800/5' },
  ],
  organizer: [
    { icon: <span className="text-5xl">📋</span>, headline: 'Create Events', subtitle: 'Build beautiful event pages with our easy wizard. Add tickets, add-ons, and more', gradient: 'from-teal/20 to-teal-dark/5' },
    { icon: <span className="text-5xl">🏛️</span>, headline: 'Book Venues & Artists', subtitle: 'Browse and book the perfect venue and entertainment for your event', gradient: 'from-purple-500/20 to-purple-800/5' },
    { icon: <span className="text-5xl">🎫</span>, headline: 'Sell Tickets', subtitle: 'Manage ticket tiers, promo codes, and track sales in real-time', gradient: 'from-orange/20 to-orange-dark/5' },
    { icon: <span className="text-5xl">✅</span>, headline: 'Check In Guests', subtitle: 'Scan QR codes or manually check in attendees at the door', gradient: 'from-success/20 to-green-800/5' },
  ],
  venue_owner: [
    { icon: <span className="text-5xl">🏢</span>, headline: 'List Your Space', subtitle: 'Showcase your venue with photos, amenities, and pricing details', gradient: 'from-purple-500/20 to-purple-800/5' },
    { icon: <span className="text-5xl">📅</span>, headline: 'Set Availability', subtitle: 'Manage your calendar and control when your venue is bookable', gradient: 'from-teal/20 to-teal-dark/5' },
    { icon: <span className="text-5xl">🤝</span>, headline: 'Accept Bookings', subtitle: 'Review requests, negotiate pricing, and confirm bookings', gradient: 'from-orange/20 to-orange-dark/5' },
    { icon: <span className="text-5xl">💰</span>, headline: 'Track Earnings', subtitle: 'Monitor your revenue, occupancy rates, and get paid via Stripe', gradient: 'from-success/20 to-green-800/5' },
  ],
  artist: [
    { icon: <span className="text-5xl">🎤</span>, headline: 'Build Your Profile', subtitle: 'Showcase your talent, music, and portfolio to event organizers', gradient: 'from-pink-500/20 to-pink-800/5' },
    { icon: <span className="text-5xl">📡</span>, headline: 'Go Live', subtitle: 'Stream live performances and connect with fans in real-time', gradient: 'from-orange/20 to-orange-dark/5' },
    { icon: <span className="text-5xl">🎭</span>, headline: 'Accept Gigs', subtitle: 'Get booked for events, negotiate rates, and manage your schedule', gradient: 'from-teal/20 to-teal-dark/5' },
    { icon: <span className="text-5xl">💸</span>, headline: 'Collect Tips', subtitle: 'Receive tips from fans during shows and live streams', gradient: 'from-success/20 to-green-800/5' },
  ],
};

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { profile } = useAuthContext();
  const router = useRouter();
  const supabase = createClient();

  const role = profile?.role || 'guest';
  const slides = ROLE_SLIDES[role] || ROLE_SLIDES.guest;
  const isLast = currentSlide === slides.length - 1;

  const handleComplete = async () => {
    if (profile) {
      await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', profile.id);
    }

    // Route to Stripe Connect for non-guest roles
    if (role !== 'guest') {
      router.push('/stripe-connect');
    } else {
      router.push('/home');
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-dvh flex flex-col">
      <div className={`flex-1 flex flex-col items-center justify-center px-8 bg-gradient-to-b ${slide.gradient}`}>
        <div className="mb-8">{slide.icon}</div>
        <h2 className="font-headline font-bold text-2xl text-center mb-3">{slide.headline}</h2>
        <p className="font-body text-on-surface-variant text-sm text-center max-w-[280px]">{slide.subtitle}</p>
      </div>

      <div className="px-6 pb-8 pt-6">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-6 bg-primary-container' : 'w-1.5 bg-white/10'
              }`}
            />
          ))}
        </div>

        <Button
          size="lg"
          fullWidth
          onClick={() => {
            if (isLast) {
              handleComplete();
            } else {
              setCurrentSlide(currentSlide + 1);
            }
          }}
        >
          {isLast ? 'Get Started' : 'Next'}
        </Button>

        {!isLast && (
          <button
            onClick={handleComplete}
            className="w-full text-center text-sm text-outline mt-3 py-2 hover:text-on-surface-variant transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
