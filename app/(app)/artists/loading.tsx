export default function ArtistsLoading() {
  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-alt animate-pulse rounded-full h-8 w-20 shrink-0"
          />
        ))}
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3 p-4">
            <div className="bg-surface-alt animate-pulse rounded-full h-24 w-24" />
            <div className="bg-surface-alt animate-pulse rounded-lg h-4 w-20" />
            <div className="bg-surface-alt animate-pulse rounded-lg h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
