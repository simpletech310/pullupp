import type { Metadata, Viewport } from 'next';
import { Syne, Outfit } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/providers/auth-provider';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PullUpp - Events, Venues & Live Entertainment',
  description: 'Discover events, book venues, connect with artists, and experience live entertainment.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0F0F13',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${outfit.variable}`}>
      <body className="font-body bg-bg text-text-primary">
        <AuthProvider>
          {children}
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              style: {
                background: '#1A1A23',
                border: '1px solid #2D2D3A',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
