import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

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
      return NextResponse.json({ success: true, data: cached.data })
    }

    // Parse date
    const targetDate = new Date(dateStr + 'T00:00:00.000')
    const targetEnd = new Date(dateStr + 'T23:59:59.999')
    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1, 0, 0, 0, 0)
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999)

    // Fetch all data in parallel using Prisma (no HTTP calls to other APIs)
    const [
      diaryEntries,
      transactions,
      rawHabits,
      workouts,
      mealsWithItems,
      waterLogs,
    ] = await Promise.all([
      // Diary entries for the month
      db.diaryEntry.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
        orderBy: { date: 'desc' },
      }),
      // Transactions for the month
      db.transaction.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
        include: { category: true },
      }),
      // All habits
      db.habit.findMany({
        where: { isArchived: false },
        include: {
          logs: {
            where: { date: { gte: new Date(Date.now() - 7 * 86400000) } },
            orderBy: { date: 'desc' },
          },
        },
      }),
      // Workouts for the month
      db.workout.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
        orderBy: { date: 'desc' },
        include: { exercises: true },
      }),
      // Meals for today
      db.meal.findMany({
        where: { date: { gte: targetDate, lte: targetEnd } },
        include: { items: true },
      }),
      // Water logs for today
      db.waterLog.findMany({
        where: { date: { gte: targetDate, lte: targetEnd } },
      }),
    ])

    // ── Build analysis context ──────────────────────────────────────

    // Mood analysis
    const moodEmojis = ['', '😢', '😕', '😐', '🙂', '😄']
    const recentEntries = diaryEntries.slice(0, 7)
    const moods = recentEntries.map(e => e.mood).filter((m): m is number => m !== null && m !== undefined && m > 0)
    const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0
    const todayDiary = diaryEntries.find(e => {
      const d = e.date instanceof Date ? e.date : new Date(e.date)
      return d.toISOString().slice(0, 10) === dateStr
    })

    // Finance analysis
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
      .slice(0, 3)

    // Habits analysis
    const todayStr = dateStr
    const activeHabits = rawHabits.filter(h => !h.isArchived)
    const completedToday = activeHabits.filter(h => {
      return h.logs.some(l => {
        const logDate = l.date instanceof Date ? l.date.toISOString().slice(0, 10) : String(l.date).slice(0, 10)
        return logDate === todayStr
      })
    }).length
    const totalHabits = activeHabits.length
    const habitsRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0
    const uncompletedHabits = activeHabits
      .filter(h => {
        return !h.logs.some(l => {
          const logDate = l.date instanceof Date ? l.date.toISOString().slice(0, 10) : String(l.date).slice(0, 10)
          return logDate === todayStr
        })
      })
      .map(h => h.emoji + ' ' + h.name)

    // Workout analysis
    const todayWorkout = workouts.find(w => {
      const d = w.date instanceof Date ? w.date : new Date(w.date)
      return d.toISOString().slice(0, 10) === dateStr
    })
    const weekWorkouts = workouts.filter(w => {
      const d = new Date(w.date instanceof Date ? w.date : String(w.date))
      const weekAgo = new Date(Date.now() - 7 * 86400000)
      return d >= weekAgo
    })
    const totalWorkoutMinutes = weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)

    // Nutrition analysis
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

    // ── Build LLM prompt ────────────────────────────────────────────
    const prompt = buildPrompt({
      date: dateStr,
      todayDiary,
      moods,
      avgMood,
      moodEmojis,
      totalIncome,
      totalExpense,
      topCategories,
      totalHabits,
      completedToday,
      habitsRate,
      uncompletedHabits,
      todayWorkout,
      weekWorkoutCount: weekWorkouts.length,
      totalWorkoutMinutes,
      totalKcal,
      totalProtein,
      totalCarbs,
      totalFat,
      waterGlasses,
      mealCount: mealsWithItems.length,
    })

    // ── Call LLM ───────────────────────────────────────────────────
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: 'Проанализируй данные и предоставь персонализированные инсайты на сегодняшний день.',
        },
      ],
      thinking: { type: 'disabled' },
    })

    const rawResponse = completion.choices[0]?.message?.content || ''

    // ── Parse LLM response ─────────────────────────────────────────
    const insights = parseInsights(rawResponse, avgMood)

    // ── Cache result ───────────────────────────────────────────────
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
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate insights',
      },
      { status: 500 },
    )
  }
}

// ── Prompt Builder ─────────────────────────────────────────────────────

interface PromptData {
  date: string
  todayDiary: { title: string; content: string; mood: number | null } | undefined
  moods: number[]
  avgMood: number
  moodEmojis: string[]
  totalIncome: number
  totalExpense: number
  topCategories: [string, number][]
  totalHabits: number
  completedToday: number
  habitsRate: number
  uncompletedHabits: string[]
  todayWorkout: { name: string; duration: number; exercises: { name: string; sets: number; reps: number }[] } | undefined
  weekWorkoutCount: number
  totalWorkoutMinutes: number
  totalKcal: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  waterGlasses: number
  mealCount: number
}

