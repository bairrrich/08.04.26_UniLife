import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ── In-memory cache: 30 minutes TTL ──────────────────────────────────
const CACHE_TTL_MS = 30 * 60 * 1000
const insightCache = new Map<string, { data: InsightsResponse; expiresAt: number }>()

interface InsightsResponse {
  summary: string
  tips: string[]
  mood: string
  score: number
  generatedAt: string
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date') || new Date().toISOString().slice(0, 10)

    // Check cache first
    const cached = insightCache.get(dateStr)
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json({ success: true, data: cached.data, cached: true })
    }

    // Parse date
    const targetDate = new Date(dateStr + 'T00:00:00.000')
    const targetEnd = new Date(dateStr + 'T23:59:59.999')
    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1, 0, 0, 0, 0)
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999)

    // Fetch all data in parallel using Prisma
    const [
      diaryEntries,
      transactions,
      rawHabits,
      workouts,
      mealsWithItems,
      waterLogs,
    ] = await Promise.all([
      db.diaryEntry.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
        orderBy: { date: 'desc' },
      }),
      db.transaction.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
        include: { category: true },
      }),
      db.habit.findMany({
        include: {
          logs: {
            where: { date: { gte: new Date(Date.now() - 7 * 86400000) } },
            orderBy: { date: 'desc' },
          },
        },
      }),
      db.workout.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
        orderBy: { date: 'desc' },
        include: { exercises: true },
      }),
      db.meal.findMany({
        where: { date: { gte: targetDate, lte: targetEnd } },
        include: { items: true },
      }),
      db.waterLog.findMany({
        where: { date: { gte: targetDate, lte: targetEnd } },
      }),
    ])

    // ── Analyze data ──────────────────────────────────────────────────
    const analysis = analyzeData({
      dateStr,
      diaryEntries,
      transactions,
      rawHabits,
      workouts,
      mealsWithItems,
      waterLogs,
    })

    // ── Generate insights ─────────────────────────────────────────────
    const insights = generateInsights(analysis)

    // ── Cache result ───────────────────────────────────────────────────
    insightCache.set(dateStr, {
      data: insights,
      expiresAt: Date.now() + CACHE_TTL_MS,
    })

    // Clean old cache entries
    for (const [key, val] of insightCache.entries()) {
      if (Date.now() > val.expiresAt) {
        insightCache.delete(key)
      }
    }

    return NextResponse.json({ success: true, data: insights })
  } catch (error) {
    console.error('AI Insights API error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate insights' },
      { status: 500 },
    )
  }
}

// ── Data Analysis ────────────────────────────────────────────────────────

interface AnalysisResult {
  avgMood: number
  todayDiary: boolean
  todayDiaryTitle: string
  todayDiaryMood: number | null
  moods: number[]
  totalIncome: number
  totalExpense: number
  topCategories: [string, number][]
  totalHabits: number
  completedToday: number
  habitsRate: number
  uncompletedNames: string[]
  todayWorkout: boolean
  todayWorkoutName: string
  weekWorkoutCount: number
  totalWorkoutMinutes: number
  totalKcal: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  waterGlasses: number
  mealCount: number
  balance: number
}

