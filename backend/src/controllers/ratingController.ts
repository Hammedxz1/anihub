import type { Request, Response } from 'express'
import { prisma } from '../config/database'
import { AppError } from '../middleware/errorHandler'

export async function upsert(req: Request, res: Response) {
  const { mangaId } = req.params as { mangaId: string }
  const { score } = req.body as { score: number }

  if (score == null || score < 1 || score > 10) {
    throw new AppError(400, 'score must be between 1 and 10')
  }

  const rating = await prisma.rating.upsert({
    where: { userId_mangaId: { userId: req.user!.id, mangaId } },
    create: { userId: req.user!.id, mangaId, score },
    update: { score },
  })

  res.json(rating)
}

export async function listByManga(req: Request, res: Response) {
  const { mangaId } = req.params as { mangaId: string }

  const [ratings, aggregate] = await prisma.$transaction([
    prisma.rating.findMany({
      where: { mangaId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.rating.aggregate({
      where: { mangaId },
      _avg: { score: true },
      _count: { score: true },
    }),
  ])

  res.json({
    ratings,
    average: aggregate._avg.score,
    count: aggregate._count.score,
  })
}
