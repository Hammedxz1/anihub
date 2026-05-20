import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { deleteBookmarkApi, listBookmarksApi, type Bookmark } from '../api/bookmarks'
import { BookmarkSkeleton } from '../components/ui/Skeleton'
import { formatRelativeDate } from '../utils/mangadex'

type BookmarkGroup = {
  mangaId: string
  bookmarks: Bookmark[]
}

function groupByManga(bookmarks: Bookmark[]): BookmarkGroup[] {
  const map = new Map<string, BookmarkGroup>()
  for (const b of bookmarks) {
    let group = map.get(b.mangaId)
    if (!group) {
      group = { mangaId: b.mangaId, bookmarks: [] }
      map.set(b.mangaId, group)
    }
    group.bookmarks.push(b)
  }
  return Array.from(map.values())
}

export default function Bookmarks() {
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: listBookmarksApi,
    staleTime: 30 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBookmarkApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmarks'] })
      toast.success('Bookmark removed')
    },
    onError: () => toast.error('Could not remove bookmark'),
  })

  const groups = groupByManga(bookmarks)

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl tracking-wider neon-text-primary">Bookmarks</h1>
      <p className="mt-1 text-surface-muted">
        {bookmarks.length} saved {bookmarks.length === 1 ? 'page' : 'pages'}
      </p>

      {isLoading && <div className="mt-8"><BookmarkSkeleton /></div>}

      {!isLoading && bookmarks.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-4xl">🔖</p>
          <p className="mt-3 text-lg text-surface-muted">No bookmarks yet.</p>
          <p className="mt-1 text-sm text-surface-muted">
            Press{' '}
            <kbd className="rounded border border-surface-border bg-surface-card px-1.5 py-0.5 text-xs font-mono">
              B
            </kbd>{' '}
            while reading to bookmark a page.
          </p>
          <Link to="/library" className="btn-primary mt-6 inline-flex">
            Browse Manga
          </Link>
        </div>
      )}

      {!isLoading && groups.length > 0 && (
        <div className="mt-8 space-y-8">
          {groups.map((group) => (
            <div key={group.mangaId}>
              <div className="flex items-center gap-3">
                <Link
                  to={`/manga/${group.mangaId}`}
                  className="font-display text-xl tracking-wider text-white transition hover:text-primary-300"
                >
                  {group.mangaId}
                </Link>
                <span className="rounded-full border border-surface-border bg-surface-card px-2 py-0.5 text-xs text-surface-muted">
                  {group.bookmarks.length}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {group.bookmarks.map((bm) => (
                  <div key={bm.id} className="card flex items-center gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          Page {bm.pageNumber}
                        </span>
                        <span className="text-xs text-surface-muted">
                          {formatRelativeDate(bm.createdAt)}
                        </span>
                      </div>
                      {bm.note && (
                        <p className="mt-1 line-clamp-2 text-sm text-white/70">{bm.note}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/read/${bm.chapterId}?page=${bm.pageNumber}&m=${bm.mangaId}`)
                        }
                        className="btn-ghost text-xs"
                      >
                        Jump to page
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(bm.id)}
                        disabled={deleteMutation.isPending}
                        aria-label="Delete bookmark"
                        className="rounded-lg p-2 text-surface-muted transition hover:bg-surface-hover hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
