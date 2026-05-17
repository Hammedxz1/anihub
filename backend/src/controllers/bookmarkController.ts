import type { Request, Response } from 'express'
import { prisma } from '../config/database'
import { AppError } from '../middleware/errorHandler'

export async function list(req: Request, res: Response) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  })
  res.json(bookmarks)
}

export async function create(req: Request, res: Response) {
  const { mangaId, chapterId, pageNumber, note } = req.body as {
    mangaId: string
    chapterId: string
    pageNumber: number
    note?: string
  }

  if (!mangaId || !chapterId || pageNumber == null) {
    throw new AppError(400, 'mangaId, chapterId, and pageNumber are required')
  }

  const bookmark = await prisma.bookmark.create({
    data: { userId: req.user!.id, mangaId, chapterId, pageNumber, note },
  })

  res.status(201).json(bookmark)
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params as { id: string }

  const bookmark = await prisma.bookmark.findUnique({ where: { id } })
  if (!bookmark) throw new AppError(404, 'Bookmark not found')
  if (bookmark.userId !== req.user!.id) throw new AppError(403, 'Forbidden')

  await prisma.bookmark.delete({ where: { id } })
  res.json({ message: 'Bookmark deleted' })
}
