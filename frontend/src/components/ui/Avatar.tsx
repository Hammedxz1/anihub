import { getPresetById, presetIdFromAvatarUrl } from '../../constants/presetAvatars'
import { cn } from '../../utils/cn'

interface AvatarProps {
  src?: string | null
  username: string
  size?: number
  ringColor?: 'pro' | 'free' | 'none'
  className?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'
const STATIC_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

function resolveAvatarUrl(value: string): string {
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('/uploads/')) return `${STATIC_ORIGIN}${value}`
  return value
}

export function Avatar({ src, username, size = 96, ringColor = 'none', className }: AvatarProps) {
  const presetId = presetIdFromAvatarUrl(src)
  const preset = presetId ? getPresetById(presetId) : null

  const ring =
    ringColor === 'pro'
      ? 'ring-2 ring-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.55)]'
      : ringColor === 'free'
        ? 'ring-2 ring-surface-border'
        : ''

  return (
    <div
      className={cn(
        'overflow-hidden rounded-full bg-gradient-to-br from-primary-600 to-accent-pink',
        ring,
        className,
      )}
      style={{ width: size, height: size }}
    >
      {preset ? (
        preset.render()
      ) : src ? (
        <img
          src={resolveAvatarUrl(src)}
          alt={username}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-display text-white"
          style={{ fontSize: size * 0.45 }}
        >
          {username.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}
