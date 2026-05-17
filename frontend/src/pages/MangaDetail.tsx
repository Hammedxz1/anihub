import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMangaByIdApi, searchMangaApi } from '../api/manga'
import { getChaptersApi } from '../api/chapters'
import { getProgressByMangaApi } from '../api/progress'
import {
  STATUS_CLASS,
  STATUS_LABEL,
  getAuthor,
  getCoverUrl,
  getDescription,
  getTitle,
} from '../utils/mangadex'
import { isPremiumManga } from '../constants/premiumManga'
import { useAuth } from '../context/AuthContext'
import { Synopsis } from '../components/manga/Synopsis'
import { RatingControl } from '../components/manga/RatingControl'
import { SaveToLibraryButton } from '../components/manga/SaveToLibraryButton'
import { ChapterList, FREE_CHAPTER_LIMIT, getFirstUnreadChapter } from '../components/manga/ChapterList'
import { CommentsSection } from '../components/manga/CommentsSection'
import { PaywallModal } from '../components/manga/PaywallModal'
import { MangaCard } from '../components/manga/MangaCard'
import { MangaCardSkeleton } from '../components/manga/MangaCardSkeleton'
import { cn } from '../utils/cn'

export default function MangaDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, isPro } = useAuth()
  const [paywallOpen, setPaywallOpen] = useState(false)

  const { data: manga, isLoading, isError } = useQuery({
    queryKey: ['manga', id],
    queryFn: () => getMangaByIdApi(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  })

  const { data: chaptersResp } = useQuery({
    queryKey: ['chapters', id],
    queryFn: () => getChaptersApi(id, { limit: 200 }),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  })

  const { data: progress } = useQuery({
    queryKey: ['progress', 'manga', id],
    queryFn: () => getProgressByMangaApi(id),
    enabled: isAuthenticated && Boolean(id),
    staleTime: 30 * 1000,
  })

  // Related manga based on first 2 tags
  const firstTags = manga?.attributes.tags.slice(0, 2).map((t) => t.id) ?? []
  const { data: related, isLoading: relatedLoading } = useQuery({
    queryKey: ['manga', 'related', id, firstTags],
    queryFn: () => searchMangaApi({ tags: firstTags, limit: 12 }),
    enabled: firstTags.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  const readIds = useMemo(
    () => new Set((progress ?? []).map((p) => p.chapterId)),
    [progress],
  )

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="h-72 animate-pulse rounded-3xl border border-surface-border bg-surface-card md:h-96" />
        <div className="mt-6 h-8 w-2/3 animate-pulse rounded bg-surface-card" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-surface-card" />
      </div>
    )
  }

  if (isError || !manga) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl tracking-wider">Manga not found</h1>
        <Link to="/library" className="btn-primary mt-6 inline-flex">Back to library</Link>
      </div>
    )
  }

  const title = getTitle(manga)
  const nativeTitle =
    manga.attributes.altTitles?.find((t) => t.ja)?.ja ??
    manga.attributes.altTitles?.find((t) => t['ja-ro'])?.['ja-ro'] ??
    null
  const author = getAuthor(manga)
  const artist = manga.relationships.find((r) => r.type === 'artist')?.attributes
  const artistName = (artist as { name?: string } | undefined)?.name
  const cover = getCoverUrl(manga, 'original')
  const coverThumb = getCoverUrl(manga, 512)
  const desc = getDescription(manga)
  const status = manga.attributes.status
  const year = manga.attributes.year
  const contentRating = manga.attributes.contentRating
  const premium = isPremiumManga(manga.id)

  const chapters = chaptersResp?.data ?? []
  const ascending = [...chapters].reverse()
  const freeIds = new Set(ascending.slice(0, FREE_CHAPTER_LIMIT).map((c) => c.id))

  function handleStartReading() {
    if (!chapters.length) return
    const target = getFirstUnreadChapter(chapters, readIds)
    if (!target) return
    const locked = premium && !isPro && !freeIds.has(target.id)
    if (locked) {
      setPaywallOpen(true)
      return
    }
    navigate(`/read/${target.id}?m=${id}`)
  }

  return (
    <div className="pb-16">
      {/* Hero with blurred cover background */}
      <div className="relative">
        {cover && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={cover} alt="" aria-hidden="true" className="h-full w-full scale-110 object-cover opacity-50 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-surface/40 via-surface/80 to-surface" />
          </div>
        )}

        <div className="relative mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-12">
          <div className="flex flex-col gap-6 md:flex-row md:gap-10">
            {/* Cover thumbnail */}
            {coverThumb && (
              <img
                src={coverThumb}
                alt={title}
                className="mx-auto h-64 w-44 flex-shrink-0 rounded-2xl border border-surface-border object-cover shadow-2xl shadow-primary-900/40 md:mx-0 md:h-80 md:w-56"
              />
            )}

            <div className="min-w-0 flex-1">
              {premium && (
                <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-200">
                  ✦ Pro
                </span>
              )}
              <h1 className="font-display text-4xl tracking-wider neon-text-primary md:text-6xl">{title}</h1>
              {nativeTitle && nativeTitle !== title && (
                <p className="mt-1 text-lg text-surface-muted">{nativeTitle}</p>
              )}

              {/* Author / artist */}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/80">
                {author && <span>by <span className="text-white">{author}</span></span>}
                {artistName && artistName !== author && (
                  <span>Art by <span className="text-white">{artistName}</span></span>
                )}
              </div>

              {/* Status / year / content rating */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
                    STATUS_CLASS[status],
                  )}
                >
                  {STATUS_LABEL[status]}
                </span>
                {year && (
                  <span className="rounded-full border border-surface-border bg-surface-card px-2.5 py-0.5 text-xs text-white/80">
                    {year}
                  </span>
                )}
                {contentRating && (
                  <span className="rounded-full border border-surface-border bg-surface-card px-2.5 py-0.5 text-xs uppercase text-white/80">
                    {contentRating}
                  </span>
                )}
              </div>

              {/* Genre pills */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {manga.attributes.tags.map((tag) => {
                  const name = tag.attributes.name.en ?? Object.values(tag.attributes.name)[0]
                  return (
                    <Link
                      key={tag.id}
                      to={`/library?tags=${encodeURIComponent(tag.id)}`}
                      className="rounded-full border border-surface-border bg-surface-card/70 px-2.5 py-0.5 text-xs text-white/80 transition hover:border-primary-500 hover:bg-primary-600/15 hover:text-primary-200"
                    >
                      {name}
                    </Link>
                  )
                })}
              </div>

              <RatingControl mangaId={manga.id} />

              {/* Action buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleStartReading}
                  disabled={chapters.length === 0}
                  className="btn-primary"
                >
                  {progress?.length ? 'Continue Reading' : 'Start Reading'}
                </button>
                <SaveToLibraryButton
                  mangaId={manga.id}
                  mangaTitle={title}
                  coverUrl={coverThumb}
                  totalChapters={chapters.length}
                />
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <Synopsis text={desc} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <ChapterList mangaId={manga.id} onPaywall={() => setPaywallOpen(true)} />

        {/* You May Also Like */}
        <section className="mt-12">
          <h2 className="font-display text-2xl tracking-wider md:text-3xl">You May Also Like</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {relatedLoading
              ? Array.from({ length: 6 }).map((_, i) => <MangaCardSkeleton key={i} />)
              : (related?.data ?? [])
                  .filter((m) => m.id !== manga.id)
                  .slice(0, 6)
                  .map((m) => <MangaCard key={m.id} manga={m} />)}
          </div>
        </section>

        <CommentsSection mangaId={manga.id} />
      </div>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  )
}
