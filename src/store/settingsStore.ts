import { create } from 'zustand'
import { supabase, ORG_SLUG } from '../lib/supabase'
import type { SiteSettings } from '../types'

// Fallback content so the site renders before/without a DB connection.
export const DEFAULT_SETTINGS: SiteSettings = {
  id: 'default',
  org_slug: ORG_SLUG,
  team_name: 'श्री कृष्ण क्रीडा मंडळ गोंदवले खुर्द',
  tagline: 'Pride of the Village',
  logo_url: '/logo.png',
  primary_color: '#f97316',
  secondary_color: '#f43f5e',
  contact_email: null,
  contact_phone: null,
  address: null,
  facebook_url: null,
  instagram_url: null,
  youtube_url: null,
  founded_year: 2010,
  hero_image_url: null,
  hero_title: 'श्री कृष्ण क्रीडा मंडळ गोंदवले खुर्द',
  hero_subtitle: 'Strength · Spirit · Sportsmanship',
  about_text:
    'Our kabaddi team has been a source of pride and unity for over a decade.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

interface SettingsState {
  settings: SiteSettings
  isLoading: boolean
  loadSettings: () => Promise<void>
  applyTheme: (settings: SiteSettings) => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,

  loadSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('org_slug', ORG_SLUG)
        .maybeSingle()

      if (error) throw error
      const settings = data ? (data as SiteSettings) : DEFAULT_SETTINGS
      set({ settings, isLoading: false })
      get().applyTheme(settings)
    } catch {
      set({ settings: DEFAULT_SETTINGS, isLoading: false })
      get().applyTheme(DEFAULT_SETTINGS)
    }
  },

  applyTheme: (settings) => {
    const root = document.documentElement
    if (settings.primary_color)
      root.style.setProperty('--color-primary', settings.primary_color)
    if (settings.secondary_color)
      root.style.setProperty('--color-secondary', settings.secondary_color)
  },
}))
