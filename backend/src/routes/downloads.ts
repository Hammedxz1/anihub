import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { requirePro } from '../middleware/requirePro'
import { list, create, getFile, remove } from '../controllers/downloadController'

const router = Router()

router.use(requireAuth)

router.get('/', list)
router.post('/', requirePro, create)
router.get('/:id/file', requirePro, getFile)
router.delete('/:id', remove)

export default router
