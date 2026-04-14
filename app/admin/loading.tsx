export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-container rounded-lg border border-white/5 p-4 space-y-2">
            <div className="bg-surface-container-high animate-pulse rounded-lg h-3 w-20" />
            <div className="bg-surface-container-high animate-pulse rounded-lg h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-surface-container rounded-lg border border-white/5 overflow-hidden">
        {/* Table header */}
        <div className="border-b border-white/5 p-4 flex gap-4">
          <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-24" />
          <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-32 flex-1" />
          <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-20" />
          <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-20" />
        </div>
        {/* Table rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-white/5 p-4 flex gap-4 items-center">
            <div className="bg-surface-container-high animate-pulse rounded-full h-8 w-8" />
            <div className="bg-surface-container-high animate-pulse rounded-lg h-4 flex-1" />
            <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-20" />
            <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
