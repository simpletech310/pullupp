'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/providers/auth-provider';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  showProfile?: boolean;
  transparent?: boolean;
}

export function TopBar({
  title,
  showBack = false,
  showProfile = true,
  transparent = false,
}: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthContext();

  const isHome = pathname === '/home' || pathname === '/';

  return (
    <header className={[
      'fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16',
      transparent
        ? 'bg-transparent'
        : 'bg-background/60 backdrop-blur-xl',
    ].join(' ')}>
      {/* Left */}
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-90"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-container">
              <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        ) : (
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Center */}
      <div className="flex items-center">
        {title ? (
          <h1 className="font-headline font-bold text-lg tracking-tight text-on-surface truncate max-w-[200px]">
            {title}
          </h1>
        ) : (
          <Link href="/home">
            <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary-container to-secondary-container font-headline uppercase">
              PULLUPP
            </h1>
          </Link>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <Link href="/profile">
            <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-on-surface font-body">
                  {user?.email?.charAt(0).toUpperCase() ?? 'U'}
                </span>
              )}
            </div>
          </Link>
        ) : (
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}
