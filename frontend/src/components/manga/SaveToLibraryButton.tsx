import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  addToLibraryApi,
  listLibraryApi,
  removeFromLibraryApi,
  type LibraryStatus,
} from '../../api/library'
import { useAuth } from '../../context/AuthContext'

interface SaveToLibraryButtonProps {
  mangaId: string
  mangaTitle: string
  coverUrl?: string | null
  totalChapters?: number
}

const STATUSES: { value: LibraryStatus; label: string }[] = [
  { value: 'reading',       label: 'Reading' },
  { value: 'completed',     label: 'Completed' },
  { value: 'on_hold',       label: 'On Hold' },
  { value: 'dropped',       label: 'Dropped' },
  { value: 'plan_to_read',  label: 'Plan to Read' },
]

export function SaveToLibraryButton({ mangaId, mangaTitle, coverUrl, totalChapters }: SaveToLibraryButtonProps) {
  const { isAuthenticated } = useAuth()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const { data: library } = useQuery({
    queryKey: ['library', 'all'],
    queryFn: () => listLibraryApi(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  })

  const current = library?.find((i) => i.mangaId === mangaId)

  const saveMutation = useMutation({
    mutationFn: (status: LibraryStatus) =>
      addToLibraryApi({ mangaId, mangaTitle, coverUrl, status, totalChapters }),
    onSuccess: (_, status) => {
      qc.invalidateQueries({ queryKey: ['library', 'all'] })
      qc.invalidateQueries({ queryKey: ['my-library'] })
      const label = STATUSES.find((s) => s.value === status)?.label ?? status
      toast.success(`Added to library · ${label}`)
    },
    onError: () => toast.error('Could not add to library'),
  })

  const removeMutation = useMutation({
    mutationFn: () => removeFromLibraryApi(mangaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library', 'all'] })
      qc.invalidateQueries({ queryKey: ['my-library'] })
      toast.success('Removed from library')
    },
    onError: () => toast.error('Could not remove from library'),
  })

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!isAuthenticated) return null

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="btn-ghost">
        {current
          ? `In Library · ${STATUSES.find((s) => s.value === current.status)?.label ?? current.status}`
          : 'Save to Library'}
        <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 animate-slide-up overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-xl">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                saveMutation.mutate(s.value)
                setOpen(false)
              }}
              className="block w-full px-4 py-2.5 text-left text-sm text-white/80 transition hover:bg-surface-hover hover:text-white"
            >
              {s.label}
            </button>
          ))}
          {current && (
            <button
              type="button"
              onClick={() => {
                removeMutation.mutate()
                setOpen(false)
              }}
              className="block w-full border-t border-surface-border px-4 py-2.5 text-left text-sm text-rose-300 transition hover:bg-surface-hover"
            >
              Remove from library
            </button>
          )}
        </div>
      )}
    </div>
  )
}
