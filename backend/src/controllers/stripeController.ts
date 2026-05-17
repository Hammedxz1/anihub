import type { Request, Response } from 'express'
import { prisma } from '../config/database'
import {
  createCheckoutSession,
  createPortalSession,
  constructWebhookEvent,
  handleWebhookEvent,
} from '../services/stripe'
import { AppError } from '../middleware/errorHandler'

export async function createCheckout(req: Request, res: Response) {
  const { url } = await createCheckoutSession(req.user!.id, req.user!.email)
  res.json({ url })
}

export async function createPortal(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { stripeCustomerId: true },
  })

  if (!user?.stripeCustomerId) throw new AppError(400, 'No billing account found')

  const { url } = await createPortalSession(user.stripeCustomerId)
  res.json({ url })
}

export async function webhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string
  if (!sig) throw new AppError(400, 'Missing stripe-signature header')

  let event
  try {
    event = constructWebhookEvent(req.body as Buffer, sig)
  } catch {
    throw new AppError(400, 'Invalid webhook signature')
  }

  await handleWebhookEvent(event)
  res.json({ received: true })
}

export async function getSubscription(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { subscriptionStatus: true, subscriptionEndDate: true, stripeCustomerId: true },
  })

  if (!user) throw new AppError(404, 'User not found')
  res.json(user)
}
