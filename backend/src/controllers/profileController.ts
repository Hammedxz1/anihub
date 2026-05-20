import type { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { prisma } from '../config/database'
import { AppError } from '../middleware/errorHandler'
import { AVATAR_DIR } from '../config/upload'

const PUBLIC_FIELDS = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  favoriteGenres: true,
  publicProfile: true,
  socialTwitter: true,
  socialAnilist: true,
  socialMal: true,
  createdAt: true,
} as const

export async function getByUsername(req: Request, res: Response) {
  const { username } = req.params as { username: string }

  const user = await prisma.user.findUnique({ where: { username }, select: { ...PUBLIC_FIELDS, id: true } })
  if (!user) throw new AppError(404, 'User not found')
  if (!user.publicProfile && req.user?.id !== user.id) {
    throw new AppError(403, 'This profile is private')
  }

  res.json(user)
}

export async function getMe(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      ...PUBLIC_FIELDS,
      email: true,
      subscriptionStatus: true,
      subscriptionEndDate: true,
    },
  })
  if (!user) throw new AppError(404, 'User not found')
  res.json(user)
}

export async function updateMe(req: Request, res: Response) {
  const {
    displayName,
    bio,
    favoriteGenres,
    publicProfile,
    socialTwitter,
    socialAnilist,
    socialMal,
    avatarUrl,
  } = req.body as {
    displayName?: string | null
    bio?: string | null
    favoriteGenres?: string[]
    publicProfile?: boolean
    socialTwitter?: string | null
    socialAnilist?: string | null
    socialMal?: string | null
    avatarUrl?: string | null
  }

  // Only allow setting avatarUrl to a preset reference. File uploads use the
  // dedicated /me/avatar endpoint so we can manage the file on disk.
  const safeAvatarUrl =
    avatarUrl === undefined
      ? undefined
      : avatarUrl === null || avatarUrl.startsWith('preset:')
        ? avatarUrl
        : undefined

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      displayName,
      bio,
      favoriteGenres,
      publicProfile,
      socialTwitter,
      socialAnilist,
      socialMal,
      ...(safeAvatarUrl !== undefined ? { avatarUrl: safeAvatarUrl } : {}),
    },
    select: { ...PUBLIC_FIELDS, email: true, subscriptionStatus: true, subscriptionEndDate: true },
  })

  res.json(user)
}

export async function uploadAvatar(req: Request, res: Response) {
  if (!req.file) throw new AppError(400, 'No file uploaded')

  const oldUser = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { avatarUrl: true },
  })

  const avatarUrl = `/uploads/avatars/${req.file.filename}`
  await prisma.user.update({ where: { id: req.user!.id }, data: { avatarUrl } })

  // Delete old avatar file if it exists
  if (oldUser?.avatarUrl) {
    const oldFilename = path.basename(oldUser.avatarUrl)
    const oldPath = path.join(AVATAR_DIR, oldFilename)
    fs.unlink(oldPath, () => {})
  }

  res.json({ avatarUrl })
}

export async function deleteMe(req: Request, res: Response) {
  await prisma.user.delete({ where: { id: req.user!.id } })
  res.clearCookie('refreshToken', { path: '/api/auth' })
  res.json({ message: 'Account deleted' })
}

async function loadProfileForViewer(username: string, viewerId: string | undefined) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, publicProfile: true, favoriteGenres: true },
  })
  if (!user) throw new AppError(404, 'User not found')

  const isSelf = viewerId === user.id
  if (!user.publicProfile && !isSelf) throw new AppError(403, 'This profile is private')

  return { user, isSelf }
}

export async function getUserLibrary(req: Request, res: Response) {
  const { username } = req.params as { username: string }
  const { status } = req.query as { status?: string }

  const { user } = await loadProfileForViewer(username, req.user?.id)

  const items = await prisma.readingListItem.findMany({
    where: { userId: user.id, ...(status ? { status } : {}) },
    orderBy: { updatedAt: 'desc' },
  })

  res.json(items)
}

export async function getUserStats(req: Request, res: Response) {
  const { username } = req.params as { username: string }
  const { user } = await loadProfileForViewer(username, req.user?.id)

  const [libraryCount, chaptersRead, progress, library] = await prisma.$transaction([
    prisma.readingListItem.count({ where: { userId: user.id } }),
    prisma.readingProgress.count({ where: { userId: user.id } }),
    prisma.readingProgress.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true, mangaId: true, chapterId: true, pageNumber: true },
    }),
    prisma.readingListItem.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: { mangaId: true, mangaTitle: true, coverUrl: true, status: true, updatedAt: true },
      take: 20,
    }),
  ])

  // Reading streak: count consecutive days back from today with at least 1 progress event
  const days = new Set<string>()
  for (const p of progress) days.add(p.updatedAt.toISOString().slice(0, 10))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) streak++
    else if (i > 0) break
  }

  // Chapters read per day for the last 30 days
  const monthly: { date: string; count: number }[] = []
  const counts = new Map<string, number>()
  for (const p of progress) {
    const key = p.updatedAt.toISOString().slice(0, 10)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    monthly.push({ date: key, count: counts.get(key) ?? 0 })
  }

  res.json({
    totalManga: libraryCount,
    chaptersRead,
    streak,
    favoriteGenres: user.favoriteGenres,
    monthly,
    recent: library.slice(0, 10),
  })
}
