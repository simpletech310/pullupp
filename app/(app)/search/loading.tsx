export default function SearchLoading() {
  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Search input */}
      <div className="bg-surface-alt animate-pulse rounded-lg h-12" />

      {/* Category chips */}
      <div className="flex gap-2 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-alt animate-pulse rounded-full h-8 w-20 shrink-0"
          />
        ))}
      </div>

      {/* 2x2 card grid */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="bg-surface-alt animate-pulse h-28" />
            <div className="p-3 space-y-2">
              <div className="bg-surface-alt animate-pulse rounded-lg h-4 w-3/4" />
              <div className="bg-surface-alt animate-pulse rounded-lg h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* Artist circles row */}
      <div className="flex gap-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <div className="bg-surface-alt animate-pulse rounded-full h-16 w-16" />
            <div className="bg-surface-alt animate-pulse rounded-lg h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}
