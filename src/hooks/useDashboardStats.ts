import { useQuery } from '@tanstack/react-query'
import { countRows } from './crud'

export interface DashboardStats {
  players: number
  management: number
  achievements: number
  donors: number
  unreadMessages: number
}

/** Aggregate counts for the admin dashboard overview cards. */
export function useDashboardStats() {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      const [players, management, achievements, donors, unreadMessages] =
        await Promise.all([
          countRows('players', { is_retired: false }),
          countRows('management_members'),
          countRows('achievements'),
          countRows('prize_donors'),
          countRows('contact_messages', { is_read: false }),
        ])
      return { players, management, achievements, donors, unreadMessages }
    },
  })
}
