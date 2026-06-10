import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Admin session auto-expires after 8h of inactivity (security measure #6).
const MAX_INACTIVITY_MS = 8 * 60 * 60 * 1000
const ACTIVITY_KEY = 'kabaddi_last_activity'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  checkSession: () => Promise<void>
  touchActivity: () => void
}

function setSession(set: (p: Partial<AuthState>) => void, session: Session | null) {
  set({
    session,
    user: session?.user ?? null,
    isAdmin: !!session?.user,
    isLoading: false,
  })
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()))
    setSession(set, data.session)
  },

  signOut: async () => {
    await supabase.auth.signOut()
    localStorage.removeItem(ACTIVITY_KEY)
    set({ user: null, session: null, isAdmin: false, isLoading: false })
  },

  checkSession: async () => {
    const { data } = await supabase.auth.getSession()
    const session = data.session

    // Enforce inactivity timeout.
    const last = Number(localStorage.getItem(ACTIVITY_KEY) ?? 0)
    if (session && last && Date.now() - last > MAX_INACTIVITY_MS) {
      await get().signOut()
      return
    }
    if (session) localStorage.setItem(ACTIVITY_KEY, String(Date.now()))
    setSession(set, session)
  },

  touchActivity: () => {
    if (get().session) localStorage.setItem(ACTIVITY_KEY, String(Date.now()))
  },
}))

// Keep store in sync with Supabase auth changes (token refresh, sign-out).
supabase.auth.onAuthStateChange((_event, session) => {
  setSession((p) => useAuthStore.setState(p), session)
})
