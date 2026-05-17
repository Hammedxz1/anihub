import PQueue from 'p-queue'
import { prisma } from '../config/database'

const BASE_URL = 'https://api.mangadex.org'
const COVER_BASE = 'https://uploads.mangadex.org/covers'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// Hard cap: 5 requests per second as required by MangaDex API guidelines
const queue = new PQueue({ intervalCap: 5, interval: 1000 })

// ─── Internal helpers ────────────────────────────────────────────────────────

async function fetchMangaDex<T>(
  path: string,
  params: Record<string, string | number | string[] | undefined> = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, v))
    } else {
      url.searchParams.set(key, String(value))
    }
  }

  const response = await queue.add(() =>
    fetch(url.toString(), {
      headers: { 'Content-Type': 'application/json' },
    }),
  )

  if (!response || !response.ok) {
    throw new Error(`MangaDex API error: ${response?.status} ${response?.statusText}`)
  }

  return response.json() as Promise<T>
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

async function getCached(mangaDexId: string): Promise<unknown | null> {
  const cached = await prisma.cachedManga.findUnique({ where: { mangaDexId } })
  if (!cached) return null
  if (Date.now() - cached.cachedAt.getTime() > CACHE_TTL_MS) return null
  return cached.data
}

async function setCache(mangaDexId: string, data: unknown): Promise<void> {
  await prisma.cachedManga.upsert({
    where: { mangaDexId },
    update: { data: data as never, cachedAt: new Date() },
    create: { mangaDexId, data: data as never, cachedAt: new Date() },
  })
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SearchMangaOptions {
  query?: string
  tags?: string[]
  status?: 'ongoing' | 'completed' | 'hiatus' | 'cancelled'
  limit?: number
  offset?: number
  order?: Record<string, 'asc' | 'desc'>
}

export async function searchManga(options: SearchMangaOptions = {}) {
  const { query, tags, status, limit = 20, offset = 0, order } = options

  const params: Record<string, string | number | string[] | undefined> = {
    'includes[]': ['cover_art', 'author', 'artist'],
    limit,
    offset,
  }

  if (query) params.title = query
  if (status) params.status = status
  if (tags?.length) params['includedTags[]'] = tags
  if (order) {
    for (const [field, dir] of Object.entries(order)) {
      params[`order[${field}]`] = dir
    }
  }

  return fetchMangaDex('/manga', params)
}

export async function getMangaById(id: string) {
  const cached = await getCached(id)
  if (cached) return cached

  const data = await fetchMangaDex(`/manga/${id}`, {
    'includes[]': ['cover_art', 'author', 'artist', 'tag'],
  })

  await setCache(id, data)
  return data
}

export interface ChapterListOptions {
  language?: string[]
  limit?: number
  offset?: number
}

export async function getChapterList(mangaId: string, options: ChapterListOptions = {}) {
  const { language = ['en'], limit = 100, offset = 0 } = options

  return fetchMangaDex(`/manga/${mangaId}/feed`, {
    'translatedLanguage[]': language,
    limit,
    offset,
    'includes[]': ['scanlation_group'],
    'order[chapter]': 'desc',
  })
}

export async function getChapterPages(chapterId: string) {
  return fetchMangaDex<{
    baseUrl: string
    chapter: { hash: string; data: string[]; dataSaver: string[] }
  }>(`/at-home/server/${chapterId}`)
}

export type CoverSize = 256 | 512 | undefined

export function getCoverUrl(mangaId: string, filename: string, size?: CoverSize): string {
  if (size) {
    return `${COVER_BASE}/${mangaId}/${filename}.${size}.jpg`
  }
  return `${COVER_BASE}/${mangaId}/${filename}`
}

export async function getTagList() {
  return fetchMangaDex('/manga/tag')
}
