import { useParams } from 'react-router-dom'

export default function MangaDetail() {
  const { id } = useParams()
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl tracking-wider">Manga detail</h1>
      <p className="mt-2 text-surface-muted">ID: {id}</p>
    </section>
  )
}
