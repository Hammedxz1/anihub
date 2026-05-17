import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { list, create, remove } from '../controllers/bookmarkController'

const router = Router()

router.use(requireAuth)

router.get('/', list)
router.post('/', create)
router.delete('/:id', remove)

export default router
