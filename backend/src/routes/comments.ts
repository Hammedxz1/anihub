import { Router } from 'express'
import { requireAuth, optionalAuth } from '../middleware/auth'
import { create, listByManga } from '../controllers/commentController'

const router = Router()

router.get('/manga/:mangaId', optionalAuth, listByManga)
router.post('/manga/:mangaId', requireAuth, create)

export default router
