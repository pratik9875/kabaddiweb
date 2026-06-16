import { cn } from '../../lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className, ...rest }) => {
  return (
    <div
      className={cn('p-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 hover:shadow-xl border border-slate-100 bg-white', className)}
      {...rest}
    >
      {children}
    </div>
  )
}
