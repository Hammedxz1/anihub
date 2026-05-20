import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      {/* Anime-style confused character */}
      <div className="relative">
        <ConfusedCharacterSVG />
        <span
          className="absolute -right-4 top-4 animate-bounce text-2xl text-primary-400"
          style={{ animationDelay: '0ms' }}
        >?</span>
        <span
          className="absolute -left-2 top-10 animate-bounce text-xl text-accent-cyan"
          style={{ animationDelay: '150ms' }}
        >?</span>
        <span
          className="absolute right-2 top-16 animate-bounce text-lg text-primary-300"
          style={{ animationDelay: '300ms' }}
        >?</span>
      </div>

      <h1 className="mt-6 font-display text-8xl tracking-wider neon-text-primary">404</h1>
      <p className="mt-2 font-display text-2xl tracking-wider text-white/80">Page Not Found</p>
      <p className="mt-3 text-surface-muted">
        This page wandered off into another dimension. Let's get you back.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">Back to Home</Link>
        <Link to="/library" className="btn-ghost">Browse Manga</Link>
      </div>
    </section>
  )
}

function ConfusedCharacterSVG() {
  return (
    <svg
      width="220"
      height="260"
      viewBox="0 0 220 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="mx-auto drop-shadow-[0_0_24px_rgba(192,38,211,0.4)]"
    >
      {/* Glow ring */}
      <ellipse cx="110" cy="248" rx="50" ry="8" fill="rgba(192,38,211,0.15)" />

      {/* Body */}
      <rect x="65" y="168" width="90" height="50" rx="14" fill="#11111a" stroke="#23232f" strokeWidth="1.5" />
      <ellipse cx="110" cy="215" rx="55" ry="12" fill="#1a1a26" stroke="#23232f" strokeWidth="1.5" />

      {/* Scarf */}
      <path d="M78 172 Q110 182 142 172 L145 180 Q110 192 75 180 Z" fill="#a21caf" opacity="0.85" />

      {/* Neck */}
      <rect x="100" y="152" width="20" height="22" rx="8" fill="#e8c9a0" />

      {/* Head */}
      <ellipse cx="110" cy="130" rx="46" ry="50" fill="#f5deb5" stroke="#23232f" strokeWidth="1.5" />

      {/* Hair */}
      <path d="M65 118 Q60 70 110 60 Q160 70 155 118" fill="#1c1c2e" />
      <path d="M65 118 Q55 100 62 85 Q68 95 70 110 Z" fill="#1c1c2e" />
      <path d="M155 118 Q165 100 158 85 Q152 95 150 110 Z" fill="#1c1c2e" />
      <path d="M90 63 Q88 48 98 52 Q94 60 92 68 Z" fill="#1c1c2e" />
      <path d="M110 60 Q110 44 118 49 Q114 58 113 66 Z" fill="#1c1c2e" />
      <path d="M128 65 Q130 50 138 55 Q132 63 129 70 Z" fill="#1c1c2e" />

      {/* Ears */}
      <ellipse cx="64" cy="130" rx="8" ry="10" fill="#f5deb5" stroke="#23232f" strokeWidth="1" />
      <ellipse cx="156" cy="130" rx="8" ry="10" fill="#f5deb5" stroke="#23232f" strokeWidth="1" />

      {/* Left eye — wide / surprised */}
      <ellipse cx="92" cy="128" rx="13" ry="15" fill="white" />
      <ellipse cx="92" cy="130" rx="9" ry="10" fill="#6b3fa0" />
      <ellipse cx="92" cy="130" rx="6" ry="7" fill="#2a0d40" />
      <ellipse cx="88" cy="126" rx="3" ry="3" fill="white" opacity="0.9" />
      <ellipse cx="95" cy="132" rx="1.5" ry="1.5" fill="white" opacity="0.6" />
      <ellipse cx="97" cy="123" rx="2.5" ry="2" fill="white" opacity="0.8" />

      {/* Right eye — squinting (confused) */}
      <path d="M118 125 Q131 119 136 126 Q131 132 118 130 Z" fill="white" />
      <path d="M122 126 Q129 122 134 126 Q129 130 122 129 Z" fill="#2a0d40" />
      <path d="M117 124 Q127 118 137 124" stroke="#23232f" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Eyebrows */}
      <path d="M80 112 Q92 107 104 110" stroke="#1c1c2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M118 110 Q128 106 138 111" stroke="#1c1c2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <path d="M108 140 Q110 145 112 140" stroke="#c9a07a" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Mouth — small O (confused) */}
      <ellipse cx="110" cy="152" rx="7" ry="5" fill="#c9a07a" />
      <ellipse cx="110" cy="153" rx="5" ry="3.5" fill="#8b2252" />

      {/* Sweat drop */}
      <path d="M145 108 Q148 100 151 108 Q151 114 148 116 Q145 114 145 108 Z" fill="#22d3ee" opacity="0.8" />

      {/* Blush */}
      <ellipse cx="80" cy="143" rx="9" ry="5" fill="#f9a8d4" opacity="0.45" />
      <ellipse cx="140" cy="143" rx="9" ry="5" fill="#f9a8d4" opacity="0.45" />

      {/* Arms raised in confusion */}
      <path
        d="M75 175 Q55 160 48 145 Q44 138 50 135 Q56 132 60 140 Q66 155 80 168 Z"
        fill="#f5deb5"
        stroke="#23232f"
        strokeWidth="1"
      />
      <path
        d="M145 175 Q165 160 172 145 Q176 138 170 135 Q164 132 160 140 Q154 155 140 168 Z"
        fill="#f5deb5"
        stroke="#23232f"
        strokeWidth="1"
      />
    </svg>
  )
}
