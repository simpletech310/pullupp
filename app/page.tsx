'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';

export default function SplashPage() {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/home');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg">
        <div className="font-display font-bold text-3xl tracking-tight animate-pulse">
          Pull<span className="text-orange">Upp</span>
        </div>
      </div>
    );
  }

  return (
    <div id="app-container" className="min-h-dvh flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-orange/8 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-teal/6 blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="font-display font-bold text-5xl tracking-tight mb-3">
          Pull<span className="text-orange">Upp</span>
        </h1>
        <p className="text-text-secondary text-base mb-2">
          Events. Venues. Live Entertainment.
        </p>
        <p className="text-text-muted text-sm mb-10 max-w-[280px] mx-auto">
          Discover events, book venues, connect with artists, and experience live entertainment.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-[300px] mx-auto">
          <Button
            size="lg"
            fullWidth
            onClick={() => router.push('/register')}
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => router.push('/login')}
          >
            I have an account
          </Button>
        </div>
      </div>

      <p className="absolute bottom-8 text-xs text-text-muted">
        PullUpp v2.0
      </p>
    </div>
  );
}
