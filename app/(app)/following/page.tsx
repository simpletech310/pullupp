'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AVATAR_COLORS } from '@/lib/utils/constants';
import { formatCompactNumber } from '@/lib/utils/format';

type Tab = 'artists' | 'venues';

interface FollowedArtist {
  id: string;
  name: string;
  genre: string;
  followers: number;
  colorIndex: number;
}

interface FollowedVenue {
  id: string;
  name: string;
  type: string;
  location: string;
  colorIndex: number;
}

const INITIAL_ARTISTS: FollowedArtist[] = [
  { id: 'a1', name: 'DJ Nova', genre: 'DJ', followers: 12400, colorIndex: 0 },
  { id: 'a3', name: 'Kai Rhythm', genre: 'Rapper', followers: 23100, colorIndex: 2 },
  { id: 'a5', name: 'Maya Blue', genre: 'Singer', followers: 18600, colorIndex: 4 },
  { id: 'a8', name: 'DJ Spice', genre: 'DJ', followers: 31500, colorIndex: 7 },
  { id: 'a6', name: 'Lena Park', genre: 'Comedian', followers: 9200, colorIndex: 5 },
];

const INITIAL_VENUES: FollowedVenue[] = [
  { id: 'v1', name: 'The Velvet Room', type: 'Nightclub', location: 'Atlanta, GA', colorIndex: 1 },
  { id: 'v2', name: 'Skyline Rooftop', type: 'Rooftop Bar', location: 'Atlanta, GA', colorIndex: 3 },
  { id: 'v3', name: 'Warehouse 22', type: 'Event Space', location: 'Atlanta, GA', colorIndex: 6 },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function FollowingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('artists');
  const [followedArtists, setFollowedArtists] = useState<Set<string>>(new Set(INITIAL_ARTISTS.map(a => a.id)));
  const [followedVenues, setFollowedVenues] = useState<Set<string>>(new Set(INITIAL_VENUES.map(v => v.id)));

  const toggleArtistFollow = (id: string) => {
    setFollowedArtists(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleVenueFollow = (id: string) => {
    setFollowedVenues(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="font-display font-bold text-xl">Following</h2>
      </div>

      {/* Tab Bar */}
      <div className="px-4 mb-4">
        <div className="flex bg-surface border border-border rounded-xl p-1">
          {(['artists', 'venues'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 capitalize
                ${activeTab === tab
                  ? 'bg-orange text-white shadow-[0_0_12px_rgba(255,107,53,0.2)]'
                  : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Artists Tab */}
      {activeTab === 'artists' && (
        <div className="px-4">
          {INITIAL_ARTISTS.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                  <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <p className="text-text-secondary text-sm">No artists followed yet</p>
              <p className="text-text-muted text-xs mt-1">Discover artists to follow</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {INITIAL_ARTISTS.map(artist => {
                const isFollowing = followedArtists.has(artist.id);
                const color = AVATAR_COLORS[artist.colorIndex % AVATAR_COLORS.length];

                return (
                  <div
                    key={artist.id}
                    className="bg-surface border border-border rounded-2xl p-3.5 flex items-center gap-3"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-display font-bold text-sm shrink-0 cursor-pointer"
                      style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
                      onClick={() => router.push(`/artists/${artist.id}`)}
                    >
                      {getInitials(artist.name)}
                    </div>
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => router.push(`/artists/${artist.id}`)}
                    >
                      <p className="font-semibold text-sm truncate">{artist.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="default" className="text-[10px]">{artist.genre}</Badge>
                        <span className="text-text-muted text-xs">{formatCompactNumber(artist.followers)} followers</span>
                      </div>
                    </div>
                    <Button
                      variant={isFollowing ? 'teal' : 'outline'}
                      size="sm"
                      onClick={() => toggleArtistFollow(artist.id)}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Venues Tab */}
      {activeTab === 'venues' && (
        <div className="px-4">
          {INITIAL_VENUES.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <p className="text-text-secondary text-sm">No venues followed yet</p>
              <p className="text-text-muted text-xs mt-1">Explore venues to follow</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {INITIAL_VENUES.map(venue => {
                const isFollowing = followedVenues.has(venue.id);
                const color = AVATAR_COLORS[venue.colorIndex % AVATAR_COLORS.length];

                return (
                  <div
                    key={venue.id}
                    className="bg-surface border border-border rounded-2xl p-3.5 flex items-center gap-3"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
                      style={{ background: `linear-gradient(135deg, ${color}40, ${color}20)` }}
                      onClick={() => router.push(`/venues/${venue.id}`)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => router.push(`/venues/${venue.id}`)}
                    >
                      <p className="font-semibold text-sm truncate">{venue.name}</p>
                      <p className="text-text-muted text-xs mt-0.5">{venue.type} &middot; {venue.location}</p>
                    </div>
                    <Button
                      variant={isFollowing ? 'teal' : 'outline'}
                      size="sm"
                      onClick={() => toggleVenueFollow(venue.id)}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
