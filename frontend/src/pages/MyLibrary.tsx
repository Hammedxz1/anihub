import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listLibraryApi,
  removeFromLibraryApi,
  updateLibraryApi,
  type LibraryItem,
  type LibraryStatus,
} from '../api/library'
import { cn } from '../utils/cn'

const TABS: { value: LibraryStatus | 'all'; label: string }[] = [
  { value: 'all',          label: 'All' },
  { value: 'reading',      label: 'Reading' },
  { value: 'plan_to_read', label: 'Want to Read' },
  { value: 'completed',    label: 'Completed' },
  { value: 'on_hold',      label: 'On Hold' },
  { value: 'dropped',      label: 'Dropped' },
]

const STATUS_OPTIONS: { value: LibraryStatus; label: string }[] = [
  { value: 'reading',      label: 'Reading' },
  { value: 'plan_to_read', label: 'Want to Read' },
  { value: 'completed',    label: 'Completed' },
  { value: 'on_hold',      label: 'On Hold' },
  { value: 'dropped',      label: 'Dropped' },
]

export default function MyLibrary() {
  const [tab, setTab] = useState<LibraryStatus | 'all'>('all')
  const qc = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['my-library'],
    queryFn: () => listLibraryApi(),
    staleTime: 30 * 1000,
  })

  const filtered = tab === 'all' ? items : items.filter((i) => i.status === tab)

  const updateMutation = useMutation({
    mutationFn: ({ mangaId, status }: { mangaId: string; status: LibraryStatus }) =>
      updateLibraryApi(mangaId, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-library'] }),
  })

  const removeMutation = useMutation({
    mutationFn: (mangaId: string) => removeFromLibraryApi(mangaId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-library'] }),
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl tracking-wider neon-text-primary">My Library</h1>
      <p className="mt-1 text-surface-muted">
        {items.length} {items.length === 1 ? 'title' : 'titles'} tracked
      </p>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-surface-border">
        {TABS.map((t) => {
          const count = t.value === 'all' ? items.length : items.filter((i) => i.status === t.value).length
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={cn(
                '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition',
                tab === t.value
                  ? 'border-primary-500 text-primary-300'
                  : 'border-transparent text-white/70 hover:text-white',
              )}
            >
              {t.label}
              <span className="ml-1.5 rounded-full bg-surface-card px-1.5 py-0.5 text-xs text-surface-muted">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {isLoading && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-surface-card aspect-[2/3]" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-lg text-surface-muted">Nothing here yet.</p>
          <Link to="/library" className="btn-primary mt-4 inline-flex">
            Browse Manga
          </Link>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => (
            <LibraryCard
              key={item.id}
              item={item}
              onStatusChange={(status) => updateMutation.mutate({ mangaId: item.mangaId, status })}
              onRemove={() => removeMutation.mutate(item.mangaId)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function LibraryCard({
  item,
  onStatusChange,
  onRemove,
}: {
  item: LibraryItem
  onStatusChange: (s: LibraryStatus) => void
  onRemove: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const progress =
    item.totalChapters && item.totalChapters > 0
      ? Math.min(100, (item.chaptersRead / item.totalChapters) * 100)
      : null

  return (
    <div className="group relative flex flex-col">
      <Link to={`/manga/${item.mangaId}`} className="block">
        <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-surface-border bg-surface-card transition group-hover:neon-border-primary">
          {item.coverUrl ? (
            <img src={item.coverUrl} alt={item.mangaTitle} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-surface-muted">
              No cover
            </div>
          )}
        </div>
      </Link>

      {/* Progress bar */}
      {progress !== null && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="mt-1.5 flex items-start justify-between gap-1">
        <Link to={`/manga/${item.mangaId}`} className="flex-1">
          <h3 className="line-clamp-2 text-sm font-medium text-white group-hover:text-primary-300">
            {item.mangaTitle}
          </h3>
          {item.chaptersRead > 0 && (
            <p className="text-xs text-surface-muted">
              Ch. {item.chaptersRead}{item.totalChapters ? ` / ${item.totalChapters}` : ''}
            </p>
          )}
        </Link>

        {/* Context menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className="rounded-lg p-1 text-surface-muted hover:bg-surface-hover hover:text-white"
            aria-label="Options"
          >
            ⋮
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-surface-border bg-surface-card py-1 shadow-xl">
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-surface-muted">
                  Move to
                </p>
                {STATUS_OPTIONS.filter((o) => o.value !== item.status).map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => { onStatusChange(o.value); setShowMenu(false) }}
                    className="w-full px-3 py-1.5 text-left text-sm text-white hover:bg-surface-hover"
                  >
                    {o.label}
                  </button>
                ))}
                <div className="my-1 border-t border-surface-border" />
                <button
                  type="button"
                  onClick={() => { onRemove(); setShowMenu(false) }}
                  className="w-full px-3 py-1.5 text-left text-sm text-red-300 hover:bg-surface-hover"
                >
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
