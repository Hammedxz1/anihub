import type { ReaderSettings, ReadingMode } from '../../hooks/useReaderSettings'
import { cn } from '../../utils/cn'

interface ReaderBottomBarProps {
  visible: boolean
  page: number
  totalPages: number
  settings: ReaderSettings
  onSettingsChange: (patch: Partial<ReaderSettings>) => void
  onBookmark: () => void
  bookmarkSaved: boolean
}

const MODES: { value: ReadingMode; label: string }[] = [
  { value: 'paged',      label: 'Paged' },
  { value: 'long-strip', label: 'Long Strip' },
  { value: 'webtoon',    label: 'Webtoon' },
]

export function ReaderBottomBar({
  visible,
  page,
  totalPages,
  settings,
  onSettingsChange,
  onBookmark,
  bookmarkSaved,
}: ReaderBottomBarProps) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 transform border-t border-surface-border bg-surface/85 backdrop-blur-xl transition-transform duration-200 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
        <span className="font-display text-lg tracking-wider text-white">
          {totalPages > 0 ? `${Math.min(page, totalPages)} / ${totalPages}` : '— / —'}
        </span>

        <div className="flex items-center gap-1 rounded-xl border border-surface-border bg-surface-card p-1">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onSettingsChange({ mode: m.value })}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition',
                settings.mode === m.value
                  ? 'bg-primary-600/30 text-primary-200'
                  : 'text-white/70 hover:bg-surface-hover hover:text-white',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {settings.mode === 'paged' && (
          <button
            type="button"
            onClick={() =>
              onSettingsChange({ direction: settings.direction === 'ltr' ? 'rtl' : 'ltr' })
            }
            className="rounded-xl border border-surface-border bg-surface-card px-2.5 py-1.5 text-xs font-medium text-white/80 hover:bg-surface-hover"
            aria-label="Toggle reading direction"
          >
            {settings.direction === 'ltr' ? 'LTR →' : '← RTL'}
          </button>
        )}

        <button
          type="button"
          onClick={onBookmark}
          className={cn(
            'rounded-xl border px-2.5 py-1.5 text-xs font-medium transition',
            bookmarkSaved
              ? 'border-primary-500 bg-primary-600/20 text-primary-200 shadow-glow-primary'
              : 'border-surface-border bg-surface-card text-white/80 hover:bg-surface-hover',
          )}
          aria-label="Bookmark current page"
        >
          {bookmarkSaved ? '★ Bookmarked' : '☆ Bookmark'}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <svg className="h-4 w-4 text-surface-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4" />
            <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          <input
            type="range"
            min={30}
            max={100}
            value={settings.brightness}
            onChange={(e) => onSettingsChange({ brightness: Number(e.target.value) })}
            className="w-24 accent-primary-500"
            aria-label="Brightness"
          />
        </div>
      </div>
    </div>
  )
}
