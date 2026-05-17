import { Router } from 'express'
import { optionalAuth } from '../middleware/auth'
import { search, getById, getChapters, getRelated, getTags } from '../controllers/mangaController'

const router = Router()

router.get('/', optionalAuth, search)
router.get('/tags', getTags)
router.get('/:id', optionalAuth, getById)
router.get('/:id/chapters', optionalAuth, getChapters)
router.get('/:id/related', optionalAuth, getRelated)

export default router
