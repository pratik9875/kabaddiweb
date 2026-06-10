import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCog,
  Trophy,
  Wallet,
  TrendingUp,
  HandCoins,
  Images,
  Mail,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const ADMIN_NAV: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/players', label: 'Players', icon: Users },
  { to: '/admin/management', label: 'Management', icon: UserCog },
  { to: '/admin/achievements', label: 'Achievements', icon: Trophy },
  { to: '/admin/expenses', label: 'Expenses', icon: Wallet },
  { to: '/admin/income', label: 'Income', icon: TrendingUp },
  { to: '/admin/donors', label: 'Donors', icon: HandCoins },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

interface AdminSidebarProps {
  onNavigate?: () => void
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      {ADMIN_NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-gray-600 hover:bg-gray-100',
            )
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
