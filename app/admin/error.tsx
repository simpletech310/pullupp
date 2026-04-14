'use client';

import Link from 'next/link';

export default function AdminError({
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

      <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
        Something went wrong
      </h2>

      <p className="text-on-surface-variant text-sm mb-8 max-w-xs">
        {error.message || 'An unexpected error occurred in the admin panel.'}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={reset}
          className="h-12 rounded-lg bg-primary-container text-white font-semibold text-sm hover:bg-primary-container-dark transition-colors"
        >
          Try Again
        </button>

        <Link
          href="/admin"
          className="h-12 rounded-lg border border-white/5 flex items-center justify-center text-on-surface-variant text-sm hover:bg-surface-container-high transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
