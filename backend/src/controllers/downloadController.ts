import type { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { prisma } from '../config/database'
import { AppError } from '../middleware/errorHandler'
import { getChapterPages } from '../services/mangadex'
import { DOWNLOAD_DIR } from '../config/upload'

export async function list(req: Request, res: Response) {
  const downloads = await prisma.download.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  })
  res.json(downloads)
}

export async function create(req: Request, res: Response) {
  const { chapterId, mangaId, chapterNum, mangaTitle } = req.body as {
    chapterId: string
    mangaId: string
    chapterNum: string
    mangaTitle: string
  }

  if (!chapterId || !mangaId || !chapterNum || !mangaTitle) {
    throw new AppError(400, 'chapterId, mangaId, chapterNum, and mangaTitle are required')
  }

  const existing = await prisma.download.findFirst({
    where: { userId: req.user!.id, chapterId, status: { in: ['pending', 'completed'] } },
  })
  if (existing) throw new AppError(409, 'Chapter already downloaded or in progress')

  const download = await prisma.download.create({
    data: { userId: req.user!.id, chapterId, mangaId, chapterNum, mangaTitle, status: 'pending' },
  })

  // Fetch pages and store as JSON (async, update status when done)
  setImmediate(async () => {
    try {
      const pages = await getChapterPages(chapterId)
      const filename = `${req.user!.id}-${chapterId}.json`
      const filePath = path.join(DOWNLOAD_DIR, filename)
      const content = JSON.stringify(pages)
      fs.writeFileSync(filePath, content)
      const fileSize = Buffer.byteLength(content)

      await prisma.download.update({
        where: { id: download.id },
        data: { status: 'completed', filePath: `/uploads/downloads/${filename}`, fileSize },
      })
    } catch {
      await prisma.download.update({ where: { id: download.id }, data: { status: 'failed' } }).catch(() => {})
    }
  })

  res.status(202).json(download)
}

export async function getFile(req: Request, res: Response) {
  const { id } = req.params as { id: string }

  const download = await prisma.download.findUnique({ where: { id } })
  if (!download) throw new AppError(404, 'Download not found')
  if (download.userId !== req.user!.id) throw new AppError(403, 'Forbidden')
  if (download.status !== 'completed' || !download.filePath) {
    throw new AppError(400, 'Download is not ready')
  }

  const filename = path.basename(download.filePath)
  const filePath = path.join(DOWNLOAD_DIR, filename)

  if (!fs.existsSync(filePath)) throw new AppError(404, 'File not found on disk')

  res.sendFile(filePath)
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params as { id: string }

  const download = await prisma.download.findUnique({ where: { id } })
  if (!download) throw new AppError(404, 'Download not found')
  if (download.userId !== req.user!.id) throw new AppError(403, 'Forbidden')

  if (download.filePath) {
    const filename = path.basename(download.filePath)
    const filePath = path.join(DOWNLOAD_DIR, filename)
    fs.unlink(filePath, () => {})
  }

  await prisma.download.delete({ where: { id } })
  res.json({ message: 'Download deleted' })
}
