import type { MangaDexManga, MangaStatus } from '../types/manga'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'
const COVER_BASE = 'https://uploads.mangadex.org/covers'

export function getTitle(manga: MangaDexManga): string {
  const t = manga.attributes.title
  return t.en ?? t['ja-ro'] ?? t.ja ?? Object.values(t)[0] ?? 'Untitled'
}

export function getDescription(manga: MangaDexManga): string {
  const d = manga.attributes.description ?? {}
  return d.en ?? Object.values(d)[0] ?? ''
}

export function getCoverFileName(manga: MangaDexManga): string | null {
  const cover = manga.relationships.find((r) => r.type === 'cover_art')
  if (!cover?.attributes) return null
  const fileName = (cover.attributes as { fileName?: string }).fileName
  return fileName ?? null
}

export function getCoverUrl(manga: MangaDexManga, size: 256 | 512 | 'original' = 512): string | null {
  const fileName = getCoverFileName(manga)
  if (!fileName) return null
  const upstream =
    size === 'original'
      ? `${COVER_BASE}/${manga.id}/${fileName}`
      : `${COVER_BASE}/${manga.id}/${fileName}.${size}.jpg`
  return `${API_BASE_URL}/reader/proxy?url=${encodeURIComponent(upstream)}`
}

export function getAuthor(manga: MangaDexManga): string | null {
  const author = manga.relationships.find((r) => r.type === 'author')
  if (!author?.attributes) return null
  return (author.attributes as { name?: string }).name ?? null
}

export const STATUS_LABEL: Record<MangaStatus, string> = {
  ongoing:   'Ongoing',
  completed: 'Completed',
  hiatus:    'Hiatus',
  cancelled: 'Cancelled',
}

export const STATUS_CLASS: Record<MangaStatus, string> = {
  ongoing:   'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  completed: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  hiatus:    'bg-amber-500/15 text-amber-300 border-amber-500/30',
  cancelled: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
}

export function formatRelativeDate(iso?: string): string {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  const wk = Math.floor(day / 7)
  if (wk < 4) return `${wk}w ago`
  const mo = Math.floor(day / 30)
  if (mo < 12) return `${mo}mo ago`
  const yr = Math.floor(day / 365)
  return `${yr}y ago`
}
