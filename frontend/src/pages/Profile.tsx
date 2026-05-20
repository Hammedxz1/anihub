import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
  getProfileByUsernameApi,
  getUserLibraryApi,
  getUserStatsApi,
} from '../api/profile'
import { getTagsApi } from '../api/manga'
import type { LibraryItem, LibraryStatus } from '../api/library'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/ui/Avatar'
import { BarChart } from '../components/ui/BarChart'
import { DonutChart } from '../components/ui/DonutChart'
import { cn } from '../utils/cn'

const DONUT_COLORS = ['#d946ef', '#22d3ee', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981']

const TABS: { value: LibraryStatus; label: string }[] = [
  { value: 'reading',      label: 'Reading' },
  { value: 'plan_to_read', label: 'Want to Read' },
  { value: 'completed',    label: 'Completed' },
  { value: 'dropped',      label: 'Dropped' },
]

export default function Profile() {
  const { username = '' } = useParams<{ username: string }>()
  const { user: viewer } = useAuth()
  const [activeTab, setActiveTab] = useState<LibraryStatus>('reading')

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => getProfileByUsernameApi(username),
    enabled: Boolean(username),
  })

  const isSelf = viewer?.username === username
  const isPrivate =
    isAxiosError(error) && error.response?.status === 403

  const { data: stats } = useQuery({
    queryKey: ['profile', username, 'stats'],
    queryFn: () => getUserStatsApi(username),
    enabled: Boolean(profile),
    staleTime: 60 * 1000,
  })

  const { data: library } = useQuery({
    queryKey: ['profile', username, 'library', activeTab],
    queryFn: () => getUserLibraryApi(username, activeTab),
    enabled: Boolean(profile),
    staleTime: 30 * 1000,
  })

  const { data: tags } = useQuery({
    queryKey: ['manga', 'tags'],
    queryFn: getTagsApi,
    staleTime: 60 * 60 * 1000,
  })

  const tagNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const t of tags ?? []) {
      map.set(t.id, t.attributes.name.en ?? Object.values(t.attributes.name)[0] ?? t.id)
    }
    return map
  }, [tags])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="h-40 animate-pulse rounded-3xl border border-surface-border bg-surface-card" />
      </div>
    )
  }

  if (isPrivate) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl tracking-wider">This profile is private</h1>
        <p className="mt-2 text-surface-muted">@{username} has chosen to hide their profile.</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl tracking-wider">User not found</h1>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
      </div>
    )
  }

  const isPro =
    isSelf && (viewer?.subscriptionStatus === 'premium' || viewer?.subscriptionStatus === 'pro')

  // Favorite genres donut: derived from user's library tags via favorite genres list
  const donutData = (profile.favoriteGenres ?? []).slice(0, 6).map((id, i) => ({
    label: tagNameById.get(id) ?? id,
    value: 1,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }))

  const favoriteName =
    profile.favoriteGenres?.[0] ? tagNameById.get(profile.favoriteGenres[0]) ?? '—' : '—'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      {/* Header */}
      <header className="flex flex-col items-center gap-4 text-center md:flex-row md:items-end md:text-left">
        <Avatar
          src={profile.avatarUrl}
          username={profile.username}
          size={128}
          ringColor={isPro ? 'pro' : 'free'}
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <h1 className="font-display text-4xl tracking-wider neon-text-primary">
              {profile.displayName ?? profile.username}
            </h1>
            {isPro ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-200">
                ✦ MangaVerse Pro
              </span>
            ) : (
              <span className="rounded-full border border-surface-border bg-surface-card px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-surface-muted">
                Free
              </span>
            )}
          </div>
          <p className="mt-1 text-surface-muted">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-3 whitespace-pre-line text-sm text-white/85">{profile.bio}</p>
          )}

          <SocialLinks
            twitter={profile.socialTwitter}
            anilist={profile.socialAnilist}
            mal={profile.socialMal}
          />
        </div>
        {isSelf && (
          <Link to="/settings/profile" className="btn-ghost text-sm">
            Edit profile
          </Link>
        )}
      </header>

      {/* Stats cards */}
      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Manga saved"     value={stats?.totalManga ?? 0} />
        <StatCard label="Chapters read"   value={stats?.chaptersRead ?? 0} />
        <StatCard label="Reading streak"  value={stats?.streak ?? 0} suffix="d" />
        <StatCard label="Favorite genre"  value={favoriteName} />
      </section>

      {/* Charts */}
      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-xl tracking-wider">Chapters Read · Last 30 Days</h2>
          <div className="mt-3">
            {stats?.monthly?.length ? (
              <BarChart data={stats.monthly} />
            ) : (
              <p className="text-sm text-surface-muted">No reading activity yet.</p>
            )}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-display text-xl tracking-wider">Favorite Genres</h2>
          <div className="mt-3">
            {donutData.length > 0 ? (
              <DonutChart data={donutData} centerLabel={`${donutData.length}`} />
            ) : (
              <p className="text-sm text-surface-muted">No favorite genres yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Recently Read */}
      {stats?.recent && stats.recent.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl tracking-wider">Recently Read</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {stats.recent.map((r) => (
              <Link
                key={r.mangaId}
                to={`/manga/${r.mangaId}`}
                className="group block w-32 flex-shrink-0"
              >
                <div className="aspect-[2/3] overflow-hidden rounded-xl border border-surface-border bg-surface-card transition group-hover:neon-border-primary">
                  {r.coverUrl ? (
                    <img src={r.coverUrl} alt={r.mangaTitle} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-surface-muted">No cover</div>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-white/90 group-hover:text-primary-300">
                  {r.mangaTitle}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reading list tabs */}
      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-wider">Reading List</h2>
        <div className="mt-3 flex flex-wrap gap-2 border-b border-surface-border">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setActiveTab(t.value)}
              className={cn(
                '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition',
                activeTab === t.value
                  ? 'border-primary-500 text-primary-300'
                  : 'border-transparent text-white/70 hover:text-white',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <LibraryGrid items={library ?? []} />
      </section>
    </div>
  )
}

function SocialLinks({
  twitter,
  anilist,
  mal,
}: {
  twitter: string | null
  anilist: string | null
  mal: string | null
}) {
  if (!twitter && !anilist && !mal) return null
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
      {twitter && (
        <a
          href={twitter.startsWith('http') ? twitter : `https://twitter.com/${twitter.replace(/^@/, '')}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-surface-border bg-surface-card px-3 py-1.5 text-xs text-white/80 hover:bg-surface-hover"
        >
          𝕏 / Twitter
        </a>
      )}
      {anilist && (
        <a
          href={anilist.startsWith('http') ? anilist : `https://anilist.co/user/${anilist}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-surface-border bg-surface-card px-3 py-1.5 text-xs text-white/80 hover:bg-surface-hover"
        >
          AniList
        </a>
      )}
      {mal && (
        <a
          href={mal.startsWith('http') ? mal : `https://myanimelist.net/profile/${mal}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-surface-border bg-surface-card px-3 py-1.5 text-xs text-white/80 hover:bg-surface-hover"
        >
          MyAnimeList
        </a>
      )}
    </div>
  )
}

function StatCard({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="card p-4 text-center">
      <p className="font-display text-3xl tracking-wider text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix && <span className="ml-0.5 text-xl text-surface-muted">{suffix}</span>}
      </p>
      <p className="mt-0.5 text-xs uppercase tracking-wider text-surface-muted">{label}</p>
    </div>
  )
}

function LibraryGrid({ items }: { items: LibraryItem[] }) {
  if (items.length === 0) {
    return <p className="mt-6 text-sm text-surface-muted">Nothing here yet.</p>
  }
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {items.map((item) => (
        <Link key={item.id} to={`/manga/${item.mangaId}`} className="group block">
          <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-surface-border bg-surface-card transition group-hover:neon-border-primary">
            {item.coverUrl ? (
              <img src={item.coverUrl} alt={item.mangaTitle} loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-surface-muted">No cover</div>
            )}
          </div>
          <h3 className="mt-2 line-clamp-2 text-sm font-medium text-white group-hover:text-primary-300">
            {item.mangaTitle}
          </h3>
          {item.chaptersRead > 0 && (
            <p className="text-xs text-surface-muted">
              Ch. {item.chaptersRead}{item.totalChapters ? ` / ${item.totalChapters}` : ''}
            </p>
          )}
        </Link>
      ))}
    </div>
  )
}
