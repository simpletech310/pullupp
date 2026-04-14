'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-on-surface">{label}</span>
      <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${
          enabled ? 'bg-secondary-container' : 'bg-border-light'
        }`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
          enabled ? 'left-[22px]' : 'left-0.5'
        }`} />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [serviceFee, setServiceFee] = useState('5');
  const [tipCut, setTipCut] = useState('0');
  const [maxTicketPrice, setMaxTicketPrice] = useState('500');
  const [maxTipAmount, setMaxTipAmount] = useState('200');
  const [maxEventCapacity, setMaxEventCapacity] = useState('5000');

  const [liveStreaming, setLiveStreaming] = useState(true);
  const [tipping, setTipping] = useState(true);
  const [groups, setGroups] = useState(true);
  const [directMessages, setDirectMessages] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleSave = () => {
    showToast('Settings saved successfully');
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-headline font-bold text-2xl mb-6">Platform Settings</h1>

      <div className="space-y-6">
        {/* Fees */}
        <Card className="p-5">
          <h2 className="font-headline font-bold text-base mb-4">Fees</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Service Fee %"
              type="number"
              value={serviceFee}
              onChange={(e) => setServiceFee(e.target.value)}
              min="0"
              max="100"
            />
            <Input
              label="Tip Platform Cut %"
              type="number"
              value={tipCut}
              onChange={(e) => setTipCut(e.target.value)}
              min="0"
              max="100"
            />
          </div>
        </Card>

        {/* Limits */}
        <Card className="p-5">
          <h2 className="font-headline font-bold text-base mb-4">Limits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Max Ticket Price ($)"
              type="number"
              value={maxTicketPrice}
              onChange={(e) => setMaxTicketPrice(e.target.value)}
              min="0"
            />
            <Input
              label="Max Tip Amount ($)"
              type="number"
              value={maxTipAmount}
              onChange={(e) => setMaxTipAmount(e.target.value)}
              min="0"
            />
            <Input
              label="Max Event Capacity"
              type="number"
              value={maxEventCapacity}
              onChange={(e) => setMaxEventCapacity(e.target.value)}
              min="0"
            />
          </div>
        </Card>

        {/* Features */}
        <Card className="p-5">
          <h2 className="font-headline font-bold text-base mb-4">Features</h2>
          <div className="divide-y divide-white/5">
            <Toggle label="Live Streaming" enabled={liveStreaming} onChange={() => setLiveStreaming(!liveStreaming)} />
            <Toggle label="Tipping" enabled={tipping} onChange={() => setTipping(!tipping)} />
            <Toggle label="Groups" enabled={groups} onChange={() => setGroups(!groups)} />
            <Toggle label="Direct Messages" enabled={directMessages} onChange={() => setDirectMessages(!directMessages)} />
          </div>
        </Card>

        {/* Maintenance */}
        <Card className="p-5">
          <h2 className="font-headline font-bold text-base mb-4">Maintenance</h2>
          <Toggle label="Maintenance Mode" enabled={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
          {maintenanceMode && (
            <div className="mt-3 p-3 bg-warning/5 border border-warning/20 rounded-xl">
              <p className="text-sm text-warning font-medium">Warning: Maintenance mode is active</p>
              <p className="text-xs text-outline mt-1">Users will see a maintenance page and cannot access the platform.</p>
            </div>
          )}
        </Card>

        {/* Danger Zone */}
        <Card className="p-5 border-error/30">
          <h2 className="font-headline font-bold text-base mb-1 text-error">Danger Zone</h2>
          <p className="text-xs text-outline mb-4">These actions are irreversible. Proceed with caution.</p>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant="danger" onClick={() => showToast('Cache cleared (mock)')}>
              Clear All Cache
            </Button>
            <Button size="sm" variant="danger" onClick={() => showToast('Analytics reset (mock)')}>
              Reset Analytics
            </Button>
          </div>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Toast */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 bg-surface-container border border-white/5 rounded-xl px-5 py-3 shadow-lg flex items-center gap-3 animate-slide-up z-50">
          <span className="w-5 h-5 rounded-full bg-success/15 text-success flex items-center justify-center text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="text-sm text-on-surface">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