function buildPrompt(data: PromptData): string {
  return `Ты — персональный AI-ассистент UniLife, анализирующий данные о жизни пользователя. Твоя задача — создать краткие, вдохновляющие и полезные инсайты на основе данных.

Сегодня: ${data.date}

## Данные о настроении (дневник)
- Записей за последние 7 дней: ${data.moods.length}
- Среднее настроение: ${data.avgMood.toFixed(1)}/5 (${data.moodEmojis[Math.round(data.avgMood)] || '😐'})
- Последние настроения: ${data.moods.map(m => data.moodEmojis[m]).join(', ') || 'нет данных'}
${data.todayDiary ? `- Сегодня в дневнике: "${data.todayDiary.title}" (настроение: ${data.moodEmojis[data.todayDiary.mood || 0] || 'не указано'})` : '- Сегодня ещё нет записи в дневнике'}

## Финансы (текущий месяц)
- Доходы: ${data.totalIncome.toLocaleString('ru-RU')} ₽
- Расходы: ${data.totalExpense.toLocaleString('ru-RU')} ₽
- Баланс: ${(data.totalIncome - data.totalExpense).toLocaleString('ru-RU')} ₽
${data.topCategories.length > 0 ? `- Топ категории расходов: ${data.topCategories.map(([name, amount]) => `${name} (${amount.toLocaleString('ru-RU')} ₽)`).join(', ')}` : '- Нет данных о расходах'}

## Привычки
- Активных привычек: ${data.totalHabits}
- Выполнено сегодня: ${data.completedToday} из ${data.totalHabits} (${data.habitsRate}%)
${data.uncompletedHabits.length > 0 ? `- Не выполнены: ${data.uncompletedHabits.join(', ')}` : '- Все привычки выполнены!'}

## Тренировки
${data.todayWorkout ? `- Сегодня: ${data.todayWorkout.name} (${data.todayWorkout.duration} мин, ${data.todayWorkout.exercises.length} упражнений)` : '- Сегодня ещё нет тренировки'}
- За неделю: ${data.weekWorkoutCount} тренировок, ${data.totalWorkoutMinutes} минут всего

## Питание (сегодня)
- Приёмов пищи: ${data.mealCount}
- Калории: ${data.totalKcal} ккал
- Белки: ${data.totalProtein}г, Жиры: ${data.totalFat}г, Углеводы: ${data.totalCarbs}г
- Вода: ${data.waterGlasses} стаканов

## Формат ответа

Ответь ТОЛЬКО в формате JSON (без markdown, без обратных кавычек, просто чистый JSON):

{
  "summary": "2-3 предложения персонализированного итога дня на русском языке. Будь дружелюбным и поддерживающим. Упомяни ключевые моменты.",
  "tips": [
    "Практический совет 1 на русском",
    "Практический совет 2 на русском",
    "Практический совет 3 на русском"
  ],
  "mood": "один эмодзи отражающий общее настроение (например: 😊, 🌟, 💪, 🧘, ⚡, 🎯)",
  "score": число от 0 до 100 отражающее общий прогресс дня
}

Для score учитывай:
- Настроение: до 25 баллов
- Финансы (расходы в пределах доходов): до 15 баллов
- Привычки (процент выполнения): до 20 баллов
- Тренировки: до 20 баллов
- Питание и вода: до 20 баллов

Важно:
- Ответь ТОЛЬКО валидным JSON без дополнительных символов
- Используй русский язык для всех текстов
- Будь поддерживающим и мотивирующим`
}

// ── Response Parser ────────────────────────────────────────────────────

function parseInsights(raw: string, avgMood: number): InsightsResponse {
  try {
    // Try to extract JSON from the response
    let jsonStr = raw.trim()

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(jsonStr)

    // Validate and sanitize
    const summary = typeof parsed.summary === 'string'
      ? parsed.summary.slice(0, 500)
      : 'Твой день в порядке! Продолжай в том же духе.'

    const tips = Array.isArray(parsed.tips)
      ? parsed.tips
          .filter((t): t is string => typeof t === 'string')
          .slice(0, 5)
          .map(t => t.slice(0, 200))
      : ['Записывай свои достижения каждый день', 'Следи за балансом расходов и доходов', 'Не забывай о регулярных тренировках']

    const mood = typeof parsed.mood === 'string' && parsed.mood.length <= 4
      ? parsed.mood
      : avgMood >= 4 ? '😊' : avgMood >= 3 ? '😐' : avgMood >= 2 ? '😕' : '😢'

    const score = typeof parsed.score === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.score)))
      : 50

    return {
      summary,
      tips,
      mood,
      score,
      generatedAt: new Date().toISOString(),
    }
  } catch {
    // Fallback if JSON parsing fails
    const defaultTips = [
      'Начни день с записи в дневнике — это помогает осознать свои эмоции',
      'Планируй расходы заранее, чтобы избежать непредвиденных трат',
      'Даже 15 минут тренировки лучше, чем ничего',
    ]

    return {
      summary: 'Сегодня хороший день для новых достижений! Продолжай следить за своими привычками и здоровьем.',
      tips: defaultTips,
      mood: avgMood >= 4 ? '😊' : avgMood >= 3 ? '😐' : '🌟',
      score: Math.round(avgMood * 20),
      generatedAt: new Date().toISOString(),
    }
  }
}
