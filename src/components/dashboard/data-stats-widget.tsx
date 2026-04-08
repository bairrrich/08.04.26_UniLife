'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  BookOpen,
  Wallet,
  UtensilsCrossed,
  Dumbbell,
  Library,
  Target,
  Repeat,
  ClipboardList,
  Goal,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedNumber } from '@/components/ui/animated-number'
import DashboardSection from '@/components/dashboard/dashboard-section'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModuleStats {
  diary: number
  transactions: number
  categories: number
  meals: number
  waterLogs: number
  workouts: number
  collections: number
  posts: number
  comments: number
  likes: number
  habits: number
  goals: number
}

interface StatsResponse {
  modules: ModuleStats
  totalRecords: number
  storageEstimateKB: number
}

interface StatItem {
  key: string
  label: string
  emoji: string
  icon: typeof BookOpen
  iconBg: string
  iconColor: string
  value: number
}

// ─── Stat Definitions ─────────────────────────────────────────────────────────

const STAT_DEFS: {
  key: keyof ModuleStats
  label: string
  emoji: string
  icon: typeof BookOpen
  iconBg: string
  iconColor: string
}[] = [
    {
      key: 'diary',
      label: 'Записей в дневнике',
      emoji: '📝',
      icon: BookOpen,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'transactions',
      label: 'Транзакций',
      emoji: '💰',
      icon: Wallet,
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      key: 'meals',
      label: 'Приёмов пищи',
      emoji: '🍽️',
      icon: UtensilsCrossed,
      iconBg: 'bg-orange-100 dark:bg-orange-900/40',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      key: 'workouts',
      label: 'Тренировок',
      emoji: '💪',
      icon: Dumbbell,
      iconBg: 'bg-sky-100 dark:bg-sky-900/40',
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      key: 'collections',
      label: 'Коллекций',
      emoji: '📚',
      icon: Library,
      iconBg: 'bg-violet-100 dark:bg-violet-900/40',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      key: 'habits',
      label: 'Привычек',
      emoji: '🎯',
      icon: Repeat,
      iconBg: 'bg-rose-100 dark:bg-rose-900/40',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      key: 'posts',
      label: 'Постов в ленте',
      emoji: '📋',
      icon: ClipboardList,
      iconBg: 'bg-teal-100 dark:bg-teal-900/40',
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      key: 'goals',
      label: 'Целей',
      emoji: '🎯',
      icon: Goal,
      iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40',
      iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    },
  ]

// ─── Container Animation Variants ─────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: 'easeInOut' as const,
    },
  },
}

// ─── Stat Card Sub-component ──────────────────────────────────────────────────

function StatCard({ stat }: { stat: StatItem }) {
  const Icon = stat.icon

  return (
    <motion.div
      variants={itemVariants}
      className="group flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
    >
      {/* Icon */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.iconBg}`}
      >
        <Icon className={`h-4 w-4 ${stat.iconColor}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">
          {stat.emoji} {stat.label}
        </p>
        <p className="text-lg font-bold tabular-nums tracking-tight text-foreground animate-count-fade-in">
          <AnimatedNumber value={stat.value} />
        </p>
      </div>
    </motion.div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DataStatsWidget() {
  const [stats, setStats] = useState<ModuleStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/stats')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      if (json.success && json.data?.modules) {
        setStats(json.data.modules)
      }
    } catch {
      // Silently fail — the widget will show skeleton indefinitely
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const items: StatItem[] | null = stats
    ? STAT_DEFS.map((def) => ({
      key: def.key,
      label: def.label,
      emoji: def.emoji,
      icon: def.icon,
      iconBg: def.iconBg,
      iconColor: def.iconColor,
      value: stats[def.key] ?? 0,
    }))
    : null

  const totalRecords = items?.reduce((sum, item) => sum + item.value, 0) ?? 0

  return (
    <DashboardSection
      id="data-stats"
      title="Ваша активность"
      icon={<Activity className="h-3.5 w-3.5" />}
    >
      {/* Total records badge */}
      {!loading && stats && (
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <Activity className="h-3 w-3" />
            Всего записей:{' '}
            <span className="font-bold tabular-nums animate-count-fade-in">
              <AnimatedNumber value={totalRecords} />
            </span>
          </span>
        </div>
      )}

      {loading || !items ? (
        <StatsSkeleton />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {items.map((stat) => (
            <StatCard key={stat.key} stat={stat} />
          ))}
        </motion.div>
      )}
    </DashboardSection>
  )
}
