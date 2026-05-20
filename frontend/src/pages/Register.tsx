import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500' }
  if (score <= 2) return { score, label: 'Fair',   color: 'bg-amber-500' }
  if (score <= 3) return { score, label: 'Good',   color: 'bg-yellow-400' }
  return           { score, label: 'Strong', color: 'bg-emerald-500' }
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail]             = useState('')
  const [username, setUsername]       = useState('')
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [tos, setTos]                 = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [submitting, setSubmitting]   = useState(false)

  const strength = useMemo(() => passwordStrength(password), [password])
  const mismatch = confirm.length > 0 && confirm !== password

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (!tos) { setError('You must accept the Terms of Service'); return }
    setError(null)
    setSubmitting(true)
    try {
      await register(email, username, password)
      navigate('/', { replace: true })
    } catch (err) {
      const message =
        err instanceof Error && 'response' in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Registration failed')
          : 'Registration failed'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl tracking-wider neon-text-primary">Create account</h1>
      <p className="mt-2 text-surface-muted">Join MangaVerse and start reading.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-surface-muted" htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
            autoComplete="name"
            placeholder="How others see you (optional)"
            className="input"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-surface-muted" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="input"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-surface-muted" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={30}
            pattern="^[a-zA-Z0-9_]+$"
            autoComplete="username"
            placeholder="Letters, numbers, underscores"
            className="input"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-surface-muted" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
          />
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= strength.score ? strength.color : 'bg-surface-border'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-surface-muted">{strength.label}</p>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-surface-muted" htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            className={`input ${mismatch ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40' : ''}`}
          />
          {mismatch && <p className="mt-1 text-xs text-red-400">Passwords do not match</p>}
        </div>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={tos}
            onChange={(e) => setTos(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary-500"
            required
          />
          <span className="text-sm text-surface-muted">
            I agree to the{' '}
            <Link to="/terms" className="text-primary-300 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-primary-300 hover:underline">Privacy Policy</Link>
          </span>
        </label>

        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting || mismatch} className="btn-primary w-full">
          {submitting ? 'Creating…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-surface-muted">
          Already a member?{' '}
          <Link to="/login" className="text-primary-300 hover:underline">Log in</Link>
        </p>
      </form>
    </section>
  )
}
