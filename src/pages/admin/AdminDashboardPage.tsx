import { Link } from 'react-router-dom'
import { Users, Trophy, HandCoins, Mail, Plus, UserCog } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDashboardStats } from '../../hooks/useDashboardStats'

interface StatCard {
  label: string
  value: number | undefined
  icon: LucideIcon
  to: string
}

const QUICK_ACTIONS = [
  { label: 'Add Player', to: '/admin/players' },
  { label: 'Add Achievement', to: '/admin/achievements' },
  { label: 'Add Expense', to: '/admin/expenses' },
]

export function AdminDashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, isError } = useDashboardStats()

  const cards: StatCard[] = [
    { label: 'Players', value: data?.players, icon: Users, to: '/admin/players' },
    { label: 'Management', value: data?.management, icon: UserCog, to: '/admin/management' },
    { label: 'Achievements', value: data?.achievements, icon: Trophy, to: '/admin/achievements' },
    { label: 'Donors', value: data?.donors, icon: HandCoins, to: '/admin/donors' },
    { label: 'Unread Messages', value: data?.unreadMessages, icon: Mail, to: '/admin/messages' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Signed in as {user?.email}</p>
      </div>

      {isError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Could not load stats. Check your connection and try again.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{label}</span>
              <span
                className="grid h-9 w-9 place-items-center rounded-lg text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                <Icon size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {isLoading ? (
                <span className="inline-block h-7 w-10 animate-pulse rounded bg-gray-200" />
              ) : (
                (value ?? 0)
              )}
            </p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus size={15} /> {a.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-400">
        Content management pages are added in the next phase.
      </p>
    </div>
  )
}
