'use client'

import { useEffect, useState, useCallback } from 'react'
import { Keyboard, Settings, Database, BookOpen, Wallet, Dumbbell, Target, Trash2, RotateCcw } from 'lucide-react'
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
import { ModuleHeader } from '@/components/layout/module-header'
import { ProfileSection } from './settings/profile-section'
import { NotificationsSection } from './settings/notifications-section'
import { ThemeSection } from './settings/theme-section'
import { AppearanceSection } from './settings/appearance-section'
import { DataStatsSection } from './settings/data-stats-section'
import { DataManagementSection } from './settings/data-management-section'
import { AboutSection } from './settings/about-section'
import { toast } from 'sonner'

const NAVIGATION_SHORTCUTS = [
  { key: 'D', action: 'Дашборд' },
  { key: 'F', action: 'Финансы' },
  { key: 'N', action: 'Питание' },
  { key: 'W', action: 'Тренировки' },
  { key: 'H', action: 'Привычки' },
  { key: 'G', action: 'Цели' },
]

const ACTION_SHORTCUTS = [
  { key: '⌘K', action: 'Поиск' },
  { key: '⌘,', action: 'Следующий модуль' },
  { key: 'Esc', action: 'Закрыть диалог' },
]

// ── Quick Stats Types ────────────────────────────────────────────────

interface QuickStats {
  diary: number
  transactions: number
  workouts: number
  habits: number
}

const QUICK_STATS_CONFIG = [
  { key: 'diary' as const, label: 'Записи в дневнике', icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
  { key: 'transactions' as const, label: 'Транзакции', icon: Wallet, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/15' },
  { key: 'workouts' as const, label: 'Тренировки', icon: Dumbbell, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/15' },
  { key: 'habits' as const, label: 'Привычки', icon: Target, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-500/15' },
]

// ── Quick Stats Skeleton ─────────────────────────────────────────────

function QuickStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-muted/30 p-3">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="skeleton-shimmer h-8 w-8 rounded-lg shrink-0" />
            <div className="skeleton-shimmer h-3 w-24 rounded" />
          </div>
          <div className="skeleton-shimmer h-6 w-12 rounded" />
        </div>
      ))}
    </div>
  )
}

// ── Quick Stats Card ─────────────────────────────────────────────────

function QuickStatsCard() {
  const [stats, setStats] = useState<QuickStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) return
      const json = await res.json()
      if (json?.success && json?.data) {
        const d = json.data
        setStats({
          diary: Array.isArray(d.diaryMonth) ? d.diaryMonth.length : 0,
          transactions: Array.isArray(d.transactions) ? d.transactions.length : 0,
          workouts: Array.isArray(d.workouts) ? d.workouts.length : 0,
          habits: Array.isArray(d.habits) ? d.habits.length : 0,
        })
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

  return (
    <Card className="rounded-xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base">Ваши данные</CardTitle>
            <CardDescription>Обзор записей по модулям за текущий месяц</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <QuickStatsSkeleton />
        ) : stats ? (
          <div className="grid grid-cols-2 gap-3">
            {QUICK_STATS_CONFIG.map((item) => {
              const Icon = item.icon
              const count = stats[item.key]
              return (
                <div key={item.key} className="rounded-xl bg-muted/30 p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium leading-tight">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{count}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Не удалось загрузить данные
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ── Danger Zone ───────────────────────────────────────────────────────

function DangerZone() {
  const [clearing, setClearing] = useState(false)

  const handleClearAllData = async () => {
    setClearing(true)
    try {
      const res = await fetch('/api/settings/clear', { method: 'POST' })
      if (res.ok) {
        toast.success('Все данные успешно очищены!')
      } else {
        toast.error('Ошибка при очистке данных')
      }
    } catch {
      toast.error('Ошибка сети')
    } finally {
      setClearing(false)
    }
  }

  const handleResetWidgets = () => {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('widget') || key.includes('layout') || key.includes('dashboard-config'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))
      toast.success(`Настройки виджетов сброшены (${keysToRemove.length} элементов)`)
    } catch {
      toast.error('Ошибка при сбросе настроек виджетов')
    }
  }

  return (
    <Card className="rounded-xl overflow-hidden border-l-4 border-l-destructive">
      <CardHeader>
        <CardTitle className="text-base text-destructive flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Опасная зона
        </CardTitle>
        <CardDescription>
          Действия в этом разделе необратимы. Будьте осторожны.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <h4 className="font-medium text-sm mb-1">Очистить все данные</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Безвозвратно удалить все записи, транзакции, тренировки и другие данные.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2" disabled={clearing}>
                <Trash2 className="h-4 w-4" />
                {clearing ? 'Очистка...' : 'Очистить все данные'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Очистить все данные?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие приведёт к безвозвратному удалению всех записей,
                  транзакций, тренировок и других данных. Рекомендуем сначала
                  экспортировать данные.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAllData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Очистить всё
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Separator />

        <div className="rounded-lg border border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/5 p-4">
          <h4 className="font-medium text-sm mb-1">Сбросить настройки виджетов</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Вернуть настройки виджетов дашборда к значениям по умолчанию.
          </p>
          <Button variant="outline" size="sm" className="gap-2 border-orange-300 dark:border-orange-500/30 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/10" onClick={handleResetWidgets}>
            <RotateCcw className="h-4 w-4" />
            Сбросить настройки виджетов
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Keyboard Shortcuts Components ─────────────────────────────────────

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-md border border-border bg-muted/50 text-xs font-mono font-medium text-foreground shadow-sm">
      {children}
    </kbd>
  )
}

function ShortcutsGroup({
  title,
  shortcuts,
}: {
  title: string
  shortcuts: { key: string; action: string }[]
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {shortcuts.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">{s.action}</span>
            <Kbd>{s.key}</Kbd>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Settings Page ─────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <ModuleHeader
        icon={Settings}
        title="Настройки"
        description="Управление профилем и параметрами приложения"
        accent="zinc"
        noBlobs
        showCustomize={false}
      />

      {/* Quick Stats Card */}
      <QuickStatsCard />

      <ProfileSection />
      <NotificationsSection />
      <ThemeSection />
      <AppearanceSection />

      {/* Keyboard Shortcuts Section */}
      <Card className="rounded-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">Горячие клавиши</CardTitle>
              <CardDescription>Быстрая навигация и действия</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <ShortcutsGroup title="Навигация" shortcuts={NAVIGATION_SHORTCUTS} />
          <Separator />
          <ShortcutsGroup title="Действия" shortcuts={ACTION_SHORTCUTS} />
          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Подсказка: на мобильных устройствах используйте жесты или меню навигации
            </p>
          </div>
        </CardContent>
      </Card>

      <DataStatsSection />
      <DataManagementSection />

      {/* Danger Zone */}
      <DangerZone />

      <AboutSection />
    </div>
  )
}
