import { useParams } from 'react-router-dom'

export default function Profile() {
  const { username } = useParams()
  return (
    <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl tracking-wider">@{username}</h1>
      <p className="mt-2 text-surface-muted">Public profile page.</p>
    </section>
  )
}
