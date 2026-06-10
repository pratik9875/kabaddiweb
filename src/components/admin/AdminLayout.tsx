import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useSettingsStore } from '../../store/settingsStore'
import { AdminSidebar } from './AdminSidebar'
import { Button } from '../ui/Button'

/** Authenticated admin shell: top bar + sidebar (drawer on mobile) + content. */
export function AdminLayout() {
  const settings = useSettingsStore((s) => s.settings)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden text-gray-600"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-gray-900">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.team_name}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <span
                className="grid h-8 w-8 place-items-center rounded-lg text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                <Shield size={16} />
              </span>
            )}
            <span className="hidden sm:inline font-marathi">{settings.team_name} · Admin</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-gray-500 sm:inline">{user?.email}</span>
          <Button size="sm" variant="outline" onClick={handleLogout}>
            <LogOut size={15} /> Logout
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
          <AdminSidebar />
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
              <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
                <span className="font-bold text-gray-900">Menu</span>
                <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                  <X />
                </button>
              </div>
              <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
            </aside>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
