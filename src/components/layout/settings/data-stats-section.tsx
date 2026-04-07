'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
}

interface StatsData {
  modules: ModuleStats
  totalRecords: number
  storageEstimateKB: number
}

const MODULE_DISPLAY: { key: keyof ModuleStats; label: string; emoji: string; icon: React.ElementType }[] = [
  { key: 'diary', label: 'Дневник', emoji: '📝', icon: BookOpen },
  { key: 'transactions', label: 'Транзакции', emoji: '💳', icon: Wallet },
  { key: 'categories', label: 'Категории', emoji: '🏷️', icon: Database },
  { key: 'meals', label: 'Приёмы пищи', emoji: '🍽️', icon: Apple },
  { key: 'waterLogs', label: 'Записи воды', emoji: '💧', icon: Database },
  { key: 'workouts', label: 'Тренировки', emoji: '💪', icon: Dumbbell },
  { key: 'collections', label: 'Коллекции', emoji: '📚', icon: Library },
  { key: 'posts', label: 'Посты', emoji: '📰', icon: Newspaper },
  { key: 'comments', label: 'Комментарии', emoji: '💬', icon: Database },
  { key: 'likes', label: 'Лайки', emoji: '❤️', icon: Database },
]

// Module colors for the mini bar chart
const MODULE_BAR_COLORS: { key: keyof ModuleStats; label: string; color: string; darkColor: string }[] = [
  { key: 'diary', label: 'Дневник', color: '#10b981', darkColor: '#34d399' },
  { key: 'transactions', label: 'Финансы', color: '#f59e0b', darkColor: '#fbbf24' },
  { key: 'meals', label: 'Питание', color: '#f97316', darkColor: '#fb923c' },
  { key: 'workouts', label: 'Тренировки', color: '#3b82f6', darkColor: '#60a5fa' },
  { key: 'collections', label: 'Коллекции', color: '#8b5cf6', darkColor: '#a78bfa' },
]

export function DataStatsSection() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

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
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
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
        setStats({ modules: { diary: 0, transactions: 0, categories: 0, meals: 0, waterLogs: 0, workouts: 0, collections: 0, posts: 0, comments: 0, likes: 0 }, totalRecords: 0, storageEstimateKB: 0 })
      } else {
        toast.error('Ошибка при очистке данных')
      }
    } catch {
      toast.error('Ошибка сети')
    } finally {
      setClearing(false)
    }
  }

  const maxCount = stats
    ? Math.max(...Object.values(stats.modules), 1)
    : 1

  // Mini bar chart data
  const barChartData = useMemo(() => {
    if (!stats) return []
    const maxBar = Math.max(...MODULE_BAR_COLORS.map(m => stats.modules[m.key]), 1)
    return MODULE_BAR_COLORS.map(m => ({
      ...m,
      count: stats.modules[m.key],
      percentage: Math.round((stats.modules[m.key] / maxBar) * 100),
    }))
  }, [stats])

  // Storage estimate display
  const storageDisplay = useMemo(() => {
    if (!stats) return '—'
    if (stats.storageEstimateKB > 1024) {
      return `${(stats.storageEstimateKB / 1024).toFixed(1)} МБ`
    }
    return `${stats.storageEstimateKB} КБ`
  }, [stats])

  // Storage bar percentage (relative to 1MB)
  const storagePercentage = useMemo(() => {
    if (!stats) return 0
    return Math.min(Math.round((stats.storageEstimateKB / 1024) * 100), 100)
  }, [stats])

  // Last updated text
  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) return '—'
    return lastUpdated.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }, [lastUpdated])

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
            <CardDescription className="mt-1">Записи по модулям и использование хранилища</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mini bar chart — CSS only, vertical bars */}
        {loading ? (
          <div className="h-[120px] rounded-xl bg-muted/30 animate-pulse" />
        ) : stats && barChartData.length > 0 ? (
          <div className="rounded-xl bg-muted/20 p-4">
            <div className="flex items-end justify-between gap-2 h-[100px]">
              {barChartData.map((bar) => (
                <div key={bar.key} className="flex flex-col items-center gap-1.5 flex-1">
                  {/* Bar */}
                  <div className="w-full flex flex-col items-center justify-end h-[70px]">
                    <span className="text-[10px] font-semibold tabular-nums text-muted-foreground mb-1">
                      {bar.count > 0 ? bar.count : ''}
                    </span>
                    <div
                      className="w-full max-w-[40px] rounded-t-md transition-all duration-700 ease-out animate-bar-grow"
                      style={{
                        height: `${Math.max(bar.percentage, bar.count > 0 ? 6 : 0)}%`,
                        backgroundColor: bar.color,
                        opacity: 0.85,
                        minHeight: bar.count > 0 ? '4px' : '0px',
                      }}
                    />
                  </div>
                  {/* Label */}
                  <span className="text-[10px] text-muted-foreground leading-tight text-center truncate w-full">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Module counts list */}
        <div className="grid gap-2">
          {loading ? (
            <div className="grid gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : stats ? (
            MODULE_DISPLAY.map((mod) => {
              const count = stats.modules[mod.key]
              const percentage = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
              // Get bar color for the 5 main modules
              const barColor = MODULE_BAR_COLORS.find(b => b.key === mod.key)
              const barStyle = barColor
                ? { background: `linear-gradient(to right, ${barColor.color}99, ${barColor.color}55)` }
                : { background: undefined }
              return (
                <div key={mod.key} className="flex items-center gap-3 group">
                  <span className="text-sm w-6 text-center">{mod.emoji}</span>
                  <span className="text-sm font-medium w-20 sm:w-28 shrink-0 truncate">{mod.label}</span>
                  <div className="flex-1 h-6 bg-muted/50 rounded-md overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(percentage, count > 0 ? 4 : 0)}%`,
                        ...(barStyle.background ? { background: barStyle.background } : { background: 'linear-gradient(to right, var(--primary)aa, var(--primary)66)' }),
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold tabular-nums w-8 sm:w-10 text-right shrink-0">
                    {count}
                  </span>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Не удалось загрузить статистику
            </p>
          )}
        </div>

        {/* Summary cards — 3 column */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Всего</span>
              </div>
              <span className="text-xl font-bold tabular-nums number-highlight">
                {stats.totalRecords}
              </span>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Хранилище</span>
              </div>
              <span className="text-lg font-bold tabular-nums number-highlight">
                {storageDisplay}
              </span>
              {/* Storage usage bar */}
              <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${Math.max(storagePercentage, 2)}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Обновлено</span>
              </div>
              <span className="text-lg font-bold tabular-nums number-highlight">
                {lastUpdatedText}
              </span>
            </div>
          </div>
        )}

        <Separator />

        {/* Actions */}
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
                  Это действие приведёт к безвозвратному удалению всех записей, транзакций,
                  тренировок, постов и других данных. Рекомендуем сначала экспортировать данные.
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
