import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchMangaApi } from '../../api/manga'
import { getCoverUrl, getDescription, getTitle } from '../../utils/mangadex'
import { isPremiumManga } from '../../constants/premiumManga'
import { cn } from '../../utils/cn'

const ROTATE_MS = 5000

export function HeroCarousel() {
  const { data, isLoading } = useQuery({
    queryKey: ['hero', 'popular'],
    queryFn: () => searchMangaApi({ sort: 'popular', limit: 5 }),
    staleTime: 5 * 60 * 1000,
  })

  const [index, setIndex] = useState(0)
  const items = data?.data ?? []

  useEffect(() => {
    if (items.length <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS)
    return () => clearInterval(t)
  }, [items.length])

  if (isLoading || !items.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative h-[420px] animate-pulse overflow-hidden rounded-3xl border border-surface-border bg-surface-card md:h-[480px]" />
      </div>
    )
  }

  const active = items[index]
  const cover = getCoverUrl(active, 'original')
  const title = getTitle(active)
  const desc = getDescription(active)

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <div className="relative h-[420px] overflow-hidden rounded-3xl border border-surface-border md:h-[480px]">
        {/* Blurred background */}
        {cover && (
          <div className="absolute inset-0">
            <img
              key={`bg-${active.id}`}
              src={cover}
              alt=""
              aria-hidden="true"
              className="h-full w-full animate-fade-in object-cover blur-2xl scale-110 opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/85 to-surface/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="relative flex h-full items-center gap-6 p-6 md:gap-10 md:p-10">
          {/* Cover */}
          {cover && (
            <img
              key={`cover-${active.id}`}
              src={cover}
              alt={title}
              className="hidden h-[80%] animate-slide-up rounded-2xl border border-surface-border object-cover shadow-2xl shadow-primary-900/40 md:block"
            />
          )}

          <div key={`text-${active.id}`} className="flex max-w-2xl animate-slide-up flex-col">
            {isPremiumManga(active.id) && (
              <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full border border-amber-300/40 bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-200">
                ✦ Pro
              </span>
            )}
            <h1 className="font-display text-4xl tracking-wider neon-text-primary md:text-6xl">
              {title}
            </h1>
            <p className="mt-4 line-clamp-3 text-sm text-white/80 md:text-base">{desc}</p>
            <div className="mt-6 flex gap-3">
              <Link to={`/manga/${active.id}`} className="btn-primary">
                Start Reading
              </Link>
              <Link to={`/manga/${active.id}`} className="btn-ghost">
                Details
              </Link>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {items.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-8 bg-primary-400' : 'w-4 bg-white/30 hover:bg-white/50',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
