import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SpinnerProps {
  className?: string
  size?: number
}

export function Spinner({ className, size = 24 }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-[var(--color-primary)]', className)}
    />
  )
}

/** Full-viewport centered spinner — used while restoring session. */
export function FullPageSpinner() {
  return (
    <div className="grid min-h-screen place-items-center">
      <Spinner size={36} />
    </div>
  )
}
