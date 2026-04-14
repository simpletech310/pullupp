'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type VenueStatus = 'active' | 'inactive' | 'flagged';

interface Venue {
  id: string;
  name: string;
  owner: string;
  type: string;
  capacity: number;
  bookings: number;
  status: VenueStatus;
}

const STATUS_CONFIG: Record<VenueStatus, { variant: 'success' | 'default' | 'warning'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'default', label: 'Inactive' },
  flagged: { variant: 'warning', label: 'Flagged' },
};

const MOCK_VENUES: Venue[] = [
  { id: 'V001', name: 'The Velvet Room', owner: 'Alex Williams', type: 'Lounge', capacity: 200, bookings: 34, status: 'active' },
  { id: 'V002', name: 'Skyline Terrace', owner: 'Naomi Chen', type: 'Rooftop', capacity: 150, bookings: 22, status: 'active' },
  { id: 'V003', name: 'The Basement', owner: 'Rick Torres', type: 'Club', capacity: 300, bookings: 48, status: 'active' },
  { id: 'V004', name: 'Harmony Hall', owner: 'Lisa Park', type: 'Concert Hall', capacity: 500, bookings: 15, status: 'inactive' },
  { id: 'V005', name: 'Sunset Pier', owner: 'Carlos Rivera', type: 'Outdoor', capacity: 400, bookings: 9, status: 'flagged' },
  { id: 'V006', name: 'Studio 54 Reborn', owner: 'Dana White', type: 'Club', capacity: 250, bookings: 31, status: 'active' },
];

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState(MOCK_VENUES);

  const updateStatus = (id: string, newStatus: VenueStatus) => {
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v)));
  };

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="font-display font-bold text-2xl mb-6">Venue Management</h1>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Venue</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Owner</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Type</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Capacity</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Bookings</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((venue, i) => (
                <tr
                  key={venue.id}
                  className={`border-b border-border last:border-0 hover:bg-surface-hover transition-colors ${
                    i % 2 === 1 ? 'bg-surface-alt/30' : ''
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-text-primary">{venue.name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">{venue.owner}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="default">{venue.type}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right text-text-primary">{venue.capacity}</td>
                  <td className="px-5 py-3.5 text-right text-text-primary font-medium">{venue.bookings}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_CONFIG[venue.status].variant}>{STATUS_CONFIG[venue.status].label}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {venue.status === 'inactive' && (
                        <Button size="sm" variant="teal" onClick={() => updateStatus(venue.id, 'active')}>Approve</Button>
                      )}
                      {venue.status !== 'flagged' && (
                        <Button size="sm" variant="secondary" onClick={() => updateStatus(venue.id, 'flagged')}>Flag</Button>
                      )}
                      {venue.status === 'active' && (
                        <Button size="sm" variant="danger" onClick={() => updateStatus(venue.id, 'inactive')}>Deactivate</Button>
                      )}
                      {venue.status === 'flagged' && (
                        <Button size="sm" variant="teal" onClick={() => updateStatus(venue.id, 'active')}>Approve</Button>
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
