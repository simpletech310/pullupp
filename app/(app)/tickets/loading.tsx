export default function TicketsLoading() {
  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Tab bar */}
      <div className="flex gap-4">
        <div className="bg-surface-container-high animate-pulse rounded-lg h-10 w-32" />
        <div className="bg-surface-container-high animate-pulse rounded-lg h-10 w-32" />
      </div>

      {/* Ticket cards */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="bg-surface-container-high animate-pulse h-3 rounded-t-lg" />
            <div className="p-4 space-y-3">
              <div className="bg-surface-container-high animate-pulse rounded-lg h-5 w-3/4" />
              <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-1/2" />
              <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-2/3" />
              <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-1/3" />
              <div className="bg-surface-container-high animate-pulse rounded-lg h-10 w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
