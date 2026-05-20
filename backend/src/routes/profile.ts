import { Router } from 'express'
import { requireAuth, optionalAuth } from '../middleware/auth'
import { avatarUpload } from '../config/upload'
import {
  getByUsername,
  getMe,
  updateMe,
  uploadAvatar,
  deleteMe,
  getUserLibrary,
  getUserStats,
} from '../controllers/profileController'

const router = Router()

router.get('/me', requireAuth, getMe)
router.patch('/me', requireAuth, updateMe)
router.post('/me/avatar', requireAuth, avatarUpload.single('avatar'), uploadAvatar)
router.delete('/me', requireAuth, deleteMe)

router.get('/:username/library', optionalAuth, getUserLibrary)
router.get('/:username/stats',   optionalAuth, getUserStats)
router.get('/:username',         optionalAuth, getByUsername)

export default router
