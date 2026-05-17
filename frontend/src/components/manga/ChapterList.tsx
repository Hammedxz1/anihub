import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getChaptersApi } from '../../api/chapters'
import { getProgressByMangaApi } from '../../api/progress'
import type { MangaDexChapter } from '../../types/chapter'
import { formatRelativeDate } from '../../utils/mangadex'
import { isPremiumManga } from '../../constants/premiumManga'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

interface ChapterListProps {
  mangaId: string
  onPaywall: () => void
}

export const FREE_CHAPTER_LIMIT = 3

function chapterLabel(c: MangaDexChapter): string {
  const ch = c.attributes.chapter ? `Ch. ${c.attributes.chapter}` : 'Oneshot'
  const vol = c.attributes.volume ? `Vol. ${c.attributes.volume} · ` : ''
  return `${vol}${ch}`
}

function scanlationGroup(c: MangaDexChapter): string | null {
  const group = c.relationships.find((r) => r.type === 'scanlation_group')
  return group?.attributes?.name ?? null
}

export function ChapterList({ mangaId, onPaywall }: ChapterListProps) {
  const navigate = useNavigate()
  const { isAuthenticated, isPro } = useAuth()
  const [showAll, setShowAll] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['chapters', mangaId],
    queryFn: () => getChaptersApi(mangaId, { limit: 200 }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: progress } = useQuery({
    queryKey: ['progress', 'manga', mangaId],
    queryFn: () => getProgressByMangaApi(mangaId),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  })

  const readChapterIds = useMemo(
    () => new Set((progress ?? []).map((p) => p.chapterId)),
    [progress],
  )

  const chapters = data?.data ?? []
  // Backend returns chapters in descending order. The "free" first 3 are the
  // chronologically first 3, which are the last 3 in the reversed list.
  const ascending = useMemo(() => [...chapters].reverse(), [chapters])
  const freeChapterIds = useMemo(
    () => new Set(ascending.slice(0, FREE_CHAPTER_LIMIT).map((c) => c.id)),
    [ascending],
  )

  const premium = isPremiumManga(mangaId)
  const visible = showAll ? chapters : chapters.slice(0, 30)

  function handleClick(c: MangaDexChapter) {
    const locked = premium && !isPro && !freeChapterIds.has(c.id)
    if (locked) {
      onPaywall()
      return
    }
    navigate(`/read/${c.id}?m=${mangaId}`)
  }

  return (
    <div className="mt-10">
      <h2 className="font-display text-2xl tracking-wider md:text-3xl">
        Chapters {chapters.length > 0 && <span className="text-surface-muted">({chapters.length})</span>}
      </h2>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl border border-surface-border bg-surface-card" />
          ))}
        </div>
      ) : chapters.length === 0 ? (
        <p className="mt-4 text-sm text-surface-muted">No chapters available yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-surface-border overflow-hidden rounded-2xl border border-surface-border bg-surface-card">
          {visible.map((c) => {
            const locked = premium && !isPro && !freeChapterIds.has(c.id)
            const read = readChapterIds.has(c.id)
            const title = c.attributes.title
            const group = scanlationGroup(c)
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => handleClick(c)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-hover',
                    locked && 'opacity-70',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                      isAuthenticated
                        ? read
                          ? 'bg-primary-400 shadow-[0_0_8px_rgba(217,70,239,0.7)]'
                          : 'bg-surface-border'
                        : 'bg-transparent',
                    )}
                    aria-label={read ? 'Read' : 'Unread'}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{chapterLabel(c)}</span>
                      {title && <span className="truncate text-sm text-surface-muted">— {title}</span>}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-surface-muted">
                      <span>{formatRelativeDate(c.attributes.publishAt)}</span>
                      {group && <span>· {group}</span>}
                      {c.attributes.pages > 0 && <span>· {c.attributes.pages}p</span>}
                    </div>
                  </div>
                  {locked ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-300">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1.5A4.5 4.5 0 007.5 6v3.5H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-9a2 2 0 00-2-2h-1.5V6A4.5 4.5 0 0012 1.5zm-2.5 4.5a2.5 2.5 0 015 0v3.5h-5V6z" />
                      </svg>
                      Pro
                    </span>
                  ) : (
                    <span className="text-surface-muted">›</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {chapters.length > 30 && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-4 text-sm font-medium text-primary-300 hover:underline"
        >
          Show all {chapters.length} chapters
        </button>
      )}
    </div>
  )
}

export function getFirstUnreadChapter(
  chapters: MangaDexChapter[],
  readIds: Set<string>,
): MangaDexChapter | null {
  // chapters are descending; iterate ascending
  for (let i = chapters.length - 1; i >= 0; i--) {
    const c = chapters[i]
    if (!readIds.has(c.id)) return c
  }
  return chapters[chapters.length - 1] ?? null
}
