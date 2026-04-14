'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type TxType = 'ticket' | 'tip' | 'booking';
type TxStatus = 'completed' | 'pending' | 'refunded';

interface Transaction {
  id: string;
  type: TxType;
  from: string;
  to: string;
  amount: number;
  fee: number;
  date: string;
  status: TxStatus;
}

const TYPE_BADGE: Record<TxType, { variant: 'orange' | 'teal' | 'purple'; label: string }> = {
  ticket: { variant: 'orange', label: 'Ticket' },
  tip: { variant: 'teal', label: 'Tip' },
  booking: { variant: 'purple', label: 'Booking' },
};

const STATUS_BADGE: Record<TxStatus, { variant: 'success' | 'warning' | 'error'; label: string }> = {
  completed: { variant: 'success', label: 'Completed' },
  pending: { variant: 'warning', label: 'Pending' },
  refunded: { variant: 'error', label: 'Refunded' },
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TX001', type: 'ticket', from: 'Marcus Johnson', to: 'Rooftop Jazz Night', amount: 30, fee: 1.5, date: 'Apr 13, 2026', status: 'completed' },
  { id: 'TX002', type: 'tip', from: 'Marcus Johnson', to: 'DJ Nova', amount: 25, fee: 0, date: 'Apr 13, 2026', status: 'completed' },
  { id: 'TX003', type: 'ticket', from: 'Tyler Brooks', to: 'Latin Heat Friday', amount: 30, fee: 1.5, date: 'Apr 12, 2026', status: 'completed' },
  { id: 'TX004', type: 'booking', from: 'Sarah Kim', to: 'The Velvet Room', amount: 500, fee: 25, date: 'Apr 12, 2026', status: 'completed' },
  { id: 'TX005', type: 'tip', from: 'Olivia Grant', to: 'Luna Keys', amount: 10, fee: 0, date: 'Apr 12, 2026', status: 'completed' },
  { id: 'TX006', type: 'ticket', from: 'Jordan Patel', to: 'Underground Beats', amount: 30, fee: 1.5, date: 'Apr 11, 2026', status: 'refunded' },
  { id: 'TX007', type: 'booking', from: 'Mia Rodriguez', to: 'Skyline Terrace', amount: 350, fee: 17.5, date: 'Apr 11, 2026', status: 'pending' },
  { id: 'TX008', type: 'tip', from: 'Tyler Brooks', to: 'Vega Rhythm', amount: 50, fee: 0, date: 'Apr 11, 2026', status: 'completed' },
  { id: 'TX009', type: 'ticket', from: 'Olivia Grant', to: 'Comedy Night Live', amount: 20, fee: 1, date: 'Apr 10, 2026', status: 'completed' },
  { id: 'TX010', type: 'ticket', from: 'Marcus Johnson', to: 'Latin Heat Friday', amount: 30, fee: 1.5, date: 'Apr 10, 2026', status: 'completed' },
  { id: 'TX011', type: 'booking', from: 'Derek Stone', to: 'The Basement', amount: 800, fee: 40, date: 'Apr 9, 2026', status: 'completed' },
  { id: 'TX012', type: 'tip', from: 'Sarah Kim', to: 'Aria Sky', amount: 15, fee: 0, date: 'Apr 9, 2026', status: 'completed' },
  { id: 'TX013', type: 'ticket', from: 'Naomi Chen', to: 'Acoustic Brunch', amount: 25, fee: 1.25, date: 'Apr 8, 2026', status: 'completed' },
  { id: 'TX014', type: 'tip', from: 'Tyler Brooks', to: 'Midnight Pulse', amount: 20, fee: 0, date: 'Apr 8, 2026', status: 'completed' },
  { id: 'TX015', type: 'booking', from: 'Mia Rodriguez', to: 'Studio 54 Reborn', amount: 600, fee: 30, date: 'Apr 7, 2026', status: 'completed' },
  { id: 'TX016', type: 'ticket', from: 'Olivia Grant', to: 'Rooftop Jazz Night', amount: 30, fee: 1.5, date: 'Apr 7, 2026', status: 'pending' },
];

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'ticket', label: 'Tickets' },
  { key: 'tip', label: 'Tips' },
  { key: 'booking', label: 'Bookings' },
] as const;

export default function AdminTransactionsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [toastVisible, setToastVisible] = useState(false);

  const filtered = activeTab === 'all'
    ? MOCK_TRANSACTIONS
    : MOCK_TRANSACTIONS.filter((t) => t.type === activeTab);

  const totalRevenue = MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.fee, 0);

  const handleExport = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl">Transactions</h1>
        <Button size="sm" variant="secondary" onClick={handleExport}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </Button>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase tracking-wide mb-1">Total Volume</div>
          <div className="font-display font-bold text-xl text-text-primary">${totalRevenue.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase tracking-wide mb-1">Platform Fees</div>
          <div className="font-display font-bold text-xl text-teal">${totalFees.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase tracking-wide mb-1">Transactions</div>
          <div className="font-display font-bold text-xl text-orange">{MOCK_TRANSACTIONS.length}</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface border border-border rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'bg-orange text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">ID</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">From</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">To</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Amount</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Fee</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, i) => (
                <tr
                  key={tx.id}
                  className={`border-b border-border last:border-0 hover:bg-surface-hover transition-colors ${
                    i % 2 === 1 ? 'bg-surface-alt/30' : ''
                  }`}
                >
                  <td className="px-5 py-3.5 text-text-muted font-mono text-xs">{tx.id}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={TYPE_BADGE[tx.type].variant}>{TYPE_BADGE[tx.type].label}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-text-primary">{tx.from}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{tx.to}</td>
                  <td className="px-5 py-3.5 text-right text-text-primary font-medium">${tx.amount.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right text-text-muted">${tx.fee.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{tx.date}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_BADGE[tx.status].variant}>{STATUS_BADGE[tx.status].label}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Toast */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 bg-surface border border-border rounded-xl px-5 py-3 shadow-lg flex items-center gap-3 animate-slide-up z-50">
          <span className="w-5 h-5 rounded-full bg-success/15 text-success flex items-center justify-center text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="text-sm text-text-primary">CSV export started (mock)</span>
        </div>
      )}
    </div>
  );
}
