'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F0F13',
          color: '#FFFFFF',
          fontFamily: "'Outfit', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '24px',
            maxWidth: '400px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
              color: '#FF6B35',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
            }}
          >
            PullUpp
          </div>

          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>

          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
              marginBottom: '8px',
            }}
          >
            Something went wrong
          </h2>

          <p
            style={{
              fontSize: '14px',
              color: '#9CA3AF',
              marginBottom: '32px',
              lineHeight: 1.5,
            }}
          >
            {error.message || 'A critical error occurred. Please reload the page.'}
          </p>

          <button
            onClick={reset}
            style={{
              height: '48px',
              width: '100%',
              maxWidth: '280px',
              borderRadius: '12px',
              backgroundColor: '#FF6B35',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: "'Outfit', system-ui, sans-serif",
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
