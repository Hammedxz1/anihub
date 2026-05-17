import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

const navLinks = [
  { to: '/',        label: 'Home' },
  { to: '/library', label: 'Library' },
  { to: '/search',  label: 'Search' },
]

export function Navbar() {
  const { user, isAuthenticated, isPro, logout } = useAuth()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    navigate('/')
  }

  const initial = (user?.displayName ?? user?.username ?? '?').charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="font-display text-3xl tracking-wider neon-text-primary"
          >
            MangaVerse
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-3 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-primary-600/15 text-primary-300'
                        : 'text-white/80 hover:bg-surface-hover hover:text-white',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-surface-border bg-surface-card px-1.5 py-1 transition hover:bg-surface-hover"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-accent-pink font-display text-base text-white">
                    {initial}
                  </span>
                )}
                {isPro && (
                  <span className="rounded-md bg-gradient-to-r from-primary-600 to-accent-pink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-glow-primary">
                    Pro
                  </span>
                )}
                <svg className="mr-1 h-4 w-4 text-surface-muted" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 animate-slide-up overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-xl"
                >
                  <div className="border-b border-surface-border px-4 py-3">
                    <p className="text-sm font-semibold text-white">
                      {user?.displayName ?? user?.username}
                    </p>
                    <p className="truncate text-xs text-surface-muted">{user?.email}</p>
                  </div>
                  <DropdownLink to={`/profile/${user?.username}`} onClick={() => setMenuOpen(false)}>
                    Profile
                  </DropdownLink>
                  <DropdownLink to="/my-library" onClick={() => setMenuOpen(false)}>
                    My Library
                  </DropdownLink>
                  <DropdownLink to="/bookmarks" onClick={() => setMenuOpen(false)}>
                    Bookmarks
                  </DropdownLink>
                  <DropdownLink to="/downloads" onClick={() => setMenuOpen(false)}>
                    Downloads
                  </DropdownLink>
                  <DropdownLink to="/settings/profile" onClick={() => setMenuOpen(false)}>
                    Settings
                  </DropdownLink>
                  {!isPro && (
                    <DropdownLink to="/subscribe" onClick={() => setMenuOpen(false)}>
                      <span className="text-primary-300">Upgrade to Pro</span>
                    </DropdownLink>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full border-t border-surface-border px-4 py-2.5 text-left text-sm text-white/80 transition hover:bg-surface-hover hover:text-white"
                    role="menuitem"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="btn-ghost text-sm">Log in</Link>
              <Link to="/register" className="btn-primary text-sm">Sign up</Link>
            </div>
          )}

          <button
            type="button"
            className="rounded-xl border border-surface-border p-2 text-white md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-surface-border bg-surface-card md:hidden">
          <ul className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-xl px-3 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-primary-600/15 text-primary-300'
                        : 'text-white/80 hover:bg-surface-hover hover:text-white',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            {!isAuthenticated && (
              <li className="flex flex-col gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-ghost text-sm">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm">
                  Sign up
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}

function DropdownLink({
  to,
  onClick,
  children,
}: {
  to: string
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      role="menuitem"
      className="block px-4 py-2.5 text-sm text-white/80 transition hover:bg-surface-hover hover:text-white"
    >
      {children}
    </Link>
  )
}
