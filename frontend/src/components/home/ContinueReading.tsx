import { Link } from 'react-router-dom'
import { useQuery, useQueries } from '@tanstack/react-query'
import { fetchRecentProgress } from '../../api/progress'
import { getMangaByIdApi } from '../../api/manga'
import { getCoverUrl, getTitle } from '../../utils/mangadex'

export function ContinueReading() {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['progress', 'recent', 4],
    queryFn: () => fetchRecentProgress(4),
    staleTime: 30 * 1000,
  })

  const mangaQueries = useQueries({
    queries: (progress ?? []).map((p) => ({
      queryKey: ['manga', p.mangaId],
      queryFn: () => getMangaByIdApi(p.mangaId),
      staleTime: 5 * 60 * 1000,
    })),
  })

  if (isLoading) {
    return (
      <section className="mt-12 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 font-display text-3xl tracking-wider text-white md:text-4xl">
            Continue Reading
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl border border-surface-border bg-surface-card" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!progress?.length) return null

  return (
    <section className="mt-12 px-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 font-display text-3xl tracking-wider text-white md:text-4xl">
          Continue Reading
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {progress.map((p, idx) => {
            const manga = mangaQueries[idx]?.data
            const title = manga ? getTitle(manga) : 'Loading…'
            const cover = manga ? getCoverUrl(manga, 256) : null

            return (
              <Link
                key={p.id}
                to={`/read/${p.chapterId}`}
                className="card group flex items-center gap-3 overflow-hidden p-2 transition-all hover:-translate-y-0.5 hover:neon-border-primary"
              >
                <div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-hover">
                  {cover && (
                    <img
                      src={cover}
                      alt={title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="line-clamp-2 text-sm font-medium text-white group-hover:text-primary-300">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs text-surface-muted">Page {p.pageNumber}</p>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-accent-pink"
                      style={{ width: `${Math.min(100, p.pageNumber * 3)}%` }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
