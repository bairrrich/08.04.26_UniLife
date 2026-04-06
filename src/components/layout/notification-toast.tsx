'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '@/store/use-app-store'
import { Target, Sparkles, BookOpen } from 'lucide-react'
import type { AppModule } from '@/store/use-app-store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationCheck {
  id: string
  message: string
  icon: React.ReactNode
  module?: AppModule
}

// ─── Session-based dismissal storage ─────────────────────────────────────────

const SESSION_KEY = 'unilife-notif-dismissed'

function getDismissed(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function markDismissed(id: string) {
  try {
    const set = getDismissed()
    set.add(id)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]))
  } catch {
    // sessionStorage unavailable
  }
}

// ─── Notification Helpers ────────────────────────────────────────────────────

function getDaysUntilDeadline(deadline: string): number {
  const now = new Date()
  const dl = new Date(deadline)
  const diff = dl.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const activeModule = useAppStore((s) => s.activeModule)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const hasFired = useRef(false)

  useEffect(() => {
    // Only fire once on dashboard load
    if (hasFired.current) return
    if (activeModule !== 'dashboard') return
    hasFired.current = true

    const dismissed = getDismissed()
    const today = getTodayStr()
    const hour = new Date().getHours()
    const notifications: NotificationCheck[] = []

    // 1. Goals with deadlines within 3 days
    fetch('/api/goals')
      .then((res) => res.json())
      .then((json) => {
        if (!json.success || !json.data) return
        const goals = json.data as { id: string; title: string; deadline: string | null; status: string; progress: number }[]

        const upcomingGoals = goals.filter((g) => {
          if (!g.deadline || g.status === 'completed') return false
          const days = getDaysUntilDeadline(g.deadline)
          return days >= 0 && days <= 3
        })

        // Max 1 goal notification per session
        if (upcomingGoals.length > 0 && !dismissed.has('goal-deadline')) {
          const goal = upcomingGoals[0]
          const days = getDaysUntilDeadline(goal.deadline!)
          const dayWord = days === 0 ? 'сегодня' : days === 1 ? 'завтра' : `через ${days} дня`

          notifications.push({
            id: 'goal-deadline',
            message: `Цель «${goal.title}» — ${dayWord}`,
            icon: <Target className="h-4 w-4" />,
            module: 'goals',
          })
        }

        return { goals }
      })
      .then(({ goals }) => {
        // 2. Habits not completed by evening (after 5pm)
        if (hour >= 17 && !dismissed.has('habits-reminder')) {
          fetch('/api/habits')
            .then((res) => res.json())
            .then((json) => {
              if (!json.success || !json.data) return
              const activeHabits = (json.data as { todayCompleted: boolean }[]).filter(
                (h) => !h.todayCompleted
              )

              if (activeHabits.length > 0) {
                notifications.push({
                  id: 'habits-reminder',
                  message: 'Не забудьте про привычки',
                  icon: <Sparkles className="h-4 w-4" />,
                  module: 'habits',
                })
              }
            })
            .catch(() => {})
        }
      })
      .then(() => {
        // 3. No diary entry today after 6pm
        if (hour >= 18 && !dismissed.has('diary-reminder')) {
          fetch(`/api/diary?date=${today}`)
            .then((res) => res.json())
            .then((json) => {
              if (!json.success || !json.data || json.data.length === 0) {
                notifications.push({
                  id: 'diary-reminder',
                  message: 'Запишите мысли за день',
                  icon: <BookOpen className="h-4 w-4" />,
                  module: 'diary',
                })
              }
            })
            .catch(() => {})
        }
      })
      .then(() => {
        // Small delay to collect all notifications before showing
        setTimeout(() => {
          for (const notif of notifications) {
            markDismissed(notif.id)

            toast(notif.message, {
              icon: notif.icon,
              description: notif.module ? 'Нажмите, чтобы перейти' : undefined,
              duration: 6000,
              action: notif.module
                ? {
                    label: 'Перейти',
                    onClick: () => setActiveModule(notif.module!),
                  }
                : undefined,
              closeButton: true,
            })
          }
        }, 800)
      })
      .catch(() => {
        // Silent fail — notifications are non-critical
      })
  }, [activeModule, setActiveModule])
}

// ─── Component (placeholder — hook is used elsewhere) ────────────────────────

export function NotificationToaster() {
  useNotifications()
  return null
}
