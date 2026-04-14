'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  actions?: React.ReactNode;
}

export function TopBar({ title, showBack, showNotifications = true, actions }: TopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="p-2.5 -ml-2.5 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          ) : null}
          {title ? (
            <h1 className="font-display font-bold text-lg">{title}</h1>
          ) : (
            <Link href="/home" className="flex items-center">
              <span className="font-display font-bold text-xl tracking-tight">
                Pull<span className="text-orange">Upp</span>
              </span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {actions}
          {showNotifications && (
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative p-2.5 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {/* Notification badge - TODO: wire up to real count */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
