import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center bg-bg">
      <p className="font-headline text-7xl font-bold text-primary-container mb-4">404</p>

      <h1 className="font-headline text-2xl font-bold text-on-surface mb-2">
        Page not found
      </h1>

      <p className="text-on-surface-variant text-sm mb-10 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/home"
        className="h-12 px-8 rounded-lg bg-primary-container text-white font-semibold text-sm flex items-center justify-center hover:bg-primary-container-dark transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
