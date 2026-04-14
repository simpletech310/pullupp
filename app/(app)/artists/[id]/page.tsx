'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { AVATAR_COLORS, EVENT_GRADIENTS, TIP_PRESETS } from '@/lib/utils/constants';
import { formatCurrency, formatCompactNumber, formatDate, getInitials } from '@/lib/utils/format';
import { getArtistById } from '@/lib/supabase/queries';
import { toggleFollow } from '@/lib/supabase/mutations';
import { useAuthContext } from '@/providers/auth-provider';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_SONGS: Record<string, { title: string; duration: string }[]> = {
  a1: [
    { title: 'Midnight Pulse', duration: '3:42' },
    { title: 'Neon Streets', duration: '4:15' },
    { title: 'Bassline Theory', duration: '5:08' },
    { title: 'Afterglow', duration: '3:55' },
  ],
  a2: [
    { title: 'Golden Hour', duration: '4:20' },
    { title: 'Velvet Dreams', duration: '3:58' },
    { title: 'Slow Burn', duration: '4:45' },
  ],
  a3: [
    { title: 'City Lights', duration: '3:30' },
    { title: 'Crown Me', duration: '2:58' },
    { title: 'Rise Up', duration: '4:12' },
    { title: 'No Cap', duration: '3:15' },
    { title: 'Legacy', duration: '4:40' },
  ],
  a4: [
    { title: 'Funk Machine', duration: '5:20' },
    { title: 'Soul Kitchen', duration: '4:30' },
    { title: 'Brass & Sass', duration: '3:55' },
  ],
  a5: [
    { title: 'Blue Skies', duration: '3:45' },
    { title: 'Wanderlust', duration: '4:10' },
    { title: 'Paper Moon', duration: '3:28' },
    { title: 'Echo Chamber', duration: '4:55' },
  ],
  a6: [
    { title: 'Opening Set - Relationships', duration: '12:00' },
    { title: 'Crowd Work Highlights', duration: '8:30' },
    { title: 'Closing Bit - Technology', duration: '10:15' },
  ],
  a7: [
    { title: 'Seasoned Beats', duration: '4:00' },
    { title: 'Low Heat', duration: '3:35' },
    { title: 'Simmer', duration: '5:12' },
  ],
  a8: [
    { title: 'Spice Route', duration: '4:30' },
    { title: 'Lagos Nights', duration: '5:10' },
    { title: 'Pepper Dem', duration: '3:48' },
    { title: 'Island Bounce', duration: '4:22' },
  ],
};

const MOCK_TOP_TIPPERS: Record<string, { name: string; total: number }[]> = {
  a1: [
    { name: 'Alex M.', total: 250 },
    { name: 'Jordan K.', total: 180 },
    { name: 'Sam W.', total: 120 },
    { name: 'Riley T.', total: 95 },
    { name: 'Casey D.', total: 75 },
  ],
  a2: [
    { name: 'Taylor R.', total: 200 },
    { name: 'Morgan F.', total: 150 },
    { name: 'Quinn L.', total: 100 },
    { name: 'Drew P.', total: 80 },
    { name: 'Blake S.', total: 60 },
  ],
  a3: [
    { name: 'Chris B.', total: 500 },
    { name: 'Devon M.', total: 320 },
    { name: 'Avery W.', total: 210 },
    { name: 'Jamie N.', total: 180 },
    { name: 'Reese C.', total: 150 },
  ],
  a4: [
    { name: 'Pat G.', total: 150 },
    { name: 'Robin H.', total: 120 },
    { name: 'Lee V.', total: 90 },
    { name: 'Dana K.', total: 70 },
    { name: 'Sky J.', total: 50 },
  ],
  a5: [
    { name: 'Harper L.', total: 300 },
    { name: 'Emery T.', total: 250 },
    { name: 'Sage R.', total: 175 },
    { name: 'Finley W.', total: 130 },
    { name: 'Rowan A.', total: 100 },
  ],
  a6: [
    { name: 'Jules M.', total: 180 },
    { name: 'Ari P.', total: 140 },
    { name: 'Parker D.', total: 110 },
    { name: 'Eden F.', total: 85 },
    { name: 'River S.', total: 65 },
  ],
  a7: [
    { name: 'Kai L.', total: 120 },
    { name: 'Nova B.', total: 95 },
    { name: 'Zion M.', total: 80 },
    { name: 'Indie R.', total: 60 },
    { name: 'Storm W.', total: 45 },
  ],
  a8: [
    { name: 'Phoenix A.', total: 600 },
    { name: 'Milan J.', total: 420 },
    { name: 'Remy C.', total: 310 },
    { name: 'Nico T.', total: 250 },
    { name: 'Lennox D.', total: 180 },
  ],
};

