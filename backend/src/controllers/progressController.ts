import type { Request, Response } from 'express'
import { prisma } from '../config/database'
import { AppError } from '../middleware/errorHandler'

export async function getByManga(req: Request, res: Response) {
  const { mangaId } = req.params as { mangaId: string }

  const progress = await prisma.readingProgress.findMany({
    where: { userId: req.user!.id, mangaId },
    orderBy: { updatedAt: 'desc' },
  })

  res.json(progress)
}

export async function upsert(req: Request, res: Response) {
  const { mangaId, chapterId, pageNumber } = req.body as {
    mangaId: string
    chapterId: string
    pageNumber: number
  }

  if (!mangaId || !chapterId || pageNumber == null) {
    throw new AppError(400, 'mangaId, chapterId, and pageNumber are required')
  }

  const progress = await prisma.readingProgress.upsert({
    where: { userId_chapterId: { userId: req.user!.id, chapterId } },
    create: { userId: req.user!.id, mangaId, chapterId, pageNumber },
    update: { pageNumber, mangaId },
  })

  res.json(progress)
}

export async function recent(req: Request, res: Response) {
  const { limit = '10' } = req.query as { limit?: string }

  const progress = await prisma.readingProgress.findMany({
    where: { userId: req.user!.id },
    orderBy: { updatedAt: 'desc' },
    take: Math.min(Number(limit), 50),
    distinct: ['mangaId'],
  })

  res.json(progress)
}
