export function SkeletonCard() {
  return (
    <div className="rounded-card bg-hearth-900/5 animate-pulse overflow-hidden">
      <div className="aspect-[4/3] bg-hearth-900/10" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-hearth-900/10 rounded w-3/4" />
        <div className="h-3 bg-hearth-900/10 rounded w-1/2" />
        <div className="h-4 bg-hearth-900/10 rounded w-1/4 mt-3" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`bg-hearth-900/10 rounded animate-pulse ${className}`} />
}
