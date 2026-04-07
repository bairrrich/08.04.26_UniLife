'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { safeJson } from '@/lib/safe-fetch'
import { toast } from 'sonner'
import {
  BarChart3,
  Trash2,
  Download,
  RefreshCw,
  BookOpen,
  Wallet,
  Apple,
  Dumbbell,
  Library,
  Newspaper,
  Database,
  HardDrive,
  Clock,
  HeartPulse,
  Target,
  Activity,
  Droplets,
  MessageCircle,
  ThumbsUp,
  Tag,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────────

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

interface ModuleLastActivity {
  diary: string | null
  transactions: string | null
  meals: string | null
  workouts: string | null
  collections: string | null
  posts: string | null
  habits: string | null
  goals: string | null
}

interface StatsData {
  modules: ModuleStats
  lastActivity: ModuleLastActivity
  totalRecords: number
  storageEstimateKB: number
}

// ── Module Display Config ───────────────────────────────────────────

interface ModuleDisplayConfig {
  key: keyof ModuleStats
  label: string
  emoji: string
  icon: React.ElementType
  color: string
  darkColor: string
  lastActivityKey?: keyof ModuleLastActivity
  isSubModule?: boolean
}

const MODULE_DISPLAY: ModuleDisplayConfig[] = [
  {
    key: 'diary',
    label: 'Дневник',
    emoji: '📝',
    icon: BookOpen,
    color: '#10b981',
    darkColor: '#34d399',
    lastActivityKey: 'diary',
  },
  {
    key: 'transactions',
    label: 'Транзакции',
    emoji: '💳',
    icon: Wallet,
    color: '#f59e0b',
    darkColor: '#fbbf24',
    lastActivityKey: 'transactions',
  },
  {
    key: 'categories',
    label: 'Категории',
    emoji: '🏷️',
    icon: Tag,
    color: '#8b5cf6',
    darkColor: '#a78bfa',
    isSubModule: true,
  },
  {
    key: 'meals',
    label: 'Приёмы пищи',
    emoji: '🍽️',
    icon: Apple,
    color: '#f97316',
    darkColor: '#fb923c',
    lastActivityKey: 'meals',
  },
  {
    key: 'waterLogs',
    label: 'Вода',
    emoji: '💧',
    icon: Droplets,
    color: '#06b6d4',
    darkColor: '#22d3ee',
    isSubModule: true,
  },
  {
    key: 'workouts',
    label: 'Тренировки',
    emoji: '💪',
    icon: Dumbbell,
    color: '#3b82f6',
    darkColor: '#60a5fa',
    lastActivityKey: 'workouts',
  },
  {
    key: 'collections',
    label: 'Коллекции',
    emoji: '📚',
    icon: Library,
    color: '#8b5cf6',
    darkColor: '#a78bfa',
    lastActivityKey: 'collections',
  },
  {
    key: 'habits',
    label: 'Привычки',
    emoji: '✅',
    icon: HeartPulse,
    color: '#ec4899',
    darkColor: '#f472b6',
    lastActivityKey: 'habits',
  },
  {
    key: 'goals',
    label: 'Цели',
    emoji: '🎯',
    icon: Target,
    color: '#14b8a6',
    darkColor: '#2dd4bf',
    lastActivityKey: 'goals',
  },
  {
    key: 'posts',
    label: 'Посты',
    emoji: '📰',
    icon: Newspaper,
    color: '#f43f5e',
    darkColor: '#fb7185',
    lastActivityKey: 'posts',
  },
  {
    key: 'comments',
    label: 'Комментарии',
    emoji: '💬',
    icon: MessageCircle,
    color: '#6366f1',
    darkColor: '#818cf8',
    isSubModule: true,
  },
  {
    key: 'likes',
    label: 'Лайки',
    emoji: '❤️',
    icon: ThumbsUp,
    color: '#e11d48',
    darkColor: '#fb7185',
    isSubModule: true,
  },
]

// Main modules for health calculation (excluding sub-modules like categories, waterLogs, comments, likes)
const MAIN_MODULE_KEYS: (keyof ModuleStats)[] = [
  'diary',
  'transactions',
  'meals',
  'workouts',
  'collections',
  'habits',
  'goals',
  'posts',
]

// ── Helper: format relative time ────────────────────────────────────

function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return '—'

  const now = new Date()
  const date = new Date(isoString)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'только что'
  if (diffMinutes < 60) return `${diffMinutes} мин назад`
  if (diffHours < 24) return `${diffHours} ч назад`
  if (diffDays < 7) return `${diffDays} д назад`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

// ── Helper: format absolute date ────────────────────────────────────

function formatAbsoluteDate(isoString: string | null): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Health Gauge Component ──────────────────────────────────────────

function DataHealthGauge({ percentage }: { percentage: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getHealthColor = (pct: number) => {
    if (pct >= 75) return { stroke: '#10b981', bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', label: 'Отлично' }
    if (pct >= 50) return { stroke: '#f59e0b', bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', label: 'Хорошо' }
    if (pct >= 25) return { stroke: '#f97316', bg: 'bg-orange-100 dark:bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', label: 'Средне' }
    return { stroke: '#ef4444', bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-600 dark:text-red-400', label: 'Низкое' }
  }

  const health = getHealthColor(percentage)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width={100} height={100} viewBox="0 0 100 100" className="-rotate-90">
          {/* Background track */}
          <circle
            cx={50}
            cy={50}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={8}
            className="text-muted/30"
          />
          {/* Foreground arc */}
          <motion.circle
            cx={50}
            cy={50}
            r={radius}
            fill="none"
            stroke={health.stroke}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className={cn('text-xl font-bold tabular-nums', health.text)}
          >
            {percentage}%
          </motion.span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground">Здоровье данных</p>
        <div className={cn('inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium', health.bg, health.text)}>
          <Activity className="h-3 w-3" />
          {health.label}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────

export function DataStatsSection() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/stats')
      const json = await safeJson<{ success?: boolean; data?: StatsData }>(res)
      if (json && json.data) {
        setStats(json.data)
        setLastUpdated(new Date())
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleExportAll = async () => {
    try {
      toast.loading('Подготовка экспорта...')
      const res = await fetch('/api/settings/export?module=all')
      const result = await safeJson<{ success?: boolean; data?: unknown }>(res)
      if (!result || !result.data) throw new Error('Export failed')
      const blob = new Blob(
        [JSON.stringify(result.data, null, 2)],
        { type: 'application/json' },
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `unilife-all-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Все данные экспортированы!')
    } catch {
      toast.error('Ошибка экспорта')
    } finally {
      toast.dismiss()
    }
  }

  const handleClearAll = async () => {
    setClearing(true)
    toast.dismiss()
    try {
      const res = await fetch('/api/settings/clear', { method: 'POST' })
      if (res.ok) {
        toast.success('Все данные успешно очищены!')
        setStats({
          modules: {
            diary: 0, transactions: 0, categories: 0, meals: 0,
            waterLogs: 0, workouts: 0, collections: 0, posts: 0,
            comments: 0, likes: 0, habits: 0, goals: 0,
          },
          lastActivity: {
            diary: null, transactions: null, meals: null, workouts: null,
            collections: null, posts: null, habits: null, goals: null,
          },
          totalRecords: 0,
          storageEstimateKB: 0,
        })
      } else {
        toast.error('Ошибка при очистке данных')
      }
    } catch {
      toast.error('Ошибка сети')
    } finally {
      setClearing(false)
    }
  }

  // ── Derived Values ──────────────────────────────────────────────

  // Max count for bar scaling (main modules only)
  const maxCount = stats
    ? Math.max(
        ...MAIN_MODULE_KEYS.map((k) => stats.modules[k]),
        1,
      )
    : 1

  // Data health: percentage of main modules with data
  const dataHealthPercentage = useMemo(() => {
    if (!stats) return 0
    const modulesWithData = MAIN_MODULE_KEYS.filter(
      (k) => stats.modules[k] > 0,
    ).length
    return Math.round((modulesWithData / MAIN_MODULE_KEYS.length) * 100)
  }, [stats])

  // Storage display
  const storageDisplay = useMemo(() => {
    if (!stats) return '—'
    if (stats.storageEstimateKB > 1024) {
      return `${(stats.storageEstimateKB / 1024).toFixed(1)} МБ`
    }
    return `${stats.storageEstimateKB} КБ`
  }, [stats])

  const storagePercentage = useMemo(() => {
    if (!stats) return 0
    return Math.min(Math.round((stats.storageEstimateKB / 1024) * 100), 100)
  }, [stats])

  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) return '—'
    return lastUpdated.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [lastUpdated])

  // ── Render ──────────────────────────────────────────────────────

  return (
    <Card className="rounded-xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-500" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Статистика данных
            </CardTitle>
            <CardDescription className="mt-1">
              Записи по модулям и использование хранилища
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw
              className={cn('h-4 w-4', loading && 'animate-spin')}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ── Health Gauge + Summary ───────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center gap-8 py-4">
            <div className="h-[110px] w-[110px] rounded-full bg-muted/30 animate-pulse" />
            <div className="space-y-2 w-48">
              <div className="h-4 rounded bg-muted animate-pulse" />
              <div className="h-3 rounded bg-muted animate-pulse w-3/4" />
              <div className="h-3 rounded bg-muted animate-pulse w-1/2" />
            </div>
          </div>
        ) : stats ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-6 rounded-xl bg-muted/20 p-4 sm:p-6"
          >
            {/* Health Gauge */}
            <DataHealthGauge percentage={dataHealthPercentage} />

            {/* Quick Stats */}
            <div className="flex-1 space-y-3 w-full">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Всего записей
                  </p>
                  <p className="text-lg font-bold tabular-nums">
                    {stats.totalRecords}
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Хранилище
                  </p>
                  <p className="text-lg font-bold tabular-nums">
                    {storageDisplay}
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Обновлено
                  </p>
                  <p className="text-lg font-bold tabular-nums">
                    {lastUpdatedText}
                  </p>
                </div>
              </div>

              {/* Storage bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">
                    Использование хранилища
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {storagePercentage}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(storagePercentage, 2)}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}

        <Separator />

        {/* ── Module List with Bars + Last Activity ────────────── */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Записи по модулям
          </p>

          {loading ? (
            <div className="grid gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-1">
              {MODULE_DISPLAY.map((mod, idx) => {
                const count = stats.modules[mod.key]
                const percentage =
                  maxCount > 0
                    ? Math.round((count / maxCount) * 100)
                    : 0

                // Last activity
                const lastActivityIso =
                  mod.lastActivityKey && stats.lastActivity
                    ? stats.lastActivity[mod.lastActivityKey]
                    : null
                const relativeTime = formatRelativeTime(lastActivityIso)
                const absoluteTime = formatAbsoluteDate(lastActivityIso)

                const isExpanded = expandedModule === mod.key

                return (
                  <motion.div
                    key={mod.key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: idx * 0.04,
                      duration: 0.3,
                      ease: 'easeOut',
                    }}
                    className={cn(
                      'group rounded-lg transition-colors',
                      mod.isSubModule
                        ? 'opacity-70'
                        : 'hover:bg-muted/30',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedModule(isExpanded ? null : mod.key)
                      }
                      className={cn(
                        'w-full flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors text-left',
                        isExpanded && 'bg-muted/40',
                      )}
                    >
                      {/* Emoji + Label */}
                      <span className="text-sm w-6 text-center shrink-0">
                        {mod.emoji}
                      </span>
                      <span
                        className={cn(
                          'text-sm font-medium shrink-0 truncate',
                          mod.isSubModule ? 'w-20 sm:w-24' : 'w-24 sm:w-28',
                        )}
                      >
                        {mod.label}
                      </span>

                      {/* Bar */}
                      <div className="flex-1 h-5 bg-muted/50 rounded-md overflow-hidden">
                        <motion.div
                          className="h-full rounded-md"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.max(percentage, count > 0 ? 4 : 0)}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            ease: 'easeOut',
                            delay: 0.2 + idx * 0.03,
                          }}
                          style={{
                            background: `linear-gradient(to right, ${mod.color}cc, ${mod.color}66)`,
                          }}
                        />
                      </div>

                      {/* Count */}
                      <span className="text-sm font-semibold tabular-nums w-8 sm:w-10 text-right shrink-0">
                        {count}
                      </span>

                      {/* Last activity indicator */}
                      {lastActivityIso && (
                        <div
                          className="hidden sm:flex items-center gap-1 shrink-0 text-[11px] text-muted-foreground"
                          title={absoluteTime}
                        >
                          <Clock className="h-3 w-3" />
                          <span className="tabular-nums max-w-[70px] truncate">
                            {relativeTime}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* Expanded: show last activity details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-12 pr-3 pb-2.5 pt-0.5">
                          <div className="rounded-md bg-muted/30 p-2.5 space-y-2">
                            {/* Count details */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Количество записей
                              </span>
                              <span className="font-semibold tabular-nums">
                                {count}
                              </span>
                            </div>

                            {/* Last activity */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Последняя активность
                              </span>
                              <span
                                className="font-medium text-foreground tabular-nums"
                                title={absoluteTime}
                              >
                                {relativeTime}
                              </span>
                            </div>

                            {/* Activity indicator dot */}
                            {lastActivityIso && (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: mod.color }}
                                  />
                                  <span className="text-[10px] text-muted-foreground">
                                    {absoluteTime}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Mini bar visualization */}
                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.max(percentage, count > 0 ? 4 : 0)}%`,
                                  backgroundColor: mod.color,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Не удалось загрузить статистику
            </p>
          )}
        </div>

        <Separator />

        {/* ── Actions ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <Button
            className="gap-2 flex-1 min-w-[160px]"
            onClick={handleExportAll}
          >
            <Download className="h-4 w-4" />
            Экспорт всех данных
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2 flex-1 min-w-[160px]"
                disabled={clearing}
              >
                <Trash2 className="h-4 w-4" />
                {clearing ? 'Очистка...' : 'Очистить все данные'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Очистить все данные?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие приведёт к безвозвратному удалению всех записей,
                  транзакций, тренировок, постов и других данных. Рекомендуем
                  сначала экспортировать данные.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Очистить всё
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
