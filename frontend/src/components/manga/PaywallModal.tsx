import { useState } from 'react'
import { createCheckoutApi } from '../../api/stripe'

interface PaywallModalProps {
  open: boolean
  onClose: () => void
}

const BENEFITS = [
  'Unlimited access to all premium manga',
  'Read every chapter — no free-chapter limit',
  'Offline downloads for reading anywhere',
  'High-resolution covers and pages',
  'Support the platform and creators',
]

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleUpgrade() {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="card relative w-full max-w-md animate-slide-up overflow-hidden p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-surface-muted hover:bg-surface-hover hover:text-white"
          aria-label="Close"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>

        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-200">
            ✦ MangaVerse Pro
          </div>
          <h2 className="mt-4 font-display text-3xl tracking-wider neon-text-primary">
            You've reached the free chapter limit
          </h2>
          <p className="mt-2 text-sm text-surface-muted">
            Premium titles are free for the first 3 chapters. Upgrade to keep reading.
          </p>
        </div>

        <ul className="mt-6 space-y-2.5">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-white/90">
              <span className="mt-0.5 text-primary-400">✦</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {error && (
          <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleUpgrade}
          disabled={loading}
          className="btn-primary mt-6 w-full text-base"
        >
          {loading ? 'Redirecting…' : 'Upgrade for $3.99/month'}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2 text-xs text-surface-muted hover:text-white"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
