import Stripe from 'stripe'
import { prisma } from '../config/database'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
})

// Derive types from the live instance so they work with both CJS and ESM entry points
type StripeEvent = ReturnType<typeof stripe.webhooks.constructEvent>
type StripeSubscription = Awaited<ReturnType<typeof stripe.subscriptions.retrieve>>
type StripeInvoice = Awaited<ReturnType<typeof stripe.invoices.retrieve>>

const PRICE_ID = process.env.STRIPE_PRICE_ID ?? ''
const APP_URL = process.env.APP_URL ?? 'http://localhost:5173'

// ─── Checkout ────────────────────────────────────────────────────────────────

export async function createCheckoutSession(userId: string, email: string) {
  let customerId: string | undefined

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  })

  if (user?.stripeCustomerId) {
    customerId = user.stripeCustomerId
  } else {
    const customer = await stripe.customers.create({ email, metadata: { userId } })
    customerId = customer.id
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    success_url: `${APP_URL}/premium?success=1`,
    cancel_url: `${APP_URL}/premium?canceled=1`,
    metadata: { userId },
  })

  return { url: session.url }
}

// ─── Customer Portal ──────────────────────────────────────────────────────────

export async function createPortalSession(stripeCustomerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${APP_URL}/account`,
  })

  return { url: session.url }
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

export function constructWebhookEvent(payload: Buffer, sig: string): StripeEvent {
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? ''
  return stripe.webhooks.constructEvent(payload, sig, secret)
}

export async function handleWebhookEvent(event: StripeEvent): Promise<void> {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as StripeSubscription
      const customerId =
        typeof sub.customer === 'string' ? sub.customer : sub.customer.id

      // In API v2026-04-22, period dates live on SubscriptionItem; use cancel_at as fallback
      const periodEnd = (sub.items?.data?.[0] as { current_period_end?: number } | undefined)
        ?.current_period_end
      const endDate = periodEnd
        ? new Date(periodEnd * 1000)
        : sub.cancel_at
          ? new Date(sub.cancel_at * 1000)
          : null

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          subscriptionStatus: sub.status === 'active' ? 'premium' : sub.status,
          subscriptionEndDate: endDate,
        },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as StripeSubscription
      const customerId =
        typeof sub.customer === 'string' ? sub.customer : sub.customer.id

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          subscriptionStatus: 'free',
          subscriptionEndDate: null,
        },
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as StripeInvoice
      const customerId =
        typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

      if (!customerId) break

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { subscriptionStatus: 'past_due' },
      })
      break
    }

    default:
      break
  }
}

export { stripe }
