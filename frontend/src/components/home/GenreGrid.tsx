import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTagsApi } from '../../api/manga'
import type { MangaDexTag } from '../../types/manga'

const GENRE_ICONS: Record<string, string> = {
  Action:        '⚔️',
  Adventure:     '🗺️',
  Comedy:        '😄',
  Drama:         '🎭',
  Fantasy:       '🐉',
  Horror:        '👻',
  Mystery:       '🔍',
  Romance:       '💕',
  'Sci-Fi':      '🚀',
  'Slice of Life': '☕',
  Sports:        '⚽',
  Supernatural:  '🌙',
  Thriller:      '🔪',
  Tragedy:       '💔',
  Psychological: '🧠',
  Historical:    '📜',
  Mecha:         '🤖',
  Martial_Arts:  '🥋',
  Music:         '🎵',
  School_Life:   '🏫',
}

function tagName(tag: MangaDexTag): string {
  return tag.attributes.name.en ?? Object.values(tag.attributes.name)[0] ?? 'Tag'
}

function iconFor(name: string): string {
  return GENRE_ICONS[name] ?? GENRE_ICONS[name.replace(/\s+/g, '_')] ?? '📚'
}

export function GenreGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ['manga', 'tags'],
    queryFn: getTagsApi,
    staleTime: 60 * 60 * 1000,
  })

  // Only show "genre" group tags
  const genres = (data ?? []).filter((t) => t.attributes.group === 'genre')

  return (
    <section className="mt-16 px-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 font-display text-3xl tracking-wider text-white md:text-4xl">
          Browse by Genre
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-surface-border bg-surface-card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {genres.map((tag) => {
              const name = tagName(tag)
              return (
                <Link
                  key={tag.id}
                  to={`/library?tags=${encodeURIComponent(tag.id)}`}
                  className="card group flex h-24 flex-col items-center justify-center gap-2 p-3 text-center transition-all hover:-translate-y-0.5 hover:neon-border-primary"
                >
                  <span className="text-2xl" aria-hidden="true">{iconFor(name)}</span>
                  <span className="text-sm font-medium text-white/90 group-hover:text-primary-300">{name}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
