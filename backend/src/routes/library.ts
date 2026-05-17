import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { list, add, update, remove } from '../controllers/libraryController'

const router = Router()

router.use(requireAuth)

router.get('/', list)
router.post('/', add)
router.patch('/:mangaId', update)
router.delete('/:mangaId', remove)

export default router
