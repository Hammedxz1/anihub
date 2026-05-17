import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-7xl tracking-wider neon-text-primary">404</h1>
      <p className="mt-4 text-surface-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
    </section>
  )
}
