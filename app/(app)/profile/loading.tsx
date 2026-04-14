export default function ProfileLoading() {
  return (
    <div className="px-4 pt-8 space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="bg-surface-alt animate-pulse rounded-full h-24 w-24" />
        <div className="bg-surface-alt animate-pulse rounded-lg h-6 w-36" />
        <div className="bg-surface-alt animate-pulse rounded-full h-6 w-20" />
      </div>

      {/* Stats row */}
      <div className="flex justify-center gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="bg-surface-alt animate-pulse rounded-lg h-6 w-10" />
            <div className="bg-surface-alt animate-pulse rounded-lg h-3 w-14" />
          </div>
        ))}
      </div>

      {/* Menu rows */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-lg border border-border p-4 flex items-center gap-3"
          >
            <div className="bg-surface-alt animate-pulse rounded-lg h-8 w-8" />
            <div className="bg-surface-alt animate-pulse rounded-lg h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
