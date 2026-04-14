'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { AVATAR_COLORS, TIP_PRESETS } from '@/lib/utils/constants';
import { formatCurrency, formatCompactNumber, formatDate } from '@/lib/utils/format';

const MOCK_ARTISTS: Record<string, {
  id: string; name: string; genre: string; bio: string;
  followers: number; tipsEarned: number; eventsCount: number;
  hourlyRate: number; is_live: boolean; streamId?: string;
  songs: { title: string; duration: string }[];
  upcomingEvents: { id: string; title: string; date: string; venue: string }[];
  topTippers: { name: string; total: number }[];
}> = {
  a1: {
    id: 'a1', name: 'DJ Nova', genre: 'DJ',
    bio: 'Spinning beats that move the city. House, techno, and everything in between. Atlanta-based, worldwide sound.',
    followers: 12400, tipsEarned: 4580, eventsCount: 47, hourlyRate: 150,
    is_live: true, streamId: 'stream-nova-1',
    songs: [
      { title: 'Midnight Pulse', duration: '3:42' },
      { title: 'Neon Streets', duration: '4:15' },
      { title: 'Bassline Theory', duration: '5:08' },
      { title: 'Afterglow', duration: '3:55' },
    ],
    upcomingEvents: [
      { id: '1', title: 'Midnight Groove', date: '2026-05-15', venue: 'The Velvet Room' },
      { id: '6', title: 'Summer Vibes Festival', date: '2026-06-01', venue: 'The Grand Hall' },
    ],
    topTippers: [
      { name: 'Alex M.', total: 250 },
      { name: 'Jordan K.', total: 180 },
      { name: 'Sam W.', total: 120 },
      { name: 'Riley T.', total: 95 },
      { name: 'Casey D.', total: 75 },
    ],
  },
  a2: {
    id: 'a2', name: 'SoulWave', genre: 'Singer',
    bio: 'R&B soul with a modern twist. Vocals that heal. Writing songs from the heart, performing with everything I have.',
    followers: 8700, tipsEarned: 3200, eventsCount: 32, hourlyRate: 200, is_live: false,
    songs: [
      { title: 'Golden Hour', duration: '4:20' },
      { title: 'Velvet Dreams', duration: '3:58' },
      { title: 'Slow Burn', duration: '4:45' },
    ],
    upcomingEvents: [
      { id: '7', title: 'Jazz Under the Stars', date: '2026-06-05', venue: 'Skyline Rooftop' },
    ],
    topTippers: [
      { name: 'Taylor R.', total: 200 },
      { name: 'Morgan F.', total: 150 },
      { name: 'Quinn L.', total: 100 },
      { name: 'Drew P.', total: 80 },
      { name: 'Blake S.', total: 60 },
    ],
  },
  a3: {
    id: 'a3', name: 'Kai Rhythm', genre: 'Rapper',
    bio: 'ATL-born lyricist blending conscious bars with trap energy. Every verse tells a story.',
    followers: 23100, tipsEarned: 7800, eventsCount: 65, hourlyRate: 300, is_live: false,
    songs: [
      { title: 'City Lights', duration: '3:30' },
      { title: 'Crown Me', duration: '2:58' },
      { title: 'Rise Up', duration: '4:12' },
      { title: 'No Cap', duration: '3:15' },
      { title: 'Legacy', duration: '4:40' },
    ],
    upcomingEvents: [
      { id: '8', title: 'Hip Hop Showcase', date: '2026-06-10', venue: 'Warehouse 22' },
    ],
    topTippers: [
      { name: 'Chris B.', total: 500 },
      { name: 'Devon M.', total: 320 },
      { name: 'Avery W.', total: 210 },
      { name: 'Jamie N.', total: 180 },
      { name: 'Reese C.', total: 150 },
    ],
  },
  a4: {
    id: 'a4', name: 'Marcus Cole', genre: 'Band',
    bio: 'Four-piece funk and soul band. Bringing the groove back to live music with brass, bass, and big energy.',
    followers: 5300, tipsEarned: 2100, eventsCount: 28, hourlyRate: 500,
    is_live: true, streamId: 'stream-marcus-1',
    songs: [
      { title: 'Funk Machine', duration: '5:20' },
      { title: 'Soul Kitchen', duration: '4:30' },
      { title: 'Brass & Sass', duration: '3:55' },
    ],
    upcomingEvents: [],
    topTippers: [
      { name: 'Pat G.', total: 150 },
      { name: 'Robin H.', total: 120 },
      { name: 'Lee V.', total: 90 },
      { name: 'Dana K.', total: 70 },
      { name: 'Sky J.', total: 50 },
    ],
  },
  a5: {
    id: 'a5', name: 'Maya Blue', genre: 'Singer',
    bio: 'Indie-pop vocalist with jazzy undertones. Performing stripped-back sets that give you chills.',
    followers: 18600, tipsEarned: 5400, eventsCount: 41, hourlyRate: 175, is_live: false,
    songs: [
      { title: 'Blue Skies', duration: '3:45' },
      { title: 'Wanderlust', duration: '4:10' },
      { title: 'Paper Moon', duration: '3:28' },
      { title: 'Echo Chamber', duration: '4:55' },
    ],
    upcomingEvents: [
      { id: '7', title: 'Jazz Under the Stars', date: '2026-06-05', venue: 'Skyline Rooftop' },
    ],
    topTippers: [
      { name: 'Harper L.', total: 300 },
      { name: 'Emery T.', total: 250 },
      { name: 'Sage R.', total: 175 },
      { name: 'Finley W.', total: 130 },
      { name: 'Rowan A.', total: 100 },
    ],
  },
  a6: {
    id: 'a6', name: 'Lena Park', genre: 'Comedian',
    bio: 'Stand-up comedy that hits different. Observational humor meets storytelling. Your cheeks will hurt.',
    followers: 9200, tipsEarned: 2900, eventsCount: 53, hourlyRate: 125, is_live: false,
    songs: [
      { title: 'Opening Set - Relationships', duration: '12:00' },
      { title: 'Crowd Work Highlights', duration: '8:30' },
      { title: 'Closing Bit - Technology', duration: '10:15' },
    ],
    upcomingEvents: [
      { id: '2', title: 'Laugh Factory Live', date: '2026-05-18', venue: 'Skyline Rooftop' },
    ],
    topTippers: [
      { name: 'Jules M.', total: 180 },
      { name: 'Ari P.', total: 140 },
      { name: 'Parker D.', total: 110 },
      { name: 'Eden F.', total: 85 },
      { name: 'River S.', total: 65 },
    ],
  },
  a7: {
    id: 'a7', name: 'Chef Kwame', genre: 'Producer',
    bio: 'Cooking beats in the lab. Genre-bending production from lo-fi to house. Collaborations welcome.',
    followers: 6800, tipsEarned: 1800, eventsCount: 19, hourlyRate: 250, is_live: false,
    songs: [
      { title: 'Seasoned Beats', duration: '4:00' },
      { title: 'Low Heat', duration: '3:35' },
      { title: 'Simmer', duration: '5:12' },
    ],
    upcomingEvents: [],
    topTippers: [
      { name: 'Kai L.', total: 120 },
      { name: 'Nova B.', total: 95 },
      { name: 'Zion M.', total: 80 },
      { name: 'Indie R.', total: 60 },
      { name: 'Storm W.', total: 45 },
    ],
  },
  a8: {
    id: 'a8', name: 'DJ Spice', genre: 'DJ',
    bio: 'Queen of the decks. Afrobeats, amapiano, and dancehall fusion. Every set is a passport to the world.',
    followers: 31500, tipsEarned: 9200, eventsCount: 82, hourlyRate: 350,
    is_live: true, streamId: 'stream-spice-1',
    songs: [
      { title: 'Spice Route', duration: '4:30' },
      { title: 'Lagos Nights', duration: '5:10' },
      { title: 'Pepper Dem', duration: '3:48' },
      { title: 'Island Bounce', duration: '4:22' },
    ],
    upcomingEvents: [
      { id: '1', title: 'Midnight Groove', date: '2026-05-15', venue: 'The Velvet Room' },
      { id: '6', title: 'Summer Vibes Festival', date: '2026-06-01', venue: 'The Grand Hall' },
    ],
    topTippers: [
      { name: 'Phoenix A.', total: 600 },
      { name: 'Milan J.', total: 420 },
      { name: 'Remy C.', total: 310 },
      { name: 'Nico T.', total: 250 },
      { name: 'Lennox D.', total: 180 },
    ],
  },
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const ARTIST_IDS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];

