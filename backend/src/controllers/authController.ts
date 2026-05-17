import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'
import { env } from '../config/env'
import {
  signAccessToken,
  signRefreshToken,
  signResetToken,
  verifyRefreshToken,
  verifyResetToken,
  refreshTokenCookieOptions,
} from '../utils/jwt'
import { AppError } from '../middleware/errorHandler'
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email'

export async function register(req: Request, res: Response) {
  const { email, username, password } = req.body as {
    email: string
    username: string
    password: string
  }

  if (!email || !username || !password) throw new AppError(400, 'email, username, and password are required')
  if (password.length < 8) throw new AppError(400, 'Password must be at least 8 characters')

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  })
  if (existing?.email === email) throw new AppError(409, 'Email already in use')
  if (existing?.username === username) throw new AppError(409, 'Username already taken')

  const rounds = Number(env.BCRYPT_ROUNDS)
  const passwordHash = await bcrypt.hash(password, rounds)

  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: { id: true, email: true, username: true, subscriptionStatus: true },
  })

  await sendWelcomeEmail(email, username).catch(() => {})

  const accessToken = signAccessToken(user.id)
  const refreshToken = signRefreshToken(user.id)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })

  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions())
  res.status(201).json({ accessToken, refreshToken, user })
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string }

  if (!email || !password) throw new AppError(400, 'email and password are required')

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, username: true, passwordHash: true, subscriptionStatus: true },
  })
  if (!user) throw new AppError(401, 'Invalid credentials')

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new AppError(401, 'Invalid credentials')

  const accessToken = signAccessToken(user.id)
  const refreshToken = signRefreshToken(user.id)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })

  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions())

  const { passwordHash: _, ...safeUser } = user
  res.json({ accessToken, refreshToken, user: safeUser })
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.refreshToken as string | undefined
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } }).catch(() => {})
  }
  res.clearCookie('refreshToken', { path: '/api/auth' })
  res.json({ message: 'Logged out' })
}

export async function refresh(req: Request, res: Response) {
  const token = (req.cookies?.refreshToken ?? req.body?.refreshToken) as string | undefined
  if (!token) throw new AppError(401, 'Refresh token required')

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token')
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } })
  if (!stored || stored.userId !== payload.sub || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token revoked or expired')
  }

  await prisma.refreshToken.delete({ where: { token } })

  const newRefreshToken = signRefreshToken(payload.sub)
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: payload.sub, expiresAt: newExpiresAt },
  })

  const accessToken = signAccessToken(payload.sub)
  res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions())
  res.json({ accessToken, refreshToken: newRefreshToken })
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as { email: string }
  if (!email) throw new AppError(400, 'email is required')

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })

  // Always respond 200 to prevent email enumeration
  if (user) {
    const resetToken = signResetToken(user.id)
    await sendPasswordResetEmail(email, resetToken).catch(() => {})
  }

  res.json({ message: 'If that email exists you will receive a reset link shortly' })
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body as { token: string; password: string }
  if (!token || !password) throw new AppError(400, 'token and password are required')
  if (password.length < 8) throw new AppError(400, 'Password must be at least 8 characters')

  let payload
  try {
    payload = verifyResetToken(token)
  } catch {
    throw new AppError(400, 'Invalid or expired reset token')
  }

  const rounds = Number(env.BCRYPT_ROUNDS)
  const passwordHash = await bcrypt.hash(password, rounds)
  await prisma.user.update({ where: { id: payload.sub }, data: { passwordHash } })

  // Invalidate all refresh tokens for this user
  await prisma.refreshToken.deleteMany({ where: { userId: payload.sub } })

  res.json({ message: 'Password updated successfully' })
}
