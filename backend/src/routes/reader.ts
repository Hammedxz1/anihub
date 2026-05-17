import { Router } from 'express'
import { getPages, proxyImage } from '../controllers/readerController'

const router = Router()

router.get('/chapter/:chapterId/pages', getPages)
router.get('/proxy', proxyImage)

export default router
