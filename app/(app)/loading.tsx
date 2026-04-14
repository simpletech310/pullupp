export default function AppLoading() {
  return (
    <div className="px-4 pt-6 space-y-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-surface-alt animate-pulse rounded-lg h-32"
        />
      ))}
    </div>
  );
}
