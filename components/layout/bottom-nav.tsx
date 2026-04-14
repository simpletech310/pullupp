'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/providers/auth-provider';
import type { UserRole } from '@/types/database';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

const HomeIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const SearchIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const TicketIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const ProfileIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const CalendarIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const MessageIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const MusicIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const BuildingIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 18h6"/></svg>;

function getNavItems(role: UserRole | null): NavItem[] {
  switch (role) {
    case 'organizer':
      return [
        { href: '/home', label: 'Home', icon: HomeIcon },
        { href: '/search', label: 'Search', icon: SearchIcon },
        { href: '/bookings', label: 'Bookings', icon: CalendarIcon },
        { href: '/messages', label: 'Messages', icon: MessageIcon },
        { href: '/profile', label: 'Profile', icon: ProfileIcon },
      ];
    case 'venue_owner':
      return [
        { href: '/home', label: 'Home', icon: HomeIcon },
        { href: '/venues/dashboard', label: 'Dashboard', icon: BuildingIcon },
        { href: '/bookings', label: 'Bookings', icon: CalendarIcon },
        { href: '/messages', label: 'Messages', icon: MessageIcon },
        { href: '/profile', label: 'Profile', icon: ProfileIcon },
      ];
    case 'artist':
      return [
        { href: '/home', label: 'Home', icon: HomeIcon },
        { href: '/artists/dashboard', label: 'Dashboard', icon: MusicIcon },
        { href: '/bookings', label: 'Gigs', icon: CalendarIcon },
        { href: '/messages', label: 'Messages', icon: MessageIcon },
        { href: '/profile', label: 'Profile', icon: ProfileIcon },
      ];
    default: // guest
      return [
        { href: '/home', label: 'Home', icon: HomeIcon },
        { href: '/search', label: 'Search', icon: SearchIcon },
        { href: '/tickets', label: 'My Tickets', icon: TicketIcon },
        { href: '/messages', label: 'Messages', icon: MessageIcon },
        { href: '/profile', label: 'Profile', icon: ProfileIcon },
      ];
  }
}

export function BottomNav() {
  const pathname = usePathname();
  const { role } = useAuthContext();
  const items = getNavItems(role);

  return (
    <nav role="navigation" aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-bg-elevated/95 backdrop-blur-xl border-t border-border/50">
      <div className="max-w-[480px] mx-auto flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`
                flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[56px]
                transition-colors duration-200
                ${isActive ? 'text-orange' : 'text-text-muted hover:text-text-secondary'}
              `}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
