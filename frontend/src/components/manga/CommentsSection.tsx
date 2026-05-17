import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCommentApi, listCommentsApi } from '../../api/comments'
import { useAuth } from '../../context/AuthContext'
import { formatRelativeDate } from '../../utils/mangadex'

export function CommentsSection({ mangaId }: { mangaId: string }) {
  const { isAuthenticated, user } = useAuth()
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['comments', mangaId, page],
    queryFn: () => listCommentsApi(mangaId, page, 20),
    staleTime: 30 * 1000,
  })

  const mutation = useMutation({
    mutationFn: (content: string) => createCommentApi(mangaId, content),
    onSuccess: () => {
      setText('')
      qc.invalidateQueries({ queryKey: ['comments', mangaId] })
    },
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim() || mutation.isPending) return
    mutation.mutate(text.trim())
  }

  const comments = data?.comments ?? []
  const total = data?.total ?? 0
  const pages = Math.ceil(total / (data?.limit ?? 20)) || 1

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl tracking-wider md:text-3xl">
        Comments {total > 0 && <span className="text-surface-muted">({total})</span>}
      </h2>

      {isAuthenticated ? (
        <form onSubmit={onSubmit} className="mt-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Comment as ${user?.displayName ?? user?.username}…`}
            maxLength={2000}
            rows={3}
            className="w-full resize-none rounded-2xl border border-surface-border bg-surface-card px-4 py-3 text-white placeholder:text-surface-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-surface-muted">{text.length} / 2000</span>
            <button
              type="submit"
              disabled={!text.trim() || mutation.isPending}
              className="btn-primary text-sm"
            >
              {mutation.isPending ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-4 rounded-2xl border border-surface-border bg-surface-card p-4 text-sm text-surface-muted">
          <Link to="/login" className="text-primary-300 hover:underline">Log in</Link> to leave a comment.
        </p>
      )}

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-surface-border bg-surface-card" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="mt-6 text-sm text-surface-muted">No comments yet. Be the first!</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="card flex gap-3 p-4">
              {c.user.avatarUrl ? (
                <img src={c.user.avatarUrl} alt="" className="h-9 w-9 flex-shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-accent-pink font-display text-base text-white">
                  {(c.user.displayName ?? c.user.username).charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <Link to={`/profile/${c.user.username}`} className="font-medium text-white hover:text-primary-300">
                    {c.user.displayName ?? c.user.username}
                  </Link>
                  <span className="text-xs text-surface-muted">{formatRelativeDate(c.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-white/90">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-ghost text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-surface-muted">Page {page} of {pages}</span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-ghost text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  )
}
