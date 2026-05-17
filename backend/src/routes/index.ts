import { Router } from 'express'
import authRouter from './auth'
import profileRouter from './profile'
import mangaRouter from './manga'
import readerRouter from './reader'
import bookmarksRouter from './bookmarks'
import libraryRouter from './library'
import progressRouter from './progress'
import downloadsRouter from './downloads'
import ratingsRouter from './ratings'
import commentsRouter from './comments'
import stripeRouter from './stripe'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

router.use('/auth', authRouter)
router.use('/users', profileRouter)
router.use('/manga', mangaRouter)
router.use('/reader', readerRouter)
router.use('/bookmarks', bookmarksRouter)
router.use('/library', libraryRouter)
router.use('/progress', progressRouter)
router.use('/downloads', downloadsRouter)
router.use('/ratings', ratingsRouter)
router.use('/comments', commentsRouter)
router.use('/stripe', stripeRouter)

export default router