const DEFAULT_TOP_TIPPERS = [
  { name: 'Alex M.', total: 250 },
  { name: 'Jordan K.', total: 180 },
  { name: 'Sam W.', total: 120 },
  { name: 'Riley T.', total: 95 },
  { name: 'Casey D.', total: 75 },
];

const MOCK_ARTISTS: Record<string, {
  id: string; name: string; genre: string; type?: string; bio: string;
  follower_count: number; tips_earned: number; eventsCount: number;
  hourly_rate: number; flat_rate?: number; is_active: boolean; is_live: boolean;
  streamId?: string; gradient_index: number;
  images?: string[];
  event_artists: { event: { id: string; title: string; date: string; start_time?: string; end_time?: string; category?: string; gradient_index: number; venue: { name: string; city: string; state: string } } }[];
}> = {
  a1: {
    id: 'a1', name: 'DJ Nova', genre: 'DJ', type: 'dj',
    bio: 'Spinning beats that move the city. House, techno, and everything in between. Atlanta-based, worldwide sound.',
    follower_count: 12400, tips_earned: 4580, eventsCount: 47, hourly_rate: 150,
    is_active: true, is_live: true, streamId: 'stream-nova-1', gradient_index: 0,
    event_artists: [
      { event: { id: '1', title: 'Midnight Groove', date: '2026-05-15', start_time: '10:00 PM', category: 'Music', gradient_index: 0, venue: { name: 'The Velvet Room', city: 'Atlanta', state: 'GA' } } },
      { event: { id: '6', title: 'Summer Vibes Festival', date: '2026-06-01', start_time: '6:00 PM', category: 'Music', gradient_index: 4, venue: { name: 'The Grand Hall', city: 'Atlanta', state: 'GA' } } },
    ],
  },
  a2: {
    id: 'a2', name: 'SoulWave', genre: 'Singer', type: 'vocalist',
    bio: 'R&B soul with a modern twist. Vocals that heal. Writing songs from the heart, performing with everything I have.',
    follower_count: 8700, tips_earned: 3200, eventsCount: 32, hourly_rate: 200,
    is_active: true, is_live: false, gradient_index: 1,
    event_artists: [
      { event: { id: '7', title: 'Jazz Under the Stars', date: '2026-06-05', start_time: '8:00 PM', category: 'Music', gradient_index: 1, venue: { name: 'Skyline Rooftop', city: 'Atlanta', state: 'GA' } } },
    ],
  },
  a3: {
    id: 'a3', name: 'Kai Rhythm', genre: 'Rapper', type: 'rapper',
    bio: 'ATL-born lyricist blending conscious bars with trap energy. Every verse tells a story.',
    follower_count: 23100, tips_earned: 7800, eventsCount: 65, hourly_rate: 300,
    is_active: true, is_live: false, gradient_index: 2,
    event_artists: [
      { event: { id: '8', title: 'Hip Hop Showcase', date: '2026-06-10', start_time: '9:00 PM', category: 'Music', gradient_index: 2, venue: { name: 'Warehouse 22', city: 'Atlanta', state: 'GA' } } },
    ],
  },
  a4: {
    id: 'a4', name: 'Marcus Cole', genre: 'Band', type: 'band',
    bio: 'Four-piece funk and soul band. Bringing the groove back to live music with brass, bass, and big energy.',
    follower_count: 5300, tips_earned: 2100, eventsCount: 28, hourly_rate: 500,
    is_active: true, is_live: true, streamId: 'stream-marcus-1', gradient_index: 3,
    event_artists: [],
  },
  a5: {
    id: 'a5', name: 'Maya Blue', genre: 'Singer', type: 'vocalist',
    bio: 'Indie-pop vocalist with jazzy undertones. Performing stripped-back sets that give you chills.',
    follower_count: 18600, tips_earned: 5400, eventsCount: 41, hourly_rate: 175,
    is_active: true, is_live: false, gradient_index: 4,
    event_artists: [
      { event: { id: '7', title: 'Jazz Under the Stars', date: '2026-06-05', start_time: '8:00 PM', category: 'Music', gradient_index: 1, venue: { name: 'Skyline Rooftop', city: 'Atlanta', state: 'GA' } } },
    ],
  },
  a6: {
    id: 'a6', name: 'Lena Park', genre: 'Comedian', type: 'comedian',
    bio: 'Stand-up comedy that hits different. Observational humor meets storytelling. Your cheeks will hurt.',
    follower_count: 9200, tips_earned: 2900, eventsCount: 53, hourly_rate: 125,
    is_active: true, is_live: false, gradient_index: 5,
    event_artists: [
      { event: { id: '2', title: 'Laugh Factory Live', date: '2026-05-18', start_time: '8:00 PM', category: 'Comedy', gradient_index: 5, venue: { name: 'Skyline Rooftop', city: 'Atlanta', state: 'GA' } } },
    ],
  },
  a7: {
    id: 'a7', name: 'Chef Kwame', genre: 'Producer', type: 'producer',
    bio: 'Cooking beats in the lab. Genre-bending production from lo-fi to house. Collaborations welcome.',
    follower_count: 6800, tips_earned: 1800, eventsCount: 19, hourly_rate: 250,
    is_active: true, is_live: false, gradient_index: 6,
    event_artists: [],
  },
  a8: {
    id: 'a8', name: 'DJ Spice', genre: 'DJ', type: 'dj',
    bio: 'Queen of the decks. Afrobeats, amapiano, and dancehall fusion. Every set is a passport to the world.',
    follower_count: 31500, tips_earned: 9200, eventsCount: 82, hourly_rate: 350,
    is_active: true, is_live: true, streamId: 'stream-spice-1', gradient_index: 7,
    event_artists: [
      { event: { id: '1', title: 'Midnight Groove', date: '2026-05-15', start_time: '10:00 PM', category: 'Music', gradient_index: 0, venue: { name: 'The Velvet Room', city: 'Atlanta', state: 'GA' } } },
      { event: { id: '6', title: 'Summer Vibes Festival', date: '2026-06-01', start_time: '6:00 PM', category: 'Music', gradient_index: 4, venue: { name: 'The Grand Hall', city: 'Atlanta', state: 'GA' } } },
    ],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGradientForArtist(artist: any, id: string): string {
  const idx = artist?.gradient_index != null
    ? artist.gradient_index % EVENT_GRADIENTS.length
    : (id.charCodeAt(id.length - 1) % EVENT_GRADIENTS.length);
  return EVENT_GRADIENTS[idx];
}

function getAvatarColor(artist: any, id: string): string {
  const idx = artist?.gradient_index != null
    ? artist.gradient_index % AVATAR_COLORS.length
    : (id.charCodeAt(id.length - 1) % AVATAR_COLORS.length);
  return AVATAR_COLORS[idx];
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ArtistSkeleton() {
  return (
    <div className="pb-24 animate-pulse">
      <div className="h-[574px] bg-surface-container-high" />
      <div className="px-4 -mt-6 mb-5">
        <div className="glass-card rounded-2xl p-6 border border-white/5">
          <div className="flex justify-between">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-5 w-16 bg-white/10 rounded" />
                <div className="h-3 w-12 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 mb-4">
        <div className="h-32 glass-card rounded-2xl border border-white/5" />
      </div>
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <div className="h-12 flex-1 bg-surface-container-high rounded-xl" />
          <div className="h-12 flex-1 bg-surface-container-high rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ArtistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, profile } = useAuthContext();

  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState('');
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipLoading, setTipLoading] = useState(false);
  const [tipConfirmed, setTipConfirmed] = useState(false);

  // Local toast state instead of sonner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function fetchArtist() {
      setLoading(true);
      try {
        const { data, error } = await getArtistById(id);
        if (data && !error) {
          setArtist(data);
        } else {
          const mock = MOCK_ARTISTS[id];
          if (mock) {
            setArtist(mock);
          } else {
            setNotFound(true);
          }
        }
      } catch {
        const mock = MOCK_ARTISTS[id];
        if (mock) {
          setArtist(mock);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchArtist();
  }, [id]);

  if (loading) return <ArtistSkeleton />;

  if (notFound || !artist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-16 h-16 rounded-full glass-card flex items-center justify-center mb-4 border border-white/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a98a80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <p className="font-headline font-bold text-lg mb-1 text-on-surface">Artist Not Found</p>
        <p className="text-on-surface-variant text-sm mb-5 font-body">This artist profile doesn&apos;t exist or has been removed.</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Derived values
  const gradient = getGradientForArtist(artist, id);
  const avatarColor = getAvatarColor(artist, id);
  const artistName: string = artist.name ?? 'Unknown Artist';
  const initials = getInitials(artistName);
  const genre: string = artist.genre ?? '';
  const bio: string = artist.bio ?? '';
  const isLive: boolean = !!(artist.is_live);
  const streamId: string | undefined = artist.streamId ?? artist.stream_id;
  const followerCount: number = Number(artist.follower_count ?? artist.followers ?? 0);
  const tipsEarned: number = Number(artist.tips_earned ?? artist.tipsEarned ?? 0);
  const hourlyRate: number | null = artist.hourly_rate ? Number(artist.hourly_rate) : null;
  const flatRate: number | null = artist.flat_rate ? Number(artist.flat_rate) : null;
  const eventArtists: any[] = artist.event_artists ?? [];
  const upcomingEvents = eventArtists
    .map((ea: any) => ea.event)
    .filter((ev: any) => ev && ev.id);

  // Songs (from mock keyed by id, or generic fallback)
  const songs: { title: string; duration: string }[] = MOCK_SONGS[id] ?? [
    { title: 'Latest Track', duration: '3:45' },
    { title: 'Popular Set', duration: '4:20' },
  ];
  const isComedian = genre.toLowerCase().includes('comedian') || genre.toLowerCase().includes('comedy');
  const tracksLabel = isComedian ? 'Sets' : 'Top Tracks';

  // Top tippers (always mock)
  const topTippers = MOCK_TOP_TIPPERS[id] ?? DEFAULT_TOP_TIPPERS;

  // Tip amount
  const tipAmount = selectedTip ?? (customTip ? parseFloat(customTip) : 0);

  // Auth state
  const isLoggedIn = !!user;
  const isOrganizer = profile?.role === 'organizer' || profile?.role === 'superadmin';

  // Follow handler
  const handleFollow = async () => {
    if (!user) {
      showToast('Sign in to follow artists', 'error');
      return;
    }
    setFollowLoading(true);
    try {
      const { following, error } = await toggleFollow(user.id, 'artist', artist.id);
      if (!error) {
        setIsFollowing(following);
        showToast(following ? `Following ${artistName}` : `Unfollowed ${artistName}`);
      } else {
        showToast('Failed to update follow', 'error');
      }
    } catch {
      showToast('Failed to update follow', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSendTip = () => {
    if (!isLoggedIn) {
      showToast('Sign in to send tips', 'error');
      return;
    }
    if (tipAmount > 0) setShowTipModal(true);
  };

  const confirmTip = async () => {
    setTipLoading(true);
    try {
      const res = await fetch('/api/stripe/create-tip-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: artist.id,
          amount: Math.round(tipAmount * 100),
          context: 'profile',
        }),
      });
      const data = await res.json();
      if (data.clientSecret || data.success) {
        setTipConfirmed(true);
        setTimeout(() => {
          setShowTipModal(false);
          setTipConfirmed(false);
          setSelectedTip(null);
          setCustomTip('');
          showToast(`Tip sent to ${artistName}!`);
        }, 1500);
      } else {
        showToast(data.error || 'Tip failed', 'error');
        setShowTipModal(false);
      }
    } catch {
      showToast('Failed to send tip', 'error');
      setShowTipModal(false);
    } finally {
      setTipLoading(false);
    }
  };

  return (
    <div className="pb-32 bg-background min-h-screen">
      {/* Ambient orbs */}
      <div className="fixed top-[-120px] left-[-80px] w-[320px] h-[320px] rounded-full bg-primary-container/10 blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[80px] right-[-100px] w-[280px] h-[280px] rounded-full bg-secondary-container/10 blur-[100px] pointer-events-none z-0" />

      {/* Toast */}
      {toast && (
        <div className={`
          fixed top-4 left-1/2 -translate-x-1/2 z-50
          px-4 py-3 rounded-xl text-sm font-semibold shadow-xl
          transition-all duration-300 animate-fade-in font-body
          ${toast.type === 'error'
            ? 'bg-red-900/90 text-white border border-red-500/30'
            : 'bg-surface-container border border-white/10 text-on-surface'}
        `}>
          {toast.message}
        </div>
      )}

      {/* ── Hero ── */}
      <div className="relative h-[574px] w-full overflow-hidden">
        {/* Background: gradient or image */}
        {artist.images?.[0] ? (
          <img
            src={artist.images[0]}
            alt={artistName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: gradient }}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 p-3 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors z-10"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* LIVE badge */}
        {isLive && (
          <div className="absolute top-12 right-4 z-10">
            <Badge variant="error" className="flex items-center gap-1.5 py-1.5 px-3">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE NOW
            </Badge>
          </div>
        )}

        {/* Artist identity at bottom of hero */}
        <div className="absolute bottom-8 left-4 right-4 z-10">
          <h1 className="font-headline text-5xl font-extrabold text-white tracking-tighter leading-none transform -rotate-1 origin-left">
            {artistName}
          </h1>
          {genre && (
            <p className="text-on-surface-variant font-medium tracking-wide uppercase text-sm mt-2 font-body">
              {genre}
            </p>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="px-4 -mt-6 mb-6 relative z-10">
        <div className="glass-card rounded-2xl p-6 shadow-2xl border border-white/5 flex justify-between items-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold text-white font-headline">{formatCompactNumber(followerCount)}</span>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold font-body">Followers</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold text-white font-headline">{formatCurrency(tipsEarned)}</span>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold font-body">Tips Earned</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold text-white font-headline">
              {upcomingEvents.length > 0 ? upcomingEvents.length : (artist.eventsCount ?? '—')}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold font-body">Events</span>
          </div>
        </div>
      </div>

      {/* ── About / Bio ── */}
      {bio && (
        <div className="px-4 mb-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h2 className="font-headline font-bold text-base text-on-surface mb-3">About</h2>
            <p className="text-on-surface leading-relaxed text-sm font-body">{bio}</p>
            {genre && (
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary text-[10px] font-bold tracking-widest uppercase border border-secondary/20 font-body">
                  {genre}
                </span>
                {artist.type && artist.type !== genre.toLowerCase() && (
                  <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary text-[10px] font-bold tracking-widest uppercase border border-secondary/20 font-body">
                    {artist.type}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Live Now Banner ── */}
      {isLive && streamId && (
        <div className="px-4 mb-6">
          <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <span className="w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse" />
              </div>
              <div>
                <p className="font-headline font-semibold text-sm text-white">Streaming Live</p>
                <p className="text-on-surface-variant text-xs font-body mt-0.5">{artistName} is performing right now</p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => router.push(`/live/${streamId}`)}
            >
              Watch
            </Button>
          </div>
        </div>
      )}

      {/* ── Tour Dates / Upcoming Events ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-headline font-bold text-base text-on-surface">Tour Dates</h2>
          <button className="text-primary-container text-xs font-bold uppercase tracking-widest font-body">View All</button>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
            {upcomingEvents.map((event: any, i: number) => {
              const eventGradient = EVENT_GRADIENTS[(event.gradient_index ?? i) % EVENT_GRADIENTS.length];
              const eventDate = event.date ? new Date(event.date) : null;
              const dayLabel = eventDate
                ? eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
                : '';
              return (
                <div
                  key={event.id ?? i}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="min-w-[260px] glass-card rounded-2xl overflow-hidden border border-white/5 cursor-pointer flex-shrink-0"
                >
                  <div className="h-32 relative">
                    <div className="absolute inset-0" style={{ background: eventGradient }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {dayLabel && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-primary-container text-white text-[10px] font-black uppercase rounded font-body">
                          {dayLabel}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-headline font-bold text-sm text-white truncate">{event.title}</p>
                    {event.venue && (
                      <p className="text-on-surface-variant text-[10px] font-body mt-0.5 truncate">
                        {event.venue.name} · {event.venue.city}
                      </p>
                    )}
                    {event.start_time && (
                      <p className="text-outline text-[10px] font-body mt-0.5">{event.start_time}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mx-4 glass-card rounded-2xl p-6 text-center border border-white/5">
            <p className="text-on-surface-variant text-sm font-body">No upcoming events scheduled</p>
          </div>
        )}
      </div>

      {/* ── Top Tracks / Sets ── */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline font-bold text-base text-on-surface">{tracksLabel}</h2>
          <button className="text-primary-container text-xs font-bold uppercase tracking-widest font-body">View All</button>
        </div>
        <div className="flex flex-col gap-2">
          {songs.map((song, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-high/40 hover:bg-surface-container-high/80 transition-all border border-transparent hover:border-white/10 cursor-pointer"
            >
              {/* Play button */}
              <div className="w-12 h-12 rounded-full kinetic-gradient flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,107,53,0.4)] shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm font-body truncate">{song.title}</p>
                <p className="text-on-surface-variant text-[10px] font-body mt-0.5">{artistName}</p>
              </div>
              <span className="text-on-surface-variant text-[10px] font-mono shrink-0">{song.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Send Tip ── */}
      <div className="px-4 mb-6">
        <h2 className="font-headline font-bold text-base text-on-surface mb-3">Send a Tip</h2>
        <div className="glass-card p-5 rounded-2xl border border-white/5">
          <div className="flex gap-2 mb-3">
            {TIP_PRESETS.map(amount => (
              <button
                key={amount}
                onClick={() => { setSelectedTip(amount); setCustomTip(''); }}
                className={`
                  flex-1 py-2.5 rounded-full font-bold text-sm transition-all duration-200 font-body
                  ${selectedTip === amount
                    ? 'bg-primary-container text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                    : 'bg-surface-container-high border border-white/5 text-white hover:border-white/20'}
                `}
              >
                ${amount}
              </button>
            ))}
          </div>
          <div className="mb-3">
            <Input
              placeholder="Custom amount"
              type="number"
              min="1"
              value={customTip}
              onChange={(e) => { setCustomTip(e.target.value); setSelectedTip(null); }}
              icon={<span className="text-on-surface-variant text-sm font-semibold font-body">$</span>}
            />
          </div>
          <button
            disabled={tipAmount <= 0}
            onClick={handleSendTip}
            className="w-full kinetic-gradient text-white font-bold py-4 rounded-xl uppercase tracking-widest text-sm shadow-[0_4px_20px_rgba(255,107,53,0.3)] disabled:opacity-40 disabled:cursor-not-allowed font-body"
          >
            {tipAmount > 0 ? `Send ${formatCurrency(tipAmount)} Tip` : 'Send a Tip'}
          </button>
        </div>
      </div>

      {/* ── Book Artist Rate Card ── */}
      {(hourlyRate || flatRate) && (
        <div className="px-4 mb-6">
          <h2 className="font-headline font-bold text-base text-on-surface mb-3">Book This Artist</h2>
          <div className="glass-card rounded-2xl overflow-hidden border-l-4 border-primary-container border border-white/5">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-headline font-bold text-2xl text-primary-container">
                    {hourlyRate ? `${formatCurrency(hourlyRate)}/hr` : formatCurrency(flatRate!)}
                  </p>
                  <p className="text-on-surface-variant text-xs font-body mt-0.5">
                    {hourlyRate ? 'Hourly rate · negotiable' : 'Flat rate per event'}
                  </p>
                </div>
                {flatRate && hourlyRate && (
                  <Badge variant="orange">Also {formatCurrency(flatRate)} flat</Badge>
                )}
              </div>
              <p className="text-on-surface-variant text-xs font-body mb-4 leading-relaxed">
                Send a booking request and {artistName.split(' ')[0]} will confirm availability and details within 24 hours.
              </p>
              <button
                onClick={() => router.push(`/bookings/request?type=artist&artistId=${artist.id}`)}
                className="w-full bg-primary-container text-white font-bold py-4 rounded-xl uppercase tracking-widest text-sm font-body"
              >
                Request Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Tippers ── */}
      <div className="px-4 mb-6">
        <h2 className="font-headline font-bold text-base text-on-surface mb-3">Top Tippers</h2>
        <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
          {topTippers.map((tipper, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 ${i < topTippers.length - 1 ? 'border-b border-white/5' : ''}`}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${i === 0
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : i === 1
                    ? 'bg-white/10 text-on-surface-variant'
                    : i === 2
                      ? 'bg-primary-container/20 text-primary-container'
                      : 'bg-surface-container-high text-on-surface-variant'}
              `}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold font-body text-on-surface truncate">{tipper.name}</p>
              </div>
              <span className="text-primary-container font-semibold text-sm font-body">{formatCurrency(tipper.total)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Social Links placeholder ── */}
      <div className="px-4 mb-24">
        <h2 className="font-headline font-bold text-base text-on-surface mb-3">Connect</h2>
        <div className="flex gap-3">
          {['instagram', 'twitter', 'spotify'].map((platform) => (
            <button
              key={platform}
              className="w-14 h-14 rounded-full glass-card flex items-center justify-center border border-white/10 hover:border-primary-container transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e4e1e7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* ── Fixed Bottom CTA ── */}
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <div className="glass-panel rounded-[32px] px-4 py-3 border border-white/10 flex gap-3 items-center shadow-2xl backdrop-blur-xl">
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`
              flex-1 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest font-body transition-all
              ${isFollowing
                ? 'bg-secondary-container/20 text-secondary border border-secondary/30'
                : 'bg-surface-container-high text-on-surface border border-white/10 hover:border-white/20'}
            `}
          >
            {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
          </button>
          {(isLoggedIn && isOrganizer && hourlyRate) && (
            <button
              onClick={() => router.push(`/bookings/request?type=artist&artistId=${artist.id}`)}
              className="flex-1 py-3 rounded-2xl bg-primary-container text-white font-bold text-sm uppercase tracking-widest font-body shadow-[0_4px_20px_rgba(255,107,53,0.3)]"
            >
              Book Artist
            </button>
          )}
          {(!isOrganizer || !hourlyRate) && (
            <button
              onClick={handleSendTip}
              className="flex-1 py-3 rounded-2xl kinetic-gradient text-white font-bold text-sm uppercase tracking-widest font-body shadow-[0_4px_20px_rgba(255,107,53,0.3)]"
            >
              Tip Artist
            </button>
          )}
        </div>
      </div>

      {/* ── Tip Confirmation Modal ── */}
      <Modal open={showTipModal} onClose={() => !tipLoading && setShowTipModal(false)} title="Confirm Tip">
        {tipConfirmed ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-headline font-bold text-lg text-on-surface">Tip Sent!</p>
            <p className="text-on-surface-variant text-sm mt-1 font-body">{formatCurrency(tipAmount)} to {artistName}</p>
          </div>
        ) : (
          <div>
            {/* Artist preview */}
            <div className="text-center mb-4">
              {artist.images?.[0] ? (
                <img
                  src={artist.images[0]}
                  alt={artistName}
                  className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-white/10"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-headline font-bold text-lg mx-auto mb-2"
                  style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)` }}
                >
                  {initials}
                </div>
              )}
              <p className="text-on-surface-variant text-sm font-body">Sending tip to</p>
              <p className="font-headline font-bold text-lg text-on-surface">{artistName}</p>
            </div>

            {/* Amount display */}
            <div className="bg-surface-container-high rounded-xl p-4 text-center mb-4">
              <p className="font-headline font-bold text-3xl text-primary-container">{formatCurrency(tipAmount)}</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                disabled={tipLoading}
                onClick={() => setShowTipModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                loading={tipLoading}
                onClick={confirmTip}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
