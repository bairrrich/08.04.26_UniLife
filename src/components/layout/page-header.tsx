'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

// ─── Module Accent Colors ──────────────────────────────────────────────

export interface PageHeaderProps {
  /** Icon component (Lucide icon) */
  icon: LucideIcon
  /** Page title */
  title: string
  /** Short description below title */
  description?: ReactNode
  /** Action button(s) on the right side */
  actions?: ReactNode
  /** Badge/content rendered next to the title line */
  badge?: ReactNode
  /** Additional content below the main header row */
  extra?: ReactNode
  /** Module-specific accent color key */
  accent?: 'emerald' | 'amber' | 'orange' | 'blue' | 'rose' | 'violet' | 'teal' | 'cyan' | 'sky' | 'red' | 'indigo' | 'pink' | 'zinc'
  /** Override className for the outer container */
  className?: string
  /** Hide gradient decorative blobs */
  noBlobs?: boolean
  /** Use smaller icon (h-8 instead of h-10) */
  compact?: boolean
}

// ─── Accent Color Maps ─────────────────────────────────────────────────

const ICON_BG: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  teal: 'bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
  cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
  indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
  pink: 'bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
  zinc: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
}

const BLOB_FROM: Record<string, string> = {
  emerald: 'from-emerald-400/20',
  amber: 'from-amber-400/20',
  orange: 'from-orange-400/20',
  blue: 'from-blue-400/20',
  rose: 'from-rose-400/20',
  violet: 'from-violet-400/20',
  teal: 'from-teal-400/20',
  cyan: 'from-cyan-400/20',
  sky: 'from-sky-400/20',
  red: 'from-red-400/20',
  indigo: 'from-indigo-400/20',
  pink: 'from-pink-400/20',
  zinc: 'from-zinc-400/20',
}

const BLOB_TO: Record<string, string> = {
  emerald: 'to-teal-500/20',
  amber: 'to-orange-500/15',
  orange: 'to-amber-500/15',
  blue: 'to-indigo-500/20',
  rose: 'to-pink-500/15',
  violet: 'to-purple-500/15',
  teal: 'to-cyan-500/15',
  cyan: 'to-blue-500/15',
  sky: 'to-blue-500/15',
  red: 'to-rose-500/15',
  indigo: 'to-violet-500/15',
  pink: 'to-rose-500/15',
  zinc: 'to-neutral-400/15',
}

const SECOND_BLOB_FROM: Record<string, string> = {
  emerald: 'from-amber-400/15',
  amber: 'from-orange-400/15',
  orange: 'from-emerald-400/15',
  blue: 'from-amber-400/15',
  rose: 'from-amber-400/15',
  violet: 'from-emerald-400/15',
  teal: 'from-amber-400/15',
  cyan: 'from-emerald-400/15',
  sky: 'from-amber-400/15',
  red: 'from-amber-400/15',
  indigo: 'from-emerald-400/15',
  pink: 'from-amber-400/15',
  zinc: 'from-neutral-400/10',
}

const SECOND_BLOB_TO: Record<string, string> = {
  emerald: 'to-orange-500/10',
  amber: 'to-rose-400/10',
  orange: 'to-rose-400/10',
  blue: 'to-rose-400/10',
  rose: 'to-orange-500/10',
  violet: 'to-amber-500/10',
  teal: 'to-orange-500/10',
  cyan: 'to-amber-500/10',
  sky: 'to-amber-500/10',
  red: 'to-amber-500/10',
  indigo: 'to-amber-500/10',
  pink: 'to-amber-500/10',
  zinc: 'to-neutral-400/5',
}

// ─── Component ────────────────────────────────────────────────────────

export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
  badge,
  extra,
  accent = 'emerald',
  className,
  noBlobs = false,
  compact = false,
}: PageHeaderProps) {
  const bg = ICON_BG[accent] || ICON_BG.emerald
  const blobFrom = BLOB_FROM[accent] || BLOB_FROM.emerald
  const blobTo = BLOB_TO[accent] || BLOB_TO.emerald
  const secondBlobFrom = SECOND_BLOB_FROM[accent] || SECOND_BLOB_FROM.emerald
  const secondBlobTo = SECOND_BLOB_TO[accent] || SECOND_BLOB_TO.emerald

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Decorative gradient blobs */}
      {!noBlobs && (
        <>
          <div
            className={cn(
              'pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full blur-3xl bg-gradient-to-br',
              blobFrom,
              blobTo,
            )}
          />
          <div
            className={cn(
              'pointer-events-none absolute -top-4 right-20 h-24 w-24 rounded-full blur-3xl bg-gradient-to-br',
              secondBlobFrom,
              secondBlobTo,
            )}
          />
        </>
      )}

      <div className="relative flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'shrink-0 flex items-center justify-center rounded-xl',
              bg,
              compact ? 'h-8 w-8' : 'h-10 w-10',
            )}
          >
            <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className={cn(
                  'font-bold tracking-tight truncate',
                  compact ? 'text-xl' : 'text-2xl',
                )}
              >
                {title}
              </h1>
              {badge && <div className="shrink-0">{badge}</div>}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Extra content below header */}
      {extra && <div className="relative mt-1">{extra}</div>}
    </div>
  )
}
