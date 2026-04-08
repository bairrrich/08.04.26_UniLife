import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomizeButton } from '@/components/shared'
import { PageHeader } from '@/components/layout/page-header'

// ─── Accent Color per Module ──────────────────────────────────────────

export type ModuleAccent =
  | 'emerald' | 'amber' | 'orange' | 'blue' | 'rose'
  | 'violet' | 'teal' | 'cyan' | 'sky' | 'red' | 'indigo' | 'pink' | 'zinc'

// ─── Props ─────────────────────────────────────────────────────────────

interface ModuleHeaderProps {
  /** Lucide icon component */
  icon: LucideIcon
  /** Module title */
  title: string
  /** Subtitle description (can be a string or JSX with extra info) */
  description?: ReactNode
  /** Accent color key */
  accent?: ModuleAccent
  /** Badge content (e.g. date, period, count) */
  badge?: ReactNode
  /** Extra content below header (e.g. trend charts, streaks) */
  extra?: ReactNode
  /** Whether to show the CustomizeButton (SectionCustomizer trigger) */
  showCustomize?: boolean
  /** Callback for CustomizeButton — opens section customizer */
  onCustomize?: () => void
  /** Primary action button config */
  primaryAction?: {
    label: string
    icon?: ReactNode
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
    className?: string
  }
  /** Additional action buttons rendered to the right of primary action */
  extraActions?: ReactNode
  /** Hide decorative gradient blobs */
  noBlobs?: boolean
  /** Compact mode (smaller icon/title) */
  compact?: boolean
  /** Override outer className */
  className?: string
}

// ─── Component ─────────────────────────────────────────────────────────

export function ModuleHeader({
  icon,
  title,
  description,
  accent = 'emerald',
  badge,
  extra,
  showCustomize = true,
  onCustomize,
  primaryAction,
  extraActions,
  noBlobs,
  compact,
  className,
}: ModuleHeaderProps) {
  // Build actions slot
  const actions = (
    <>
      {showCustomize && (
        <CustomizeButton onClick={onCustomize ?? (() => { })} />
      )}
      {extraActions}
      {primaryAction && (
        <Button
          size="sm"
          variant={primaryAction.variant ?? 'default'}
          onClick={primaryAction.onClick}
          className={primaryAction.className}
        >
          {primaryAction.icon && <span className="mr-1">{primaryAction.icon}</span>}
          {primaryAction.label}
        </Button>
      )}
    </>
  )

  return (
    <PageHeader
      icon={icon}
      title={title}
      description={description}
      accent={accent}
      badge={badge}
      extra={extra}
      actions={actions}
      noBlobs={noBlobs}
      compact={compact}
      className={className}
    />
  )
}

// ─── Helper: Default Add Button Icon ────────────────────────────────────

export function AddIcon() {
  return <Plus className="h-4 w-4" />
}
