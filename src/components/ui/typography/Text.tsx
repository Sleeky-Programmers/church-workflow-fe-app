import React from 'react'
import { cn } from '@/lib/utils'

type TextProps = {
  text?: string
  className?: string
  style?: React.CSSProperties
  variant?: 'default' | 'muted' | 'error'
  children?: React.ReactNode
}

export function Text({
  text,
  className,
  variant = 'default',
  children,
}: TextProps) {
  const variantClass = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    error: 'text-destructive',
  }[variant]

  return (
    <p className={cn('text-sm', variantClass, className)}>
      {children ?? text}
    </p>
  )
}

export function Span({
  text,
  className,
  style,
  children,
}: TextProps) {
  return (
    <span
      className={cn('text-xs', className)}
      style={style}
    >
      {children ?? text}
    </span>
  )
}
