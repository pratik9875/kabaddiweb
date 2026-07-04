import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Shield } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { Container } from '../ui/Container'
import { cn } from '../../lib/utils'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/players', label: 'Players' },
  { to: '/retired-players', label: 'Retired' },
  { to: '/management', label: 'Management' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/finances', label: 'Finances' },
  { to: '/donors', label: 'Donors' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const settings = useSettingsStore((s) => s.settings)
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors hover:text-[var(--color-primary)]',
      isActive ? 'text-[var(--color-primary)]' : 'text-gray-600',
    )

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100/60 py-2">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex shrink-0 items-center gap-3 font-bold text-gray-900">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
          ) : (
            <span
              className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              <Shield size={28} />
            </span>
          )}
          <span className="whitespace-nowrap text-base font-marathi sm:text-lg xl:text-xl">{settings.team_name}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 xl:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/admin/login"
            className="text-xs font-medium text-gray-400 hover:text-gray-600"
          >
            Admin
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="xl:hidden text-gray-700"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </Container>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-gray-100 bg-white xl:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'text-gray-600 hover:bg-gray-50',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/admin/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-400"
            >
              Admin
            </Link>
          </Container>
        </nav>
      )}
    </header>
  )
}
