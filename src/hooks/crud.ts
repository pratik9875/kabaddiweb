import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { supabase, ORG_SLUG } from '../lib/supabase'

export type Filters = Record<string, string | number | boolean | null>

interface OrderSpec {
  column: string
  ascending?: boolean
}

/**
 * Build a typed set of CRUD hooks for one org-scoped table.
 *
 * The Supabase client is generically typed per literal table name; since
 * `table` here is a runtime string, we cast at the boundary and re-assert
 * the Row/Insert/Update generics so call sites stay type-safe.
 *
 * org_slug is injected automatically on create — callers omit it.
 */
export function createCrud<
  Row extends { id: string },
  Insert extends object,
  Update extends object,
>(table: string, order?: OrderSpec) {
  const root = [table] as const

  function useList(
    filters?: Filters,
    options?: Partial<UseQueryOptions<Row[], Error>>,
  ) {
    return useQuery<Row[], Error>({
      queryKey: [table, filters ?? null],
      queryFn: async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q: any = supabase.from(table as never).select('*').eq('org_slug', ORG_SLUG)
        if (filters) {
          for (const [k, v] of Object.entries(filters)) q = q.eq(k, v)
        }
        if (order) q = q.order(order.column, { ascending: order.ascending ?? true })
        const { data, error } = await q
        if (error) throw error
        return (data ?? []) as Row[]
      },
      ...options,
    })
  }

  function useCreate() {
    const qc = useQueryClient()
    return useMutation<Row, Error, Insert>({
      mutationFn: async (input) => {
        const { data, error } = await supabase
          .from(table as never)
          .insert({ ...input, org_slug: ORG_SLUG } as never)
          .select()
          .single()
        if (error) throw error
        return data as Row
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: root }),
    })
  }

  function useUpdate() {
    const qc = useQueryClient()
    return useMutation<Row, Error, Update & { id: string }>({
      mutationFn: async ({ id, ...patch }) => {
        const { data, error } = await supabase
          .from(table as never)
          .update(patch as never)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data as Row
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: root }),
    })
  }

  function useRemove() {
    const qc = useQueryClient()
    return useMutation<string, Error, string>({
      mutationFn: async (id) => {
        const { error } = await supabase.from(table as never).delete().eq('id', id)
        if (error) throw error
        return id
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: root }),
    })
  }

  return { useList, useCreate, useUpdate, useRemove }
}

/** Count rows in an org-scoped table, optionally filtered. */
export async function countRows(table: string, filters?: Filters): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = supabase
    .from(table as never)
    .select('id', { count: 'exact', head: true })
    .eq('org_slug', ORG_SLUG)
  if (filters) {
    for (const [k, v] of Object.entries(filters)) q = q.eq(k, v)
  }
  const { count, error } = await q
  if (error) throw error
  return count ?? 0
}
