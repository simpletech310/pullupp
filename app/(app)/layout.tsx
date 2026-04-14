'use client';

import { TopBar } from '@/components/layout/top-bar';
import { BottomNav } from '@/components/layout/bottom-nav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="app-container">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-orange focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:top-2 focus:left-2">
        Skip to content
      </a>
      <TopBar />
      <main id="main-content" className="pb-16 min-h-[calc(100dvh-56px-64px)]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
