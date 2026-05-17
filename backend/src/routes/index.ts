import { Router } from 'express'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Feature routes will be mounted here:
// router.use('/auth',    authRouter)
// router.use('/manga',   mangaRouter)
// router.use('/chapters', chapterRouter)
// router.use('/users',   userRouter)

export default router
