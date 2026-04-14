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
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M9 22V12h6v10"/>
        </svg>
      ),
      title: 'Book Venues',
      desc: 'Browse and book rooftops, halls, studios, and unique spaces for your next event.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
        </svg>
      ),
      title: 'Connect with Artists',
      desc: 'Discover local DJs, bands, comedians, and performers. Book them for your events.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
        </svg>
      ),
      title: 'Watch Live',
      desc: 'Stream live performances from your favorite artists, anywhere, anytime.',
    },
  ];

  return (
    <div className="min-h-dvh bg-background text-on-surface font-body overflow-x-hidden">

      {/* ── Fixed Background Orbs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary-container/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-secondary-container/10 blur-[100px]" />
        <div className="absolute top-[40%] left-[-10%] w-[300px] h-[300px] rounded-full bg-primary-container/5 blur-[80px]" />
      </div>

      {/* ── Fixed Header ── */}
      <header className="bg-background/60 backdrop-blur-xl h-16 px-6 flex justify-between items-center fixed top-0 w-full z-50 border-b border-white/5">
        {/* Hamburger */}
        <button className="text-on-surface-variant p-1" aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Wordmark */}
        <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary-container to-secondary-container font-headline uppercase select-none">
          PULLUPP
        </span>

        {/* Sign In */}
        <Link
          href="/auth/login"
          className="text-sm font-bold text-primary-container hover:opacity-80 transition-opacity"
        >
          Sign In
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen kinetic-gradient flex flex-col items-center justify-center text-center pt-32 pb-16 px-6">
        {/* Overlay image texture */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-60"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
          {/* Pill badge */}
          <span className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
            Atlanta&apos;s Premier Event Platform
          </span>

          {/* Headline */}
          <h1 className="font-headline font-extrabold text-5xl md:text-7xl tracking-tighter text-white leading-[0.9]">
            THE PULSE<br />OF LIVE<br />ENTERTAINMENT
          </h1>

          {/* Subtitle */}
          <p className="text-white/70 text-lg max-w-md font-body font-light">
            Discover concerts, comedy nights, art shows, and more. Experience Atlanta&apos;s live entertainment scene.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              href="/home"
              className="kinetic-gradient text-white font-bold py-4 px-8 rounded-2xl shadow-[0_0_24px_rgba(255,107,53,0.4)] uppercase tracking-widest text-sm hover:opacity-90 transition-opacity active:scale-95"
            >
              Explore Events
            </Link>
            <Link
              href="/register"
              className="glass-card text-white font-bold py-4 px-8 rounded-2xl border border-white/10 uppercase tracking-widest text-sm hover:bg-white/10 transition-all active:scale-95"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </section>

      {/* ── Upcoming Events ── */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-2">
                Live Near You
              </p>
              <h2 className="font-headline font-bold text-3xl text-white leading-tight">
                Upcoming Events
              </h2>
            </div>
            <Link href="/home" className="text-sm font-bold text-primary-container hover:opacity-80 transition-opacity shrink-0 mb-1">
              View all →
            </Link>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={cat === 'All' ? '/home' : `/category/${cat.toLowerCase()}`}
                className="shrink-0 px-4 py-2 rounded-full text-xs font-bold bg-surface-container border border-white/5 text-on-surface-variant hover:border-primary-container/40 hover:text-white transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant/50">
              <p className="text-lg font-semibold font-headline">No upcoming events</p>
              <p className="text-sm mt-1">Check back soon for new events</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event: any) => {
                const gradient = EVENT_GRADIENTS[event.gradient_index % EVENT_GRADIENTS.length];
                const coverImg = event.cover_images?.[0];
                const venueName = event.venue?.name || event.manual_venue_name || 'Atlanta';
                const minPrice = getMinPrice(event.ticket_tiers);

                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group glass-card rounded-[24px] overflow-hidden border border-white/5 hover:border-white/15 hover:-translate-y-1 transition-all duration-200"
                  >
                    {/* Event image */}
                    <div
                      className="aspect-[16/7] relative flex items-end p-4"
                      style={{
                        background: coverImg
                          ? `url(${coverImg}) center/cover no-repeat`
                          : gradient,
                      }}
                    >
                      {coverImg && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      )}
                      <span className="relative z-10 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
                        {event.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-headline font-bold text-sm text-white mb-2 line-clamp-1 group-hover:text-primary-container transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-on-surface-variant text-xs mb-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {formatDate(event.date)} · {event.start_time?.slice(0, 5)}
                      </div>
                      <div className="flex items-center gap-1.5 text-on-surface-variant text-xs mb-4">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {venueName}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-primary-container font-bold text-sm">
                          {minPrice ?? 'Tickets Available'}
                        </span>
                        <span className="px-3 py-1.5 bg-primary-container/10 text-primary-container text-[10px] font-bold rounded-lg uppercase tracking-widest group-hover:bg-primary-container group-hover:text-white transition-all">
                          Get Tickets
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 kinetic-gradient text-white font-bold py-4 px-8 rounded-2xl shadow-[0_0_24px_rgba(255,107,53,0.3)] uppercase tracking-widest text-sm hover:opacity-90 transition-opacity active:scale-95"
            >
              View All Events →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 px-4 py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-container mb-3">
              Why PullUpp
            </p>
            <h2 className="font-headline font-bold text-3xl text-white">Everything You Need</h2>
            <p className="text-on-surface-variant text-base max-w-md mx-auto mt-3">
              PullUpp is the all-in-one platform for Atlanta&apos;s entertainment community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-surface-container rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl kinetic-gradient flex items-center justify-center mb-4 text-white">
                  {f.icon}
                </div>
                <h3 className="font-headline font-bold text-lg text-white mb-2">{f.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 px-4 py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="glass-panel rounded-2xl p-8 border border-white/5">
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-8">
              By the Numbers
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {[
                { num: '500+', label: 'Events Monthly' },
                { num: '200+', label: 'Venues Listed' },
                { num: '1,000+', label: 'Artists' },
                { num: '50K+', label: 'Community Members' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-headline font-black text-4xl text-primary-container mb-1">{stat.num}</p>
                  <p className="text-on-surface-variant text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="relative z-10 px-4 py-20 border-t border-white/5">
        <div className="kinetic-gradient rounded-3xl p-10 text-center mx-auto max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-4">
            Ready to Join?
          </p>
          <h2 className="font-headline font-black text-4xl text-white mb-4 leading-tight">
            Ready to PullUpp?
          </h2>
          <p className="text-white/70 text-base mb-8 max-w-sm mx-auto">
            Join thousands of event-goers, artists, and organizers in Atlanta.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-primary-container font-bold rounded-2xl text-sm uppercase tracking-widest hover:opacity-90 transition-opacity active:scale-95"
            >
              Get Started
            </Link>
            <Link
              href="/home"
              className="px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl text-sm uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-4 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-headline font-black text-xl text-transparent bg-clip-text bg-gradient-to-br from-primary-container to-secondary-container uppercase tracking-tighter">
            PULLUPP
          </span>
          <p className="text-on-surface-variant/50 text-xs">
            © 2026 PullUpp. Events, Venues &amp; Live Entertainment.
          </p>
          <div className="flex items-center gap-4 text-on-surface-variant/50 text-xs">
            <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
