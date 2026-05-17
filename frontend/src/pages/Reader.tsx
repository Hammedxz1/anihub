import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getChapterPagesApi, getChaptersApi } from '../api/chapters'
import { getMangaByIdApi } from '../api/manga'
import { createBookmarkApi, deleteBookmarkApi, listBookmarksApi } from '../api/bookmarks'
import { upsertProgressApi } from '../api/progress'
import { useAuth } from '../context/AuthContext'
import { useReaderSettings } from '../hooks/useReaderSettings'
import { proxyUrl } from '../utils/imageProxy'
import { getTitle } from '../utils/mangadex'
import type { MangaDexChapter } from '../types/chapter'
import { ReaderTopBar } from '../components/reader/ReaderTopBar'
import { ReaderBottomBar } from '../components/reader/ReaderBottomBar'

const PRELOAD_AHEAD = 2

export default function Reader() {
  const { chapterId = '' } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isAuthenticated } = useAuth()
  const [settings, updateSettings] = useReaderSettings()

  const [page, setPage] = useState(0)
  const [barsVisible, setBarsVisible] = useState(true)
  const lastScrollY = useRef(0)

  // Pages for current chapter
  const { data: pagesData, isLoading } = useQuery({
    queryKey: ['chapter-pages', chapterId],
    queryFn: () => getChapterPagesApi(chapterId),
    enabled: Boolean(chapterId),
    staleTime: 5 * 60 * 1000,
  })

  // The /reader/chapter/:id/pages endpoint doesn't return manga relationships,
  // so the manga ID is passed via the ?m= query param from the chapter list.
  const params = new URLSearchParams(window.location.search)
  const mangaId = params.get('m')

  const { data: manga } = useQuery({
    queryKey: ['manga', mangaId],
    queryFn: () => getMangaByIdApi(mangaId as string),
    enabled: Boolean(mangaId),
    staleTime: 5 * 60 * 1000,
  })

  const { data: chaptersResp } = useQuery({
    queryKey: ['chapters', mangaId],
    queryFn: () => getChaptersApi(mangaId as string, { limit: 200 }),
    enabled: Boolean(mangaId),
    staleTime: 5 * 60 * 1000,
  })

  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: listBookmarksApi,
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  })

  const chapters = chaptersResp?.data ?? []
  const currentChapter: MangaDexChapter | null =
    chapters.find((c) => c.id === chapterId) ?? null

  // Build proxied page URLs
  const pageUrls = useMemo(() => {
    if (!pagesData) return [] as string[]
    const { baseUrl, chapter } = pagesData
    return chapter.data.map((file) => proxyUrl(`${baseUrl}/data/${chapter.hash}/${file}`))
  }, [pagesData])

  const totalPages = pageUrls.length

  // Reset page when chapter changes
  useEffect(() => {
    setPage(0)
  }, [chapterId])

  // Preload next pages in paged mode
  useEffect(() => {
    if (settings.mode !== 'paged') return
    for (let i = 1; i <= PRELOAD_AHEAD; i++) {
      const next = pageUrls[page + i]
      if (next) {
        const img = new Image()
        img.src = next
      }
    }
  }, [page, pageUrls, settings.mode])

  // Hide bars on scroll down, show on scroll up (vertical modes)
  useEffect(() => {
    if (settings.mode === 'paged') {
      setBarsVisible(true)
      return
    }
    function onScroll() {
      const y = window.scrollY
      setBarsVisible(y < lastScrollY.current || y < 80)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [settings.mode])

  // Save progress (debounced 2s)
  const progressMutation = useMutation({
    mutationFn: upsertProgressApi,
  })
  const progressTimer = useRef<number | null>(null)
  useEffect(() => {
    if (!isAuthenticated || !mangaId || !chapterId || totalPages === 0) return
    if (progressTimer.current) window.clearTimeout(progressTimer.current)
    progressTimer.current = window.setTimeout(() => {
      progressMutation.mutate({ mangaId, chapterId, pageNumber: page + 1 })
    }, 2000)
    return () => {
      if (progressTimer.current) window.clearTimeout(progressTimer.current)
    }
  }, [page, mangaId, chapterId, totalPages, isAuthenticated, progressMutation])

  // Navigation: prev/next page (paged) or prev/next chapter at boundary
  const goNext = useCallback(() => {
    if (settings.mode === 'paged' && page < totalPages - 1) {
      setPage((p) => p + 1)
    } else {
      // navigate to next chapter (ascending = previous in list, since list is desc)
      const idx = chapters.findIndex((c) => c.id === chapterId)
      const next = idx > 0 ? chapters[idx - 1] : null
      if (next) navigate(`/read/${next.id}?m=${mangaId ?? ''}`)
    }
  }, [settings.mode, page, totalPages, chapters, chapterId, navigate, mangaId])

  const goPrev = useCallback(() => {
    if (settings.mode === 'paged' && page > 0) {
      setPage((p) => p - 1)
    } else {
      const idx = chapters.findIndex((c) => c.id === chapterId)
      const prev = idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null
      if (prev) navigate(`/read/${prev.id}?m=${mangaId ?? ''}`)
    }
  }, [settings.mode, page, chapters, chapterId, navigate, mangaId])

  // Bookmark current page
  const currentBookmark = bookmarks?.find(
    (b) => b.chapterId === chapterId && b.pageNumber === page + 1,
  )
  const toggleBookmark = useCallback(async () => {
    if (!isAuthenticated || !mangaId) return
    try {
      if (currentBookmark) {
        await deleteBookmarkApi(currentBookmark.id)
      } else {
        await createBookmarkApi({ mangaId, chapterId, pageNumber: page + 1 })
      }
      qc.invalidateQueries({ queryKey: ['bookmarks'] })
    } catch {
      /* ignore */
    }
  }, [isAuthenticated, mangaId, currentBookmark, chapterId, page, qc])

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        settings.direction === 'rtl' ? goPrev() : goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        settings.direction === 'rtl' ? goNext() : goPrev()
      } else if (e.key === 'b' || e.key === 'B') {
        toggleBookmark()
      } else if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen().catch(() => {})
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev, settings.direction, toggleBookmark])

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center text-surface-muted">
        Loading chapter…
      </div>
    )
  }

  if (!pagesData || totalPages === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl tracking-wider">Chapter unavailable</h1>
        <p className="mt-2 text-surface-muted">This chapter has no readable pages.</p>
        <Link to="/library" className="btn-primary mt-6 inline-flex">Back to library</Link>
      </div>
    )
  }

  const mangaTitle = manga ? getTitle(manga) : 'Reading…'
  const brightnessOpacity = settings.brightness / 100
  const atEnd = settings.mode === 'paged' && page >= totalPages - 1

  return (
    <div
      className="min-h-screen bg-black pb-24"
      style={{ filter: `brightness(${brightnessOpacity})` }}
    >
      <ReaderTopBar
        visible={barsVisible}
        mangaTitle={mangaTitle}
        mangaId={mangaId}
        chapter={currentChapter}
        allChapters={chapters}
        onSelectChapter={(id) => navigate(`/read/${id}?m=${mangaId ?? ''}`)}
      />

      {/* Reading area */}
      {settings.mode === 'paged' ? (
        <PagedView
          pageUrls={pageUrls}
          page={page}
          direction={settings.direction}
          onTapLeft={() => (settings.direction === 'rtl' ? goNext() : goPrev())}
          onTapRight={() => (settings.direction === 'rtl' ? goPrev() : goNext())}
          onTapCenter={() => setBarsVisible((v) => !v)}
        />
      ) : (
        <VerticalView pageUrls={pageUrls} gap={settings.mode === 'webtoon' ? 0 : 12} />
      )}

      {/* End-of-chapter overlay (paged mode) */}
      {atEnd && (
        <EndOverlay
          mangaId={mangaId}
          chapters={chapters}
          chapterId={chapterId}
          onNext={goNext}
        />
      )}

      <ReaderBottomBar
        visible={barsVisible}
        page={page + 1}
        totalPages={totalPages}
        settings={settings}
        onSettingsChange={updateSettings}
        onBookmark={toggleBookmark}
        bookmarkSaved={Boolean(currentBookmark)}
      />
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PagedView({
  pageUrls,
  page,
  direction,
  onTapLeft,
  onTapRight,
  onTapCenter,
}: {
  pageUrls: string[]
  page: number
  direction: 'ltr' | 'rtl'
  onTapLeft: () => void
  onTapRight: () => void
  onTapCenter: () => void
}) {
  const url = pageUrls[page]
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-1rem)] max-w-5xl items-center justify-center px-2 pt-16">
      {url && (
        <img
          src={url}
          alt={`Page ${page + 1}`}
          className="max-h-[calc(100vh-6rem)] w-auto object-contain"
          style={{ direction }}
        />
      )}
      <button
        type="button"
        onClick={onTapLeft}
        className="absolute inset-y-0 left-0 w-1/3"
        aria-label="Previous"
      />
      <button
        type="button"
        onClick={onTapCenter}
        className="absolute inset-y-0 left-1/3 w-1/3"
        aria-label="Toggle controls"
      />
      <button
        type="button"
        onClick={onTapRight}
        className="absolute inset-y-0 right-0 w-1/3"
        aria-label="Next"
      />
    </div>
  )
}

