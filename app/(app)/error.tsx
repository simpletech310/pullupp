'use client';

import Link from 'next/link';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-error/10 mb-6">
        <svg
          className="h-8 w-8 text-error"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>

      <h2 className="font-display text-xl font-bold text-text-primary mb-2">
        Something went wrong
      </h2>

      <p className="text-text-secondary text-sm mb-8 max-w-xs">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={reset}
          className="h-12 rounded-lg bg-orange text-white font-semibold text-sm hover:bg-orange-dark transition-colors"
        >
          Try Again
        </button>

        <Link
          href="/home"
          className="h-12 rounded-lg border border-border flex items-center justify-center text-text-secondary text-sm hover:bg-surface-hover transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