function analyzeData({
  dateStr,
  diaryEntries,
  transactions,
  rawHabits,
  workouts,
  mealsWithItems,
  waterLogs,
}: {
  dateStr: string
  diaryEntries: { date: Date; mood: number | null; title: string }[]
  transactions: { type: string; amount: number; category: { name: string } | null }[]
  rawHabits: { emoji: string; name: string; logs: { date: Date }[] }[]
  workouts: { date: Date; duration: number | null; name: string; exercises: unknown[] }[]
  mealsWithItems: { items: { kcal: number | null; protein: number | null; carbs: number | null; fat: number | null }[] }[]
  waterLogs: { amountMl: number }[]
}): AnalysisResult {
  // Mood
  const moodEmojis = ['', '😢', '😕', '😐', '🙂', '😄']
  const recentEntries = diaryEntries.slice(0, 7)
  const moods = recentEntries.map(e => e.mood).filter((m): m is number => m !== null && m !== undefined && m > 0)
  const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0

  const todayDiary = diaryEntries.find(e => {
    const d = e.date instanceof Date ? e.date : new Date(e.date)
    return d.toISOString().slice(0, 10) === dateStr
  })

  // Finance
  let totalIncome = 0
  let totalExpense = 0
  const categorySpending = new Map<string, number>()
  for (const t of transactions) {
    if (t.type === 'INCOME') {
      totalIncome += t.amount
    } else {
      totalExpense += t.amount
      const catName = t.category?.name || 'Другое'
      categorySpending.set(catName, (categorySpending.get(catName) || 0) + t.amount)
    }
  }
  const topCategories = Array.from(categorySpending.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3) as [string, number][]

  // Habits
  const totalHabits = rawHabits.length
  const completedToday = rawHabits.filter(h =>
    h.logs.some(l => {
      const logDate = l.date instanceof Date ? l.date.toISOString().slice(0, 10) : String(l.date).slice(0, 10)
      return logDate === dateStr
    }),
  ).length
  const habitsRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0
  const uncompletedNames = rawHabits
    .filter(h =>
      !h.logs.some(l => {
        const logDate = l.date instanceof Date ? l.date.toISOString().slice(0, 10) : String(l.date).slice(0, 10)
        return logDate === dateStr
      }),
    )
    .map(h => h.emoji + ' ' + h.name)

  // Workouts
  const todayWorkout = workouts.find(w => {
    const d = w.date instanceof Date ? w.date : new Date(w.date)
    return d.toISOString().slice(0, 10) === dateStr
  })
  const weekWorkouts = workouts.filter(w => {
    const d = new Date(w.date instanceof Date ? w.date : String(w.date))
    return d >= new Date(Date.now() - 7 * 86400000)
  })
  const totalWorkoutMinutes = weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)

  // Nutrition
  let totalKcal = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0
  for (const meal of mealsWithItems) {
    for (const item of meal.items) {
      totalKcal += item.kcal || 0
      totalProtein += item.protein || 0
      totalCarbs += item.carbs || 0
      totalFat += item.fat || 0
    }
  }
  const waterMl = waterLogs.reduce((sum, w) => sum + (w.amountMl || 250), 0)
  const waterGlasses = Math.round(waterMl / 250)

  return {
    avgMood,
    todayDiary: !!todayDiary,
    todayDiaryTitle: todayDiary?.title || '',
    todayDiaryMood: todayDiary?.mood ?? null,
    moods,
    totalIncome,
    totalExpense,
    topCategories,
    totalHabits,
    completedToday,
    habitsRate,
    uncompletedNames,
    todayWorkout: !!todayWorkout,
    todayWorkoutName: todayWorkout?.name || '',
    weekWorkoutCount: weekWorkouts.length,
    totalWorkoutMinutes,
    totalKcal,
    totalProtein,
    totalCarbs,
    totalFat,
    waterGlasses,
    mealCount: mealsWithItems.length,
    balance: totalIncome - totalExpense,
  }
}

// ── Rule-Based Insight Generator ──────────────────────────────────────────

