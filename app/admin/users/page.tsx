'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Role = 'guest' | 'organizer' | 'venue_owner' | 'artist';
type Status = 'active' | 'banned';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  joined: string;
  status: Status;
}

const ROLE_LABELS: Record<Role, string> = {
  guest: 'Guest',
  organizer: 'Organizer',
  venue_owner: 'Venue Owner',
  artist: 'Artist',
};

const ROLE_BADGE_VARIANT: Record<Role, 'default' | 'orange' | 'teal' | 'purple'> = {
  guest: 'default',
  organizer: 'orange',
  venue_owner: 'teal',
  artist: 'purple',
};

const MOCK_USERS: User[] = [
  { id: '1', name: 'Marcus Johnson', email: 'marcus.j@email.com', avatar: 'MJ', role: 'guest', joined: 'Jan 15, 2026', status: 'active' },
  { id: '2', name: 'Sarah Kim', email: 'sarah.k@email.com', avatar: 'SK', role: 'organizer', joined: 'Feb 3, 2026', status: 'active' },
  { id: '3', name: 'DJ Nova', email: 'nova@djnova.com', avatar: 'DN', role: 'artist', joined: 'Dec 12, 2025', status: 'active' },
  { id: '4', name: 'Alex Williams', email: 'alex.w@email.com', avatar: 'AW', role: 'venue_owner', joined: 'Nov 28, 2025', status: 'active' },
  { id: '5', name: 'Luna Keys', email: 'luna@keys.com', avatar: 'LK', role: 'artist', joined: 'Jan 8, 2026', status: 'active' },
  { id: '6', name: 'Jordan Patel', email: 'jordan.p@email.com', avatar: 'JP', role: 'guest', joined: 'Mar 2, 2026', status: 'banned' },
  { id: '7', name: 'Mia Rodriguez', email: 'mia.r@email.com', avatar: 'MR', role: 'organizer', joined: 'Oct 15, 2025', status: 'active' },
  { id: '8', name: 'Tyler Brooks', email: 'tyler.b@email.com', avatar: 'TB', role: 'guest', joined: 'Feb 18, 2026', status: 'active' },
  { id: '9', name: 'Naomi Chen', email: 'naomi.c@email.com', avatar: 'NC', role: 'venue_owner', joined: 'Sep 5, 2025', status: 'active' },
  { id: '10', name: 'Beats By Ray', email: 'ray@beatsbyray.com', avatar: 'BR', role: 'artist', joined: 'Jan 22, 2026', status: 'active' },
  { id: '11', name: 'Olivia Grant', email: 'olivia.g@email.com', avatar: 'OG', role: 'guest', joined: 'Mar 10, 2026', status: 'active' },
  { id: '12', name: 'Derek Stone', email: 'derek.s@email.com', avatar: 'DS', role: 'organizer', joined: 'Nov 3, 2025', status: 'banned' },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [users, setUsers] = useState(MOCK_USERS);
  const [page] = useState(1);

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleBan = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'banned' as Status : 'active' as Status } : u,
      ),
    );
  };

  const changeRole = (id: string, newRole: Role) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)),
    );
  };

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="font-display font-bold text-2xl mb-6">User Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-body focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-colors"
          >
            <option value="all">All Roles</option>
            <option value="guest">Guest</option>
            <option value="organizer">Organizer</option>
            <option value="venue_owner">Venue Owner</option>
            <option value="artist">Artist</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Joined</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-border last:border-0 hover:bg-surface-hover transition-colors ${
                    i % 2 === 1 ? 'bg-surface-alt/30' : ''
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <a href={`/admin/users/${user.id}`} className="flex items-center gap-3 hover:text-orange transition-colors">
                      <span className="w-8 h-8 rounded-full bg-orange/15 text-orange flex items-center justify-center text-xs font-bold shrink-0">
                        {user.avatar}
                      </span>
                      <span className="font-medium text-text-primary">{user.name}</span>
                    </a>
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">{user.joined}</td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-success' : 'bg-error'}`} />
                      <span className="text-text-secondary capitalize">{user.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant={user.status === 'active' ? 'danger' : 'secondary'}
                        onClick={() => toggleBan(user.id)}
                      >
                        {user.status === 'active' ? 'Ban' : 'Unban'}
                      </Button>
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user.id, e.target.value as Role)}
                        className="bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary font-body focus:outline-none focus:border-orange transition-colors"
                      >
                        <option value="guest">Guest</option>
                        <option value="organizer">Organizer</option>
                        <option value="venue_owner">Venue Owner</option>
                        <option value="artist">Artist</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <span className="text-sm text-text-muted">
            Showing {Math.min(filtered.length, (page - 1) * 10 + 1)}-{Math.min(filtered.length, page * 10)} of 50 users
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" disabled>Previous</Button>
            <Button size="sm" variant="secondary" className="!bg-orange/15 !text-orange">1</Button>
            <Button size="sm" variant="ghost">2</Button>
            <Button size="sm" variant="ghost">3</Button>
            <Button size="sm" variant="ghost">4</Button>
            <Button size="sm" variant="ghost">5</Button>
            <Button size="sm" variant="ghost">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
