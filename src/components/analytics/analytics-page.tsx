'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  CalendarDays,
  Lightbulb,
  Sparkles,
  Inbox,
  Brain,
  Flame,
  Smile,
  Dumbbell,
  Wallet,
} from 'lucide-react'

import {
  toDateStr,
  getDateRange,
  MOOD_EMOJI,
  MOOD_LABELS,
  RU_DAYS_SHORT,
  RU_MONTHS_SHORT,
  RU_MONTHS,
  formatCurrency,
  type Period,
} from '@/lib/format'

import type {
  DiaryEntry,
  Transaction,
  NutritionDay,
  Workout,
  HabitItem,
  ActivityStats,
  MoodChartDataPoint,
  SpendingChartDataPoint,
  WorkoutDistributionPoint,
  TopCategoryPoint,
  HabitsHeatmapCell,
} from './types'
import { PIE_COLORS, WORKOUT_TYPE_COLORS } from './constants'
import { classifyWorkout, getMonthStr } from './helpers'
import { ActivityOverview } from './activity-overview'
import { OverviewStats } from './overview-stats'
import { ChartsRow } from './charts-row'
import { NutritionChart, WorkoutDistributionChart, TopCategoriesChart } from './bottom-charts'
import { HabitsHeatmapSection } from './habits-heatmap-section'

// ─── Period Comparison Types ──────────────────────────────────────────────────

interface PeriodComparison {
  diaryChange: number | null
  expenseChange: number | null
  workoutChange: number | null
  habitsChange: number | null
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [loading, setLoading] = useState(true)
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [habits, setHabits] = useState<HabitItem[]>([])
  const [nutritionDays, setNutritionDays] = useState<NutritionDay[]>([])
  const [prevPeriodComparison, setPrevPeriodComparison] = useState<PeriodComparison>({
    diaryChange: null,
    expenseChange: null,
    workoutChange: null,
    habitsChange: null,
  })

