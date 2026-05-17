import { Link } from 'react-router-dom'
import type { MangaDexManga } from '../../types/manga'
import {
  STATUS_CLASS,
  STATUS_LABEL,
  formatRelativeDate,
  getCoverUrl,
  getTitle,
} from '../../utils/mangadex'
import { isPremiumManga } from '../../constants/premiumManga'
import { cn } from '../../utils/cn'

interface MangaCardProps {
  manga: MangaDexManga
  className?: string
}

export function MangaCard({ manga, className }: MangaCardProps) {
  const title = getTitle(manga)
  const cover = getCoverUrl(manga, 512)
  const status = manga.attributes.status
  const lastChapter = manga.attributes.lastChapter
  const updated = manga.attributes.latestUploadedChapter ?? manga.attributes.updatedAt
  const premium = isPremiumManga(manga.id)

  return (
    <Link
      to={`/manga/${manga.id}`}
      className={cn(
        'group block w-full text-left transition-transform duration-200 hover:-translate-y-1',
        className,
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-surface-border bg-surface-card transition-shadow duration-200 group-hover:neon-border-primary">
        {cover ? (
          <img
            src={cover}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-hover text-surface-muted">
            No cover
          </div>
        )}

        {/* Bottom gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* Top-left status pill */}
        <span
          className={cn(
            'absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
            STATUS_CLASS[status] ?? 'bg-surface-card/80 text-white border-surface-border',
          )}
        >
          {STATUS_LABEL[status] ?? status}
        </span>

        {/* Top-right PRO badge */}
        {premium && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.5)] backdrop-blur-sm">
            <span aria-hidden="true">✦</span> Pro
          </span>
        )}

        {/* Bottom overlay info */}
        <div className="absolute inset-x-0 bottom-0 p-2.5">
          {lastChapter && (
            <p className="text-[11px] font-medium text-primary-300">
              Ch. {lastChapter}
              {updated && <span className="ml-1 text-surface-muted">· {formatRelativeDate(updated)}</span>}
            </p>
          )}
        </div>
      </div>

      <h3 className="mt-2 line-clamp-2 font-sans text-sm font-medium leading-snug text-white group-hover:text-primary-300">
        {title}
      </h3>
    </Link>
  )
}