function generateInsights(a: AnalysisResult): InsightsResponse {
  // ── Calculate score ────────────────────────────────────────────────
  let moodScore = 0
  if (a.moods.length > 0) {
    moodScore = Math.round((a.avgMood / 5) * 25)
  }

  let financeScore = 0
  if (a.totalIncome > 0) {
    const savingsRate = Math.max(0, (a.balance / a.totalIncome) * 100)
    financeScore = Math.min(15, Math.round(savingsRate / 100 * 15))
  } else if (a.totalExpense === 0) {
    financeScore = 10
  }

  const habitsScore = Math.round((a.habitsRate / 100) * 20)

  let workoutScore = 0
  if (a.todayWorkout) workoutScore += 10
  if (a.weekWorkoutCount >= 3) workoutScore += 10
  else if (a.weekWorkoutCount >= 1) workoutScore += 5

  let nutritionScore = 0
  if (a.mealCount > 0) nutritionScore += 5
  if (a.totalKcal >= 1500 && a.totalKcal <= 2500) nutritionScore += 5
  if (a.waterGlasses >= 6) nutritionScore += 5
  else if (a.waterGlasses >= 3) nutritionScore += 3

  const score = Math.min(100, moodScore + financeScore + habitsScore + workoutScore + nutritionScore)

  // ── Mood emoji ─────────────────────────────────────────────────────
  let mood = '🌟'
  if (score >= 80) mood = '🌟'
  else if (score >= 60) mood = '😊'
  else if (score >= 40) mood = '😐'
  else if (score >= 20) mood = '😕'
  else mood = '💪'

  // ── Summary ────────────────────────────────────────────────────────
  const parts: string[] = []

  if (a.todayDiary) {
    const moodEmojis = ['', '😢', '😕', '😐', '🙂', '😄']
    const moodEmoji = moodEmojis[a.todayDiaryMood || 3] || '😐'
    parts.push(`Сегодня в дневнике запись "${a.todayDiaryTitle}" с настроением ${moodEmoji}`)
  } else {
    parts.push('Ещё нет записи в дневнике — начни день с рефлексии!')
  }

  if (a.habitsRate === 100) {
    parts.push('Все привычки выполнены — отличная дисциплина!')
  } else if (a.habitsRate >= 50) {
    parts.push(`Привычки: ${a.completedToday}/${a.totalHabits} (${a.habitsRate}%) — хороший прогресс`)
  } else if (a.totalHabits > 0) {
    parts.push(`${a.totalHabits - a.completedToday} привычек ещё ждут выполнения`)
  }

  if (a.todayWorkout) {
    parts.push(`Тренировка "${a.todayWorkoutName}" уже в активе!`)
  } else if (a.weekWorkoutCount === 0) {
    parts.push('На этой неделе ещё нет тренировок — время начать!')
  }

  const summary = parts.join('. ') + '.'

  // ── Tips ───────────────────────────────────────────────────────────
  const tips: string[] = []

  if (!a.todayDiary) {
    tips.push('📝 Запиши свои мысли в дневник — это поможет осознать эмоции и планировать день')
  }

  if (a.uncompletedNames.length > 0 && a.uncompletedNames.length <= 3) {
    tips.push(`✅ Не забудь: ${a.uncompletedNames.join(', ')}`)
  } else if (a.uncompletedNames.length > 3) {
    tips.push(`✅ Осталось ${a.uncompletedNames.length} привычек — начни с самой важной`)
  }

  if (!a.todayWorkout && a.weekWorkoutCount < 2) {
    tips.push('🏃 Даже 15 минут активности улучшат настроение и продуктивность')
  }

  if (a.waterGlasses < 6) {
    tips.push(`💧 Выпей ещё ${8 - a.waterGlasses} стаканов воды для хорошего самочувствия`)
  }

  if (a.totalKcal < 1200 && a.mealCount > 0) {
    tips.push('🍎 Недостаточно калорий — добавьте питательный перекус')
  }

  if (a.totalProtein < 50 && a.mealCount > 0) {
    tips.push('🥩 Увеличьте потребление белка — важно для мышц и энергии')
  }

  if (a.balance < 0) {
    tips.push(`💸 Расходы превышают доходы на ${Math.abs(a.balance).toLocaleString('ru-RU')} ₽ — пересмотрите бюджет`)
  }

  if (a.topCategories.length > 0) {
    tips.push(`📊 Основные траты: ${a.topCategories.map(([name]) => name).join(', ')}`)
  }

  if (tips.length === 0) {
    tips.push('🌟 Продолжай в том же духе — ты на правильном пути!')
    tips.push('📅 Планируй завтрашний день с вечера для лучшей продуктивности')
    tips.push('🧘 Найди 5 минут для медитации или глубокого дыхания')
  }

  // Limit to 4 tips max
  return {
    summary,
    tips: tips.slice(0, 4),
    mood,
    score,
    generatedAt: new Date().toISOString(),
  }
}
