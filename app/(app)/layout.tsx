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
      <TopBar />
      <main className="pb-16 min-h-[calc(100dvh-56px-64px)]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