function VerticalView({ pageUrls, gap }: { pageUrls: string[]; gap: number }) {
  return (
    <div className="mx-auto max-w-3xl pt-16" style={{ display: 'flex', flexDirection: 'column', gap }}>
      {pageUrls.map((url, i) => (
        <img
          key={url}
          src={url}
          alt={`Page ${i + 1}`}
          loading={i < 3 ? 'eager' : 'lazy'}
          className="w-full"
        />
      ))}
    </div>
  )
}

function EndOverlay({
  mangaId,
  chapters,
  chapterId,
  onNext,
}: {
  mangaId: string | null
  chapters: MangaDexChapter[]
  chapterId: string
  onNext: () => void
}) {
  const idx = chapters.findIndex((c) => c.id === chapterId)
  const hasNext = idx > 0
  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex items-end justify-center pb-32">
      <div className="card pointer-events-auto mx-4 w-full max-w-md animate-slide-up p-6 text-center">
        <h2 className="font-display text-2xl tracking-wider neon-text-primary">End of chapter</h2>
        <p className="mt-1 text-sm text-surface-muted">How was it? Rate the manga on the detail page.</p>
        <div className="mt-4 flex flex-col gap-2">
          {hasNext ? (
            <button type="button" onClick={onNext} className="btn-primary">
              Next chapter →
            </button>
          ) : (
            <span className="text-sm text-surface-muted">You're all caught up.</span>
          )}
          {mangaId && (
            <Link to={`/manga/${mangaId}`} className="btn-ghost text-sm">
              Back to detail
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
