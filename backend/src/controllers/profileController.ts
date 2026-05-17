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

  const user = await prisma.user.findUnique({ where: { username }, select: PUBLIC_FIELDS })
  if (!user) throw new AppError(404, 'User not found')
  if (!user.publicProfile) throw new AppError(403, 'This profile is private')

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
  } = req.body as {
    displayName?: string
    bio?: string
    favoriteGenres?: string[]
    publicProfile?: boolean
    socialTwitter?: string
    socialAnilist?: string
    socialMal?: string
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { displayName, bio, favoriteGenres, publicProfile, socialTwitter, socialAnilist, socialMal },
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
