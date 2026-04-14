'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/auth-provider';
import { toggleSaveEvent } from '@/lib/supabase/mutations';
import { EVENT_GRADIENTS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

interface SavedEvent {
  id: string;
  created_at: string;
  event: {
    id: string;
    title: string;
    date: string;
    start_time: string;
    category: string;
    cover_images: string[] | null;
    gradient_index: number;
    manual_venue_name: string | null;
    venue: {
      id: string;
      name: string;
      address: string;
      city: string;
    } | null;
  };
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function SavedEventsPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [unsavingId, setUnsavingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSavedEvents() {
      try {
        setLoading(true);
        const res = await fetch('/api/user/saved-events');
        if (!res.ok) throw new Error('Failed to load saved events');
        const data = await res.json();
        setSavedEvents(data);
      } catch {
        toast.error('Failed to load saved events');
      } finally {
        setLoading(false);
      }
    }
    fetchSavedEvents();
  }, []);

  const handleUnsave = async (savedEventId: string, eventId: string) => {
    if (!user?.id) return;
    setUnsavingId(savedEventId);
    try {
      const result = await toggleSaveEvent(user.id, eventId);
      if (result.error) {
        toast.error('Failed to unsave event');
      } else {
        setSavedEvents((prev) => prev.filter((se) => se.id !== savedEventId));
      }
    } catch {
      toast.error('Failed to unsave event');
    } finally {
      setUnsavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="pb-24">
        <div className="px-4 pt-5 pb-4">
          <h2 className="font-headline font-bold text-2xl text-on-surface">Saved Events</h2>
          <p className="text-on-surface-variant text-sm mt-1 font-body">Events you've bookmarked</p>
        </div>

        <div className="px-4 grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-container-high animate-shimmer rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] w-full" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-surface-container-highest rounded w-3/4" />
                <div className="h-3 bg-surface-container-highest rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (savedEvents.length === 0) {
    return (
      <div className="pb-24">
        <div className="px-4 pt-5 pb-4">
          <h2 className="font-headline font-bold text-2xl text-on-surface">Saved Events</h2>
          <p className="text-on-surface-variant text-sm mt-1 font-body">Events you've bookmarked</p>
        </div>

        <div className="flex flex-col items-center py-16 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 text-on-surface-variant">
            <BookmarkIcon />
          </div>
          <h3 className="font-headline font-semibold text-base text-on-surface mb-2">No saved events yet</h3>
          <p className="text-on-surface-variant text-sm font-body max-w-[220px]">
            Tap the heart icon on events you like to save them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="px-4 pt-5 pb-4">
        <h2 className="font-headline font-bold text-2xl text-on-surface">Saved Events</h2>
        <p className="text-on-surface-variant text-sm mt-1 font-body">Events you've bookmarked</p>
      </div>

      <div className="px-4 grid grid-cols-2 gap-3">
        {savedEvents.map((saved) => {
          const event = saved.event;
          const gradientIndex = event.gradient_index ?? 0;
          const venueName = event.venue?.name || event.manual_venue_name || '';
          const hasCoverImage = event.cover_images && event.cover_images.length > 0;

          return (
            <div
              key={saved.id}
              className="glass-card rounded-2xl border border-white/5 overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200 active:scale-[0.98]"
            >
              <div
                className="aspect-[4/3] relative w-full"
                style={{
                  background: hasCoverImage
                    ? `url(${event.cover_images![0]}) center/cover`
                    : EVENT_GRADIENTS[gradientIndex % EVENT_GRADIENTS.length],
                }}
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <span className="absolute top-2 left-2 bg-secondary-container text-white px-2.5 py-0.5 rounded-full font-body text-xs font-black uppercase tracking-wide">
                  {event.category}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnsave(saved.id, event.id);
                  }}
                  disabled={unsavingId === saved.id}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full glass-panel border border-white/10 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                  aria-label="Unsave event"
                >
                  <HeartIcon filled />
                </button>
              </div>
              <div className="p-3" onClick={() => router.push(`/events/${event.id}`)}>
                <h4 className="font-headline font-semibold text-xs text-on-surface mb-1 line-clamp-1">{event.title}</h4>
                <p className="text-on-surface-variant text-xs font-body mb-0.5">{formatDate(event.date)}</p>
                {venueName && (
                  <p className="text-outline text-xs font-body line-clamp-1">{venueName}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
