import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { env } from './env'
import router from '../routes'
import { errorHandler } from '../middleware/errorHandler'
import { notFound } from '../middleware/notFound'
import { UPLOAD_ROOT } from './upload'

const app = express()

app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(compression())

// Raw body for Stripe webhook — must come before express.json()
app.use(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Serve uploaded files (avatars, downloads)
app.use('/uploads', express.static(UPLOAD_ROOT))

app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }),
)

app.use('/api', router)
app.use(notFound)
app.use(errorHandler)

export default app
