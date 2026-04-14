'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    href: '/home',
    label: 'Explore',
    icon: (filled: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Search',
    icon: (filled: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 2.5 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    href: '/tickets',
    label: 'Tickets',
    icon: (filled: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
        <path d="M13 5v2M13 17v2M13 11v2"/>
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (filled: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/home') return pathname === '/home' || pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-[32px] bg-surface-container/80 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.5)] flex justify-around items-center h-20 pb-4 border-t border-white/5">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'flex flex-col items-center justify-center gap-1 transition-all duration-200',
              active
                ? 'text-primary-container drop-shadow-[0_0_8px_rgba(255,107,53,0.4)] scale-110'
                : 'text-on-surface-variant hover:text-on-surface',
            ].join(' ')}
          >
            {item.icon(active)}
            <span className="font-body text-xs uppercase tracking-[0.05em] font-bold">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
