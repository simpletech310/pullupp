'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { createClient } from '@/lib/supabase/client';
import { checkInTicket, bulkCheckInTickets } from '@/lib/supabase/mutations';
import { useAuthContext } from '@/providers/auth-provider';

// ── Types ──
type Tab = 'scanner' | 'guestlist' | 'history';
type Tier = string;
type ScanResult = 'valid' | 'invalid' | 'used';

interface Attendee {
  id: string;
  name: string;
  email: string;
  confirmationCode: string;
  tier: string;
  checkedIn: boolean;
  isVIP: boolean;
}

interface HistoryEntry {
  id: string;
  name: string;
  tier: string;
  time: string;
  method: 'Scan' | 'Manual';
}

// ── Tier badge config ──
function tierBadgeVariant(tier: string): 'default' | 'orange' | 'teal' {
  const lower = tier.toLowerCase();
  if (lower.includes('vvip')) return 'teal';
  if (lower.includes('vip')) return 'orange';
  return 'default';
}

interface ScanResultData {
  status: ScanResult;
  name: string;
  tier: string;
  code: string;
}

export default function CheckInPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthContext();
  const eventId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>('scanner');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<Tier | 'All'>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);

  useEffect(() => {
    async function fetchAttendees() {
      const supabase = createClient();
      const { data: tickets } = await supabase
        .from('tickets')
        .select('id, qr_code, status, checked_in_at, user:profiles!user_id(name, email), tier:ticket_tiers!tier_id(name)')
        .eq('event_id', eventId);

      if (tickets) {
        setAttendees(tickets.map((t: any) => ({
          id: t.id,
          name: t.user?.name || 'Unknown',
          email: t.user?.email || '',
          confirmationCode: t.qr_code || t.id.slice(0, 8),
          tier: t.tier?.name || 'General',
          checkedIn: t.status === 'used',
          isVIP: (t.tier?.name || '').toLowerCase().includes('vip'),
        })));
      }
      setLoading(false);
    }
    fetchAttendees();
  }, [eventId]);

  // ── Stats ──
  const checkedInCount = attendees.filter(a => a.checkedIn).length;
  const totalCount = attendees.length;
  const progressPct = Math.round((checkedInCount / totalCount) * 100);

  // ── Guest list filtering ──
  const filteredAttendees = attendees.filter(a => {
    const matchesTier = tierFilter === 'All' || a.tier === tierFilter;
    const matchesSearch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase())
      || a.email.toLowerCase().includes(searchQuery.toLowerCase())
      || a.confirmationCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  // ── Handlers ──
  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkCheckIn() {
    setAttendees(prev => prev.map(a =>
      selectedIds.has(a.id) ? { ...a, checkedIn: true } : a
    ));
    setSelectedIds(new Set());
  }

  const simulateScan = useCallback(() => {
    setScanning(true);
    setTimeout(() => {
      const mockResults: ScanResultData[] = [
        { status: 'valid', name: 'Guest', tier: 'General', code: 'SCAN001' },
        { status: 'used', name: 'Guest', tier: 'VIP', code: 'SCAN002' },
        { status: 'invalid', name: '', tier: '', code: 'INVALID' },
      ];
      const result = mockResults[Math.floor(Math.random() * mockResults.length)];
      setScanResult(result);
      setShowScanModal(true);
      setScanning(false);
    }, 1500);
  }, []);

  // ── Tab buttons ──
  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'scanner',
      label: 'Scanner',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 6V1h-5M1 6V1h5M23 18v5h-5M1 18v5h5"/></svg>,
    },
    {
      key: 'guestlist',
      label: 'Guest List',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
    {
      key: 'history',
      label: 'History',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
  ];

  // ── Scanner Tab ──
  function ScannerTab() {
    return (
      <div className="px-4 flex flex-col items-center gap-6 animate-fade-in">
        {/* Scan area */}
        <div className="relative w-full aspect-square max-w-[300px] bg-surface-alt rounded-3xl overflow-hidden border border-border flex items-center justify-center">
          {/* Scan frame corners */}
          <div className="absolute inset-6">
            {/* Top-left corner */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange rounded-tl-lg" />
            {/* Top-right corner */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange rounded-tr-lg" />
            {/* Bottom-left corner */}
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-orange rounded-bl-lg" />
            {/* Bottom-right corner */}
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange rounded-br-lg" />
          </div>

          {/* Animated scan line */}
          {scanning && (
            <div
              className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-orange to-transparent"
              style={{
                animation: 'scan-line 2s linear infinite',
                boxShadow: '0 0 12px rgba(255, 107, 53, 0.5)',
              }}
            />
          )}

          {/* Center content */}
          <div className="flex flex-col items-center gap-2 z-10">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`text-text-muted ${scanning ? 'animate-pulse-dot' : ''}`}>
              <path d="M23 6V1h-5M1 6V1h5M23 18v5h-5M1 18v5h5" />
              <rect x="5" y="5" width="14" height="14" rx="1" strokeDasharray="3 3" />
            </svg>
            {!scanning && (
              <p className="text-text-muted text-xs">Position QR code in frame</p>
            )}
            {scanning && (
              <p className="text-orange text-xs font-semibold">Scanning...</p>
            )}
          </div>
        </div>

        <Button fullWidth size="lg" onClick={simulateScan} loading={scanning}>
          {scanning ? 'Scanning...' : 'Tap to Scan'}
        </Button>

        {/* Quick stats */}
        <div className="w-full grid grid-cols-3 gap-3">
          <div className="bg-surface border border-border rounded-2xl p-3 text-center">
            <div className="font-display font-bold text-xl text-orange">{checkedInCount}</div>
            <div className="text-[10px] text-text-muted mt-0.5">Checked In</div>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-3 text-center">
            <div className="font-display font-bold text-xl text-text-primary">{totalCount}</div>
            <div className="text-[10px] text-text-muted mt-0.5">Total</div>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-3 text-center">
            <div className="font-display font-bold text-xl text-teal">{totalCount - checkedInCount}</div>
            <div className="text-[10px] text-text-muted mt-0.5">Remaining</div>
          </div>
        </div>

        {/* Scan Result Modal */}
        <Modal open={showScanModal} onClose={() => setShowScanModal(false)} title="Scan Result">
          {scanResult && (
            <div className="flex flex-col items-center gap-4 py-4">
              {scanResult.status === 'valid' && (
                <>
                  <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-lg text-success">Valid Ticket</h3>
                  <p className="text-text-primary font-semibold">{scanResult.name}</p>
                  <Badge variant={tierBadgeVariant(scanResult.tier)}>{scanResult.tier}</Badge>
                </>
              )}
              {scanResult.status === 'invalid' && (
                <>
                  <div className="w-20 h-20 rounded-full bg-error/15 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-lg text-error">Invalid Ticket</h3>
                  <p className="text-text-secondary text-sm text-center">This ticket could not be verified. Please check the ticket and try again.</p>
                </>
              )}
              {scanResult.status === 'used' && (
                <>
                  <div className="w-20 h-20 rounded-full bg-warning/15 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-lg text-warning">Already Used</h3>
                  <p className="text-text-primary font-semibold">{scanResult.name}</p>
                  <p className="text-text-secondary text-sm">This ticket has already been used</p>
                </>
              )}
              <Button fullWidth variant="secondary" onClick={() => setShowScanModal(false)}>
                Dismiss
              </Button>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // ── Guest List Tab ──
  function GuestListTab() {
    return (
      <div className="px-4 flex flex-col gap-4 animate-fade-in">
        {/* Stats row */}
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">{checkedInCount} / {totalCount} checked in</span>
            <span className="text-xs text-orange font-semibold">{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange to-orange-light rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Tier filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {(['All', 'General', 'VIP', 'VVIP'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                tierFilter === t
                  ? 'bg-orange text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                  : 'bg-surface border border-border text-text-secondary hover:border-border-light'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <Input
          placeholder="Search by name, email, or code..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          }
        />

        {/* Attendee list */}
        <div className="flex flex-col gap-2">
          {filteredAttendees.map(attendee => (
            <div
              key={attendee.id}
              onClick={() => toggleSelect(attendee.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                selectedIds.has(attendee.id)
                  ? 'bg-orange/5 border-orange/30'
                  : 'bg-surface border-border hover:border-border-light'
              }`}
            >
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                attendee.checkedIn
                  ? 'bg-success border-success'
                  : selectedIds.has(attendee.id)
                    ? 'bg-orange border-orange'
                    : 'border-border-light'
              }`}>
                {(attendee.checkedIn || selectedIds.has(attendee.id)) && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">{attendee.name}</span>
                  {attendee.isVIP && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  )}
                </div>
                <p className="text-text-muted text-[11px] truncate">{attendee.email}</p>
                <p className="text-text-muted text-[10px] font-mono mt-0.5">{attendee.confirmationCode}</p>
              </div>

              {/* Tier badge */}
              <Badge variant={tierBadgeVariant(attendee.tier)}>{attendee.tier}</Badge>
            </div>
          ))}
        </div>

        {/* Bulk check-in floating button */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-20 left-0 right-0 z-20 px-4">
            <div className="max-w-[480px] mx-auto">
              <Button fullWidth size="lg" onClick={bulkCheckIn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Bulk Check-In ({selectedIds.size})
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── History Tab ──
  function HistoryTab() {
    const checkedIn = attendees.filter(a => a.checkedIn);
    return (
      <div className="px-4 flex flex-col gap-2 animate-fade-in">
        <p className="text-xs text-text-muted mb-1">{checkedIn.length} entries tonight</p>
        {checkedIn.length === 0 && (
          <p className="text-center text-text-muted py-8">No check-ins yet</p>
        )}
        {checkedIn.map(entry => (
          <div key={entry.id} className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3">
            <span className="text-text-muted text-xs font-mono shrink-0 w-16">Manual</span>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm">{entry.name}</span>
              <span className="text-text-muted text-sm"> - </span>
              <Badge variant={tierBadgeVariant(entry.tier)} className="inline-flex">{entry.tier}</Badge>
            </div>
            <Badge variant="teal">Checked In</Badge>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-surface-hover transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h2 className="font-display font-bold text-xl">Check-In</h2>
          <p className="text-text-secondary text-xs">Midnight Groove</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 px-4 pb-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-orange text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                : 'bg-surface border border-border text-text-secondary hover:border-border-light'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'scanner' && <ScannerTab />}
      {activeTab === 'guestlist' && <GuestListTab />}
      {activeTab === 'history' && <HistoryTab />}
    </div>
  );
}
