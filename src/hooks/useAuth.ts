import { useAuthStore } from '../store/authStore'

/**
 * Thin wrapper over authStore for components.
 * Exposes login/logout + derived auth flags.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const signIn = useAuthStore((s) => s.signIn)
  const signOut = useAuthStore((s) => s.signOut)

  return {
    user,
    isLoading,
    isAdmin,
    isAuthenticated: !!user,
    login: signIn,
    logout: signOut,
  }
}
