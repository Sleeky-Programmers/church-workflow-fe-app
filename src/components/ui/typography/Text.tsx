import React from 'react'
import { cn } from '@/lib/utils'

type TextProps = {
  text?: string
  className?: string
  style?: React.CSSProperties
  variant?: 'default' | 'muted' | 'error' | 'partner' | 'quote' | 'tag'
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
    partner: "text-lg text-muted-foreground font-medium tracking-wide transition-opacity hover:opacity-70",
    quote: "text-lg md:text-xl font-serif italic text-gray-100",
    tag: "text-xs bg-gray-100 px-2 py-1 rounded",
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
  variant = 'default',
  children,
}: TextProps) {
  const variantClass = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    error: 'text-destructive',
    partner: "text-lg text-muted-foreground font-medium tracking-wide transition-opacity hover:opacity-70",
    quote: "text-lg md:text-xl font-serif italic text-white-600",
    tag: "text-xs bg-gray-100 px-2 py-1 rounded",
  }[variant]

  return (
    <span
      className={cn('text-xs', variantClass, className)}
      style={style}
    >
      {children ?? text}
    </span>
  )
}
