'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { EVENT_GRADIENTS, AVATAR_COLORS } from '@/lib/utils/constants';
import { formatDateTime, formatCurrency, getEventCountdown } from '@/lib/utils/format';
import { isToday } from 'date-fns';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/auth-provider';

const REACTION_EMOJIS: Record<string, string> = {
  fire: '\uD83D\uDD25',
  heart: '\u2764\uFE0F',
  hundred: '\uD83D\uDCAF',
  clap: '\uD83D\uDC4F',
};

const SOCIAL_ICONS: Record<string, { label: string; path: string }> = {
  instagram: { label: 'Instagram', path: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
  twitter: { label: 'Twitter / X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  spotify: { label: 'Spotify', path: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z' },
  tiktok: { label: 'TikTok', path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.12v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.27 8.27 0 0 0 4.85 1.56V6.8a4.84 4.84 0 0 1-1.09-.11z' },
  linkedin: { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z' },
  soundcloud: { label: 'SoundCloud', path: 'M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.05-.1-.1-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.172 1.308c.013.06.045.094.104.094.057 0 .093-.034.104-.094l.2-1.308-.2-1.332c-.01-.057-.047-.094-.104-.094' },
  facebook: { label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/events/${eventId}`);
        if (!res.ok) throw new Error('Event not found');
        const data = await res.json();
        setEvent(data);
        setReactions(data?.reactions || {});
        if (data?.ticket_tiers?.length > 0) {
          setSelectedTierId(data.ticket_tiers[0].id);
        }
      } catch {
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="pb-32 animate-fade-in">
        {/* Ambient orbs */}
        <div className="fixed -top-40 -right-40 w-[500px] h-[500px] bg-primary-container/5 blur-[120px] -z-10 rounded-full" />
        <div className="fixed -bottom-40 -left-40 w-[400px] h-[400px] bg-secondary-container/5 blur-[120px] -z-10 rounded-full" />
        {/* Hero skeleton */}
        <div className="aspect-[4/3] min-h-[280px] bg-surface-container-high animate-shimmer rounded-b-3xl" />
        <div className="px-4 mt-5 space-y-4">
          <div className="h-8 bg-surface-container-high animate-shimmer rounded-xl w-3/4" />
          <div className="h-4 bg-surface-container-high animate-shimmer rounded-lg w-1/2" />
          <div className="h-28 bg-surface-container-high animate-shimmer rounded-2xl" />
          <div className="h-20 bg-surface-container-high animate-shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-4">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-outline)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className="text-on-surface-variant text-base font-body">Event not found</p>
        <button
          onClick={() => router.push('/home')}
          className="px-6 py-3 rounded-2xl border border-white/10 text-on-surface-variant font-body text-sm hover:bg-surface-container transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const eventIsToday = isToday(new Date(event.date));
  const countdown = getEventCountdown(event.date);
  const selectedTier = event.ticket_tiers?.find((t: any) => t.id === selectedTierId) || event.ticket_tiers?.[0];

  const handleReaction = (type: string) => {
    setReactions(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: event.description, url: window.location.href });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="pb-36 animate-fade-in">
      {/* Ambient background orbs */}
      <div className="fixed -top-40 -right-40 w-[500px] h-[500px] bg-primary-container/5 blur-[120px] -z-10 rounded-full pointer-events-none" />
      <div className="fixed -bottom-60 -left-40 w-[400px] h-[400px] bg-secondary-container/5 blur-[120px] -z-10 rounded-full pointer-events-none" />

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden aspect-[4/3] min-h-[280px] flex flex-col justify-end"
        style={{ background: EVENT_GRADIENTS[(event.gradient_index ?? 0) % EVENT_GRADIENTS.length] }}
      >
        {/* Cover image */}
        {event.cover_images?.[0] && (
          <img
            src={event.cover_images[0]}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="glass-panel rounded-full w-11 h-11 flex items-center justify-center absolute top-4 left-4 z-10 border border-white/10 hover:bg-white/10 transition-colors active:scale-95"
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="glass-panel rounded-full w-11 h-11 flex items-center justify-center absolute top-4 right-4 z-10 border border-white/10 hover:bg-white/10 transition-colors active:scale-95"
          aria-label="Share event"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>

        {/* Hero content */}
        <div className="relative z-10 p-5 pb-6">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-3">
            {eventIsToday && (
              <span className="flex items-center gap-1.5 bg-red-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full font-body text-xs font-black uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
                Happening Now
              </span>
            )}
            {event.visibility && event.visibility !== 'public' && (
              <span className="flex items-center gap-1 glass-panel text-white px-3 py-1 rounded-full font-body text-xs font-black uppercase tracking-wide border border-white/10">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                {event.visibility === 'private' ? 'Private' : 'Invite Only'}
              </span>
            )}
            {event.category && (
              <span className="bg-secondary-container text-white px-3 py-1 rounded-full font-body text-xs font-black uppercase tracking-wide">
                {event.category}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-headline font-extrabold tracking-tighter text-4xl text-white leading-tight drop-shadow-lg">
            {event.title}
          </h1>

          {/* Date line */}
          <p className="text-white/70 text-sm mt-2 font-body">
            {formatDateTime(event.date, event.startTime || event.start_time)}
            {(event.endTime || event.end_time) ? ` – ${event.endTime || event.end_time}` : ''}
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 mt-5 space-y-5">

        {/* Attribute pills */}
        <div className="flex flex-wrap gap-2">
          {(event.ageRestriction || event.age_restriction) && (
            <span className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full font-body text-xs font-semibold border border-white/5">
              {event.ageRestriction || event.age_restriction}
            </span>
          )}
          {(event.dressCode || event.dress_code) && (
            <span className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full font-body text-xs font-semibold border border-white/5">
              {event.dressCode || event.dress_code}
            </span>
          )}
          <span className="bg-secondary-container/20 text-secondary px-3 py-1.5 rounded-full font-body text-xs font-semibold">
            {countdown}
          </span>
          <span className="bg-secondary-container/20 text-secondary px-3 py-1.5 rounded-full font-body text-xs font-semibold">
            {event.attendees ?? 0} / {event.capacity ?? '?'} attending
          </span>
        </div>

        {/* Reactions */}
        <div className="flex gap-2">
          {Object.entries(REACTION_EMOJIS).map(([key, emoji]) => (
            <button
              key={key}
              onClick={() => handleReaction(key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-container border border-white/5 hover:border-white/15 transition-all duration-200 active:scale-95"
            >
              <span className="text-sm">{emoji}</span>
              <span className="text-xs text-on-surface-variant font-body font-semibold">{reactions[key] || 0}</span>
            </button>
          ))}
        </div>

        {/* About */}
        <div className="glass-card rounded-2xl border border-white/5 p-5">
          <p className="text-on-surface-variant text-xs uppercase tracking-[0.2em] font-bold mb-3 font-body">About</p>
          <p className="text-on-surface text-sm leading-relaxed font-body">{event.description}</p>
        </div>

        {/* Venue */}
        {event.venue && (
          <div className="glass-card rounded-2xl border border-white/5 p-5">
            <p className="text-on-surface-variant text-xs uppercase tracking-[0.2em] font-bold mb-3 font-body">Venue</p>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-container)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-headline font-semibold text-sm text-on-surface">
                  {typeof event.venue === 'string' ? event.venue : event.venue.name}
                </p>
                {typeof event.venue === 'object' && (
                  <>
                    <p className="text-on-surface-variant text-xs mt-0.5 font-body">{event.venue.address}</p>
                    <p className="text-on-surface-variant text-xs font-body">{event.venue.city}, {event.venue.state}</p>
                    {event.venue.type && (
                      <span className="inline-block mt-2 bg-surface-container-highest text-on-surface-variant px-2.5 py-1 rounded-full text-xs font-body font-semibold">
                        {event.venue.type}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Artist Lineup */}
        {event.event_artists && event.event_artists.length > 0 && (
          <div>
            <p className="text-on-surface-variant text-xs uppercase tracking-[0.2em] font-bold mb-4 font-body">Lineup</p>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {event.event_artists.map((ea: any, i: number) => {
                const artist = ea.artist || ea;
                return (
                  <div
                    key={artist.id || i}
                    className="shrink-0 bg-surface-container-high rounded-2xl p-4 border border-white/5 hover:border-white/15 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center gap-2 w-[100px]"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-headline font-bold text-lg shrink-0"
                      style={{ backgroundColor: AVATAR_COLORS[(artist.colorIndex ?? artist.gradient_index ?? i) % AVATAR_COLORS.length] }}
                    >
                      {artist.name?.charAt(0) || '?'}
                    </div>
                    <div className="text-center w-full">
                      <p className="text-xs font-semibold font-headline truncate">{artist.name}</p>
                      <p className="text-xs text-on-surface-variant font-body mt-0.5 truncate">{artist.genre}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ticket Tiers */}
        {event.ticket_tiers && event.ticket_tiers.length > 0 && (
          <div>
            <p className="text-on-surface-variant text-xs uppercase tracking-[0.2em] font-bold mb-4 font-body">Tickets</p>
            <div className="flex flex-col gap-3">
              {event.ticket_tiers.map((tier: any, i: number) => {
                const isSelected = tier.id === selectedTierId;
                const soldPct = tier.total ? ((tier.total - (tier.remaining ?? 0)) / tier.total) * 100 : 0;
                return (
                  <div
                    key={tier.id || i}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`glass-card rounded-xl border p-6 cursor-pointer transition-all duration-200 active:scale-[0.99] ${
                      isSelected
                        ? 'border-primary-container/30 shadow-[0_0_16px_rgba(255,107,53,0.2)]'
                        : 'border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-headline font-bold text-sm text-on-surface">{tier.name}</h4>
                        {tier.remaining != null && tier.remaining <= 10 && (
                          <span className="inline-block mt-1 bg-primary-container/20 text-primary-container px-2 py-0.5 rounded-full text-xs font-body font-bold">
                            Almost Sold Out
                          </span>
                        )}
                      </div>
                      <span className="font-headline font-extrabold text-lg text-primary-container">
                        {formatCurrency(tier.price)}
                      </span>
                    </div>
                    {tier.perks && tier.perks.length > 0 && (
                      <ul className="space-y-1.5 mb-4">
                        {tier.perks.map((perk: string, j: number) => (
                          <li key={j} className="flex items-center gap-2 text-xs text-on-surface-variant font-body">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {perk}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-on-surface-variant font-body">
                        {tier.remaining ?? '?'} of {tier.total ?? '?'} left
                      </span>
                      {isSelected && (
                        <span className="text-xs text-primary-container font-body font-bold uppercase tracking-wide">Selected</span>
                      )}
                    </div>
                    {tier.total && (
                      <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary-container transition-all duration-500"
                          style={{ width: `${soldPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add-ons */}
        {event.event_addons && event.event_addons.length > 0 && (
          <div>
            <p className="text-on-surface-variant text-xs uppercase tracking-[0.2em] font-bold mb-4 font-body">Add-ons</p>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {event.event_addons.map((addon: any) => (
                <div
                  key={addon.id}
                  className="flex-none w-44 bg-surface-container-high rounded-xl p-4 border border-white/5 hover:border-white/15 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-surface-container-highest flex items-center justify-center mb-3">
                    {addon.type === 'merch' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                    )}
                  </div>
                  <p className="text-sm font-headline font-semibold truncate text-on-surface">{addon.name}</p>
                  <p className="text-primary-container text-sm font-body font-bold mt-1">+{formatCurrency(addon.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {event.socialLinks && Object.keys(event.socialLinks).length > 0 && (
          <div>
            <p className="text-on-surface-variant text-xs uppercase tracking-[0.2em] font-bold mb-4 font-body">Follow</p>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(event.socialLinks).map(([platform, url]) => {
                const icon = SOCIAL_ICONS[platform];
                if (!icon) return null;
                return (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl glass-card border border-white/5 flex items-center justify-center hover:border-white/15 hover:-translate-y-0.5 transition-all duration-200"
                    title={icon.label}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-on-surface-variant)">
                      <path d={icon.path} />
                    </svg>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed CTA Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-6 pointer-events-none">
        <div className="max-w-[480px] mx-auto pointer-events-auto">
          <div className="glass-panel rounded-[32px] flex items-center justify-between border border-white/5 px-5 py-4">
            {/* Price */}
            <div>
              <p className="text-on-surface-variant text-xs font-body uppercase tracking-wide mb-0.5">From</p>
              <p className="font-headline font-extrabold text-xl text-primary-container">
                {formatCurrency(selectedTier?.price ?? event.ticket_tiers?.[0]?.price ?? 0)}
              </p>
            </div>
            {/* Button */}
            <button
              onClick={() => router.push(`/events/${event.id}/purchase${selectedTierId ? `?tier=${selectedTierId}` : ''}`)}
              className="kinetic-gradient text-white px-8 py-4 rounded-2xl font-body font-bold uppercase tracking-widest text-sm active:scale-95 transition-transform duration-150 shadow-[0_0_20px_rgba(255,107,53,0.35)]"
            >
              Get Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
