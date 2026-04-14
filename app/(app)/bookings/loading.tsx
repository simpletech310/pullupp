export default function BookingsLoading() {
  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Tab bar */}
      <div className="flex gap-4">
        <div className="bg-surface-container-high animate-pulse rounded-lg h-10 w-28" />
        <div className="bg-surface-container-high animate-pulse rounded-lg h-10 w-28" />
      </div>

      {/* Booking cards */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl border border-white/5 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-surface-container-high animate-pulse rounded-lg h-12 w-12" />
              <div className="flex-1 space-y-2">
                <div className="bg-surface-container-high animate-pulse rounded-lg h-5 w-3/4" />
                <div className="bg-surface-container-high animate-pulse rounded-lg h-3 w-1/2" />
              </div>
            </div>
            <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-2/3" />
            <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
