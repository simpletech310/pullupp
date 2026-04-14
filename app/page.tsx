import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { EVENT_GRADIENTS } from '@/lib/utils/constants';

async function getUpcomingEvents() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('events')
      .select(`
        id, title, category, date, start_time, cover_images,
        gradient_index, manual_venue_name,
        venue:venues(id, name, city),
        ticket_tiers(price)
      `)
      .eq('status', 'published')
      .eq('visibility', 'public')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(12);
    return data || [];
  } catch {
    return [];
  }
}

function getMinPrice(tiers: any[]) {
  if (!tiers?.length) return null;
  const prices = tiers.map((t: any) => t.price).filter((p: any) => p >= 0);
  if (!prices.length) return null;
  const min = Math.min(...prices);
  return min === 0 ? 'Free' : formatCurrency(min);
}

export default async function LandingPage() {
  const events = await getUpcomingEvents();

  const categories = ['All', 'Music', 'Comedy', 'Art', 'Food', 'Networking'];

  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v3m8-3v3M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>
        </svg>
      ),
      title: 'Discover Events',
      desc: 'Find concerts, comedy shows, art exhibits, food festivals, and more happening near you.',
      color: 'text-orange',
      bg: 'bg-orange/10',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M9 22V12h6v10"/>
        </svg>
      ),
      title: 'Book Venues',
      desc: 'Browse and book rooftops, halls, studios, and unique spaces for your next event.',
      color: 'text-teal',
      bg: 'bg-teal/10',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
        </svg>
      ),
      title: 'Connect with Artists',
      desc: 'Discover local DJs, bands, comedians, and performers. Book them for your events.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
        </svg>
      ),
      title: 'Watch Live',
      desc: 'Stream live performances from your favorite artists, anywhere, anytime.',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ];

  return (
    <div className="min-h-dvh bg-[#0F0F13] text-white font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0F0F13]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-2xl tracking-tight">
            Pull<span className="text-[#FF6B35]">Upp</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-white/70 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl hover:bg-[#FF6B35]/90 transition-colors shadow-[0_0_20px_rgba(255,107,53,0.3)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#FF6B35]/8 blur-[120px]" />
          <div className="absolute top-32 right-0 w-[300px] h-[300px] rounded-full bg-[#14B8A6]/6 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full bg-purple-500/5 blur-[80px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-full text-[#FF6B35] text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
            Atlanta&apos;s Premier Event Platform
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-6xl tracking-tight mb-5 leading-tight">
            Your City.{' '}
            <span className="text-[#FF6B35]">Your Events.</span>
            <br />
            Your Moment.
          </h1>
          <p className="text-white/60 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Discover concerts, comedy nights, art shows, and more. Book venues, connect with artists, and experience Atlanta&apos;s live entertainment scene.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/home"
              className="px-8 py-4 bg-[#FF6B35] text-white font-semibold rounded-xl hover:bg-[#FF6B35]/90 transition-all shadow-[0_0_30px_rgba(255,107,53,0.3)] active:scale-95"
            >
              Explore Events →
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all active:scale-95"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl mb-1">Upcoming Events</h2>
              <p className="text-white/50 text-sm">Get your tickets before they sell out</p>
            </div>
            <Link
              href="/home"
              className="text-[#FF6B35] text-sm font-semibold hover:text-[#FF6B35]/80 transition-colors"
            >
              View all →
            </Link>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={cat === 'All' ? '/home' : `/category/${cat.toLowerCase()}`}
                className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold bg-white/5 border border-white/10 text-white/60 hover:border-[#FF6B35]/50 hover:text-white transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <p className="text-lg font-semibold">No upcoming events</p>
              <p className="text-sm mt-1">Check back soon for new events</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event: any) => {
                const gradient = EVENT_GRADIENTS[event.gradient_index % EVENT_GRADIENTS.length];
                const coverImg = event.cover_images?.[0];
                const venueName = event.venue?.name || event.manual_venue_name || 'Atlanta';
                const minPrice = getMinPrice(event.ticket_tiers);

                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group bg-[#1A1A23] border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Event Image */}
                    <div
                      className="aspect-[16/7] relative flex items-end p-4"
                      style={{
                        background: coverImg
                          ? `url(${coverImg}) center/cover no-repeat`
                          : gradient,
                      }}
                    >
                      {coverImg && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      )}
                      <span className="relative z-10 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                        {event.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-white mb-2 line-clamp-1 group-hover:text-[#FF6B35] transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {formatDate(event.date)} · {event.start_time?.slice(0, 5)}
                      </div>
                      <div className="flex items-center gap-1.5 text-white/50 text-xs mb-3">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {venueName}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#FF6B35] font-semibold text-sm">
                          {minPrice ?? 'Tickets Available'}
                        </span>
                        <span className="px-3 py-1.5 bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-semibold rounded-lg group-hover:bg-[#FF6B35] group-hover:text-white transition-all">
                          Get Tickets
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B35] text-white font-semibold rounded-xl hover:bg-[#FF6B35]/90 transition-all shadow-[0_0_20px_rgba(255,107,53,0.2)] active:scale-95"
            >
              View All Events →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl mb-3">Everything You Need</h2>
            <p className="text-white/50 text-base max-w-md mx-auto">
              PullUpp is the all-in-one platform for Atlanta&apos;s entertainment community.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-[#1A1A23] border border-white/5 rounded-2xl p-6">
                <div className={`w-12 h-12 ${f.bg} ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { num: '500+', label: 'Events Monthly' },
              { num: '200+', label: 'Venues Listed' },
              { num: '1,000+', label: 'Artists' },
              { num: '50K+', label: 'Community Members' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display font-bold text-3xl text-[#FF6B35] mb-1">{stat.num}</p>
                <p className="text-white/50 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 blur-3xl bg-[#FF6B35]/20 rounded-full" />
            <h2 className="relative font-display font-bold text-4xl">
              Ready to Pull<span className="text-[#FF6B35]">Upp</span>?
            </h2>
          </div>
          <p className="text-white/50 text-base mb-8">
            Join thousands of event-goers, artists, and organizers in Atlanta.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-[#FF6B35] text-white font-semibold rounded-xl hover:bg-[#FF6B35]/90 transition-all shadow-[0_0_30px_rgba(255,107,53,0.3)]"
            >
              Create Free Account
            </Link>
            <Link
              href="/home"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold text-lg">
            Pull<span className="text-[#FF6B35]">Upp</span>
          </span>
          <p className="text-white/30 text-xs">
            © 2026 PullUpp. Events, Venues & Live Entertainment.
          </p>
          <div className="flex items-center gap-4 text-white/40 text-xs">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
