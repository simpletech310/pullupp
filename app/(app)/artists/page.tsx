'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { AVATAR_COLORS } from '@/lib/utils/constants';
import { formatCompactNumber, formatCurrency } from '@/lib/utils/format';

const GENRES = ['All', 'DJ', 'Singer', 'Rapper', 'Band', 'Comedian', 'Producer'] as const;

const MOCK_ARTISTS = [
  { id: 'a1', name: 'DJ Nova', genre: 'DJ', followers: 12400, hourlyRate: 150, is_live: true },
  { id: 'a2', name: 'SoulWave', genre: 'Singer', followers: 8700, hourlyRate: 200, is_live: false },
  { id: 'a3', name: 'Kai Rhythm', genre: 'Rapper', followers: 23100, hourlyRate: 300, is_live: false },
  { id: 'a4', name: 'Marcus Cole', genre: 'Band', followers: 5300, hourlyRate: 500, is_live: true },
  { id: 'a5', name: 'Maya Blue', genre: 'Singer', followers: 18600, hourlyRate: 175, is_live: false },
  { id: 'a6', name: 'Lena Park', genre: 'Comedian', followers: 9200, hourlyRate: 125, is_live: false },
  { id: 'a7', name: 'Chef Kwame', genre: 'Producer', followers: 6800, hourlyRate: 250, is_live: false },
  { id: 'a8', name: 'DJ Spice', genre: 'DJ', followers: 31500, hourlyRate: 350, is_live: true },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function ArtistsPage() {
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const filtered = selectedGenre === 'All'
    ? MOCK_ARTISTS
    : MOCK_ARTISTS.filter(a => a.genre === selectedGenre);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="font-display font-bold text-xl">Artists</h2>
        <p className="text-text-secondary text-sm">Discover and book talent</p>
      </div>

      {/* Genre Filters */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {GENRES.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`
              px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200
              ${selectedGenre === genre
                ? 'bg-orange text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                : 'bg-surface border border-border text-text-secondary hover:border-border-light'
              }
            `}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Artist Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filtered.map((artist, i) => {
          const colorIndex = MOCK_ARTISTS.indexOf(artist) % AVATAR_COLORS.length;
          const color = AVATAR_COLORS[colorIndex];

          return (
            <div
              key={artist.id}
              onClick={() => router.push(`/artists/${artist.id}`)}
              className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer hover:border-border-light hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Avatar */}
              <div className="relative mb-3">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-display font-bold text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}99)`,
                  }}
                >
                  {getInitials(artist.name)}
                </div>
                {artist.is_live && (
                  <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-error px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-dot" />
                    <span className="text-[9px] font-bold text-white">LIVE</span>
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className="font-display font-bold text-sm mb-1 truncate w-full">{artist.name}</h3>

              {/* Genre Badge */}
              <Badge variant="default" className="mb-2 text-[10px]">{artist.genre}</Badge>

              {/* Followers */}
              <p className="text-text-muted text-xs mb-2">
                {formatCompactNumber(artist.followers)} followers
              </p>

              {/* Rate */}
              <p className="text-orange font-semibold text-sm">
                {formatCurrency(artist.hourlyRate)}/hr
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
