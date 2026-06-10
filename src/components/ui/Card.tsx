// src/components/ui/Card.tsx
import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...rest }) => {
  return (
    <div
      className={`glass p-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 hover:shadow-xl ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export default Card
