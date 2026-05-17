import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { prisma } from '../config/database'
import { AppError } from './errorHandler'

async function attachUser(req: Request): Promise<boolean> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return false

  const token = authHeader.slice(7)
  let payload
  try {
    payload = verifyAccessToken(token)
  } catch {
    return false
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, username: true, subscriptionStatus: true },
  })

  if (!user) return false

  req.user = user
  return true
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const ok = await attachUser(req)
  if (!ok) return next(new AppError(401, 'Authentication required'))
  next()
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  await attachUser(req)
  next()
}
