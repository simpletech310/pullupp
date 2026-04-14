'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [cameraActive, setCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const scannerRef = useRef<any>(null);
  const scannerDivId = 'qr-reader';

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

  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const handleQrCode = useCallback(async (decodedText: string) => {
    if (scanning) return; // prevent duplicate scans
    setScanning(true);
    await stopCamera();

    try {
      const res = await fetch(`/api/events/${eventId}/verify-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: decodedText }),
      });
      const json = await res.json();

      if (json.valid) {
        setScanResult({ status: 'valid', name: json.name, tier: json.tier, code: decodedText });
        // Update local attendee list
        setAttendees(prev => prev.map(a =>
          a.confirmationCode === decodedText ? { ...a, checkedIn: true } : a
        ));
      } else if (json.reason === 'already_used') {
        setScanResult({ status: 'used', name: json.name || '', tier: json.tier || '', code: decodedText });
      } else {
        setScanResult({ status: 'invalid', name: '', tier: '', code: decodedText });
      }
    } catch {
      setScanResult({ status: 'invalid', name: '', tier: '', code: decodedText });
    }

    setShowScanModal(true);
    setScanning(false);
  }, [scanning, eventId, stopCamera]);

  const startCamera = useCallback(async () => {
    const { Html5Qrcode } = await import('html5-qrcode');
    const scanner = new Html5Qrcode(scannerDivId);
    scannerRef.current = scanner;
    setCameraActive(true);

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        handleQrCode,
        () => {}, // ignore decode errors
      );
    } catch (err) {
      console.error('Camera error:', err);
      setCameraActive(false);
      scannerRef.current = null;
    }
  }, [handleQrCode]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  // ── Tab config ──
  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'scanner',
      label: 'Scanner',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 6V1h-5M1 6V1h5M23 18v5h-5M1 18v5h5"/>
        </svg>
      ),
    },
    {
      key: 'guestlist',
      label: 'Guest List',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      key: 'history',
      label: 'History',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
  ];

  // ── Scanner Tab ──
  function ScannerTab() {
    return (
      <div className="px-4 flex flex-col items-center gap-6 animate-fade-in">

        {/* Viewfinder */}
        <div className="relative w-[280px] h-[280px] bg-surface-container-high rounded-3xl overflow-hidden mx-auto">
          {/* Live camera (hidden when off) */}
          <div
            id={scannerDivId}
            className={`w-full h-full ${cameraActive ? 'block' : 'hidden'}`}
          />

          {/* Static placeholder */}
          {!cameraActive && (
            <>
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary-container rounded-tl-lg shadow-[0_0_10px_rgba(255,107,53,0.5)]" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary-container rounded-tr-lg shadow-[0_0_10px_rgba(255,107,53,0.5)]" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary-container rounded-bl-lg shadow-[0_0_10px_rgba(255,107,53,0.5)]" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary-container rounded-br-lg shadow-[0_0_10px_rgba(255,107,53,0.5)]" />

              {/* Center scan icon */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-outline flex items-center justify-center">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-outline">
                    <path d="M23 6V1h-5M1 6V1h5M23 18v5h-5M1 18v5h5"/>
                    <rect x="5" y="5" width="14" height="14" rx="1" strokeDasharray="3 3"/>
                  </svg>
                </div>
                <p className="text-outline text-xs">Tap to open camera</p>
              </div>
            </>
          )}

          {/* Animated scanner line (when camera active) */}
          {cameraActive && (
            <div className="scanner-line absolute left-0 right-0 h-0.5 animate-scanner z-10" />
          )}
        </div>

        {/* Camera button */}
        {cameraActive ? (
          <button
            onClick={stopCamera}
            disabled={scanning}
            className="w-full bg-surface-container-high text-on-surface py-4 rounded-2xl font-bold text-lg border border-white/10 disabled:opacity-50"
          >
            {scanning ? 'Verifying...' : 'Stop Camera'}
          </button>
        ) : (
          <button
            onClick={startCamera}
            className="w-full bg-primary-container text-white py-4 rounded-2xl font-bold text-lg shadow-[0_8px_24px_rgba(255,107,53,0.25)] mt-0 hover:opacity-90 transition-opacity active:scale-95"
          >
            Open Camera to Scan
          </button>
        )}

        {/* Stats row */}
        <div className="w-full grid grid-cols-3 gap-3">
          <div className="bg-surface-container-high rounded-2xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-primary-container font-headline">{checkedInCount}</div>
            <div className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-widest">Checked In</div>
          </div>
          <div className="bg-surface-container-high rounded-2xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-on-surface font-headline">{totalCount}</div>
            <div className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-widest">Total</div>
          </div>
          <div className="bg-surface-container-high rounded-2xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-secondary-container font-headline">{totalCount - checkedInCount}</div>
            <div className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-widest">Remaining</div>
          </div>
        </div>

        {/* ── Result Bottom Sheet Modal ── */}
        {showScanModal && scanResult && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Scrim */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setShowScanModal(false); setScanResult(null); }}
            />
            {/* Sheet */}
            <div className="relative bg-surface-container-highest rounded-t-[32px] p-8 pb-12 animate-slide-up">
              <div className="w-12 h-1 bg-outline-variant rounded-full mx-auto mb-8" />

              <div className="flex flex-col items-center gap-4">
                {/* Valid */}
                {scanResult.status === 'valid' && (
                  <>
                    <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center shadow-[0_0_32px_rgba(4,180,162,0.3)]">
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h3 className="font-headline font-bold text-3xl text-secondary-container">Valid Ticket</h3>
                    <div className="bg-surface-container rounded-2xl p-5 flex items-center gap-4 w-full">
                      <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center font-headline font-bold text-lg text-on-surface shrink-0">
                        {scanResult.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface truncate">{scanResult.name}</p>
                        <Badge variant={tierBadgeVariant(scanResult.tier)}>{scanResult.tier}</Badge>
                      </div>
                    </div>
                  </>
                )}

                {/* Invalid */}
                {scanResult.status === 'invalid' && (
                  <>
                    <div className="w-24 h-24 bg-error-container rounded-full flex items-center justify-center">
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-error-container">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                    <h3 className="font-headline font-bold text-3xl text-error">Invalid Ticket</h3>
                    <p className="text-on-surface-variant text-sm text-center">
                      This ticket could not be verified. Please check the ticket and try again.
                    </p>
                  </>
                )}

                {/* Already Used */}
                {scanResult.status === 'used' && (
                  <>
                    <div className="w-24 h-24 bg-error-container rounded-full flex items-center justify-center">
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-error-container">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <h3 className="font-headline font-bold text-3xl text-error">Already Used</h3>
                    {scanResult.name && (
                      <div className="bg-surface-container rounded-2xl p-5 flex items-center gap-4 w-full">
                        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center font-headline font-bold text-lg text-on-surface shrink-0">
                          {scanResult.name[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface truncate">{scanResult.name}</p>
                          <p className="text-xs text-on-surface-variant">Ticket already checked in</p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Scan Next */}
                <button
                  onClick={() => { setShowScanModal(false); setScanResult(null); }}
                  className="w-full bg-surface-container-low py-4 rounded-2xl font-bold text-lg text-on-surface mt-2 hover:bg-surface-container transition-colors"
                >
                  Scan Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Guest List Tab ──
  function GuestListTab() {
    return (
      <div className="px-4 flex flex-col gap-4 animate-fade-in">
        {/* Progress card */}
        <div className="bg-surface-container rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-on-surface">{checkedInCount} / {totalCount} checked in</span>
            <span className="text-xs text-primary-container font-bold">{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full kinetic-gradient rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Tier filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {(['All', 'General', 'VIP', 'VVIP'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                tierFilter === t
                  ? 'bg-primary-container text-white shadow-[0_0_12px_rgba(255,107,53,0.3)]'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
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
                  ? 'bg-primary-container/10 border-primary-container/30'
                  : 'bg-surface-container border-white/5 hover:border-white/10'
              }`}
            >
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                attendee.checkedIn
                  ? 'bg-secondary-container border-secondary-container'
                  : selectedIds.has(attendee.id)
                    ? 'bg-primary-container border-primary-container'
                    : 'border-outline'
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
                  <span className="font-bold text-sm text-on-surface truncate">{attendee.name}</span>
                  {attendee.isVIP && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  )}
                </div>
                <p className="text-on-surface-variant text-[11px] truncate">{attendee.email}</p>
                <p className="text-outline text-[10px] font-mono mt-0.5">{attendee.confirmationCode}</p>
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
              <button
                onClick={bulkCheckIn}
                className="w-full kinetic-gradient text-white py-4 rounded-2xl font-bold text-base shadow-[0_8px_24px_rgba(255,107,53,0.3)] flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Bulk Check-In ({selectedIds.size})
              </button>
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
        <p className="text-xs text-on-surface-variant mb-1">{checkedIn.length} entries tonight</p>
        {checkedIn.length === 0 && (
          <p className="text-center text-on-surface-variant py-8">No check-ins yet</p>
        )}
        {checkedIn.map(entry => (
          <div key={entry.id} className="flex items-center gap-3 bg-surface-container border border-white/5 rounded-xl p-3">
            <span className="text-on-surface-variant text-xs font-mono shrink-0 w-16">Manual</span>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-on-surface">{entry.name}</span>
              <span className="text-on-surface-variant text-sm"> · </span>
              <Badge variant={tierBadgeVariant(entry.tier)} className="inline-flex">{entry.tier}</Badge>
            </div>
            <Badge variant="teal">Checked In</Badge>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-4">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-white/5">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h2 className="font-headline font-bold text-xl text-on-surface">Check-In</h2>
          <p className="text-on-surface-variant text-xs">Manage guest entry</p>
        </div>
      </div>

      {/* ── Tab Strip ── */}
      <div className="flex gap-2 px-4 py-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-primary-container text-white shadow-[0_0_12px_rgba(255,107,53,0.3)]'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'scanner' && <ScannerTab />}
      {activeTab === 'guestlist' && <GuestListTab />}
      {activeTab === 'history' && <HistoryTab />}
    </div>
  );
}
