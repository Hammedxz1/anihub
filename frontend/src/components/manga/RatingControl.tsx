import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRatingsApi, upsertRatingApi } from '../../api/ratings'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

export function RatingControl({ mangaId }: { mangaId: string }) {
  const { isAuthenticated, user } = useAuth()
  const qc = useQueryClient()
  const [hover, setHover] = useState<number | null>(null)

  const { data } = useQuery({
    queryKey: ['ratings', mangaId],
    queryFn: () => getRatingsApi(mangaId),
    staleTime: 30 * 1000,
  })

  const userRating = useMemo(
    () => data?.ratings.find((r) => r.userId === user?.id)?.score ?? 0,
    [data, user?.id],
  )

  const mutation = useMutation({
    mutationFn: (score: number) => upsertRatingApi(mangaId, score),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ratings', mangaId] }),
  })

  const avg = data?.average ?? 0
  const count = data?.count ?? 0
  const displayed = hover ?? userRating

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 font-display text-2xl text-amber-300">
          <span>★</span>
          <span className="text-white">
            {avg ? avg.toFixed(1) : '—'}
          </span>
        </div>
        <span className="text-xs text-surface-muted">
          {count.toLocaleString()} {count === 1 ? 'rating' : 'ratings'}
        </span>
      </div>

      {isAuthenticated && (
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHover(null)}
          role="radiogroup"
          aria-label="Your rating"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              type="button"
              disabled={mutation.isPending}
              onMouseEnter={() => setHover(n)}
              onClick={() => mutation.mutate(n)}
              className={cn(
                'text-xl transition disabled:cursor-not-allowed',
                n <= displayed ? 'text-amber-300' : 'text-surface-border hover:text-amber-300/60',
              )}
              aria-label={`Rate ${n} of 10`}
            >
              ★
            </button>
          ))}
          {userRating > 0 && (
            <span className="ml-2 text-xs text-surface-muted">Your rating: {userRating}/10</span>
          )}
        </div>
      )}
    </div>
  )
}
