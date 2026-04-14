'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Artist {
  id: string;
  name: string;
  genre: string;
  followers: number;
  tipsEarned: number;
  streams: number;
  verified: boolean;
}

const MOCK_ARTISTS: Artist[] = [
  { id: 'A001', name: 'DJ Nova', genre: 'Electronic / House', followers: 4200, tipsEarned: 1250, streams: 45, verified: true },
  { id: 'A002', name: 'Luna Keys', genre: 'Jazz / Neo-Soul', followers: 3100, tipsEarned: 890, streams: 32, verified: true },
  { id: 'A003', name: 'Beats By Ray', genre: 'Hip-Hop / Trap', followers: 2800, tipsEarned: 620, streams: 19, verified: false },
  { id: 'A004', name: 'Solaris', genre: 'Ambient / Chill', followers: 1900, tipsEarned: 410, streams: 28, verified: true },
  { id: 'A005', name: 'Vega Rhythm', genre: 'Latin / Reggaeton', followers: 5600, tipsEarned: 1780, streams: 61, verified: true },
  { id: 'A006', name: 'Echo Chamber', genre: 'Indie / Alternative', followers: 1200, tipsEarned: 320, streams: 14, verified: false },
  { id: 'A007', name: 'Midnight Pulse', genre: 'Techno / Industrial', followers: 3400, tipsEarned: 950, streams: 38, verified: false },
  { id: 'A008', name: 'Aria Sky', genre: 'Pop / R&B', followers: 7800, tipsEarned: 2340, streams: 72, verified: true },
];

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState(MOCK_ARTISTS);

  const toggleVerified = (id: string) => {
    setArtists((prev) => prev.map((a) => (a.id === id ? { ...a, verified: !a.verified } : a)));
  };

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="font-headline font-bold text-2xl mb-6">Artist Management</h1>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Artist</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Genre</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Followers</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Tips Earned</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Streams</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Verified</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist, i) => (
                <tr
                  key={artist.id}
                  className={`border-b border-white/5 last:border-0 hover:bg-surface-container-high transition-colors ${
                    i % 2 === 1 ? 'bg-surface-container-high/30' : ''
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {artist.name.charAt(0)}
                      </span>
                      <span className="font-medium text-on-surface">{artist.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-on-surface-variant">{artist.genre}</td>
                  <td className="px-5 py-3.5 text-right text-on-surface">{artist.followers.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-on-surface font-medium">${artist.tipsEarned.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-on-surface">{artist.streams}</td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => toggleVerified(artist.id)}
                      className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                        artist.verified ? 'bg-secondary-container' : 'bg-border-light'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        artist.verified ? 'left-5' : 'left-0.5'
                      }`} />
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {!artist.verified ? (
                        <Button size="sm" variant="teal" onClick={() => toggleVerified(artist.id)}>Verify</Button>
                      ) : (
                        <Badge variant="teal">Verified</Badge>
                      )}
                      <Button size="sm" variant="secondary">Flag</Button>
                      <Button size="sm" variant="danger">Suspend</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
