'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { AVATAR_COLORS } from '@/lib/utils/constants';

interface LiveChatMessage {
  id: string;
  username: string;
  text: string;
  colorIndex: number;
}

const MOCK_CHAT: LiveChatMessage[] = [
  { id: '1', username: 'MusicLover99', text: 'This beat is fire!', colorIndex: 0 },
  { id: '2', username: 'PartyPeople', text: 'Turn it up!!', colorIndex: 1 },
  { id: '3', username: 'VibeCheck', text: 'First time watching, already a fan', colorIndex: 2 },
  { id: '4', username: 'NightOwl_ATL', text: 'Can you play some house music?', colorIndex: 3 },
  { id: '5', username: 'DanceQueen', text: 'The transitions are so smooth', colorIndex: 4 },
  { id: '6', username: 'BassHead', text: 'Drop the bass!', colorIndex: 5 },
  { id: '7', username: 'SoulfulSarah', text: 'Love the vibes tonight', colorIndex: 6 },
  { id: '8', username: 'ATL_Mike', text: 'Watching from downtown!', colorIndex: 7 },
  { id: '9', username: 'GrooveMaster', text: 'This is exactly what I needed tonight', colorIndex: 0 },
  { id: '10', username: 'CityLights', text: 'Can you shout me out?', colorIndex: 1 },
];

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function BroadcastingPage() {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showTipToast, setShowTipToast] = useState(false);
  const [tipMessage, setTipMessage] = useState('');
  const viewerCount = 47;

  useEffect(() => {
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Tip notifications
  useEffect(() => {
    const tips = [
      { from: 'Sarah', amount: 10 },
      { from: 'MusicLover99', amount: 20 },
      { from: 'VibeCheck', amount: 5 },
    ];
    let index = 0;
    const timer = setInterval(() => {
      if (index < tips.length) {
        const tip = tips[index];
        setTipMessage(`DJ Nova received $${tip.amount} from ${tip.from}!`);
        setShowTipToast(true);
        setTimeout(() => setShowTipToast(false), 3000);
        index++;
      }
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleEndStream = useCallback(() => {
    setShowEndModal(false);
    router.push('/home');
  }, [router]);

  return (
    <div className="fixed inset-0 bg-bg z-50 flex flex-col">
      {/* Camera preview area */}
      <div className="flex-1 relative bg-[#0a0a0e] flex items-center justify-center">
        {/* Camera placeholder */}
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <span className="text-xs">Camera Feed</span>
        </div>

        {/* Top overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            {/* LIVE badge */}
            <div className="flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] font-bold uppercase">Live</span>
            </div>
            {/* Viewer count */}
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-[11px] text-white font-semibold">{viewerCount}</span>
            </div>
          </div>
          {/* Elapsed time */}
          <div className="bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <span className="text-[11px] text-white font-mono">{formatElapsed(elapsed)}</span>
          </div>
        </div>

        {/* Tip toast */}
        <div
          className={`absolute top-16 left-1/2 -translate-x-1/2 bg-orange/90 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg transition-all duration-500 ${
            showTipToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">$</span>
            <span className="text-sm font-semibold">{tipMessage}</span>
          </div>
        </div>

        {/* Bottom controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center justify-center gap-6">
            {/* Mute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isMuted ? 'bg-red-600 text-white' : 'bg-white/20 backdrop-blur-sm text-white'
              }`}
            >
              {isMuted ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
            {/* Flip camera */}
            <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 16v4a2 2 0 0 1-2 2h-4" /><path d="M14 22l3-3-3-3" /><path d="M4 8V4a2 2 0 0 1 2-2h4" /><path d="M10 2L7 5l3 3" />
              </svg>
            </button>
            {/* End stream */}
            <button
              onClick={() => setShowEndModal(true)}
              className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Live chat sidebar */}
      <div className="h-[260px] bg-bg border-t border-border/50 flex flex-col">
        <div className="px-4 py-2 border-b border-border/30">
          <h3 className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wide">Live Chat</h3>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {MOCK_CHAT.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <span
                className="text-xs font-bold shrink-0"
                style={{ color: AVATAR_COLORS[msg.colorIndex % AVATAR_COLORS.length] }}
              >
                {msg.username}
              </span>
              <span className="text-xs text-text-secondary">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* End stream modal */}
      <Modal open={showEndModal} onClose={() => setShowEndModal(false)} title="End Stream?">
        <p className="text-sm text-text-secondary mb-4">
          Are you sure you want to end your broadcast? Your {viewerCount} viewers will be disconnected.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowEndModal(false)}>
            Keep Streaming
          </Button>
          <Button variant="danger" fullWidth onClick={handleEndStream}>
            End Stream
          </Button>
        </div>
      </Modal>
    </div>
  );
}
