import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { deleteDownloadApi, listDownloadsApi, type Download } from '../api/downloads'
import { formatRelativeDate } from '../utils/mangadex'

const MAX_STORAGE_BYTES = 500 * 1024 * 1024 // 500 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Downloads() {
  const { isPro } = useAuth()

  if (!isPro) return <UpgradePrompt />

  return <DownloadsList />
}

function UpgradePrompt() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="text-5xl">📥</div>
      <h1 className="mt-4 font-display text-4xl tracking-wider">Downloads</h1>
      <p className="mt-3 text-surface-muted">
        Download chapters to read offline — available on MangaVerse Pro.
      </p>
      <div className="mt-8 card p-6 text-left space-y-3">
        {[
          'Download any chapter for offline reading',
          'Up to 500 MB local storage',
          'Access all 50+ premium manga titles',
          'Ad-free reading experience',
          'Support the MangaVerse project',
        ].map((benefit) => (
          <div key={benefit} className="flex items-center gap-3 text-sm text-white/80">
            <span className="text-primary-400">✦</span>
            {benefit}
          </div>
        ))}
      </div>
      <Link to="/subscribe" className="btn-primary mt-8 inline-flex text-base px-6 py-3">
        Upgrade to Pro · $3.99/month
      </Link>
    </section>
  )
}

function DownloadsList() {
  const qc = useQueryClient()

  const { data: downloads = [], isLoading } = useQuery({
    queryKey: ['downloads'],
    queryFn: listDownloadsApi,
    staleTime: 15 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDownloadApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['downloads'] }),
  })

  const completed = downloads.filter((d) => d.status === 'completed')
  const pending   = downloads.filter((d) => d.status === 'pending')
  const failed    = downloads.filter((d) => d.status === 'failed')

  const usedBytes = completed.reduce((sum, d) => sum + (d.fileSize ?? 0), 0)
  const usedPct   = Math.min(100, (usedBytes / MAX_STORAGE_BYTES) * 100)

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl tracking-wider neon-text-primary">Downloads</h1>

      {/* Storage bar */}
      <div className="mt-6 card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-muted">Storage used</span>
          <span className="font-medium text-white">
            {formatBytes(usedBytes)} / {formatBytes(MAX_STORAGE_BYTES)}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-border">
          <div
            className={`h-full rounded-full transition-all ${
              usedPct > 80 ? 'bg-red-500' : 'bg-gradient-to-r from-primary-600 to-primary-400'
            }`}
            style={{ width: `${usedPct}%` }}
          />
        </div>
      </div>

      {isLoading && (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface-card" />
          ))}
        </div>
      )}

      {!isLoading && downloads.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-4xl">📥</p>
          <p className="mt-3 text-lg text-surface-muted">No downloads yet.</p>
          <p className="mt-1 text-sm text-surface-muted">
            Open a chapter and tap the download button to save it for offline reading.
          </p>
          <Link to="/library" className="btn-primary mt-6 inline-flex">
            Browse Manga
          </Link>
        </div>
      )}

      {/* Active downloads */}
      {pending.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl tracking-wider">Downloading</h2>
          <div className="mt-3 space-y-2">
            {pending.map((d) => (
              <ActiveDownloadRow key={d.id} download={d} />
            ))}
          </div>
        </div>
      )}

      {/* Failed */}
      {failed.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl tracking-wider text-red-300">Failed</h2>
          <div className="mt-3 space-y-2">
            {failed.map((d) => (
              <DownloadRow
                key={d.id}
                download={d}
                onDelete={() => deleteMutation.mutate(d.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl tracking-wider">
            Downloaded
            <span className="ml-2 text-base font-normal text-surface-muted">({completed.length})</span>
          </h2>
          <div className="mt-3 space-y-2">
            {completed.map((d) => (
              <DownloadRow
                key={d.id}
                download={d}
                onDelete={() => deleteMutation.mutate(d.id)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function ActiveDownloadRow({ download: d }: { download: Download }) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{d.mangaTitle}</p>
        <p className="text-xs text-surface-muted truncate">{d.chapterTitle}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-border">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary-500" />
        </div>
      </div>
      <span className="text-xs text-surface-muted shrink-0">Downloading…</span>
    </div>
  )
}

function DownloadRow({
  download: d,
  onDelete,
}: {
  download: Download
  onDelete: () => void
}) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{d.mangaTitle}</p>
        <p className="text-xs text-surface-muted truncate">{d.chapterTitle}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-surface-muted">
          {d.fileSize !== null && <span>{formatBytes(d.fileSize)}</span>}
          <span>·</span>
          <span>{formatRelativeDate(d.createdAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {d.status === 'completed' && d.filePath && (
          <Link
            to={`/read/${d.chapterId}?offline=1&m=${d.mangaId}`}
            className="btn-ghost text-xs"
          >
            Read Offline
          </Link>
        )}
        {d.status === 'failed' && (
          <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-xs text-red-300">
            Failed
          </span>
        )}
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete download"
          className="rounded-lg p-2 text-surface-muted hover:bg-surface-hover hover:text-red-300 transition"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
