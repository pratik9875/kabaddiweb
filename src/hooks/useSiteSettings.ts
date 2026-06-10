import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, ORG_SLUG } from '../lib/supabase'
import { useSettingsStore, DEFAULT_SETTINGS } from '../store/settingsStore'
import type { SiteSettings } from '../types'

export type SiteSettingsUpdate = Partial<
  Omit<SiteSettings, 'id' | 'org_slug' | 'created_at' | 'updated_at'>
>

/** Read the single tenant settings row. */
export function useSiteSettings() {
  return useQuery<SiteSettings, Error>({
    queryKey: ['site_settings', ORG_SLUG],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('org_slug', ORG_SLUG)
        .maybeSingle()
      if (error) throw error
      return data ? (data as SiteSettings) : DEFAULT_SETTINGS
    },
  })
}

/** Admin: update tenant settings; refreshes store + re-applies theme. */
export function useUpdateSiteSettings() {
  const qc = useQueryClient()
  const applyTheme = useSettingsStore((s) => s.applyTheme)
  return useMutation<SiteSettings, Error, SiteSettingsUpdate>({
    mutationFn: async (patch) => {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ ...patch, updated_at: new Date().toISOString() } as never)
        .eq('org_slug', ORG_SLUG)
        .select()
        .single()
      if (error) throw error
      return data as SiteSettings
    },
    onSuccess: (settings) => {
      useSettingsStore.setState({ settings })
      applyTheme(settings)
      qc.invalidateQueries({ queryKey: ['site_settings'] })
    },
  })
}
