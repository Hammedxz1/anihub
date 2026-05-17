import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV:             z.enum(['development', 'production', 'test']).default('development'),
  PORT:                 z.coerce.number().default(3001),
  DATABASE_URL:         z.string().url(),
  JWT_SECRET:           z.string().min(32),
  JWT_REFRESH_SECRET:   z.string().min(32),
  JWT_EXPIRES_IN:       z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN:          z.string().default('http://localhost:5173'),
  BCRYPT_ROUNDS:        z.coerce.number().default(12),
})

export const env = envSchema.parse(process.env)
export type Env = z.infer<typeof envSchema>
