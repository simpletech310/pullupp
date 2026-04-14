export default function VenuesLoading() {
  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Filter row */}
      <div className="flex gap-2 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-high animate-pulse rounded-full h-8 w-24 shrink-0"
          />
        ))}
      </div>

      {/* Venue cards */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="bg-surface-container-high animate-pulse h-36" />
            <div className="p-4 space-y-2">
              <div className="bg-surface-container-high animate-pulse rounded-lg h-5 w-3/4" />
              <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-1/2" />
              <div className="bg-surface-container-high animate-pulse rounded-lg h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
