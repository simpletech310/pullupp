'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Role = 'guest' | 'organizer' | 'venue_owner' | 'artist';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  joined: string;
  status: 'active' | 'banned';
  eventsAttended: number;
  tipsSent: number;
  bookingsMade: number;
  // organizer
  eventsCreated?: { name: string; date: string; status: string }[];
  // artist
  tipsReceived?: number;
  streamsCount?: number;
  // venue_owner
  venueName?: string;
  venueType?: string;
  venueCapacity?: number;
  bookingsReceived?: number;
}

const USERS_DB: Record<string, UserDetail> = {
  '1': { id: '1', name: 'Marcus Johnson', email: 'marcus.j@email.com', avatar: 'MJ', role: 'guest', joined: 'Jan 15, 2026', status: 'active', eventsAttended: 12, tipsSent: 8, bookingsMade: 3 },
  '2': {
    id: '2', name: 'Sarah Kim', email: 'sarah.k@email.com', avatar: 'SK', role: 'organizer', joined: 'Feb 3, 2026', status: 'active', eventsAttended: 5, tipsSent: 2, bookingsMade: 0,
    eventsCreated: [
      { name: 'Rooftop Jazz Night', date: 'Apr 15, 2026', status: 'Published' },
      { name: 'Sunset Sessions Vol. 3', date: 'Apr 22, 2026', status: 'Draft' },
      { name: 'Underground Beats', date: 'Mar 28, 2026', status: 'Published' },
    ],
  },
  '3': { id: '3', name: 'DJ Nova', email: 'nova@djnova.com', avatar: 'DN', role: 'artist', joined: 'Dec 12, 2025', status: 'active', eventsAttended: 22, tipsSent: 0, bookingsMade: 0, tipsReceived: 1250, streamsCount: 45 },
  '4': { id: '4', name: 'Alex Williams', email: 'alex.w@email.com', avatar: 'AW', role: 'venue_owner', joined: 'Nov 28, 2025', status: 'active', eventsAttended: 3, tipsSent: 5, bookingsMade: 0, venueName: 'The Velvet Room', venueType: 'Lounge', venueCapacity: 200, bookingsReceived: 34 },
  '5': { id: '5', name: 'Luna Keys', email: 'luna@keys.com', avatar: 'LK', role: 'artist', joined: 'Jan 8, 2026', status: 'active', eventsAttended: 18, tipsSent: 0, bookingsMade: 0, tipsReceived: 890, streamsCount: 32 },
  '6': { id: '6', name: 'Jordan Patel', email: 'jordan.p@email.com', avatar: 'JP', role: 'guest', joined: 'Mar 2, 2026', status: 'banned', eventsAttended: 1, tipsSent: 0, bookingsMade: 0 },
  '7': {
    id: '7', name: 'Mia Rodriguez', email: 'mia.r@email.com', avatar: 'MR', role: 'organizer', joined: 'Oct 15, 2025', status: 'active', eventsAttended: 9, tipsSent: 12, bookingsMade: 4,
    eventsCreated: [
      { name: 'Latin Heat Friday', date: 'Apr 18, 2026', status: 'Published' },
      { name: 'Salsa Under the Stars', date: 'May 2, 2026', status: 'Draft' },
    ],
  },
  '8': { id: '8', name: 'Tyler Brooks', email: 'tyler.b@email.com', avatar: 'TB', role: 'guest', joined: 'Feb 18, 2026', status: 'active', eventsAttended: 6, tipsSent: 3, bookingsMade: 1 },
  '9': { id: '9', name: 'Naomi Chen', email: 'naomi.c@email.com', avatar: 'NC', role: 'venue_owner', joined: 'Sep 5, 2025', status: 'active', eventsAttended: 2, tipsSent: 1, bookingsMade: 0, venueName: 'Skyline Terrace', venueType: 'Rooftop', venueCapacity: 150, bookingsReceived: 22 },
  '10': { id: '10', name: 'Beats By Ray', email: 'ray@beatsbyray.com', avatar: 'BR', role: 'artist', joined: 'Jan 22, 2026', status: 'active', eventsAttended: 15, tipsSent: 0, bookingsMade: 0, tipsReceived: 620, streamsCount: 19 },
  '11': { id: '11', name: 'Olivia Grant', email: 'olivia.g@email.com', avatar: 'OG', role: 'guest', joined: 'Mar 10, 2026', status: 'active', eventsAttended: 4, tipsSent: 7, bookingsMade: 2 },
  '12': {
    id: '12', name: 'Derek Stone', email: 'derek.s@email.com', avatar: 'DS', role: 'organizer', joined: 'Nov 3, 2025', status: 'banned', eventsAttended: 3, tipsSent: 0, bookingsMade: 1,
    eventsCreated: [
      { name: 'Warehouse Rave', date: 'Feb 14, 2026', status: 'Cancelled' },
    ],
  },
};

