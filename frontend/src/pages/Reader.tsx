import { useParams } from 'react-router-dom'

export default function Reader() {
  const { chapterId } = useParams()
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl tracking-wider">Reader</h1>
      <p className="mt-2 text-surface-muted">Chapter: {chapterId}</p>
    </section>
  )
}
