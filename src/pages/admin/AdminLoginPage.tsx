import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useSettingsStore } from '../../store/settingsStore'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

interface LocationState {
  from?: { pathname: string }
}

export function AdminLoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const settings = useSettingsStore((s) => s.settings)
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ?? '/admin/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  // Already signed in → skip login.
  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const onSubmit = async (values: LoginForm) => {
    setServerError(null)
    try {
      await login(values.email, values.password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Login failed. Check your credentials.',
      )
    }
  }

  return (
    <div
      className="grid min-h-screen place-items-center p-4"
      style={{
        background:
          'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.team_name}
              className="mb-3 h-14 w-14 rounded-xl object-cover"
            />
          ) : (
            <span
              className="mb-3 grid h-12 w-12 place-items-center rounded-xl text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              <Shield size={22} />
            </span>
          )}
          <h1 className="text-xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-500 font-marathi">{settings.team_name}</p>
        </div>

        {serverError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="admin@yourteam.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? <Spinner size={18} className="text-white" /> : 'Sign In'}
          </Button>
        </form>

        <Link
          to="/"
          className="mt-6 block text-center text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back to website
        </Link>
      </div>
    </div>
  )
}