export default function ArtistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const artist = MOCK_ARTISTS[id];

  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState('');
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipConfirmed, setTipConfirmed] = useState(false);

  if (!artist) {
    return (
      <div className="p-4 text-center">
        <p className="text-text-secondary">Artist not found.</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const colorIndex = ARTIST_IDS.indexOf(id) % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[colorIndex];
  const tipAmount = selectedTip ?? (customTip ? parseFloat(customTip) : 0);

  const handleSendTip = () => {
    if (tipAmount > 0) {
      setShowTipModal(true);
    }
  };

  const confirmTip = async () => {
    try {
      const res = await fetch('/api/stripe/create-tip-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: artist.id,
          amount: Math.round(tipAmount * 100), // cents
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
        }, 1500);
      } else {
        toast.error(data.error || 'Tip failed');
      }
    } catch {
      toast.error('Failed to send tip');
    }
  };

  return (
    <div className="pb-4">
      {/* Header with gradient */}
      <div
        className="relative h-44 flex items-end p-4"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}66, #0F0F13)` }}
      >
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>

      {/* Avatar + Name */}
      <div className="px-4 -mt-10 mb-4">
        <div className="flex items-end gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-display font-bold text-2xl border-4 border-bg shrink-0"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
          >
            {getInitials(artist.name)}
          </div>
          <div className="pb-1 min-w-0">
            <h1 className="font-display font-bold text-xl">{artist.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="orange">{artist.genre}</Badge>
              {artist.is_live && (
                <Badge variant="error" className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-dot" />
                  LIVE
                </Badge>
              )}
            </div>
          </div>
        </div>
        <p className="text-text-secondary text-sm mt-3 leading-relaxed">{artist.bio}</p>
      </div>

      {/* Stats Row */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <div className="bg-surface border border-border rounded-2xl p-3 flex-1 text-center">
            <div className="font-display font-bold text-lg text-orange">{formatCompactNumber(artist.followers)}</div>
            <div className="text-[11px] text-text-muted mt-0.5">Followers</div>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-3 flex-1 text-center">
            <div className="font-display font-bold text-lg text-teal">{formatCurrency(artist.tipsEarned)}</div>
            <div className="text-[11px] text-text-muted mt-0.5">Tips Earned</div>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-3 flex-1 text-center">
            <div className="font-display font-bold text-lg">{artist.eventsCount}</div>
            <div className="text-[11px] text-text-muted mt-0.5">Events</div>
          </div>
        </div>
      </div>

      {/* Follow Button */}
      <div className="px-4 mb-4">
        <Button
          variant={isFollowing ? 'teal' : 'outline'}
          fullWidth
          onClick={() => setIsFollowing(!isFollowing)}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>

      {/* Live Now Banner */}
      {artist.is_live && artist.streamId && (
        <div className="px-4 mb-4">
          <div className="bg-error/10 border border-error/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                <span className="w-3 h-3 bg-error rounded-full animate-pulse-dot" />
              </div>
              <div>
                <p className="font-semibold text-sm">Live Now</p>
                <p className="text-text-secondary text-xs">Streaming right now</p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => router.push(`/live/${artist.streamId}`)}
            >
              Watch
            </Button>
          </div>
        </div>
      )}

      {/* Tip Section */}
      <div className="px-4 mb-6">
        <h3 className="font-display font-semibold text-base mb-3">Send a Tip</h3>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex gap-2 mb-3">
            {TIP_PRESETS.map(amount => (
              <button
                key={amount}
                onClick={() => { setSelectedTip(amount); setCustomTip(''); }}
                className={`
                  flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${selectedTip === amount
                    ? 'bg-orange text-white shadow-[0_0_12px_rgba(255,107,53,0.3)]'
                    : 'bg-surface-alt border border-border text-text-secondary hover:border-border-light'
                  }
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
              value={customTip}
              onChange={(e) => { setCustomTip(e.target.value); setSelectedTip(null); }}
              icon={
                <span className="text-text-muted text-sm font-semibold">$</span>
              }
            />
          </div>
          <Button
            variant="primary"
            fullWidth
            disabled={tipAmount <= 0}
            onClick={handleSendTip}
          >
            Send Tip {tipAmount > 0 ? formatCurrency(tipAmount) : ''}
          </Button>
        </div>
      </div>

      {/* Tip Confirmation Modal */}
      <Modal open={showTipModal} onClose={() => setShowTipModal(false)} title="Confirm Tip">
        {tipConfirmed ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-display font-bold text-lg">Tip Sent!</p>
            <p className="text-text-secondary text-sm mt-1">{formatCurrency(tipAmount)} to {artist.name}</p>
          </div>
        ) : (
          <div>
            <div className="text-center mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-display font-bold text-lg mx-auto mb-2"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
              >
                {getInitials(artist.name)}
              </div>
              <p className="text-text-secondary text-sm">Sending tip to</p>
              <p className="font-display font-bold text-lg">{artist.name}</p>
            </div>
            <div className="bg-surface-alt rounded-xl p-4 text-center mb-4">
              <p className="font-display font-bold text-3xl text-orange">{formatCurrency(tipAmount)}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowTipModal(false)}>Cancel</Button>
              <Button variant="primary" fullWidth onClick={confirmTip}>Confirm</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Songs / Tracks */}
      <div className="px-4 mb-6">
        <h3 className="font-display font-semibold text-base mb-3">
          {artist.genre === 'Comedian' ? 'Sets' : 'Tracks'}
        </h3>
        <div className="flex flex-col gap-2">
          {artist.songs.map((song, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3 hover:border-border-light transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-surface-alt flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-orange ml-0.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{song.title}</p>
              </div>
              <span className="text-text-muted text-xs shrink-0">{song.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      {artist.upcomingEvents.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="font-display font-semibold text-base mb-3">Upcoming Events</h3>
          <div className="flex flex-col gap-2">
            {artist.upcomingEvents.map(event => (
              <Card
                key={event.id}
                hoverable
                onClick={() => router.push(`/events/${event.id}`)}
                className="p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{event.title}</p>
                    <p className="text-text-secondary text-xs mt-0.5">
                      {formatDate(event.date)} &middot; {event.venue}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Top Tippers */}
      <div className="px-4 mb-6">
        <h3 className="font-display font-semibold text-base mb-3">Top Tippers</h3>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {artist.topTippers.map((tipper, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 ${i < artist.topTippers.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${i === 0 ? 'bg-warning/20 text-warning' : i === 1 ? 'bg-text-muted/20 text-text-secondary' : i === 2 ? 'bg-orange/20 text-orange' : 'bg-surface-alt text-text-muted'}
              `}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tipper.name}</p>
              </div>
              <span className="text-orange font-semibold text-sm">{formatCurrency(tipper.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
