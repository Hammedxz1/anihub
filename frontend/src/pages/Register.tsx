import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
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
          <label className="mb-1 block text-sm text-surface-muted" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-xl border border-surface-border bg-surface-card px-4 py-2.5 text-white placeholder:text-surface-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
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
            className="w-full rounded-xl border border-surface-border bg-surface-card px-4 py-2.5 text-white placeholder:text-surface-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
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
            className="w-full rounded-xl border border-surface-border bg-surface-card px-4 py-2.5 text-white placeholder:text-surface-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>

        {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
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
