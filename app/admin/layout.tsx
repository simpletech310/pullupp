'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/events', label: 'Events', icon: '🎉' },
  { href: '/admin/venues', label: 'Venues', icon: '🏛️' },
  { href: '/admin/artists', label: 'Artists', icon: '🎤' },
  { href: '/admin/transactions', label: 'Transactions', icon: '💰' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh flex">
      <aside className="w-64 bg-bg-elevated border-r border-border shrink-0 hidden md:flex flex-col">
        <div className="px-6 py-5 border-b border-border">
          <Link href="/admin" className="font-display font-bold text-xl tracking-tight">
            Pull<span className="text-orange">Upp</span>
            <span className="text-xs text-text-muted ml-2 font-body font-normal">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3">
          {ADMIN_NAV.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition-colors
                  ${isActive
                    ? 'bg-orange/10 text-orange font-semibold'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }
                `}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <Link
            href="/home"
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to App
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
