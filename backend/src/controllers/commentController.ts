import type { Request, Response } from 'express'
import { prisma } from '../config/database'
import { AppError } from '../middleware/errorHandler'

export async function create(req: Request, res: Response) {
  const { mangaId } = req.params as { mangaId: string }
  const { content } = req.body as { content: string }

  if (!content?.trim()) throw new AppError(400, 'content is required')
  if (content.length > 2000) throw new AppError(400, 'content must be 2000 characters or fewer')

  const comment = await prisma.comment.create({
    data: { userId: req.user!.id, mangaId, content: content.trim() },
    include: { user: { select: { username: true, displayName: true, avatarUrl: true } } },
  })

  res.status(201).json(comment)
}

export async function listByManga(req: Request, res: Response) {
  const { mangaId } = req.params as { mangaId: string }
  const { page = '1', limit = '20' } = req.query as { page?: string; limit?: string }

  const take = Math.min(Number(limit), 100)
  const skip = (Number(page) - 1) * take

  const [comments, total] = await prisma.$transaction([
    prisma.comment.findMany({
      where: { mangaId },
      include: { user: { select: { username: true, displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.comment.count({ where: { mangaId } }),
  ])

  res.json({ comments, total, page: Number(page), limit: take })
}
