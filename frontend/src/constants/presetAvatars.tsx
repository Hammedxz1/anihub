import type { ReactElement } from 'react'

/**
 * 12 inline SVG anime-style abstract avatars.
 * Each is keyed by id so the value can be stored in `User.avatarUrl`
 * as `preset:<id>` and re-rendered without a network call.
 */

interface PresetAvatar {
  id: string
  render: () => ReactElement
  bg: string
}

function svg(children: ReactElement, gradient: ReactElement) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <defs>{gradient}</defs>
      {children}
    </svg>
  )
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'aurora',
    bg: 'from-fuchsia-500 to-violet-600',
    render: () =>
      svg(
        <>
          <rect width="100" height="100" fill="url(#g-aurora)" />
          <circle cx="50" cy="42" r="22" fill="#fce7f3" opacity="0.95" />
          <ellipse cx="44" cy="40" rx="2.4" ry="3.4" fill="#1f1147" />
          <ellipse cx="56" cy="40" rx="2.4" ry="3.4" fill="#1f1147" />
          <path d="M44 48 Q50 52 56 48" stroke="#1f1147" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M28 30 Q50 12 72 30 Q72 22 50 18 Q28 22 28 30 Z" fill="#1f1147" />
        </>,
        <linearGradient id="g-aurora" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>,
      ),
  },
  {
    id: 'sakura',
    bg: 'from-pink-400 to-rose-500',
    render: () =>
      svg(
        <>
          <rect width="100" height="100" fill="url(#g-sakura)" />
          <circle cx="50" cy="44" r="22" fill="#fff0f6" />
          <path d="M30 30 Q50 14 70 30 L66 38 Q58 30 50 30 Q42 30 34 38 Z" fill="#9d174d" />
          <ellipse cx="44" cy="44" rx="2.6" ry="3.4" fill="#3b0a2a" />
          <ellipse cx="56" cy="44" rx="2.6" ry="3.4" fill="#3b0a2a" />
          <path d="M46 52 Q50 55 54 52" stroke="#3b0a2a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle cx="20" cy="20" r="3" fill="#fff" opacity="0.8" />
          <circle cx="84" cy="76" r="2.5" fill="#fff" opacity="0.7" />
        </>,
        <linearGradient id="g-sakura" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>,
      ),
  },
  {
    id: 'cyber',
    bg: 'from-cyan-400 to-blue-600',
    render: () =>
      svg(
        <>
          <rect width="100" height="100" fill="url(#g-cyber)" />
          <circle cx="50" cy="44" r="22" fill="#e0f2fe" />
          <rect x="38" y="38" width="10" height="6" rx="2" fill="#0c4a6e" />
          <rect x="52" y="38" width="10" height="6" rx="2" fill="#0c4a6e" />
          <path d="M38 41 L62 41" stroke="#0c4a6e" strokeWidth="1.4" />
          <path d="M44 52 L56 52" stroke="#0c4a6e" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M28 26 Q50 18 72 26 L70 36 Q60 28 50 28 Q40 28 30 36 Z" fill="#0c4a6e" />
        </>,
        <linearGradient id="g-cyber" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>,
      ),
  },
  {
    id: 'ember',
    bg: 'from-orange-400 to-red-600',
    render: () =>
      svg(
        <>
          <rect width="100" height="100" fill="url(#g-ember)" />
          <circle cx="50" cy="44" r="22" fill="#fffbeb" />
          <path d="M26 30 Q34 16 50 16 Q66 16 74 30 Q66 24 58 28 Q50 22 42 28 Q34 24 26 30 Z" fill="#7c2d12" />
          <ellipse cx="44" cy="44" rx="2.4" ry="3.4" fill="#3d1808" />
          <ellipse cx="56" cy="44" rx="2.4" ry="3.4" fill="#3d1808" />
          <path d="M44 52 Q50 56 56 52" stroke="#3d1808" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <rect x="48" y="44" width="4" height="3" fill="#fb923c" opacity="0.8" />
        </>,
        <linearGradient id="g-ember" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>,
      ),
  },
  {
    id: 'moss',
    bg: 'from-emerald-400 to-teal-600',
    render: () =>
      svg(
        <>
          <rect width="100" height="100" fill="url(#g-moss)" />
          <circle cx="50" cy="44" r="22" fill="#ecfdf5" />
          <path d="M28 28 Q50 14 72 28 Q66 22 58 24 Q50 18 42 24 Q34 22 28 28 Z" fill="#064e3b" />
          <ellipse cx="44" cy="44" rx="2.4" ry="3.4" fill="#022c1c" />
          <ellipse cx="56" cy="44" rx="2.4" ry="3.4" fill="#022c1c" />
          <path d="M46 52 Q50 55 54 52" stroke="#022c1c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle cx="34" cy="44" r="2.2" fill="#10b981" opacity="0.7" />
          <circle cx="66" cy="44" r="2.2" fill="#10b981" opacity="0.7" />
        </>,
        <linearGradient id="g-moss" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>,
      ),
  },
  {
    id: 'lavender',
    bg: 'from-violet-400 to-indigo-600',
    render: () =>
      svg(
        <>
          <rect width="100" height="100" fill="url(#g-lav)" />
          <circle cx="50" cy="44" r="22" fill="#ede9fe" />
          <path d="M28 30 Q50 14 72 30 L72 38 L64 32 Q50 24 36 32 L28 38 Z" fill="#3730a3" />
          <ellipse cx="44" cy="44" rx="2.4" ry="3.4" fill="#1e1b4b" />
          <ellipse cx="56" cy="44" rx="2.4" ry="3.4" fill="#1e1b4b" />
          <path d="M44 52 Q50 55 56 52" stroke="#1e1b4b" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle cx="20" cy="20" r="2.5" fill="#fff" opacity="0.7" />
          <circle cx="80" cy="24" r="1.6" fill="#fff" opacity="0.6" />
        </>,
        <linearGradient id="g-lav" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>,
      ),
  },
  {
    id: 'noir',
    bg: 'from-slate-600 to-zinc-900',
    render: () =>
      svg(
        <>
          <rect width="100" height="100" fill="url(#g-noir)" />
          <circle cx="50" cy="44" r="22" fill="#f1f5f9" />
          <path d="M26 28 Q50 12 74 28 Q70 22 60 24 Q50 16 40 24 Q30 22 26 28 Z" fill="#0f172a" />
          <ellipse cx="44" cy="44" rx="2.4" ry="3.4" fill="#0f172a" />
          <ellipse cx="56" cy="44" rx="2.4" ry="3.4" fill="#0f172a" />
          <path d="M44 52 Q50 54 56 52" stroke="#0f172a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <rect x="36" y="40" width="8" height="6" rx="1.5" fill="#0f172a" opacity="0.3" />
          <rect x="56" y="40" width="8" height="6" rx="1.5" fill="#0f172a" opacity="0.3" />
        </>,
        <linearGradient id="g-noir" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>,
      ),
  },
  {
    id: 'gold',
    bg: 'from-amber-300 to-yellow-600',
    render: () =>
      svg(
        <>
          <rect width="100" height="100" fill="url(#g-gold)" />
          <circle cx="50" cy="44" r="22" fill="#fffbeb" />
          <path d="M28 28 Q50 12 72 28 L66 36 Q58 28 50 28 Q42 28 34 36 Z" fill="#78350f" />
          <ellipse cx="44" cy="44" rx="2.4" ry="3.4" fill="#451a03" />
          <ellipse cx="56" cy="44" rx="2.4" ry="3.4" fill="#451a03" />
          <path d="M44 52 Q50 55 56 52" stroke="#451a03" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <polygon points="50,16 52,22 58,22 53,26 55,32 50,28 45,32 47,26 42,22 48,22" fill="#fbbf24" />
        </>,
        <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>,
      ),
  },
  {
    id: 'crimson',
    bg: 'from-red-500 to-pink-700',
    render: () =>
      svg(
        <>
          <rect width="100" height="100" fill="url(#g-crim)" />
          <circle cx="50" cy="44" r="22" fill="#fdf2f8" />
          <path d="M26 30 Q50 14 74 30 L74 38 Q62 28 50 30 Q38 28 26 38 Z" fill="#7f1d1d" />
          <ellipse cx="44" cy="44" rx="2.4" ry="3.4" fill="#450a0a" />
          <ellipse cx="56" cy="44" rx="2.4" ry="3.4" fill="#450a0a" />
          <path d="M44 52 Q50 56 56 52" stroke="#450a0a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M40 32 L36 28 M60 32 L64 28" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
        </>,
        <linearGradient id="g-crim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>,
      ),
  },
  {
    id: 'ocean',
    bg: 'from-sky-400 to-indigo-600',
    render: () =>
      svg(
        <>
          <rect width="100" height="100" fill="url(#g-ocean)" />
          <circle cx="50" cy="44" r="22" fill="#eff6ff" />
          <path d="M28 30 Q50 16 72 30 Q60 22 50 24 Q40 22 28 30 Z" fill="#1e3a8a" />
          <ellipse cx="44" cy="44" rx="2.4" ry="3.4" fill="#0c1e4a" />
          <ellipse cx="56" cy="44" rx="2.4" ry="3.4" fill="#0c1e4a" />
          <path d="M44 52 Q50 54 56 52" stroke="#0c1e4a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M12 80 Q24 76 36 80 T60 80 T84 80 T100 80" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.5" />
        </>,
        <linearGradient id="g-ocean" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>,
      ),
  },
  {
    id: 'mint',
    bg: 'from-teal-300 to-emerald-500',
    render: () =>
      svg(
        <>
          <rect width="100" height="100" fill="url(#g-mint)" />
          <circle cx="50" cy="44" r="22" fill="#f0fdfa" />
          <path d="M28 30 Q50 14 72 30 L70 38 L64 34 Q50 24 36 34 L30 38 Z" fill="#134e4a" />
          <ellipse cx="44" cy="44" rx="2.4" ry="3.4" fill="#022c22" />
          <ellipse cx="56" cy="44" rx="2.4" ry="3.4" fill="#022c22" />
          <path d="M44 52 Q50 55 56 52" stroke="#022c22" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <circle cx="40" cy="48" r="1.6" fill="#2dd4bf" />
          <circle cx="60" cy="48" r="1.6" fill="#2dd4bf" />
        </>,
        <linearGradient id="g-mint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>,
      ),
  },
  {
    id: 'galaxy',
    bg: 'from-indigo-500 to-fuchsia-700',
    render: () =>
      svg(
        <>
          <rect width="100" height="100" fill="url(#g-gal)" />
          <circle cx="50" cy="44" r="22" fill="#f5f3ff" />
          <path d="M28 28 Q50 14 72 28 Q72 24 50 18 Q28 22 28 28 Z" fill="#312e81" />
          <ellipse cx="44" cy="44" rx="2.4" ry="3.4" fill="#1e1b4b" />
          <ellipse cx="56" cy="44" rx="2.4" ry="3.4" fill="#1e1b4b" />
          <path d="M44 52 Q50 55 56 52" stroke="#1e1b4b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <circle cx="18" cy="22" r="1.4" fill="#fff" />
          <circle cx="88" cy="32" r="1.2" fill="#fff" />
          <circle cx="22" cy="84" r="1.6" fill="#fff" />
          <circle cx="82" cy="76" r="1.2" fill="#fff" />
        </>,
        <linearGradient id="g-gal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a21caf" />
        </linearGradient>,
      ),
  },
]

export function isPresetAvatar(value: string | null | undefined): value is `preset:${string}` {
  return Boolean(value && value.startsWith('preset:'))
}

export function getPresetById(id: string): PresetAvatar | undefined {
  return PRESET_AVATARS.find((p) => p.id === id)
}

export function presetIdFromAvatarUrl(value: string | null | undefined): string | null {
  if (!isPresetAvatar(value)) return null
  return value.slice('preset:'.length)
}
