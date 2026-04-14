'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CATEGORIES = ['Music', 'Comedy', 'Talk', 'Other'] as const;

function Toggle({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full py-3"
    >
      <span className="text-sm font-body text-text-primary">{label}</span>
      <div
        className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${
          enabled ? 'bg-orange' : 'bg-surface-alt'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}

export default function GoLivePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Music');
  const [enableTips, setEnableTips] = useState(true);
  const [enableChat, setEnableChat] = useState(true);

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface-hover transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="font-display font-bold text-xl">Go Live</h2>
      </div>

      <div className="px-4 space-y-6">
        {/* Camera preview */}
        <div className="w-full aspect-video bg-surface border border-border rounded-2xl flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full bg-surface-alt flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <p className="text-text-muted text-xs font-body">Camera preview will appear here</p>
        </div>

        {/* Stream title */}
        <Input
          label="Stream Title"
          placeholder="What are you streaming?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Category selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            Category
          </label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  category === cat
                    ? 'bg-orange text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]'
                    : 'bg-surface border border-border text-text-secondary hover:border-border-light'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-surface border border-border rounded-2xl px-4 divide-y divide-border/50">
          <Toggle label="Enable Tips" enabled={enableTips} onToggle={() => setEnableTips(!enableTips)} />
          <Toggle label="Enable Chat" enabled={enableChat} onToggle={() => setEnableChat(!enableChat)} />
        </div>

        {/* Tips */}
        <div className="bg-teal/10 border border-teal/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-xs text-teal font-body">Make sure you&apos;re in a well-lit area for the best quality.</p>
          </div>
          <div className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal mt-0.5 shrink-0">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            <p className="text-xs text-teal font-body">Check your internet connection before starting.</p>
          </div>
        </div>

        {/* Start button */}
        <Button
          fullWidth
          size="lg"
          onClick={() => router.push('/live/broadcasting')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Start Broadcasting
        </Button>
      </div>
    </div>
  );
}
