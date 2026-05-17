import type { Request, Response } from 'express'
import {
  searchManga,
  getMangaById,
  getChapterList,
  getTagList,
} from '../services/mangadex'
import type { SearchMangaOptions } from '../services/mangadex'
import { AppError } from '../middleware/errorHandler'

const SORT_PRESETS: Record<string, Record<string, 'asc' | 'desc'>> = {
  popular:     { followedCount: 'desc' },
  rating:      { rating: 'desc' },
  latest:      { latestUploadedChapter: 'desc' },
  newest:      { createdAt: 'desc' },
  oldest:      { createdAt: 'asc' },
  title_asc:   { title: 'asc' },
  title_desc:  { title: 'desc' },
  year_desc:   { year: 'desc' },
  relevance:   { relevance: 'desc' },
}

export async function search(req: Request, res: Response) {
  const { q, offset = '0', limit = '20', tags, status, sort } = req.query as Record<string, string>

  const options: SearchMangaOptions = {
    query: q,
    offset: Number(offset),
    limit: Number(limit),
    tags: tags ? tags.split(',') : undefined,
  }

  const validStatuses = ['ongoing', 'completed', 'hiatus', 'cancelled'] as const
  if (status && (validStatuses as readonly string[]).includes(status)) {
    options.status = status as SearchMangaOptions['status']
  }

  if (sort && SORT_PRESETS[sort]) {
    options.order = SORT_PRESETS[sort]
  }

  const results = await searchManga(options)
  res.json(results)
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params as { id: string }
  const manga = await getMangaById(id)
  if (!manga) throw new AppError(404, 'Manga not found')
  res.json(manga)
}

export async function getChapters(req: Request, res: Response) {
  const { id } = req.params as { id: string }
  const { limit = '100', offset = '0', lang = 'en' } = req.query as Record<string, string>

  const chapters = await getChapterList(id, {
    limit: Number(limit),
    offset: Number(offset),
    language: [lang],
  })

  res.json(chapters)
}

export async function getRelated(_req: Request, res: Response) {
  // Return empty — MangaDex related-titles require a separate endpoint not yet implemented
  res.json({ data: [] })
}

export async function getTags(_req: Request, res: Response) {
  const tags = await getTagList()
  res.json(tags)
}
