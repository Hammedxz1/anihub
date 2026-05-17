import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getByManga, upsert, recent } from '../controllers/progressController'

const router = Router()

router.use(requireAuth)

router.get('/recent', recent)
router.get('/:mangaId', getByManga)
router.put('/', upsert)

export default router
