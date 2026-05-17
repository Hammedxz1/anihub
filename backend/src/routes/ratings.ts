import { Router } from 'express'
import { requireAuth, optionalAuth } from '../middleware/auth'
import { upsert, listByManga } from '../controllers/ratingController'

const router = Router()

router.get('/manga/:mangaId', optionalAuth, listByManga)
router.put('/manga/:mangaId', requireAuth, upsert)

export default router
