import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchMangaApi } from '../api/manga'
import { getTagsApi } from '../api/manga'
import { MangaCard } from '../components/manga/MangaCard'
import { useDebounce } from '../hooks/useDebounce'
import type { MangaStatus } from '../types/manga'
import { cn } from '../utils/cn'

const RECENT_KEY = 'mv:recentSearches'
const MAX_RECENT = 8

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

function saveRecent(term: string) {
  const current = readRecent().filter((t) => t !== term)
  const next = [term, ...current].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

const STATUS_OPTIONS: { value: MangaStatus; label: string }[] = [
  { value: 'ongoing',   label: 'Ongoing'   },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus',    label: 'On Hiatus' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery]         = useState(searchParams.get('q') ?? '')
  const [selectedTags, setTags]   = useState<string[]>(() => {
    const t = searchParams.get('tags')
    return t ? t.split(',').filter(Boolean) : []
  })
  const [status, setStatus]       = useState<MangaStatus | ''>(() => {
    const s = searchParams.get('status')
    return (s ?? '') as MangaStatus | ''
  })
  const [recent, setRecent]       = useState<string[]>(readRecent)
  const [showRecent, setShowRecent] = useState(false)

  const debounced = useDebounce(query.trim(), 400)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (debounced)           params.q = debounced
    if (selectedTags.length) params.tags = selectedTags.join(',')
    if (status)              params.status = status
    setSearchParams(params, { replace: true })
    if (debounced) saveRecent(debounced)
  }, [debounced, selectedTags, status, setSearchParams])

  const { data: tagsData = [] } = useQuery({
    queryKey: ['manga', 'tags'],
    queryFn: getTagsApi,
    staleTime: 60 * 60 * 1000,
  })

  const genres = useMemo(
    () => tagsData.filter((t) => t.attributes.group === 'genre'),
    [tagsData],
  )

  const enabled = debounced.length > 0 || selectedTags.length > 0 || Boolean(status)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', debounced, selectedTags, status],
    queryFn: () =>
      searchMangaApi({
        q: debounced || undefined,
        tags: selectedTags.length ? selectedTags : undefined,
        status: status || undefined,
        limit: 24,
        sort: debounced ? 'relevance' : 'popular',
      }),
    enabled,
    staleTime: 60 * 1000,
  })

  function toggleTag(id: string) {
    setTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  function applyRecent(term: string) {
    setQuery(term)
    setShowRecent(false)
    inputRef.current?.focus()
  }

  function clearRecent() {
    localStorage.removeItem(RECENT_KEY)
    setRecent([])
  }

  const results = data?.data ?? []
  const isEmpty = enabled && !isLoading && results.length === 0

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl tracking-wider neon-text-primary">Search</h1>

      {/* Search bar */}
      <div className="relative mt-6">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowRecent(true)}
          onBlur={() => setTimeout(() => setShowRecent(false), 150)}
          placeholder="Search by title, author, or keyword…"
          className="input h-12 pl-4 pr-12 text-base"
          autoComplete="off"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-surface-muted">
          {isFetching ? '⟳' : '⌕'}
        </span>

        {/* Recent searches dropdown */}
        {showRecent && recent.length > 0 && !query && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-surface-border bg-surface-card py-2 shadow-xl">
            <div className="flex items-center justify-between px-4 py-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-muted">Recent</p>
              <button
                type="button"
                onMouseDown={clearRecent}
                className="text-xs text-surface-muted hover:text-white"
              >
                Clear
              </button>
            </div>
            {recent.map((term) => (
              <button
                key={term}
                type="button"
                onMouseDown={() => applyRecent(term)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-white hover:bg-surface-hover"
              >
                <span className="text-surface-muted">↩</span>
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter chips: status */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-surface-muted">Status:</span>
        {STATUS_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setStatus(status === o.value ? '' : o.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition',
              status === o.value
                ? 'border-primary-500 bg-primary-600/20 text-primary-200 shadow-glow-primary'
                : 'border-surface-border bg-surface-card text-white/80 hover:bg-surface-hover',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Genre chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="self-center text-xs font-semibold uppercase tracking-wider text-surface-muted">
          Genres:
        </span>
        {genres.map((tag) => {
          const name = tag.attributes.name.en ?? Object.values(tag.attributes.name)[0]
          const active = selectedTags.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition',
                active
                  ? 'border-primary-500 bg-primary-600/20 text-primary-200 shadow-glow-primary'
                  : 'border-surface-border bg-surface-card text-white/80 hover:bg-surface-hover',
              )}
            >
              {name}
            </button>
          )
        })}
        {selectedTags.length > 0 && (
          <button
            type="button"
            onClick={() => setTags([])}
            className="rounded-full border border-surface-border px-3 py-1 text-xs text-red-300 hover:bg-surface-hover"
          >
            Clear genres
          </button>
        )}
      </div>

      {/* Results */}
      {isLoading && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-surface-card" />
          ))}
        </div>
      )}

      {!isLoading && !enabled && recent.length === 0 && (
        <div className="mt-20 text-center">
          <p className="text-5xl">🔍</p>
          <p className="mt-3 text-lg text-surface-muted">Search for manga by title, tag, or genre.</p>
        </div>
      )}

      {!isLoading && isEmpty && (
        <div className="mt-16 text-center">
          <p className="text-4xl">😔</p>
          <p className="mt-3 text-lg text-surface-muted">No results found.</p>
          <p className="mt-1 text-sm text-surface-muted">
            Try a different keyword, or adjust your filters.
          </p>
          {(selectedTags.length > 0 || status) && (
            <button
              type="button"
              onClick={() => { setTags([]); setStatus('') }}
              className="btn-ghost mt-4 text-sm"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <>
          <p className="mt-6 text-sm text-surface-muted">
            {data?.total ?? results.length} result{(data?.total ?? results.length) !== 1 ? 's' : ''}
            {debounced ? ` for "${debounced}"` : ''}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {results.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
