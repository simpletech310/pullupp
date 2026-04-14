export default function EventDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Cover image */}
      <div className="bg-surface-container-high animate-pulse h-56 w-full" />

      <div className="px-4 space-y-5">
        {/* Title */}
        <div className="bg-surface-container-high animate-pulse rounded-lg h-7 w-4/5" />

        {/* Date */}
        <div className="flex items-center gap-3">
          <div className="bg-surface-container-high animate-pulse rounded-lg h-10 w-10" />
          <div className="space-y-1.5 flex-1">
            <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-32" />
            <div className="bg-surface-container-high animate-pulse rounded-lg h-3 w-24" />
          </div>
        </div>

        {/* Venue */}
        <div className="flex items-center gap-3">
          <div className="bg-surface-container-high animate-pulse rounded-lg h-10 w-10" />
          <div className="space-y-1.5 flex-1">
            <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-40" />
            <div className="bg-surface-container-high animate-pulse rounded-lg h-3 w-28" />
          </div>
        </div>

        {/* Tier cards */}
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl border border-white/5 p-4 space-y-2">
              <div className="bg-surface-container-high animate-pulse rounded-lg h-5 w-28" />
              <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-20" />
              <div className="bg-surface-container-high animate-pulse rounded-lg h-3 w-48" />
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div className="bg-surface-container-high animate-pulse rounded-lg h-12 w-full" />
      </div>
    </div>
  );
}
