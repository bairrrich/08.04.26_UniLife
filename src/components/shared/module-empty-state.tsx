'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

export interface ModuleEmptyStateProps {
  /** Icon component (Lucide icon) */
  icon?: LucideIcon
  /** Optional emoji/icon element (takes precedence over `icon`) */
  iconElement?: ReactNode
  /** Title text */
  title: string
  /** Description text */
  description?: string
  /** Additional content below description (presets, steps, etc.) */
  children?: ReactNode
  /** Primary CTA button */
  actionLabel?: string
  /** CTA button click handler */
  onAction?: () => void
  /** Module accent color for icon background */
  accent?: 'emerald' | 'amber' | 'orange' | 'blue' | 'rose' | 'violet' | 'teal' | 'cyan' | 'sky' | 'red' | 'indigo' | 'pink' | 'zinc'
  /** Compact variant with less padding */
  compact?: boolean
  /** Additional className */
  className?: string
}

const ACCENT_GRADIENTS: Record<string, string> = {
  emerald: 'from-emerald-400/30 to-teal-500/20',
  amber: 'from-amber-400/30 to-yellow-500/20',
  orange: 'from-orange-400/30 to-amber-500/20',
  blue: 'from-blue-400/30 to-indigo-500/20',
  rose: 'from-rose-400/30 to-pink-500/20',
  violet: 'from-violet-400/30 to-purple-500/20',
  teal: 'from-teal-400/30 to-cyan-500/20',
  cyan: 'from-cyan-400/30 to-blue-500/20',
  sky: 'from-sky-400/30 to-blue-500/20',
  red: 'from-red-400/30 to-rose-500/20',
  indigo: 'from-indigo-400/30 to-violet-500/20',
  pink: 'from-pink-400/30 to-rose-500/20',
  zinc: 'from-zinc-400/30 to-neutral-500/20',
}

const CARD_GRADIENTS: Record<string, string> = {
  emerald: 'from-emerald-500/5 via-transparent to-amber-500/5',
  amber: 'from-amber-500/5 via-transparent to-orange-500/5',
  orange: 'from-orange-500/5 via-transparent to-rose-500/5',
  blue: 'from-blue-500/5 via-transparent to-indigo-500/5',
  rose: 'from-rose-500/5 via-transparent to-pink-500/5',
  violet: 'from-violet-500/5 via-transparent to-purple-500/5',
  teal: 'from-teal-500/5 via-transparent to-cyan-500/5',
  cyan: 'from-cyan-500/5 via-transparent to-blue-500/5',
  sky: 'from-sky-500/5 via-transparent to-blue-500/5',
  red: 'from-red-500/5 via-transparent to-rose-500/5',
  indigo: 'from-indigo-500/5 via-transparent to-violet-500/5',
  pink: 'from-pink-500/5 via-transparent to-rose-500/5',
  zinc: 'from-zinc-500/5 via-transparent to-neutral-500/5',
}

/**
 * Shared empty state component for consistent look across all modules.
 * Provides a card with gradient icon, title, description, optional content area, and CTA button.
 */
export function ModuleEmptyState({
  icon: Icon,
  iconElement,
  title,
  description,
  children,
  actionLabel,
  onAction,
  accent = 'emerald',
  compact = false,
  className,
}: ModuleEmptyStateProps) {
  const gradient = ACCENT_GRADIENTS[accent] || ACCENT_GRADIENTS.emerald
  const cardGradient = CARD_GRADIENTS[accent] || CARD_GRADIENTS.emerald

  return (
    <Card className={cn('overflow-hidden relative fade-in-up', className)}>
      <div className={cn('absolute inset-0 bg-gradient-to-br pointer-events-none', cardGradient)} />
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/[0.03] via-transparent to-teal-500/[0.03] pointer-events-none" />
      <CardContent className={cn('relative text-center px-4', compact ? 'py-10' : 'py-14')}>
        {/* Icon area */}
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm">
          <div className={cn('h-20 w-20 rounded-2xl bg-gradient-to-br flex items-center justify-center shimmer-border', gradient)}>
            {iconElement || (
              Icon && <Icon className="h-10 w-10 text-muted-foreground/60" />
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-1 text-lg font-semibold">{title}</h3>

        {/* Description */}
        {description && (
          <p className="max-w-xs mx-auto text-sm text-muted-foreground/70 text-balance">
            {description}
          </p>
        )}

        {/* Additional content */}
        {children && <div className="mt-6">{children}</div>}

        {/* CTA Button */}
        {actionLabel && onAction && (
          <Button
            size="lg"
            onClick={onAction}
            className={cn(
              'mt-6 bg-gradient-to-r from-emerald-500 to-teal-500',
              'hover:from-emerald-600 hover:to-teal-600 text-white',
              'shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active-press',
            )}
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
