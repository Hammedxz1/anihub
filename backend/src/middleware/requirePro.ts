import type { Request, Response, NextFunction } from 'express'
import { AppError } from './errorHandler'

export function requirePro(req: Request, _res: Response, next: NextFunction) {
  const status = req.user?.subscriptionStatus
  if (status === 'premium' || status === 'pro') return next()
  next(new AppError(403, 'Premium subscription required'))
}
