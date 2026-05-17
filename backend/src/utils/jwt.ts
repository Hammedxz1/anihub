import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AccessPayload {
  sub: string
  type: 'access'
}

export interface RefreshPayload {
  sub: string
  type: 'refresh'
}

export interface ResetPayload {
  sub: string
  type: 'reset'
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'access' } satisfies AccessPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'refresh' } satisfies RefreshPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export function signResetToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'reset' } satisfies ResetPayload, env.JWT_SECRET, {
    expiresIn: '1h',
  })
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessPayload
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload
}

export function verifyResetToken(token: string): ResetPayload {
  return jwt.verify(token, env.JWT_SECRET) as ResetPayload
}

export function refreshTokenCookieOptions(): object {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/api/auth',
  }
}