const AUDIT_LOG = [
  { action: 'Role changed to Organizer', admin: 'Admin TJ', time: 'Apr 10, 2026 3:22 PM' },
  { action: 'Account reviewed', admin: 'Admin TJ', time: 'Apr 8, 2026 11:05 AM' },
  { action: 'User flagged for review', admin: 'System', time: 'Apr 5, 2026 9:30 AM' },
  { action: 'Account created', admin: 'System', time: 'Jan 15, 2026 2:00 PM' },
];

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

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const userData = USERS_DB[id];

  const [user, setUser] = useState(userData || USERS_DB['1']);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleBan = () => {
    setUser((prev) => ({ ...prev, status: prev.status === 'active' ? 'banned' as const : 'active' as const }));
  };

  const changeRole = (newRole: Role) => {
    setUser((prev) => ({ ...prev, role: newRole }));
  };

  return (
    <div className="p-8 max-w-5xl">
      {/* Back button */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-outline hover:text-on-surface transition-colors mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        Back to Users
      </Link>

      <h1 className="font-headline font-bold text-2xl mb-6">{user.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div>
          <Card className="p-5">
            <div className="flex flex-col items-center text-center mb-5">
              <span className="w-16 h-16 rounded-full bg-primary-container/15 text-primary-container flex items-center justify-center text-xl font-bold mb-3">
                {user.avatar}
              </span>
              <h2 className="font-headline font-bold text-lg">{user.name}</h2>
              <p className="text-sm text-outline">{user.email}</p>
              <div className="mt-2">
                <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{ROLE_LABELS[user.role]}</Badge>
              </div>
            </div>
            <div className="space-y-3 text-sm border-t border-white/5 pt-4">
              <div className="flex justify-between">
                <span className="text-outline">Joined</span>
                <span className="text-on-surface">{user.joined}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Status</span>
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-success' : 'bg-error'}`} />
                  <span className="text-on-surface capitalize">{user.status}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">User ID</span>
                <span className="text-on-surface font-mono text-xs">#{user.id}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="font-headline font-bold text-xl text-primary-container">{user.eventsAttended}</div>
              <div className="text-xs text-outline mt-1">Events Attended</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="font-headline font-bold text-xl text-secondary-container">{user.tipsSent}</div>
              <div className="text-xs text-outline mt-1">Tips Sent</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="font-headline font-bold text-xl text-purple-400">{user.bookingsMade}</div>
              <div className="text-xs text-outline mt-1">Bookings Made</div>
            </Card>
          </div>

          {/* Role-specific content */}
          {user.role === 'organizer' && user.eventsCreated && (
            <Card className="p-5">
              <h3 className="font-headline font-bold text-base mb-4">Events Created</h3>
              <div className="space-y-2">
                {user.eventsCreated.map((event, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{event.name}</p>
                      <p className="text-xs text-outline">{event.date}</p>
                    </div>
                    <Badge variant={event.status === 'Published' ? 'success' : event.status === 'Draft' ? 'default' : 'error'}>
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {user.role === 'artist' && (
            <Card className="p-5">
              <h3 className="font-headline font-bold text-base mb-4">Artist Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-high rounded-xl p-4">
                  <div className="font-headline font-bold text-xl text-success">${user.tipsReceived?.toLocaleString()}</div>
                  <div className="text-xs text-outline mt-1">Tips Received</div>
                </div>
                <div className="bg-surface-container-high rounded-xl p-4">
                  <div className="font-headline font-bold text-xl text-secondary-container">{user.streamsCount}</div>
                  <div className="text-xs text-outline mt-1">Streams</div>
                </div>
              </div>
            </Card>
          )}

          {user.role === 'venue_owner' && (
            <Card className="p-5">
              <h3 className="font-headline font-bold text-base mb-4">Venue Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-outline">Venue Name</span>
                  <span className="text-on-surface font-medium">{user.venueName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-outline">Type</span>
                  <span className="text-on-surface">{user.venueType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-outline">Capacity</span>
                  <span className="text-on-surface">{user.venueCapacity}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-outline">Bookings Received</span>
                  <span className="text-on-surface font-semibold text-secondary-container">{user.bookingsReceived}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <Card className="p-5">
            <h3 className="font-headline font-bold text-base mb-4">Actions</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                variant={user.status === 'active' ? 'danger' : 'teal'}
                onClick={toggleBan}
              >
                {user.status === 'active' ? 'Ban User' : 'Unban User'}
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-outline">Change Role:</span>
                <select
                  value={user.role}
                  onChange={(e) => changeRole(e.target.value as Role)}
                  className="bg-surface-container border border-white/5 rounded-lg px-3 py-2 text-xs text-on-surface font-body focus:outline-none focus:border-primary-container transition-colors"
                >
                  <option value="guest">Guest</option>
                  <option value="organizer">Organizer</option>
                  <option value="venue_owner">Venue Owner</option>
                  <option value="artist">Artist</option>
                </select>
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </Button>
            </div>
            {showDeleteConfirm && (
              <div className="mt-4 p-4 bg-error/5 border border-error/20 rounded-xl">
                <p className="text-sm text-on-surface mb-3">Are you sure you want to delete this account? This action cannot be undone.</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="danger">Confirm Delete</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </Card>

          {/* Audit Log */}
          <Card className="p-5">
            <h3 className="font-headline font-bold text-base mb-4">Audit Log</h3>
            <div className="space-y-1">
              {AUDIT_LOG.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <span className="w-2 h-2 rounded-full bg-border-light shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-on-surface">{entry.action}</p>
                    <p className="text-xs text-outline">by {entry.admin}</p>
                  </div>
                  <span className="text-xs text-outline whitespace-nowrap">{entry.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
