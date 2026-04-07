import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiServerError } from '@/lib/api'
import crypto from 'crypto'

type NotificationType = 'warning' | 'success' | 'info' | 'reminder'

interface SmartNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  icon: string
  module: 'habits' | 'goals' | 'finance' | 'diary' | 'workout' | 'nutrition'
  actionUrl: string
  createdAt: string
  read: boolean
}

function todayRange() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  end.setHours(23, 59, 59, 999)
  return { today, end }
}

function weekRange() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  // Monday = 0, Sunday = 6 in our system (ISO: Monday=1, Sunday=7)
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - mondayOffset)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { monday, sunday }
}

function monthRange() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  monthStart.setHours(0, 0, 0, 0)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  monthEnd.setHours(23, 59, 59, 999)
  return { monthStart, monthEnd }
}

function russianDate(date: Date): string {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]
  return `${date.getDate()} ${months[date.getMonth()]}`
}

export async function GET() {
  try {
    const { today, end: todayEnd } = todayRange()
    const { monday, sunday } = weekRange()
    const { monthStart, monthEnd } = monthRange()
    const now = new Date()

    const notifications: SmartNotification[] = []

    // ── 1. Overdue goals ──
    const overdueGoals = await db.goal.findMany({
      where: {
        userId: DEMO_USER_ID,
        status: 'active',
        deadline: { lt: now },
      },
    })

    for (const goal of overdueGoals) {
      const deadline = goal.deadline!
      const daysOverdue = Math.floor(
        (now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)
      )
      notifications.push({
        id: crypto.randomUUID(),
        type: 'warning',
        title: `Просроченная цель`,
        description: `«${goal.title}» — дедлайн прошёл ${daysOverdue} дн. назад (${russianDate(deadline)}). Не забудьте завершить или обновить прогресс.`,
        icon: 'AlertTriangle',
        module: 'goals',
        actionUrl: '/?module=goals',
        createdAt: deadline.toISOString(),
        read: false,
      })
    }

    // ── 2. Streak reminders (habits with streak >= 3) ──
    const habits = await db.habit.findMany({
      where: { userId: DEMO_USER_ID },
      include: {
        logs: {
          orderBy: { date: 'desc' },
        },
      },
    })

    const habitsWithStreak = habits.map((habit) => {
      const habitLogs = habit.logs || []
      let streak = 0
      const checkDate = new Date()
      checkDate.setHours(0, 0, 0, 0)

      const todayLog = habitLogs.find((log) => {
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)
        return logDate.getTime() === checkDate.getTime()
      })

      if (!todayLog) {
        checkDate.setDate(checkDate.getDate() - 1)
      }

      for (let i = 0; i < 365; i++) {
        const targetDate = new Date(checkDate)
        targetDate.setDate(targetDate.getDate() - i)
        targetDate.setHours(0, 0, 0, 0)

        const found = habitLogs.find((log) => {
          const logDate = new Date(log.date)
          logDate.setHours(0, 0, 0, 0)
          return logDate.getTime() === targetDate.getTime()
        })

        if (found) {
          streak++
        } else {
          break
        }
      }

      return { habit, streak, todayCompleted: !!todayLog }
    })

    // Celebrate habits with streaks >= 3
    for (const { habit, streak } of habitsWithStreak) {
      if (streak >= 3) {
        notifications.push({
          id: crypto.randomUUID(),
          type: 'success',
          title: `${habit.emoji} ${habit.name} — ${streak} дней подряд!`,
          description: `Отличная серия! Продолжайте в том же духе и поддерживайте привычку.`,
          icon: 'Flame',
          module: 'habits',
          actionUrl: '/?module=habits',
          createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0).toISOString(),
          read: false,
        })
      }
    }

    // ── 3. Budget alerts (monthly expenses > 80% of income) ──
    const monthlyTransactions = await db.transaction.findMany({
      where: {
        userId: DEMO_USER_ID,
        date: { gte: monthStart, lte: monthEnd },
      },
    })

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
    const monthlyExpense = monthlyTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    if (monthlyIncome > 0 && monthlyExpense > monthlyIncome * 0.8) {
      const percent = Math.round((monthlyExpense / monthlyIncome) * 100)
      notifications.push({
        id: crypto.randomUUID(),
        type: 'warning',
        title: `Расходы превысили ${percent}% дохода`,
        description: `За этот месяц вы потратили ${Math.round(monthlyExpense).toLocaleString('ru-RU')} ₽ из ${Math.round(monthlyIncome).toLocaleString('ru-RU')} ₽ дохода. Рекомендуем контролировать траты.`,
        icon: 'Wallet',
        module: 'finance',
        actionUrl: '/?module=finance',
        createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0).toISOString(),
        read: false,
      })
    }

    // ── 4. Water reminder (if water intake today < 4 glasses = ~1000ml) ──
    const waterLogsToday = await db.waterLog.findMany({
      where: {
        userId: DEMO_USER_ID,
        date: { gte: today, lte: todayEnd },
      },
    })

    const waterTotalMl = waterLogsToday.reduce((sum, w) => sum + (w.amountMl || 250), 0)
    const waterGlasses = Math.floor(waterTotalMl / 250)

    if (waterGlasses < 4) {
      notifications.push({
        id: crypto.randomUUID(),
        type: 'reminder',
        title: `Выпейте ещё воды`,
        description: `Вы выпили только ${waterGlasses} из 8 стаканов сегодня. Не забывайте пить воду регулярно для здоровья.`,
        icon: 'Droplets',
        module: 'nutrition',
        actionUrl: '/?module=nutrition',
        createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0, 0).toISOString(),
        read: false,
      })
    }

    // ── 5. Diary reminder (if no diary entry today) ──
    const diaryToday = await db.diaryEntry.findFirst({
      where: {
        userId: DEMO_USER_ID,
        date: { gte: today, lte: todayEnd },
      },
    })

    if (!diaryToday) {
      notifications.push({
        id: crypto.randomUUID(),
        type: 'reminder',
        title: `Запишите мысли в дневник`,
        description: `У вас ещё нет записи в дневнике сегодня. Несколько минут рефлексии помогут успокоиться и настроиться на вечер.`,
        icon: 'BookOpen',
        module: 'diary',
        actionUrl: '/?module=diary',
        createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0).toISOString(),
        read: false,
      })
    }

    // ── 6. Workout reminder (if no workout this week) ──
    const workoutsThisWeek = await db.workout.findMany({
      where: {
        userId: DEMO_USER_ID,
        date: { gte: monday, lte: sunday },
      },
    })

    if (workoutsThisWeek.length === 0) {
      const daysNames = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу']
      const todayName = daysNames[now.getDay()]
      notifications.push({
        id: crypto.randomUUID(),
        type: 'reminder',
        title: `Нет тренировок на этой неделе`,
        description: `Сегодня ${todayName}, а вы ещё не тренировались. Даже 20 минут активности улучшат ваше самочувствие.`,
        icon: 'Dumbbell',
        module: 'workout',
        actionUrl: '/?module=workout',
        createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0).toISOString(),
        read: false,
      })
    }

    // ── 7. Habit completion celebration (all habits completed today) ──
    const totalHabits = habitsWithStreak.length
    const completedHabits = habitsWithStreak.filter((h) => h.todayCompleted).length

    if (totalHabits > 0 && completedHabits === totalHabits) {
      notifications.push({
        id: crypto.randomUUID(),
        type: 'success',
        title: `Все привычки выполнены!`,
        description: `Отличная работа! Все ${totalHabits} привычек на сегодня выполнены. Вы на правильном пути к целям!`,
        icon: 'Trophy',
        module: 'habits',
        actionUrl: '/?module=habits',
        createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0).toISOString(),
        read: false,
      })
    }

    // Sort: warnings first, then reminders, then info, then success
    const typeOrder: Record<NotificationType, number> = {
      warning: 0,
      reminder: 1,
      info: 2,
      success: 3,
    }
    notifications.sort((a, b) => typeOrder[a.type] - typeOrder[b.type])

    return apiSuccess({
      notifications,
      unreadCount: notifications.length,
    })
  } catch (error) {
    console.error('Notifications API error:', error)
    return apiServerError('Failed to load notifications')
  }
}
