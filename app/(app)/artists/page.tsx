'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h2 className="font-headline font-bold text-3xl tracking-tight text-on-surface">Artists</h2>
        <p className="text-on-surface-variant text-sm mt-1">Discover and book talent</p>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {GENRES.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`
              px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200
              ${selectedGenre === genre
                ? 'bg-primary-container text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                : 'bg-surface-container text-on-surface-variant'
              }
            `}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Artist Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filtered.map((artist) => {
          const colorIndex = MOCK_ARTISTS.indexOf(artist) % AVATAR_COLORS.length;
          const color = AVATAR_COLORS[colorIndex];

          return (
            <div
              key={artist.id}
              onClick={() => router.push(`/artists/${artist.id}`)}
              className="glass-card rounded-2xl overflow-hidden border border-white/5 cursor-pointer active:scale-[0.97] transition-transform"
            >
              {/* Banner area */}
              <div className="h-32 relative bg-gradient-to-br from-primary-container/40 to-secondary-container/40">
                {artist.is_live && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                    LIVE
                  </span>
                )}
              </div>

              {/* Avatar overlapping banner */}
              <div className="-mt-8 ml-4">
                <div
                  className="w-16 h-16 rounded-full border-2 border-background bg-surface-container-highest flex items-center justify-center text-white font-headline font-bold text-lg"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
                >
                  {getInitials(artist.name)}
                </div>
              </div>

              {/* Card content */}
              <div className="px-4 pt-2 pb-4 flex flex-col gap-1.5">
                <h3 className="font-headline font-bold text-base truncate text-on-surface">
                  {artist.name}
                </h3>

                <span className="self-start bg-primary-container/20 text-primary-container px-2.5 py-1 rounded-full text-xs font-bold uppercase">
                  {artist.genre}
                </span>

                <p className="text-xs text-on-surface-variant">
                  {formatCompactNumber(artist.followers)} followers
                </p>

                <p className="text-primary-container font-semibold text-sm">
                  {formatCurrency(artist.hourlyRate)}/hr
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
