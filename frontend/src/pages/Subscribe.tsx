import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createCheckoutApi, createPortalApi } from '../api/stripe'
import { cn } from '../utils/cn'

const FREE_FEATURES = [
  { label: 'Browse & search manga',      included: true  },
  { label: 'Reading list & library',     included: true  },
  { label: 'Reading progress sync',      included: true  },
  { label: 'Bookmarks',                  included: true  },
  { label: 'Community comments',         included: true  },
  { label: 'First 3 chapters free',      included: true  },
  { label: 'Premium titles (50+)',       included: false },
  { label: 'Offline downloads',          included: false },
  { label: 'Ad-free reading',            included: false },
  { label: 'Pro profile badge',          included: false },
]

const PRO_FEATURES = [
  { label: 'Browse & search manga',      included: true },
  { label: 'Reading list & library',     included: true },
  { label: 'Reading progress sync',      included: true },
  { label: 'Bookmarks',                  included: true },
  { label: 'Community comments',         included: true },
  { label: 'All chapters unlocked',      included: true },
  { label: 'Premium titles (50+)',       included: true },
  { label: 'Offline downloads',          included: true },
  { label: 'Ad-free reading',            included: true },
  { label: 'Pro profile badge',          included: true },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — cancel from your billing portal with one click. You keep Pro access until the end of your billing period.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all major credit and debit cards via Stripe. Your payment info is never stored on our servers.',
  },
  {
    q: 'What counts as a "premium title"?',
    a: 'A curated set of 50+ well-known titles. Free users can read the first 3 chapters of each; Pro users get full access.',
  },
  {
    q: 'How does offline reading work?',
    a: 'Pro users can download individual chapters from any manga detail page. Downloads are stored locally in your browser.',
  },
  {
    q: 'Is there a free trial?',
    a: 'You can read the first 3 chapters of every premium title for free — no credit card required.',
  },
]

export default function Subscribe() {
  const { user, isPro } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    if (!user) { window.location.href = '/register'; return }
    setLoading(true)
    setError(null)
    try {
      const { url } = await createCheckoutApi()
      window.location.href = url
    } catch {
      setError('Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  async function handlePortal() {
    setLoading(true)
    setError(null)
    try {
      const { url } = await createPortalApi()
      window.location.href = url
    } catch {
      setError('Could not open billing portal.')
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:px-6">
      {/* Hero */}
      <div className="text-center">
        <h1 className="font-display text-5xl tracking-wider neon-text-primary">Go Pro</h1>
        <p className="mt-3 text-lg text-surface-muted">
          Unlock every chapter, download for offline, and read ad-free.
        </p>
      </div>

      {/* Current plan banner */}
      {isPro && (
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4">
          <div>
            <p className="font-medium text-amber-200">✦ You're on MangaVerse Pro</p>
            {user?.subscriptionEndDate && (
              <p className="mt-0.5 text-sm text-amber-200/70">
                Renews {new Date(user.subscriptionEndDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handlePortal}
            disabled={loading}
            className="btn-ghost text-sm"
          >
            Manage Subscription
          </button>
        </div>
      )}

      {/* Pricing cards */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="card p-6">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl tracking-wider text-white">Free</span>
          </div>
          <p className="mt-1 text-sm text-surface-muted">Get started, no credit card needed</p>

          <div className="mt-6 space-y-3">
            {FREE_FEATURES.map((f) => (
              <Feature key={f.label} label={f.label} included={f.included} />
            ))}
          </div>

          {!user && (
            <Link to="/register" className="btn-ghost mt-8 block text-center text-sm">
              Create free account
            </Link>
          )}
          {user && !isPro && (
            <p className="mt-8 text-center text-sm text-surface-muted">Your current plan</p>
          )}
        </div>

        {/* Pro */}
        <div className="card relative p-6 neon-border-primary">
          <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white shadow-glow-primary">
            Most Popular
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl tracking-wider neon-text-primary">Pro</span>
            <span className="text-2xl font-bold text-white">$3.99</span>
            <span className="text-sm text-surface-muted">/month</span>
          </div>
          <p className="mt-1 text-sm text-surface-muted">Everything in Free, plus:</p>

          <div className="mt-6 space-y-3">
            {PRO_FEATURES.map((f) => (
              <Feature key={f.label} label={f.label} included={f.included} />
            ))}
          </div>

          {!isPro ? (
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary mt-8 w-full text-sm py-3"
            >
              {loading ? 'Redirecting…' : 'Upgrade to Pro'}
            </button>
          ) : (
            <p className="mt-8 text-center text-sm text-amber-200">✦ Active plan</p>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
          {error}
        </p>
      )}

      {/* FAQ */}
      <div className="mt-20">
        <h2 className="text-center font-display text-3xl tracking-wider">FAQ</h2>
        <div className="mt-8 space-y-4">
          {FAQ.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Feature({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className={cn('shrink-0', included ? 'text-primary-400' : 'text-surface-muted')}>
        {included ? '✓' : '×'}
      </span>
      <span className={included ? 'text-white/90' : 'text-surface-muted line-through'}>{label}</span>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <span className="font-medium text-white">{q}</span>
        <span className={cn('shrink-0 text-primary-400 transition-transform', open && 'rotate-180')}>
          ▾
        </span>
      </button>
      {open && (
        <div className="border-t border-surface-border px-5 pb-5 pt-3 text-sm text-white/80">
          {a}
        </div>
      )}
    </div>
  )
}
