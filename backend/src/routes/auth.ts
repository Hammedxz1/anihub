import { Router } from 'express'
import { authLimiter } from '../middleware/rateLimiter'
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
} from '../controllers/authController'

const router = Router()

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/logout', logout)
router.post('/refresh', refresh)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password', authLimiter, resetPassword)

export default router
