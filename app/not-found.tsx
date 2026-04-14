import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center bg-bg">
      <p className="font-display text-7xl font-bold text-orange mb-4">404</p>

      <h1 className="font-display text-2xl font-bold text-text-primary mb-2">
        Page not found
      </h1>

      <p className="text-text-secondary text-sm mb-10 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/home"
        className="h-12 px-8 rounded-lg bg-orange text-white font-semibold text-sm flex items-center justify-center hover:bg-orange-dark transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
