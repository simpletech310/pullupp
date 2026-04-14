'use client';

import { useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { AVATAR_COLORS, TIP_PRESETS } from '@/lib/utils/constants';
import { getInitials, formatCurrency } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';

interface StreamArtist {
  name: string;
  genre: string;
  colorIndex: number;
  viewers: number;
  isLive: boolean;
}

interface ViewerChatMessage {
  id: string;
  username: string;
  text: string;
  colorIndex: number;
}

const MOCK_ARTISTS: Record<string, StreamArtist> = {
  'stream-1': { name: 'DJ Nova', genre: 'Electronic / House', colorIndex: 1, viewers: 47, isLive: true },
  'stream-2': { name: 'Lena Park', genre: 'Acoustic / Indie', colorIndex: 4, viewers: 132, isLive: true },
  'stream-3': { name: 'MC Thunder', genre: 'Hip Hop / Rap', colorIndex: 0, viewers: 0, isLive: false },
};

const MOCK_CHAT_MESSAGES: ViewerChatMessage[] = [
  { id: '1', username: 'MusicLover99', text: 'This beat is fire!', colorIndex: 0 },
  { id: '2', username: 'PartyPeople', text: 'Turn it up!!', colorIndex: 1 },
  { id: '3', username: 'VibeCheck', text: 'First time watching', colorIndex: 2 },
  { id: '4', username: 'NightOwl_ATL', text: 'Can you play some house?', colorIndex: 3 },
  { id: '5', username: 'DanceQueen', text: 'Transitions are so smooth', colorIndex: 4 },
  { id: '6', username: 'BassHead', text: 'Drop the bass!', colorIndex: 5 },
  { id: '7', username: 'SoulfulSarah', text: 'Love the vibes tonight', colorIndex: 6 },
  { id: '8', username: 'ATL_Mike', text: 'Watching from downtown!', colorIndex: 7 },
  { id: '9', username: 'GrooveMaster', text: 'Exactly what I needed tonight', colorIndex: 0 },
  { id: '10', username: 'CityLights', text: 'Shout me out!', colorIndex: 1 },
  { id: '11', username: 'FreqWave', text: 'This is pure talent', colorIndex: 2 },
  { id: '12', username: 'LateNight_J', text: 'Been here since the start', colorIndex: 3 },
];

export default function LiveStreamViewerPage() {
  const params = useParams();
  const id = params.id as string;
  const artist = MOCK_ARTISTS[id] || MOCK_ARTISTS['stream-1'];
  const avatarColor = AVATAR_COLORS[artist.colorIndex % AVATAR_COLORS.length];

  const [isFollowing, setIsFollowing] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT_MESSAGES);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`stream-chat-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'stream_chat',
        filter: `stream_id=eq.${id}`,
      }, (payload) => {
        const msg = payload.new as { id: string; user_id: string; message: string; username?: string };
        setChatMessages((prev) => [...prev, {
          id: msg.id || `rt-${Date.now()}`,
          username: msg.username || 'Viewer',
          text: msg.message,
          colorIndex: Math.floor(Math.random() * AVATAR_COLORS.length),
        }]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    const newMsg: ViewerChatMessage = {
      id: `user-${Date.now()}`,
      username: 'You',
      text,
      colorIndex: 0,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Send to Supabase
    try {
      const supabase = createClient();
      await supabase.from('stream_chat').insert({
        stream_id: id,
        message: text,
      });
    } catch {
      // Message already shown locally
    }
  };

  const handleSendTip = async () => {
    const amount = selectedTip || (customTip ? parseFloat(customTip) : 0);
    if (amount <= 0) return;
    try {
      const res = await fetch('/api/stripe/create-tip-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: id,
          amount: Math.round(amount * 100), // cents
          context: 'live',
        }),
      });
      const data = await res.json();
      if (data.clientSecret || data.success) {
        toast.success(`Tipped $${amount}!`);
        setShowTipModal(false);
        setSelectedTip(null);
        setCustomTip('');
      } else {
        toast.error(data.error || 'Tip failed');
      }
    } catch {
      toast.error('Failed to send tip');
    }
  };

  // Stream ended state
  if (!artist.isLive) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-20 text-center">
        <div className="w-20 h-20 rounded-full bg-surface-container border border-white/5 flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-outline">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="font-headline font-bold text-lg mb-1">Stream Ended</h3>
        <p className="text-on-surface-variant text-sm mb-1 font-body">{artist.name}</p>
        <p className="text-outline text-xs font-body">This stream is no longer live. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-bg">
      {/* Video area */}
      <div className="relative w-full aspect-video bg-[#0a0a0e] flex items-center justify-center shrink-0 overflow-hidden">
        {artist.isLive && (MOCK_ARTISTS[id] as StreamArtist & { mux_playback_id?: string })?.mux_playback_id ? (
          <iframe
            src={`https://stream.mux.com/${(MOCK_ARTISTS[id] as StreamArtist & { mux_playback_id?: string }).mux_playback_id}`}
            className="w-full h-full"
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-outline">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span className="text-xs">Live Stream</span>
          </div>
        )}
        {/* LIVE badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-bold uppercase">Live</span>
        </div>
        {/* Viewer count */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          <span className="text-xs text-white font-semibold">{artist.viewers}</span>
        </div>
      </div>

      {/* Artist info bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {getInitials(artist.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-bold text-sm truncate">{artist.name}</h3>
          <p className="text-xs text-outline">{artist.genre}</p>
        </div>
        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            isFollowing
              ? 'bg-surface-container border border-white/5 text-on-surface-variant'
              : 'bg-teal text-white shadow-[0_0_12px_rgba(20,184,166,0.3)]'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
        <span className="text-outline text-xs shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-0.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          {artist.viewers}
        </span>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {chatMessages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2">
            <span
              className="text-xs font-bold shrink-0"
              style={{ color: msg.username === 'You' ? '#FF6B35' : AVATAR_COLORS[msg.colorIndex % AVATAR_COLORS.length] }}
            >
              {msg.username}
            </span>
            <span className="text-xs text-on-surface-variant">{msg.text}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Chat input */}
      <div className="border-t border-white/5 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendChat(); }}
            placeholder="Say something..."
            className="flex-1 bg-surface-container border border-white/5 rounded-full px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-colors font-body"
          />
          <button
            onClick={handleSendChat}
            disabled={!chatInput.trim()}
            className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center shrink-0 disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>
      </div>

      {/* Floating tip button */}
      <button
        onClick={() => setShowTipModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary-container text-white shadow-lg shadow-orange/30 flex items-center justify-center text-xl font-bold z-30 hover:bg-orange-light transition-colors"
      >
        $
      </button>

      {/* Tip modal */}
      <Modal open={showTipModal} onClose={() => setShowTipModal(false)} title={`Tip ${artist.name}`}>
        <p className="text-sm text-on-surface-variant mb-4 font-body">Show your appreciation with a tip!</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {TIP_PRESETS.map((amount) => (
            <button
              key={amount}
              onClick={() => { setSelectedTip(amount); setCustomTip(''); }}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${
                selectedTip === amount
                  ? 'bg-primary-container text-white shadow-[0_0_12px_rgba(255,107,53,0.3)]'
                  : 'bg-surface-container border border-white/5 text-on-surface hover:border-white/10'
              }`}
            >
              {formatCurrency(amount)}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <input
            type="number"
            placeholder="Custom amount"
            value={customTip}
            onChange={(e) => { setCustomTip(e.target.value); setSelectedTip(null); }}
            className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-colors font-body"
          />
        </div>
        <Button fullWidth onClick={handleSendTip} disabled={!selectedTip && !customTip}>
          Send Tip {selectedTip ? formatCurrency(selectedTip) : customTip ? formatCurrency(parseFloat(customTip) || 0) : ''}
        </Button>
      </Modal>
    </div>
  );
}
