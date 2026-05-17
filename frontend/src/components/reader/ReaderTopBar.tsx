import { useNavigate } from 'react-router-dom'
import type { MangaDexChapter } from '../../types/chapter'

interface ReaderTopBarProps {
  visible: boolean
  mangaTitle: string
  mangaId: string | null
  chapter: MangaDexChapter | null
  allChapters: MangaDexChapter[]
  onSelectChapter: (chapterId: string) => void
}

function chapterLabel(c: MangaDexChapter): string {
  const ch = c.attributes.chapter ? `Ch. ${c.attributes.chapter}` : 'Oneshot'
  if (c.attributes.title) return `${ch} — ${c.attributes.title}`
  return ch
}

export function ReaderTopBar({
  visible,
  mangaTitle,
  mangaId,
  chapter,
  allChapters,
  onSelectChapter,
}: ReaderTopBarProps) {
  const navigate = useNavigate()

  return (
    <div
      className={`fixed inset-x-0 top-0 z-30 transform border-b border-surface-border bg-surface/85 backdrop-blur-xl transition-transform duration-200 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => (mangaId ? navigate(`/manga/${mangaId}`) : navigate(-1))}
          className="rounded-full border border-surface-border bg-surface-card p-2 text-white hover:bg-surface-hover"
          aria-label="Back"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{mangaTitle}</p>
          {chapter && (
            <p className="truncate text-xs text-surface-muted">{chapterLabel(chapter)}</p>
          )}
        </div>

        {allChapters.length > 0 && chapter && (
          <select
            value={chapter.id}
            onChange={(e) => onSelectChapter(e.target.value)}
            className="max-w-[160px] truncate rounded-xl border border-surface-border bg-surface-card px-2 py-1.5 text-xs text-white focus:border-primary-500 focus:outline-none md:max-w-xs"
          >
            {allChapters.map((c) => (
              <option key={c.id} value={c.id}>
                {chapterLabel(c)}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
