'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EVENT_GRADIENTS } from '@/lib/utils/constants';
import { formatCompactNumber } from '@/lib/utils/format';

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  gradientIndex: number;
}

const MOCK_GROUPS: Group[] = [
  {
    id: 'g1', name: 'ATL House Heads',
    description: 'For lovers of house music in the Atlanta area. Sharing events, mixes, and vibes.',
    category: 'Music', memberCount: 1240, gradientIndex: 0,
  },
  {
    id: 'g2', name: 'Comedy Night Crew',
    description: 'The community for stand-up comedy fans. Open mic nights, show reviews, and laughs.',
    category: 'Comedy', memberCount: 870, gradientIndex: 1,
  },
  {
    id: 'g3', name: 'Foodie Squad',
    description: 'Food festival enthusiasts unite! Reviews, pop-up alerts, and culinary adventures.',
    category: 'Food', memberCount: 2100, gradientIndex: 3,
  },
  {
    id: 'g4', name: 'Art Collective',
    description: 'Connecting visual artists, galleries, and art lovers. Exhibitions, workshops, and collabs.',
    category: 'Art', memberCount: 560, gradientIndex: 2,
  },
  {
    id: 'g5', name: 'Tech Networkers',
    description: 'Atlanta tech professionals networking and sharing industry events and opportunities.',
    category: 'Networking', memberCount: 3400, gradientIndex: 4,
  },
  {
    id: 'g6', name: 'Live Music Lovers',
    description: 'Never miss a live show again. Sharing concert announcements, reviews, and meet-ups.',
    category: 'Music', memberCount: 4200, gradientIndex: 5,
  },
];

const CATEGORY_BADGES: Record<string, 'orange' | 'teal' | 'purple' | 'warning' | 'default'> = {
  Music: 'orange',
  Comedy: 'teal',
  Food: 'warning',
  Art: 'purple',
  Networking: 'default',
};

export default function GroupsPage() {
  const [search, setSearch] = useState('');
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());

  const filtered = search
    ? MOCK_GROUPS.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.category.toLowerCase().includes(search.toLowerCase())
      )
    : MOCK_GROUPS;

  const toggleJoin = (id: string) => {
    setJoinedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="font-display font-bold text-xl">Communities</h2>
        <p className="text-text-secondary text-sm">Find your people</p>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <Input
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          }
        />
      </div>

      {/* Groups Grid */}
      <div className="px-4 grid grid-cols-1 gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-sm">No communities found</p>
            <p className="text-text-muted text-xs mt-1">Try a different search</p>
          </div>
        ) : (
          filtered.map(group => {
            const isJoined = joinedGroups.has(group.id);
            const badgeVariant = CATEGORY_BADGES[group.category] ?? 'default';

            return (
              <div
                key={group.id}
                className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-border-light transition-colors"
              >
                {/* Gradient Strip */}
                <div
                  className="h-16"
                  style={{ background: EVENT_GRADIENTS[group.gradientIndex % EVENT_GRADIENTS.length] }}
                />

                {/* Content */}
                <div className="p-4 -mt-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-sm">{group.name}</h3>
                      <p className="text-text-secondary text-xs mt-1 line-clamp-2 leading-relaxed">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={badgeVariant}>{group.category}</Badge>
                      <span className="text-text-muted text-xs">
                        {formatCompactNumber(group.memberCount)} members
                      </span>
                    </div>
                    <Button
                      variant={isJoined ? 'teal' : 'outline'}
                      size="sm"
                      onClick={() => toggleJoin(group.id)}
                    >
                      {isJoined ? 'Joined' : 'Join'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
