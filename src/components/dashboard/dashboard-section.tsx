'use client'

import React, { useCallback, memo, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardSectionProps {
  id: string
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultCollapsed?: boolean
  className?: string
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'unilife-dashboard-sections'

function loadCollapsedState(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveCollapsedState(state: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default memo(function DashboardSection({
  id,
  title,
  icon,
  children,
  defaultCollapsed = false,
  className,
}: DashboardSectionProps) {
  // Read collapsed state from localStorage via lazy initializer (runs once)
  const initiallyCollapsed = useMemo(() => {
    if (typeof window === 'undefined') return defaultCollapsed
    const persisted = loadCollapsedState()
    return persisted && id in persisted ? persisted[id] : defaultCollapsed
  }, [id, defaultCollapsed])

  const [collapsed, setCollapsed] = React.useState(initiallyCollapsed)

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      const state = loadCollapsedState()
      state[id] = next
      saveCollapsedState(state)
      return next
    })
  }, [id])

  return (
    <div className={cn('group/section', className)}>
      {/* ── Section Header ─────────────────────────────────── */}
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center gap-3 py-2 text-left transition-opacity hover:opacity-80"
        aria-expanded={!collapsed}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        {icon && (
          <span className="text-muted-foreground/50">{icon}</span>
        )}
        <div className="h-px flex-1 bg-gradient-to-r from-muted-foreground/20 to-transparent" />
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground/50 transition-transform duration-300',
            collapsed && '-rotate-90'
          )}
        />
      </button>

      {/* ── Section Content ─────────────────────────────────── */}
      {!collapsed && (
        <motion.div
          key={id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-4 pt-1"
        >
          {children}
        </motion.div>
      )}
    </div>
  )
})
