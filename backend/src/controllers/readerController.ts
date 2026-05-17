import type { Request, Response } from 'express'
import { getChapterPages } from '../services/mangadex'
import { proxyMangaImage } from '../services/imageProxy'
import { AppError } from '../middleware/errorHandler'

export async function getPages(req: Request, res: Response) {
  const { chapterId } = req.params as { chapterId: string }
  if (!chapterId) throw new AppError(400, 'chapterId is required')

  const pages = await getChapterPages(chapterId)
  res.json(pages)
}

export async function proxyImage(req: Request, res: Response) {
  await proxyMangaImage(req, res)
}
