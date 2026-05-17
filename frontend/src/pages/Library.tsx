import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { searchMangaApi } from '../api/manga'
import type { MangaSearchParams, MangaStatus } from '../types/manga'
import { MangaCard } from '../components/manga/MangaCard'
import { MangaCardSkeleton } from '../components/manga/MangaCardSkeleton'
import { FilterPanel } from '../components/library/FilterPanel'
import { useDebounce } from '../hooks/useDebounce'

const PAGE_SIZE = 20

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams()

  const initialTags = searchParams.get('tags')?.split(',').filter(Boolean) ?? []
  const initialStatus = (searchParams.get('status') as MangaStatus | null) ?? undefined
  const initialSort = (searchParams.get('sort') as MangaSearchParams['sort']) ?? undefined
  const initialQ = searchParams.get('q') ?? ''

  const [search, setSearch] = useState(initialQ)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)
  const [status, setStatus] = useState<MangaStatus | undefined>(initialStatus)
  const [sort, setSort] = useState<MangaSearchParams['sort']>(initialSort)
  const [filterOpen, setFilterOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  // Sync state -> URL
  useEffect(() => {
    const next = new URLSearchParams()
    if (debouncedSearch) next.set('q', debouncedSearch)
    if (selectedTags.length) next.set('tags', selectedTags.join(','))
    if (status) next.set('status', status)
    if (sort) next.set('sort', sort)
    setSearchParams(next, { replace: true })
  }, [debouncedSearch, selectedTags, status, sort, setSearchParams])

  const queryKey = ['library', { q: debouncedSearch, tags: selectedTags, status, sort }] as const

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      searchMangaApi({
        q: debouncedSearch || undefined,
        tags: selectedTags.length ? selectedTags : undefined,
        status,
        sort,
        offset: pageParam,
        limit: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => {
      const next = lastPage.offset + lastPage.limit
      return next < lastPage.total ? next : undefined
    },
    staleTime: 60 * 1000,
  })

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '600px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const all = data?.pages.flatMap((p) => p.data) ?? []
  const total = data?.pages[0]?.total ?? 0

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      {/* Search bar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search manga…"
            className="w-full rounded-2xl border border-surface-border bg-surface-card px-4 py-3 pl-11 text-white placeholder:text-surface-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
          <svg
            className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
          </svg>
        </div>
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="btn-ghost flex items-center gap-2 md:hidden"
          aria-label="Open filters"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <FilterPanel
          selectedTags={selectedTags}
          status={status}
          sort={sort}
          onTagsChange={setSelectedTags}
          onStatusChange={setStatus}
          onSortChange={setSort}
          className="hidden w-64 flex-shrink-0 md:block"
        />

        {/* Mobile drawer */}
        {filterOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
            <div className="flex-1 bg-black/60" onClick={() => setFilterOpen(false)} />
            <div className="w-80 max-w-[85vw] overflow-y-auto bg-surface border-l border-surface-border p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-2xl tracking-wider">Filters</h2>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="rounded-full border border-surface-border p-1.5 text-white"
                  aria-label="Close filters"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
                  </svg>
                </button>
              </div>
              <FilterPanel
                selectedTags={selectedTags}
                status={status}
                sort={sort}
                onTagsChange={setSelectedTags}
                onStatusChange={setStatus}
                onSortChange={setSort}
              />
            </div>
          </div>
        )}

        {/* Results grid */}
        <div className="min-w-0 flex-1">
          {!isLoading && total > 0 && (
            <p className="mb-4 text-sm text-surface-muted">
              {total.toLocaleString()} {total === 1 ? 'result' : 'results'}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => <MangaCardSkeleton key={i} />)
              : all.map((m) => <MangaCard key={m.id} manga={m} />)}

            {isFetchingNextPage &&
              Array.from({ length: 6 }).map((_, i) => <MangaCardSkeleton key={`next-${i}`} />)}
          </div>

          {!isLoading && all.length === 0 && (
            <div className="mt-12 text-center text-surface-muted">
              No manga found. Try adjusting your filters.
            </div>
          )}

          <div ref={sentinelRef} className="h-12" />

          {!hasNextPage && all.length > 0 && (
            <p className="py-6 text-center text-sm text-surface-muted">You've reached the end.</p>
          )}
        </div>
      </div>
    </section>
  )
}
