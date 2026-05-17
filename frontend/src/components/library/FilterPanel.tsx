import { useQuery } from '@tanstack/react-query'
import { getTagsApi } from '../../api/manga'
import type { MangaSearchParams, MangaStatus } from '../../types/manga'
import { cn } from '../../utils/cn'

interface FilterPanelProps {
  selectedTags: string[]
  status: MangaStatus | undefined
  sort: MangaSearchParams['sort']
  onTagsChange: (tags: string[]) => void
  onStatusChange: (status: MangaStatus | undefined) => void
  onSortChange: (sort: MangaSearchParams['sort']) => void
  className?: string
}

const STATUSES: { value: MangaStatus; label: string }[] = [
  { value: 'ongoing',   label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus',    label: 'Hiatus' },
  { value: 'cancelled', label: 'Cancelled' },
]

const SORTS: { value: NonNullable<MangaSearchParams['sort']>; label: string }[] = [
  { value: 'popular',    label: 'Most Popular' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'latest',     label: 'Latest Updates' },
  { value: 'newest',     label: 'Newest' },
  { value: 'oldest',     label: 'Oldest' },
  { value: 'title_asc',  label: 'Title (A–Z)' },
  { value: 'title_desc', label: 'Title (Z–A)' },
  { value: 'year_desc',  label: 'Year (Newest)' },
]

export function FilterPanel({
  selectedTags,
  status,
  sort,
  onTagsChange,
  onStatusChange,
  onSortChange,
  className,
}: FilterPanelProps) {
  const { data: tags } = useQuery({
    queryKey: ['manga', 'tags'],
    queryFn: getTagsApi,
    staleTime: 60 * 60 * 1000,
  })

  const genres = (tags ?? []).filter((t) => t.attributes.group === 'genre')
  const themes = (tags ?? []).filter((t) => t.attributes.group === 'theme')

  function toggleTag(id: string) {
    if (selectedTags.includes(id)) onTagsChange(selectedTags.filter((t) => t !== id))
    else onTagsChange([...selectedTags, id])
  }

  return (
    <aside className={cn('space-y-6', className)}>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-muted">
          Sort by
        </label>
        <select
          value={sort ?? ''}
          onChange={(e) => onSortChange((e.target.value || undefined) as MangaSearchParams['sort'])}
          className="w-full rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        >
          <option value="">Relevance</option>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-surface-muted">
          Status
        </label>
        <select
          value={status ?? ''}
          onChange={(e) => onStatusChange((e.target.value || undefined) as MangaStatus | undefined)}
          className="w-full rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        >
          <option value="">Any</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {!!genres.length && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-muted">
            Genres
          </p>
          <div className="flex flex-wrap gap-1.5">
            {genres.map((tag) => {
              const name = tag.attributes.name.en ?? Object.values(tag.attributes.name)[0]
              const active = selectedTags.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs transition',
                    active
                      ? 'border-primary-500 bg-primary-600/20 text-primary-200 shadow-glow-primary'
                      : 'border-surface-border bg-surface-card text-white/80 hover:bg-surface-hover',
                  )}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {!!themes.length && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-muted">
            Themes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {themes.map((tag) => {
              const name = tag.attributes.name.en ?? Object.values(tag.attributes.name)[0]
              const active = selectedTags.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs transition',
                    active
                      ? 'border-accent-cyan bg-accent-cyan/20 text-accent-cyan shadow-glow-cyan'
                      : 'border-surface-border bg-surface-card text-white/80 hover:bg-surface-hover',
                  )}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {(selectedTags.length > 0 || status || sort) && (
        <button
          type="button"
          onClick={() => {
            onTagsChange([])
            onStatusChange(undefined)
            onSortChange(undefined)
          }}
          className="text-xs text-primary-300 hover:underline"
        >
          Clear all filters
        </button>
      )}
    </aside>
  )
}
