import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { supabase, ORG_SLUG } from '../lib/supabase'
import type { Player } from '../types'

export type PlayerInsert = Partial<Omit<Player, 'id' | 'created_at' | 'org_slug'>>
export type PlayerUpdate = Partial<PlayerInsert>

/** List players, filtered by retired flag. Tries sort_order ordering; falls back if column missing. */
export function usePlayers(includeRetired = false) {
  return useQuery<Player[], Error>({
    queryKey: ['players', { is_retired: includeRetired }],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase
        .from('players' as never)
        .select('*')
        .eq('org_slug', ORG_SLUG)
        .eq('is_retired', includeRetired)
      q = q.order('sort_order', { ascending: true })
      const { data, error } = await q
      if (error) {
        // sort_order column may not exist yet — retry without ordering
        if (String(error.message ?? '').includes('sort_order')) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let fallback: any = supabase
            .from('players' as never)
            .select('*')
            .eq('org_slug', ORG_SLUG)
            .eq('is_retired', includeRetired)
          const { data: d2, error: e2 } = await fallback
          if (e2) throw e2
          return (d2 ?? []) as Player[]
        }
        throw error
      }
      return (data ?? []) as Player[]
    },
  })
}

/** Insert a player. */
export function useCreatePlayer() {
  const qc = useQueryClient()
  return useMutation<Player, Error, PlayerInsert>({
    mutationFn: async (input) => {
      const { data, error } = await supabase
        .from('players' as never)
        .insert({ ...input, org_slug: ORG_SLUG } as never)
        .select()
        .single()
      if (error) throw error
      return data as Player
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  })
}

/** Update a player. */
export function useUpdatePlayer() {
  const qc = useQueryClient()
  return useMutation<Player, Error, PlayerUpdate & { id: string }>({
    mutationFn: async ({ id, ...patch }) => {
      const { data, error } = await supabase
        .from('players' as never)
        .update(patch as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Player
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  })
}

/** Delete a player. */
export function useDeletePlayer() {
  const qc = useQueryClient()
  return useMutation<string, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase.from('players' as never).delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  })
}

/** Batch-update sort_order for reordered players. */
export function useReorderPlayers() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      for (const { id, sort_order } of updates) {
        const { error } = await supabase
          .from('players')
          .update({ sort_order } as never)
          .eq('id', id)
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  })
}
