import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { createCheckout, createPortal, webhook, getSubscription } from '../controllers/stripeController'

const router = Router()

// Webhook must use raw body — mounted with express.raw in app.ts
router.post('/webhook', webhook)

router.use(requireAuth)
router.get('/subscription', getSubscription)
router.post('/checkout', createCheckout)
router.post('/portal', createPortal)

export default router
