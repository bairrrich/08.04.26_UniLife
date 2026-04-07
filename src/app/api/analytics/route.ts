import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

const RU_MONTHS_SHORT = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
]

const RU_DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const COLLECTION_TYPE_LABELS: Record<string, string> = {
  BOOK: 'Книги',
  MOVIE: 'Фильмы',
  ANIME: 'Аниме',
  SERIES: 'Сериалы',
  MUSIC: 'Музыка',
  RECIPE: 'Рецепты',
  SUPPLEMENT: 'БАДы',
  PRODUCT: 'Продукты',
  PLACE: 'Места',
}

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getStartDate(period: string): Date | null {
  const now = new Date()
  switch (period) {
    case '7d': {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case '30d': {
      const d = new Date(now)
      d.setDate(d.getDate() - 30)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case '3m': {
      const d = new Date(now)
      d.setMonth(d.getMonth() - 3)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case 'all':
      return null
    default: {
      const d = new Date(now)
      d.setDate(d.getDate() - 30)
      d.setHours(0, 0, 0, 0)
      return d
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '30d'
    const startDate = getStartDate(period)

    const whereDate = startDate
      ? { date: { gte: startDate } }
      : {}

    // ── Parallel queries ──
    const [
      diaryEntries,
      transactions,
      workouts,
      mealsWithItems,
      habits,
      habitLogs,
      waterLogs,
      collectionItems,
    ] = await Promise.all([
      db.diaryEntry.findMany({
        where: { userId: USER_ID, ...(startDate ? { date: { gte: startDate } } : {}) },
        orderBy: { date: 'desc' },
      }),
      db.transaction.findMany({
        where: { userId: USER_ID, ...(startDate ? { date: { gte: startDate } } : {}) },
        include: { category: true },
      }),
      db.workout.findMany({
        where: { userId: USER_ID, ...(startDate ? { date: { gte: startDate } } : {}) },
        orderBy: { date: 'desc' },
      }),
      db.meal.findMany({
        where: { userId: USER_ID, ...(startDate ? { date: { gte: startDate } } : {}) },
        include: { items: { select: { kcal: true, protein: true, fat: true, carbs: true } } },
      }),
      db.habit.findMany({ where: { userId: USER_ID } }),
      startDate
        ? db.habitLog.findMany({
            where: { habit: { userId: USER_ID }, date: { gte: startDate } },
          })
        : db.habitLog.findMany({ where: { habit: { userId: USER_ID } } }),
      db.waterLog.findMany({
        where: { userId: USER_ID, ...(startDate ? { date: { gte: startDate } } : {}) },
      }),
      db.collectionItem.findMany({
        where: { userId: USER_ID, ...(startDate ? { createdAt: { gte: startDate } } : {}) },
      }),
    ])

    // ── 1. Overview Stats ──
    const totalDiaryEntries = diaryEntries.length
    const totalWorkouts = workouts.length
    let totalCalories = 0
    for (const meal of mealsWithItems) {
      for (const item of meal.items) {
        totalCalories += item.kcal || 0
      }
    }
    const totalCaloriesRounded = Math.round(totalCalories)

    // Unique dates across all modules
    const allDates = new Set<string>()
    for (const e of diaryEntries) {
      allDates.add(toDateStr(new Date(e.date)))
    }
    for (const w of workouts) {
      allDates.add(toDateStr(new Date(w.date)))
    }
    for (const m of mealsWithItems) {
      allDates.add(toDateStr(new Date(m.date)))
    }
    for (const wl of waterLogs) {
      allDates.add(toDateStr(new Date(wl.date)))
    }
    const totalDaysTracked = allDates.size

    // Habits completed = total habit logs
    const totalHabitsCompleted = habitLogs.length

    const overview = {
      totalDiaryEntries,
      totalWorkouts,
      totalCalories: totalCaloriesRounded,
      totalDaysTracked,
      totalHabitsCompleted,
    }

    // ── 2. Monthly Activity Chart ──
    // Group by month
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    // Determine range: last 12 months
    const monthsData: Array<{
      month: string
      year: number
      monthIdx: number
      diary: number
      workouts: number
      habits: number
      meals: number
    }> = []

    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1)
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1)
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
      const monthIdx = d.getMonth()
      const year = d.getFullYear()

      const mDiary = diaryEntries.filter((e) => {
        const ed = new Date(e.date)
        return ed >= mStart && ed <= mEnd
      }).length

      const mWorkouts = workouts.filter((w) => {
        const wd = new Date(w.date)
        return wd >= mStart && wd <= mEnd
      }).length

      const mMeals = mealsWithItems.filter((m) => {
        const md = new Date(m.date)
        return md >= mStart && md <= mEnd
      }).length

      const mHabits = habitLogs.filter((h) => {
        const hd = new Date(h.date)
        return hd >= mStart && hd <= mEnd
      }).length

      monthsData.push({
        month: `${RU_MONTHS_SHORT[monthIdx]} ${String(year).slice(2)}`,
        year,
        monthIdx,
        diary: mDiary,
        workouts: mWorkouts,
        habits: mHabits,
        meals: mMeals,
      })
    }

    const monthlyActivity = monthsData

    // ── 3. Mood Distribution ──
    const moodCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    const MOOD_EMOJI: Record<number, string> = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' }
    const MOOD_LABELS: Record<number, string> = {
      1: 'Ужасно',
      2: 'Плохо',
      3: 'Нормально',
      4: 'Хорошо',
      5: 'Отлично',
    }
    let totalMoodEntries = 0
    for (const e of diaryEntries) {
      if (e.mood !== null && e.mood >= 1 && e.mood <= 5) {
        moodCounts[e.mood]++
        totalMoodEntries++
      }
    }

    const moodDistribution = [1, 2, 3, 4, 5].map((mood) => ({
      mood,
      emoji: MOOD_EMOJI[mood],
      label: MOOD_LABELS[mood],
      count: moodCounts[mood],
      percentage: totalMoodEntries > 0 ? Math.round((moodCounts[mood] / totalMoodEntries) * 100) : 0,
    }))

    // ── 4. Top Expense Categories ──
    const catMap: Record<string, { name: string; total: number; color: string }> = {}
    for (const t of transactions) {
      if (t.type !== 'EXPENSE') continue
      const name = t.category?.name || 'Другое'
      const color = t.category?.color || '#6b7280'
      if (!catMap[name]) catMap[name] = { name, total: 0, color }
      catMap[name].total += t.amount
    }

    const topCategories = Object.values(catMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        amount: Math.round(c.total),
        color: c.color,
      }))

    // ── 5. Habit Completion Trend (last 8 weeks) ──
    const habitCompletionTrend: Array<{ week: string; rate: number }> = []
    for (let w = 7; w >= 0; w--) {
      const weekEnd = new Date(now)
      weekEnd.setDate(weekEnd.getDate() - w * 7)
      const weekStart = new Date(weekEnd)
      weekStart.setDate(weekStart.getDate() - 6)
      weekStart.setHours(0, 0, 0, 0)
      weekEnd.setHours(23, 59, 59, 999)

      // Count completed habit-logs in this week
      const weekLogs = habitLogs.filter((l) => {
        const ld = new Date(l.date)
        return ld >= weekStart && ld <= weekEnd
      }).length

      // Total possible = number of habits * 7 days
      const totalPossible = habits.length * 7
      const rate = totalPossible > 0 ? Math.round((weekLogs / totalPossible) * 100) : 0

      const weekLabel = `${weekStart.getDate()}.${String(weekStart.getMonth() + 1).padStart(2, '0')} – ${weekEnd.getDate()}.${String(weekEnd.getMonth() + 1).padStart(2, '0')}`
      habitCompletionTrend.push({ week: weekLabel, rate })
    }

    // ── 6. Collections Type Distribution ──
    const collectionTypeMap: Record<string, number> = {}
    for (const item of collectionItems) {
      const label = COLLECTION_TYPE_LABELS[item.type] || item.type
      collectionTypeMap[label] = (collectionTypeMap[label] || 0) + 1
    }

    const collectionsDistribution = Object.entries(collectionTypeMap)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }))

    // ── 7. Weekly Heatmap (last 12 weeks × 7 days) ──
    const heatmap: Array<{ weekIdx: number; dayIdx: number; date: string; count: number; dayNum: number }> = []

    // Gather all activity dates with counts
    const activityDateCounts: Record<string, number> = {}
    const addActivity = (date: Date) => {
      const key = toDateStr(date)
      activityDateCounts[key] = (activityDateCounts[key] || 0) + 1
    }
    for (const e of diaryEntries) addActivity(new Date(e.date))
    for (const w of workouts) addActivity(new Date(w.date))
    for (const m of mealsWithItems) addActivity(new Date(m.date))
    for (const wl of waterLogs) addActivity(new Date(wl.date))
    for (const hl of habitLogs) addActivity(new Date(hl.date))
    for (const t of transactions) addActivity(new Date(t.date))

    // Build heatmap grid: 12 weeks ago → today, Mon→Sun
    // Start from 12 weeks ago, aligned to Monday
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayDayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1 // Mon=0

    // The start of week 0 is (today - todayDayOfWeek) - 11*7 days
    const thisMonday = new Date(today)
    thisMonday.setDate(today.getDate() - todayDayOfWeek)
    const startMonday = new Date(thisMonday)
    startMonday.setDate(startMonday.getDate() - 11 * 7)

    for (let weekIdx = 0; weekIdx < 12; weekIdx++) {
      for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const d = new Date(startMonday)
        d.setDate(startMonday.getDate() + weekIdx * 7 + dayIdx)
        const dateStr = toDateStr(d)
        heatmap.push({
          weekIdx,
          dayIdx,
          date: dateStr,
          count: activityDateCounts[dateStr] || 0,
          dayNum: d.getDate(),
        })
      }
    }

    // Find max count for normalization
    const maxHeatmapCount = Math.max(1, ...Object.values(activityDateCounts))

    return NextResponse.json({
      success: true,
      data: {
        overview,
        monthlyActivity,
        moodDistribution,
        topCategories,
        habitCompletionTrend,
        collectionsDistribution,
        weeklyHeatmap: { cells: heatmap, maxCount: maxHeatmapCount },
      },
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load analytics data' },
      { status: 500 }
    )
  }
}
