import { cn } from '../../utils/cn'

export function MangaCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('w-full', className)}>
      <div className="aspect-[2/3] animate-pulse rounded-2xl border border-surface-border bg-surface-card" />
      <div className="mt-2 h-3.5 animate-pulse rounded bg-surface-card" />
      <div className="mt-1.5 h-3.5 w-2/3 animate-pulse rounded bg-surface-card" />
    </div>
  )
}
