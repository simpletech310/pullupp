export default function MessagesLoading() {
  return (
    <div className="px-4 pt-6 space-y-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg"
        >
          <div className="bg-surface-container-high animate-pulse rounded-full h-12 w-12 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="bg-surface-container-high animate-pulse rounded-lg h-4 w-32" />
            <div className="bg-surface-container-high animate-pulse rounded-lg h-3 w-48" />
          </div>
          <div className="bg-surface-container-high animate-pulse rounded-lg h-3 w-10 shrink-0" />
        </div>
      ))}
    </div>
  );
}
