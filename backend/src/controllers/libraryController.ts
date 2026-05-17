import type { Request, Response } from 'express'
import { prisma } from '../config/database'
import { AppError } from '../middleware/errorHandler'

const VALID_STATUSES = ['reading', 'completed', 'on_hold', 'dropped', 'plan_to_read'] as const
type Status = (typeof VALID_STATUSES)[number]

export async function list(req: Request, res: Response) {
  const { status } = req.query as { status?: string }
  const items = await prisma.readingListItem.findMany({
    where: { userId: req.user!.id, ...(status ? { status } : {}) },
    orderBy: { updatedAt: 'desc' },
  })
  res.json(items)
}

export async function add(req: Request, res: Response) {
  const { mangaId, mangaTitle, coverUrl, status = 'plan_to_read', totalChapters } = req.body as {
    mangaId: string
    mangaTitle: string
    coverUrl?: string
    status?: string
    totalChapters?: number
  }

  if (!mangaId || !mangaTitle) throw new AppError(400, 'mangaId and mangaTitle are required')
  if (!VALID_STATUSES.includes(status as Status)) throw new AppError(400, 'Invalid status')

  const item = await prisma.readingListItem.upsert({
    where: { userId_mangaId: { userId: req.user!.id, mangaId } },
    create: { userId: req.user!.id, mangaId, mangaTitle, coverUrl, status, totalChapters },
    update: { status, totalChapters, coverUrl },
  })

  res.status(201).json(item)
}

export async function update(req: Request, res: Response) {
  const { mangaId } = req.params as { mangaId: string }
  const { status, chaptersRead, totalChapters } = req.body as {
    status?: string
    chaptersRead?: number
    totalChapters?: number
  }

  if (status && !VALID_STATUSES.includes(status as Status)) throw new AppError(400, 'Invalid status')

  const item = await prisma.readingListItem.findUnique({
    where: { userId_mangaId: { userId: req.user!.id, mangaId } },
  })
  if (!item) throw new AppError(404, 'Not in your library')

  const updated = await prisma.readingListItem.update({
    where: { userId_mangaId: { userId: req.user!.id, mangaId } },
    data: { status, chaptersRead, totalChapters },
  })

  res.json(updated)
}

export async function remove(req: Request, res: Response) {
  const { mangaId } = req.params as { mangaId: string }

  const item = await prisma.readingListItem.findUnique({
    where: { userId_mangaId: { userId: req.user!.id, mangaId } },
  })
  if (!item) throw new AppError(404, 'Not in your library')

  await prisma.readingListItem.delete({
    where: { userId_mangaId: { userId: req.user!.id, mangaId } },
  })

  res.json({ message: 'Removed from library' })
}