  // ── Data Fetching (parallel) ────────────────────────────────────────────
  const safeFetch = async (url: string, timeoutMs = 8000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      if (text.trimStart().startsWith('<')) throw new Error('Received HTML instead of JSON')
      return JSON.parse(text)
    } finally {
      clearTimeout(timer)
    }
  }

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true)
    const { from, to } = getDateRange(p)
    const currentMonth = getMonthStr(new Date())

    try {
      // Build nutrition date URLs for parallel fetching
      const fromDate = new Date(from)
      const toDate = new Date(to)
      const maxDays = p === 'year' ? 14 : p === 'month' ? 14 : 7
      const nutritionUrls: string[] = []
      const cursor = new Date(fromDate)
      let dayCount = 0
      while (cursor <= toDate && dayCount < maxDays) {
        const dateStr = toDateStr(cursor)
        nutritionUrls.push(`/api/nutrition/stats?date=${dateStr}`)
        cursor.setDate(cursor.getDate() + 1)
        dayCount++
      }

      // ── Previous period range for comparison ────────────────────────────
      const periodDays = p === 'week' ? 7 : p === 'month' ? 30 : 365
      const prevFrom = new Date(new Date(from).getTime() - periodDays * 24 * 60 * 60 * 1000)
      const prevTo = new Date(from)
      const prevMonth = getMonthStr(prevFrom)
      const prevFromStr = toDateStr(prevFrom)
      const prevToStr = toDateStr(prevTo)

      // ── Parallel fetch all endpoints (current + previous period) ────────
      const results = await Promise.allSettled([
        safeFetch(`/api/diary?from=${from}&to=${to}`),
        safeFetch(`/api/finance?month=${currentMonth}`),
        safeFetch(`/api/workout?month=${currentMonth}`),
        safeFetch('/api/habits'),
        ...nutritionUrls.map((url) => safeFetch(url)),
        // Previous period for comparison
        safeFetch(`/api/diary?from=${prevFromStr}&to=${prevToStr}`),
        safeFetch(`/api/finance?month=${prevMonth}`),
        safeFetch(`/api/workout?month=${prevMonth}`),
      ])

      const [diaryRes, financeRes, workoutRes, habitsRes, ...nutritionResults] = results
      const prevDiaryRes = results[4 + nutritionUrls.length]
      const prevFinanceRes = results[5 + nutritionUrls.length]
      const prevWorkoutRes = results[6 + nutritionUrls.length]

      // Diary
      if (diaryRes.status === 'fulfilled' && diaryRes.value.data) {
        setDiaryEntries(diaryRes.value.data)
      } else {
        setDiaryEntries([])
      }

      // Transactions
      if (
        financeRes.status === 'fulfilled' &&
        financeRes.value.success &&
        financeRes.value.data
      ) {
        setTransactions(financeRes.value.data)
      } else {
        setTransactions([])
      }

      // Workouts
      if (
        workoutRes.status === 'fulfilled' &&
        workoutRes.value.success &&
        workoutRes.value.data
      ) {
        setWorkouts(workoutRes.value.data)
      } else {
        setWorkouts([])
      }

      // Habits
      if (
        habitsRes.status === 'fulfilled' &&
        habitsRes.value.success &&
        habitsRes.value.data
      ) {
        setHabits(habitsRes.value.data)
      } else {
        setHabits([])
      }

      // Nutrition days
      const nutritionData: NutritionDay[] = []
      for (let i = 0; i < nutritionResults.length; i++) {
        const res = nutritionResults[i]
        if (
          res &&
          res.status === 'fulfilled' &&
          res.value &&
          res.value.success &&
          res.value.data
        ) {
          nutritionData.push({
            date: res.value.data.date,
            totalKcal: res.value.data.totalKcal || 0,
            totalProtein: res.value.data.totalProtein || 0,
            totalFat: res.value.data.totalFat || 0,
            totalCarbs: res.value.data.totalCarbs || 0,
          })
        }
      }
      setNutritionDays(nutritionData)

      // ── Compute previous period comparison ──────────────────────────────
      let prevDiaryCount = 0
      let prevExpenseTotal = 0
      let prevWorkoutCount = 0

      if (prevDiaryRes?.status === 'fulfilled' && prevDiaryRes.value?.data) {
        prevDiaryCount = prevDiaryRes.value.data.length
      }
      if (prevFinanceRes?.status === 'fulfilled' && prevFinanceRes.value?.data) {
        prevExpenseTotal = prevFinanceRes.value.data
          .filter((t: Transaction) => t.type === 'EXPENSE')
          .reduce((s: number, t: Transaction) => s + t.amount, 0)
      }
      if (prevWorkoutRes?.status === 'fulfilled' && prevWorkoutRes.value?.data) {
        prevWorkoutCount = prevWorkoutRes.value.data.length
      }

      // Current period metrics (computed from loaded data)
      const curDiaryCount = diaryRes.status === 'fulfilled' && diaryRes.value?.data
        ? diaryRes.value.data.length : 0
      const curExpenseTotal = financeRes.status === 'fulfilled' && financeRes.value?.data
        ? financeRes.value.data.filter((t: Transaction) => t.type === 'EXPENSE').reduce((s: number, t: Transaction) => s + t.amount, 0) : 0
      const curWorkoutCount = workoutRes.status === 'fulfilled' && workoutRes.value?.data
        ? workoutRes.value.data.length : 0

      setPrevPeriodComparison({
        diaryChange: prevDiaryCount > 0 ? Math.round(((curDiaryCount - prevDiaryCount) / prevDiaryCount) * 100) : null,
        expenseChange: prevExpenseTotal > 0 ? Math.round(((curExpenseTotal - prevExpenseTotal) / prevExpenseTotal) * 100) : null,
        workoutChange: prevWorkoutCount > 0 ? Math.round(((curWorkoutCount - prevWorkoutCount) / prevWorkoutCount) * 100) : null,
        habitsChange: null, // habits don't have historical comparison
      })
    } catch (err) {
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(period)
  }, [period, fetchData])

  // ── Derived Data ───────────────────────────────────────────────────────

  // Check if we have ANY data
  const hasData = useMemo(() => {
    return diaryEntries.length > 0 || transactions.length > 0 || workouts.length > 0 || habits.length > 0 || nutritionDays.length > 0
  }, [diaryEntries, transactions, workouts, habits, nutritionDays])

  // 1. Overview Stats
  const diaryCount = diaryEntries.length
  const moodEntries = diaryEntries.filter((e) => e.mood !== null)
  const avgMood = moodEntries.length > 0
    ? moodEntries.reduce((s, e) => s + (e.mood ?? 0), 0) / moodEntries.length
    : 0

  const totalExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0)
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0)
  const savingsRate = totalIncome > 0
    ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
    : 0

  const workoutCount = workouts.length
  const totalMinutes = workouts.reduce((s, w) => s + (w.durationMin ?? 0), 0)

  const totalHabits = habits.length
  const completedHabits = habits.filter((h) => h.todayCompleted).length
  const habitsRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

  // 2. Mood Trend Chart Data
  const moodChartData = useMemo((): MoodChartDataPoint[] => {
    const now = new Date()
    const entries = diaryEntries
      .filter((e) => e.mood !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (period === 'week') {
      const data: MoodChartDataPoint[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const dateStr = toDateStr(d)
        const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1
        const entry = entries.find((e) => toDateStr(new Date(e.date)) === dateStr)
        data.push({
          label: RU_DAYS_SHORT[dayIdx],
          mood: entry?.mood ?? 0,
          fullLabel: `${RU_DAYS_SHORT[dayIdx]}: ${entry ? MOOD_EMOJI[entry.mood!] + ' ' + MOOD_LABELS[entry.mood!] : 'Нет данных'}`,
        })
      }
      return data
    } else if (period === 'month') {
      const data: MoodChartDataPoint[] = []
      const weekLabels = ['Нед 1', 'Нед 2', 'Нед 3', 'Нед 4', 'Нед 5']
      for (let w = 0; w < 5; w++) {
        const weekStart = new Date(now.getFullYear(), now.getMonth(), w * 7 + 1)
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), (w + 1) * 7)
        const weekEntries = entries.filter((e) => {
          const d = new Date(e.date)
          return d >= weekStart && d < weekEnd && d.getMonth() === now.getMonth()
        })
        const avg = weekEntries.length > 0
          ? Math.round(weekEntries.reduce((s, e) => s + (e.mood ?? 0), 0) / weekEntries.length * 10) / 10
          : 0
        data.push({
          label: weekLabels[w] ?? `Н${w + 1}`,
          mood: avg,
          fullLabel: `${weekLabels[w]}: ${avg > 0 ? avg.toFixed(1) : 'Нет данных'}`,
        })
      }
      return data
    } else {
      const data: MoodChartDataPoint[] = []
      for (let m = 0; m < 12; m++) {
        const monthEntries = entries.filter((e) => {
          const d = new Date(e.date)
          return d.getMonth() === m && d.getFullYear() === now.getFullYear()
        })
        const avg = monthEntries.length > 0
          ? Math.round(monthEntries.reduce((s, e) => s + (e.mood ?? 0), 0) / monthEntries.length * 10) / 10
          : 0
        data.push({
          label: RU_MONTHS_SHORT[m],
          mood: avg,
          fullLabel: `${RU_MONTHS[m]}: ${avg > 0 ? avg.toFixed(1) : 'Нет данных'}`,
        })
      }
      return data
    }
  }, [diaryEntries, period])

  // 3. Spending Trend Data
  const spendingChartData = useMemo((): SpendingChartDataPoint[] => {
    const now = new Date()
    const expenses = transactions.filter((t) => t.type === 'EXPENSE')
    const income = transactions.filter((t) => t.type === 'INCOME')

    if (period === 'week') {
      const data: SpendingChartDataPoint[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const dateStr = toDateStr(d)
        const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1
        const dayExpenses = expenses
          .filter((t) => toDateStr(new Date(t.date)) === dateStr)
          .reduce((s, t) => s + t.amount, 0)
        const dayIncome = income
          .filter((t) => toDateStr(new Date(t.date)) === dateStr)
          .reduce((s, t) => s + t.amount, 0)
        data.push({
          label: RU_DAYS_SHORT[dayIdx],
          spending: Math.round(dayExpenses),
          income: Math.round(dayIncome),
        })
      }
      return data
    } else if (period === 'month') {
      const data: SpendingChartDataPoint[] = []
      const weekLabels = ['Нед 1', 'Нед 2', 'Нед 3', 'Нед 4', 'Нед 5']
      for (let w = 0; w < 5; w++) {
        const weekStart = new Date(now.getFullYear(), now.getMonth(), w * 7 + 1)
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), (w + 1) * 7)
        const weekExpenses = expenses.filter((t) => {
          const d = new Date(t.date)
          return d >= weekStart && d < weekEnd && d.getMonth() === now.getMonth()
        }).reduce((s, t) => s + t.amount, 0)
        const weekIncome = income.filter((t) => {
          const d = new Date(t.date)
          return d >= weekStart && d < weekEnd && d.getMonth() === now.getMonth()
        }).reduce((s, t) => s + t.amount, 0)
        data.push({
          label: weekLabels[w] ?? `Н${w + 1}`,
          spending: Math.round(weekExpenses),
          income: Math.round(weekIncome),
        })
      }
      return data
    } else {
      const data: SpendingChartDataPoint[] = []
      for (let m = 0; m < 12; m++) {
        const monthExpenses = expenses.filter((t) => {
          const d = new Date(t.date)
          return d.getMonth() === m && d.getFullYear() === now.getFullYear()
        }).reduce((s, t) => s + t.amount, 0)
        const monthIncome = income.filter((t) => {
          const d = new Date(t.date)
          return d.getMonth() === m && d.getFullYear() === now.getFullYear()
        }).reduce((s, t) => s + t.amount, 0)
        data.push({
          label: RU_MONTHS_SHORT[m],
          spending: Math.round(monthExpenses),
          income: Math.round(monthIncome),
        })
      }
      return data
    }
  }, [transactions, period])

  // 4. Nutrition Summary
  const nutritionSummary = useMemo(() => {
    if (nutritionDays.length === 0) {
      return { avgKcal: 0, avgProtein: 0, avgFat: 0, avgCarbs: 0, daysWithData: 0 }
    }
    const daysWithData = nutritionDays.filter((d) => d.totalKcal > 0).length
    const total = nutritionDays.reduce(
      (acc, d) => ({
        kcal: acc.kcal + d.totalKcal,
        protein: acc.protein + d.totalProtein,
        fat: acc.fat + d.totalFat,
        carbs: acc.carbs + d.totalCarbs,
      }),
      { kcal: 0, protein: 0, fat: 0, carbs: 0 }
    )
    const n = daysWithData || 1
    return {
      avgKcal: Math.round(total.kcal / n),
      avgProtein: Math.round(total.protein / n),
      avgFat: Math.round(total.fat / n),
      avgCarbs: Math.round(total.carbs / n),
      daysWithData,
    }
  }, [nutritionDays])

  // 5. Workout Distribution
  const workoutDistribution = useMemo((): WorkoutDistributionPoint[] => {
    const typeCounts: Record<string, number> = {}
    for (const w of workouts) {
      const type = classifyWorkout(w.name)
      typeCounts[type] = (typeCounts[type] || 0) + 1
    }
    return Object.entries(typeCounts)
      .map(([name, value]) => ({
        name,
        value,
        fill: WORKOUT_TYPE_COLORS[name] ?? 'hsl(var(--chart-3))',
      }))
      .sort((a, b) => b.value - a.value)
  }, [workouts])

  // 6. Top Expense Categories
  const topCategories = useMemo((): TopCategoryPoint[] => {
    const catMap: Record<string, { name: string; total: number }> = {}
    for (const t of transactions) {
      if (t.type !== 'EXPENSE') continue
      const name = t.category?.name || 'Другое'
      if (!catMap[name]) catMap[name] = { name, total: 0 }
      catMap[name].total += t.amount
    }
    return Object.values(catMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((c, i) => ({
        name: c.name.length > 14 ? c.name.slice(0, 14) + '...' : c.name,
        amount: Math.round(c.total),
        fill: PIE_COLORS[i % PIE_COLORS.length],
      }))
  }, [transactions])

  // 7. Habits Heatmap Data (last 30 days)
  const habitsHeatmap = useMemo((): HabitsHeatmapCell[] => {
    const grid: HabitsHeatmapCell[] = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = toDateStr(d)
      // Count how many habits were completed on this day
      let completedCount = 0
      let totalCount = habits.length
      for (const h of habits) {
        if (h.last7Days[dateStr]) completedCount++
      }
      // For days beyond last7Days window, mark as no data
      const isInRange = i <= 6 || false // last7Days only covers 7 days
      grid.push({
        date: dateStr,
        completed: totalCount > 0 ? completedCount === totalCount : false,
        day: d.getDate(),
        completedCount,
        totalCount,
        dayOfWeek: d.getDay(),
      })
    }
    return grid
  }, [habits])

  const heatmapCompletionRate = habitsHeatmap.length > 0
    ? Math.round((habitsHeatmap.filter((h) => h.completed).length / habitsHeatmap.length) * 100)
    : 0

  // 8. Activity Overview Stats
  const activityStats = useMemo((): ActivityStats => {
    const totalActions = diaryCount + transactions.length + workoutCount + totalHabits

    const now = new Date()
    let daysInPeriod: number
    if (period === 'week') daysInPeriod = 7
    else if (period === 'month') daysInPeriod = now.getDate()
    else daysInPeriod = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) || 1

    const avgDaily = daysInPeriod > 0 ? (totalActions / daysInPeriod).toFixed(1) : '0'

    const dayCounts: Record<string, number> = {}
    for (const e of diaryEntries) {
      const d = toDateStr(new Date(e.date))
      dayCounts[d] = (dayCounts[d] || 0) + 1
    }
    for (const t of transactions) {
      const d = toDateStr(new Date(t.date))
      dayCounts[d] = (dayCounts[d] || 0) + 1
    }
    for (const w of workouts) {
      const d = toDateStr(new Date(w.date))
      dayCounts[d] = (dayCounts[d] || 0) + 1
    }
    let mostActiveDay = '—'
    let maxDayCount = 0
    for (const [day, count] of Object.entries(dayCounts)) {
      if (count > maxDayCount) {
        maxDayCount = count
        const date = new Date(day)
        const dayIdx = date.getDay() === 0 ? 6 : date.getDay() - 1
        mostActiveDay = RU_DAYS_SHORT[dayIdx] + ', ' + date.getDate()
      }
    }
    if (maxDayCount === 0) mostActiveDay = '—'

    const moduleCounts: Record<string, number> = {
      Дневник: diaryCount,
      Финансы: transactions.length,
      Тренировки: workoutCount,
      Привычки: totalHabits,
    }
    let mostActiveModule = '—'
    let maxModuleCount = 0
    for (const [mod, count] of Object.entries(moduleCounts)) {
      if (count > maxModuleCount) {
        maxModuleCount = count
        mostActiveModule = mod
      }
    }
    if (maxModuleCount === 0) mostActiveModule = '—'

    // Calculate 7-day sparkline data
    const sparkline: number[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = toDateStr(d)
      sparkline.push(dayCounts[dateStr] || 0)
    }

    // Most productive time of day (simulated from data patterns)
    const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    const dayOfWeekCounts: Record<number, number> = {}
    for (const [day, count] of Object.entries(dayCounts)) {
      const dow = new Date(day).getDay()
      dayOfWeekCounts[dow] = (dayOfWeekCounts[dow] || 0) + count
    }
    let mostProductiveDay = '—'
    let maxDowCount = 0
    for (const [dow, count] of Object.entries(dayOfWeekCounts)) {
      if (count > maxDowCount) {
        maxDowCount = count
        mostProductiveDay = dayNames[Number(dow)]
      }
    }
    if (maxDowCount === 0) mostProductiveDay = '—'

    return { totalActions, avgDaily, mostActiveDay, mostActiveModule, sparkline, mostProductiveDay }
  }, [diaryEntries, transactions, workouts, totalHabits, diaryCount, period])

  // 9. Insights Data
  const insights = useMemo(() => {
    const items: { icon: React.ReactNode; text: string; color: string }[] = []

    // Most productive day
    if (activityStats.mostProductiveDay && activityStats.mostProductiveDay !== '—') {
      items.push({
        icon: <Brain className="h-4 w-4" />,
        text: `Самый продуктивный день: ${activityStats.mostProductiveDay}`,
        color: 'text-emerald-600 dark:text-emerald-400',
      })
    }

    // Top expense category
    if (topCategories.length > 0) {
      items.push({
        icon: <Wallet className="h-4 w-4" />,
        text: `Топ категория расходов: ${topCategories[0].name} (${formatCurrency(topCategories[0].amount)})`,
        color: 'text-amber-600 dark:text-amber-400',
      })
    }

    // Average mood
    if (avgMood > 0) {
      const moodEmoji = MOOD_EMOJI[Math.round(avgMood)] || ''
      items.push({
        icon: <Smile className="h-4 w-4" />,
        text: `Среднее настроение: ${moodEmoji} ${avgMood.toFixed(1)}/5`,
        color: 'text-blue-600 dark:text-blue-400',
      })
    }

    // Workout streak (max streak from habits)
    const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0
    if (maxStreak > 0) {
      items.push({
        icon: <Flame className="h-4 w-4" />,
        text: `Серия тренировок: ${maxStreak} дней`,
        color: 'text-orange-600 dark:text-orange-400',
      })
    }

    // Total workout minutes
    if (totalMinutes > 0) {
      items.push({
        icon: <Dumbbell className="h-4 w-4" />,
        text: `Всего тренировок: ${workoutCount}, ${totalMinutes} мин.`,
        color: 'text-violet-600 dark:text-violet-400',
      })
    }

    // Habits completion
    if (totalHabits > 0) {
      items.push({
        icon: <Sparkles className="h-4 w-4" />,
        text: `Привычки: ${completedHabits} из ${totalHabits} сегодня (${habitsRate}%)`,
        color: 'text-violet-600 dark:text-violet-400',
      })
    }

    // Nutrition average
    if (nutritionSummary.daysWithData > 0) {
      items.push({
        icon: <CalendarDays className="h-4 w-4" />,
        text: `Ср. калории: ${nutritionSummary.avgKcal} ккал (${nutritionSummary.daysWithData} дн.)`,
        color: 'text-rose-600 dark:text-rose-400',
      })
    }

    return items
  }, [activityStats, topCategories, avgMood, habits, totalMinutes, workoutCount, totalHabits, completedHabits, habitsRate, nutritionSummary])

  // ── Current Period Label ───────────────────────────────────────────────
  const periodLabel = useMemo(() => {
    const now = new Date()
    const { from, to } = getDateRange(period)
    const fromDate = new Date(from)
    const toDate = new Date(to)
    const fmt = (d: Date) => `${d.getDate()} ${RU_MONTHS_SHORT[d.getMonth()]}`
    return period === 'week'
      ? `${fmt(fromDate)} — ${fmt(toDate)}`
      : period === 'month'
        ? RU_MONTHS[now.getMonth()] + ' ' + now.getFullYear()
        : String(now.getFullYear())
  }, [period])

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="animate-slide-up space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/15 to-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">Аналитика</h1>
                  <Badge variant="secondary" className="hidden gap-1 text-[10px] font-normal sm:inline-flex">
                    <CalendarDays className="h-2.5 w-2.5" />
                    {periodLabel}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Статистика и тренды по всем модулям
                </p>
              </div>
            </div>
          </div>

          {/* Period Selector */}
          <Tabs
            value={period}
            onValueChange={(v) => setPeriod(v as Period)}
          >
            <TabsList className="bg-muted/60">
              <TabsTrigger value="week" className="text-xs sm:text-sm">Неделя</TabsTrigger>
              <TabsTrigger value="month" className="text-xs sm:text-sm">Месяц</TabsTrigger>
              <TabsTrigger value="year" className="text-xs sm:text-sm">Год</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {!loading && !hasData && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/25 bg-gradient-to-b from-muted/30 to-transparent py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/20 to-primary/20">
            <Inbox className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-muted-foreground">Нет данных</h3>
          <p className="max-w-xs text-center text-sm text-muted-foreground/70">
            Начните вести дневник, добавлять расходы или тренировки, чтобы увидеть аналитику за{' '}
            {period === 'week' ? 'эту неделю' : period === 'month' ? 'этот месяц' : 'этот год'}
          </p>
        </div>
      )}

      {/* ── Content (hidden when empty) ──────────────────────────────────── */}
      {(loading || hasData) && (
        <>
          {/* ── Activity Overview Summary ─────────────────────────────────── */}
          <ActivityOverview loading={loading} activityStats={activityStats} period={period} />

          {/* ── Overview Stats ───────────────────────────────────────────── */}
          <OverviewStats
            loading={loading}
            diaryCount={diaryCount}
            avgMood={avgMood}
            totalExpenses={totalExpenses}
            totalIncome={totalIncome}
            savingsRate={savingsRate}
            workoutCount={workoutCount}
            totalMinutes={totalMinutes}
            totalHabits={totalHabits}
            completedHabits={completedHabits}
            habitsRate={habitsRate}
            diaryEntries={diaryEntries}
            transactions={transactions}
            periodComparison={prevPeriodComparison}
          />

          {/* ── Charts Row: Mood + Spending ───────────────────────────────── */}
          <ChartsRow
            loading={loading}
            moodChartData={moodChartData}
            spendingChartData={spendingChartData}
            period={period}
          />

          {/* ── Nutrition Summary + Workout Distribution ──────────────────── */}
          <div className="stagger-children grid gap-4 lg:grid-cols-2">
            <NutritionChart loading={loading} nutritionSummary={nutritionSummary} />
            <WorkoutDistributionChart loading={loading} workoutDistribution={workoutDistribution} workoutCount={workoutCount} />
          </div>

          {/* ── Top Categories + Habits Heatmap ───────────────────────────── */}
          <div className="stagger-children grid gap-4 lg:grid-cols-2">
            <TopCategoriesChart loading={loading} topCategories={topCategories} />
            <HabitsHeatmapSection
              loading={loading}
              habitsHeatmap={habitsHeatmap}
              heatmapCompletionRate={heatmapCompletionRate}
              totalHabits={totalHabits}
              habits={habits}
            />
          </div>

          {/* ── Insights Section ─────────────────────────────────────────── */}
          {!loading && insights.length > 0 && (
            <div className="card-hover overflow-hidden rounded-xl border border-border bg-gradient-to-br from-amber-50/60 via-background to-violet-50/40 dark:from-amber-950/20 dark:via-background dark:to-violet-950/15">
              <div className="flex items-center gap-2.5 border-b bg-muted/30 px-5 py-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">Инсайты</h2>
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  {insights.length} подсказок
                </Badge>
              </div>
              <div className="stagger-children divide-y">
                {insights.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60 ${item.color}`}>
                      {item.icon}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
