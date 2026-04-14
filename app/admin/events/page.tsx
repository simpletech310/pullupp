'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type EventStatus = 'published' | 'draft' | 'cancelled' | 'flagged';

interface EventItem {
  id: string;
  name: string;
  organizer: string;
  date: string;
  category: string;
  ticketsSold: number;
  revenue: number;
  status: EventStatus;
}

const STATUS_BADGE: Record<EventStatus, { variant: 'success' | 'default' | 'error' | 'warning'; label: string }> = {
  published: { variant: 'success', label: 'Published' },
  draft: { variant: 'default', label: 'Draft' },
  cancelled: { variant: 'error', label: 'Cancelled' },
  flagged: { variant: 'warning', label: 'Flagged' },
};

const MOCK_EVENTS: EventItem[] = [
  { id: 'E001', name: 'Rooftop Jazz Night', organizer: 'Sarah Kim', date: 'Apr 15, 2026', category: 'Music', ticketsSold: 142, revenue: 4260, status: 'published' },
  { id: 'E002', name: 'Underground Beats', organizer: 'Sarah Kim', date: 'Mar 28, 2026', category: 'Music', ticketsSold: 89, revenue: 2670, status: 'published' },
  { id: 'E003', name: 'Sunset Sessions Vol. 3', organizer: 'Sarah Kim', date: 'Apr 22, 2026', category: 'Music', ticketsSold: 0, revenue: 0, status: 'draft' },
  { id: 'E004', name: 'Latin Heat Friday', organizer: 'Mia Rodriguez', date: 'Apr 18, 2026', category: 'Dance', ticketsSold: 210, revenue: 6300, status: 'published' },
  { id: 'E005', name: 'Beach Bonfire Bash', organizer: 'Derek Stone', date: 'Apr 5, 2026', category: 'Social', ticketsSold: 45, revenue: 900, status: 'cancelled' },
  { id: 'E006', name: 'Warehouse Rave', organizer: 'Derek Stone', date: 'Feb 14, 2026', category: 'Music', ticketsSold: 320, revenue: 9600, status: 'flagged' },
  { id: 'E007', name: 'Acoustic Brunch', organizer: 'Mia Rodriguez', date: 'Apr 20, 2026', category: 'Music', ticketsSold: 55, revenue: 1375, status: 'published' },
  { id: 'E008', name: 'Art After Dark', organizer: 'Sarah Kim', date: 'May 1, 2026', category: 'Art', ticketsSold: 0, revenue: 0, status: 'draft' },
  { id: 'E009', name: 'Comedy Night Live', organizer: 'Mia Rodriguez', date: 'Apr 25, 2026', category: 'Comedy', ticketsSold: 178, revenue: 3560, status: 'published' },
  { id: 'E010', name: 'Midnight Glow Party', organizer: 'Derek Stone', date: 'Mar 15, 2026', category: 'Music', ticketsSold: 250, revenue: 7500, status: 'flagged' },
];

export default function AdminEventsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [events, setEvents] = useState(MOCK_EVENTS);

  const filtered = events.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.organizer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (id: string, newStatus: EventStatus) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
  };

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="font-headline font-bold text-2xl mb-6">Event Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search events..."
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
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-container border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface font-body focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Event</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Organizer</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Category</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Tickets</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Revenue</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-outline uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event, i) => (
                <tr
                  key={event.id}
                  className={`border-b border-white/5 last:border-0 hover:bg-surface-container-high transition-colors ${
                    i % 2 === 1 ? 'bg-surface-container-high/30' : ''
                  } ${event.status === 'flagged' ? 'border-l-2 border-l-primary-container' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-on-surface">{event.name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-on-surface-variant">{event.organizer}</td>
                  <td className="px-5 py-3.5 text-on-surface-variant">{event.date}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="default">{event.category}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right text-on-surface font-medium">{event.ticketsSold}</td>
                  <td className="px-5 py-3.5 text-right text-on-surface font-medium">${event.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_BADGE[event.status].variant}>{STATUS_BADGE[event.status].label}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost">View</Button>
                      {event.status !== 'flagged' && (
                        <Button size="sm" variant="secondary" onClick={() => updateStatus(event.id, 'flagged')}>Flag</Button>
                      )}
                      {event.status !== 'cancelled' && (
                        <Button size="sm" variant="danger" onClick={() => updateStatus(event.id, 'cancelled')}>Cancel</Button>
                      )}
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
