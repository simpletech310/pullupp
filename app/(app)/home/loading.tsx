export default function HomeLoading() {
  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Greeting */}
      <div className="space-y-2">
        <div className="bg-surface-alt animate-pulse rounded-lg h-5 w-40" />
        <div className="bg-surface-alt animate-pulse rounded-lg h-7 w-56" />
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-alt animate-pulse rounded-full h-9 w-20 shrink-0"
          />
        ))}
      </div>

      {/* Event cards */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="bg-surface-alt animate-pulse h-40" />
            <div className="p-4 space-y-3">
              <div className="bg-surface-alt animate-pulse rounded-lg h-5 w-3/4" />
              <div className="bg-surface-alt animate-pulse rounded-lg h-4 w-1/2" />
              <div className="bg-surface-alt animate-pulse rounded-lg h-4 w-2/3" />
              <div className="bg-surface-alt animate-pulse rounded-lg h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
