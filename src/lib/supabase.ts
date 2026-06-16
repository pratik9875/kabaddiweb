import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Surface misconfiguration early in dev; never log the key value.
  if (import.meta.env.DEV) {
    console.warn('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  }
}

export const supabase = createClient<Database>(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
)

export const ORG_SLUG = import.meta.env.VITE_ORG_SLUG ?? 'village-kabaddi-team'

export const MEDIA_BUCKET = 'kabaddi-media'
