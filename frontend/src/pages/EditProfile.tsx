import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import {
  deleteAccountApi,
  updateProfileApi,
  uploadAvatarApi,
} from '../api/profile'
import { getTagsApi } from '../api/manga'
import { createPortalApi } from '../api/stripe'
import { PRESET_AVATARS, presetIdFromAvatarUrl } from '../constants/presetAvatars'
import { Avatar } from '../components/ui/Avatar'
import { cn } from '../utils/cn'

const MAX_BIO = 500
const MAX_AVATAR_BYTES = 2 * 1024 * 1024

export default function EditProfile() {
  const navigate = useNavigate()
  const { user, refreshUser, logout } = useAuth()
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [publicProfile, setPublicProfile] = useState(user?.publicProfile ?? true)
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(user?.favoriteGenres ?? [])
  const [socialTwitter, setSocialTwitter] = useState((user as { socialTwitter?: string } | null)?.socialTwitter ?? '')
  const [socialAnilist, setSocialAnilist] = useState((user as { socialAnilist?: string } | null)?.socialAnilist ?? '')
  const [socialMal, setSocialMal] = useState((user as { socialMal?: string } | null)?.socialMal ?? '')
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(user?.avatarUrl ?? null)

  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => {
    if (!user) return
    setDisplayName(user.displayName ?? '')
    setBio(user.bio ?? '')
    setPublicProfile(user.publicProfile ?? true)
    setFavoriteGenres(user.favoriteGenres ?? [])
    setSelectedAvatar(user.avatarUrl ?? null)
  }, [user])

  const { data: tags } = useQuery({
    queryKey: ['manga', 'tags'],
    queryFn: getTagsApi,
    staleTime: 60 * 60 * 1000,
  })

  const genres = (tags ?? []).filter((t) => t.attributes.group === 'genre')

  const presetId = presetIdFromAvatarUrl(selectedAvatar)

  const saveMutation = useMutation({
    mutationFn: () =>
      updateProfileApi({
        displayName: displayName || null,
        bio: bio || null,
        publicProfile,
        favoriteGenres,
        socialTwitter: socialTwitter || null,
        socialAnilist: socialAnilist || null,
        socialMal: socialMal || null,
      }),
    onSuccess: async () => {
      setMessage('Profile updated')
      setError(null)
      await refreshUser()
      qc.invalidateQueries({ queryKey: ['profile'] })
      setTimeout(() => setMessage(null), 2500)
    },
    onError: () => {
      setError('Could not save changes')
    },
  })

  async function handlePresetClick(presetIdValue: string) {
    const value = `preset:${presetIdValue}`
    setSelectedAvatar(value)
    try {
      // Persist preset by writing a placeholder via PATCH: store on the user
      // record using the existing updateMe endpoint (avatarUrl is not in the
      // payload, so we use a dedicated path via direct apiClient).
      const { apiClient } = await import('../api/client')
      await apiClient.patch('/users/me', { avatarUrl: value } as never)
      await refreshUser()
      setMessage('Avatar updated')
      setTimeout(() => setMessage(null), 2000)
    } catch {
      setError('Could not update avatar')
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_AVATAR_BYTES) {
      setError('Avatar must be 2 MB or smaller')
      return
    }
    try {
      const { avatarUrl } = await uploadAvatarApi(file)
      setSelectedAvatar(avatarUrl)
      await refreshUser()
      setMessage('Avatar uploaded')
      setTimeout(() => setMessage(null), 2000)
    } catch {
      setError('Avatar upload failed')
    }
  }

  function toggleGenre(id: string) {
    setFavoriteGenres((current) =>
      current.includes(id) ? current.filter((g) => g !== id) : [...current, id],
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    saveMutation.mutate()
  }

  async function handleManageSubscription() {
    try {
      const { url } = await createPortalApi()
      window.location.href = url
    } catch {
      setError('Could not open billing portal')
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') return
    try {
      await deleteAccountApi()
      await logout()
      navigate('/')
    } catch {
      setError('Could not delete account')
    }
  }

  if (!user) return null

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl tracking-wider neon-text-primary">Edit Profile</h1>

      {/* Avatar section */}
      <div className="card mt-6 p-5">
        <div className="flex items-center gap-4">
          <Avatar src={selectedAvatar} username={user.username} size={80} />
          <div>
            <h2 className="font-display text-xl tracking-wider">Avatar</h2>
            <p className="text-xs text-surface-muted">Pick a preset or upload your own (max 2 MB).</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {PRESET_AVATARS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetClick(p.id)}
              className={cn(
                'aspect-square overflow-hidden rounded-full border-2 transition',
                presetId === p.id
                  ? 'border-primary-500 shadow-glow-primary'
                  : 'border-surface-border hover:border-primary-400',
              )}
              aria-label={`Use ${p.id} avatar`}
            >
              {p.render()}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-ghost text-sm"
          >
            Upload Custom
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div className="card p-5">
          <h2 className="font-display text-xl tracking-wider">Profile</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Display Name">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                className="input"
                placeholder="How others see you"
              />
            </Field>
            <Field label="Username">
              <input value={user.username} disabled className="input opacity-60" />
            </Field>
          </div>

          <Field label={`Bio (${bio.length}/${MAX_BIO})`} className="mt-4">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO))}
              rows={4}
              className="input resize-none"
              placeholder="Tell readers a little about yourself…"
            />
          </Field>

          <label className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              checked={publicProfile}
              onChange={(e) => setPublicProfile(e.target.checked)}
              className="h-4 w-4 accent-primary-500"
            />
            <span className="text-sm text-white">Public profile</span>
            <span className="text-xs text-surface-muted">
              Allow others to view your reading list and stats
            </span>
          </label>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-xl tracking-wider">Favorite Genres</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {genres.map((tag) => {
              const name = tag.attributes.name.en ?? Object.values(tag.attributes.name)[0]
              const active = favoriteGenres.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleGenre(tag.id)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs transition',
                    active
                      ? 'border-primary-500 bg-primary-600/20 text-primary-200 shadow-glow-primary'
                      : 'border-surface-border bg-surface-card text-white/80 hover:bg-surface-hover',
                  )}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-xl tracking-wider">Social Links</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <Field label="Twitter / X">
              <input
                value={socialTwitter}
                onChange={(e) => setSocialTwitter(e.target.value)}
                className="input"
                placeholder="@handle"
              />
            </Field>
            <Field label="AniList">
              <input
                value={socialAnilist}
                onChange={(e) => setSocialAnilist(e.target.value)}
                className="input"
                placeholder="username"
              />
            </Field>
            <Field label="MyAnimeList">
              <input
                value={socialMal}
                onChange={(e) => setSocialMal(e.target.value)}
                className="input"
                placeholder="username"
              />
            </Field>
          </div>
        </div>

        {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        {message && <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
            {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="mt-10 card border-red-500/30 p-5">
        <h2 className="font-display text-xl tracking-wider text-red-300">Danger Zone</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={handleManageSubscription} className="btn-ghost text-sm">
            Manage Subscription
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
          >
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="card w-full max-w-md animate-slide-up p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl tracking-wider text-red-300">Delete account?</h3>
            <p className="mt-2 text-sm text-white/80">
              This action permanently deletes your profile, library, bookmarks, ratings, and comments.
              This cannot be undone.
            </p>
            <p className="mt-3 text-sm text-surface-muted">
              Type <span className="font-mono text-red-300">DELETE</span> to confirm:
            </p>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="input mt-2"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="btn-ghost text-sm">
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={handleDeleteAccount}
                className="rounded-xl border border-red-500/50 bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-40"
              >
                Delete forever
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-surface-muted">
        {label}
      </span>
      {children}
    </label>
  )
}
