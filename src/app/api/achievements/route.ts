import { db } from '@/lib/db'
import { apiSuccess, apiServerError, DEMO_USER_ID } from '@/lib/api'
import { getTodayStr, toDateStr, calculateStreak } from '@/lib/format'

// ─── Achievement Definitions ──────────────────────────────────────────────────

interface AchievementDef {
  key: string
  title: string
  description: string
  icon: string
  category: string
}

const ALL_ACHIEVEMENTS: AchievementDef[] = [
  // ── Diary ──
  { key: 'first_diary_entry', title: 'Первая запись', description: 'Создайте первую запись в дневнике', icon: '📖', category: 'diary' },
  { key: 'diary_streak_3', title: 'Три дня подряд', description: 'Пишите в дневник 3 дня подряд', icon: '📝', category: 'diary' },
  { key: 'diary_streak_7', title: 'Неделя без пропусков', description: 'Пишите в дневник 7 дней подряд', icon: '🔥', category: 'diary' },
  { key: 'diary_30_entries', title: '30 записей', description: 'Создайте 30 записей в дневнике', icon: '📚', category: 'diary' },

  // ── Finance ──
  { key: 'first_transaction', title: 'Первая транзакция', description: 'Запишите первую транзакцию', icon: '💳', category: 'finance' },
  { key: 'savings_rate_positive', title: 'Положительный баланс', description: 'Доходы превышают расходы', icon: '📈', category: 'finance' },
  { key: 'finance_100_transactions', title: '100 транзакций', description: 'Запишите 100 транзакций', icon: '💰', category: 'finance' },

  // ── Workout ──
  { key: 'first_workout', title: 'Первая тренировка', description: 'Запишите первую тренировку', icon: '💪', category: 'workout' },
  { key: 'workout_streak_3', title: '3 тренировки за неделю', description: 'Выполните 3+ тренировки за неделю', icon: '🏃', category: 'workout' },
  { key: 'workout_marathon', title: 'Марафонец', description: 'Накопите 1000 минут тренировок', icon: '🏅', category: 'workout' },

  // ── Habits ──
  { key: 'first_habit_complete', title: 'Первая привычка', description: 'Завершите хотя бы одну привычку', icon: '🎯', category: 'habits' },
  { key: 'all_habits_complete', title: 'Все выполнены', description: 'Выполните все привычки за день', icon: '✅', category: 'habits' },
  { key: 'habits_streak_7', title: 'Стрик 7 дней', description: 'Все привычки 7 дней подряд', icon: '⚡', category: 'habits' },

  // ── Nutrition ──
  { key: 'first_meal', title: 'Первый приём пищи', description: 'Запишите первый приём пищи', icon: '🍽️', category: 'nutrition' },
  { key: 'water_goal', title: 'Водный баланс', description: 'Выпейте 8+ стаканов воды за день', icon: '💧', category: 'nutrition' },

  // ── Collections ──
  { key: 'first_collection', title: 'Первая коллекция', description: 'Добавьте первый элемент в коллекцию', icon: '📚', category: 'collections' },
  { key: 'collections_10', title: 'Коллекционер', description: 'Соберите 10+ элементов', icon: '🏆', category: 'collections' },

  // ── Goals ──
  { key: 'first_goal_set', title: 'Первая цель', description: 'Создайте первую цель', icon: '🎯', category: 'goals' },
  { key: 'first_goal_completed', title: 'Цель достигнута', description: 'Завершите первую цель', icon: '🎉', category: 'goals' },

  // ── Feed ──
  { key: 'first_post', title: 'Первый пост', description: 'Опубликуйте первую запись', icon: '📢', category: 'feed' },

  // ── General ──
  { key: 'general_active_day', title: 'Активный день', description: 'Все ежедневные задачи за день', icon: '🏆', category: 'general' },
  { key: 'general_early_bird', title: 'Ранний пташка', description: 'Напишите в дневник до 8 утра', icon: '🐦', category: 'general' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
// todayStr(), dateToStr(), calcStreak() replaced by shared imports from @/lib/format
// (getTodayStr, toDateStr, calculateStreak) — equivalent logic.

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const today = getTodayStr()
    const now = new Date()

    // ── Fetch data from all modules in parallel ──
    const [
      diaryEntries,
      transactions,
      workouts,
      habits,
      habitLogs,
      meals,
      waterLogs,
      collectionItems,
      goals,
      posts,
      existingAchievements,
    ] = await Promise.all([
      db.diaryEntry.findMany({ where: { userId: DEMO_USER_ID }, select: { id: true, date: true, mood: true } }),
      db.transaction.findMany({ where: { userId: DEMO_USER_ID }, select: { id: true, date: true, amount: true, type: true } }),
      db.workout.findMany({ where: { userId: DEMO_USER_ID }, select: { id: true, date: true, durationMin: true } }),
      db.habit.findMany({ where: { userId: DEMO_USER_ID }, select: { id: true, name: true } }),
      db.habitLog.findMany({ select: { habitId: true, date: true, count: true } }),
      db.meal.findMany({ where: { userId: DEMO_USER_ID }, select: { id: true, date: true } }),
      db.waterLog.findMany({ where: { userId: DEMO_USER_ID }, select: { id: true, date: true, amountMl: true } }),
      db.collectionItem.findMany({ where: { userId: DEMO_USER_ID }, select: { id: true } }),
      db.goal.findMany({ where: { userId: DEMO_USER_ID }, select: { id: true, status: true } }),
      db.post.findMany({ where: { userId: DEMO_USER_ID }, select: { id: true } }),
      db.achievement.findMany({ where: { userId: DEMO_USER_ID } }),
    ])

    // ── Build existing achievement key set ──
    const existingKeys = new Set(existingAchievements.map((a) => a.key))

    // ── Precompute common data ──
    const diaryDates = diaryEntries.map((e) => toDateStr(new Date(e.date)))
    const diaryStreak = calculateStreak(diaryDates)

    const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0

    // Week range for workout streak
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = toDateStr(weekAgo)
    const weekWorkouts = workouts.filter((w) => toDateStr(new Date(w.date)) >= weekAgoStr).length
    const totalWorkoutMin = workouts.reduce((s, w) => s + (w.durationMin ?? 0), 0)

    // Habits: check today's completion
    const habitIds = habits.map((h) => h.id)
    const todayLogs = habitLogs.filter((l) => toDateStr(new Date(l.date)) === today)
    const completedHabitIdsToday = new Set(todayLogs.map((l) => l.habitId))
    const hasAnyHabitCompleted = completedHabitIdsToday.size > 0
    const allHabitsCompleted = habitIds.length > 0 && habitIds.every((id) => completedHabitIdsToday.has(id))

    // Habits streak: check if all habits were completed for N consecutive days
    const habitsStreak = (() => {
      if (habitIds.length === 0) return 0
      const logDates = [...new Set(habitLogs.map((l) => toDateStr(new Date(l.date))))].sort().reverse()
      if (logDates.length === 0) return 0
      let streak = 0
      for (const d of logDates) {
        const dayLogs = habitLogs.filter((l) => toDateStr(new Date(l.date)) === d)
        const dayHabitIds = new Set(dayLogs.map((l) => l.habitId))
        if (dayHabitIds.size >= habitIds.length) {
          streak++
        } else {
          break
        }
      }
      // Check continuity from today/yesterday
      if (logDates[0] !== today && logDates[0] !== (() => { const y = new Date(); y.setDate(y.getDate() - 1); return toDateStr(y) })()) return 0
      return streak
    })()

    const todayMealCount = meals.filter((m) => toDateStr(new Date(m.date)) === today).length

    const todayWaterMl = waterLogs.filter((w) => toDateStr(new Date(w.date)) === today).reduce((s, w) => s + w.amountMl, 0)

    const completedGoals = goals.filter((g) => g.status === 'completed')

    // Early bird check
    const hasEarlyBirdEntry = diaryEntries.some((e) => {
      const d = new Date(e.date)
      return toDateStr(d) === today && d.getHours() < 8
    })

    // Active day: diary + workout + meals + all habits
    const todayWorkoutDone = workouts.some((w) => toDateStr(new Date(w.date)) === today)
    const todayDiaryDone = diaryEntries.some((e) => toDateStr(new Date(e.date)) === today)
    const activeDay = todayDiaryDone && todayWorkoutDone && todayMealCount > 0 && allHabitsCompleted

    // ── Evaluate each achievement ──
    const newlyEarned: AchievementDef[] = []
    const allResults: (AchievementDef & { earned: boolean; earnedAt: string | null })[] = []

    for (const def of ALL_ACHIEVEMENTS) {
      let earned = false
      let earnedAt: string | null = null

      // Skip if already earned
      if (existingKeys.has(def.key)) {
        const existing = existingAchievements.find((a) => a.key === def.key)
        allResults.push({ ...def, earned: true, earnedAt: existing?.earnedAt.toISOString() ?? null })
        continue
      }

      switch (def.key) {
        // ── Diary ──
        case 'first_diary_entry':
          earned = diaryEntries.length > 0
          earnedAt = earned ? diaryEntries[diaryEntries.length - 1]?.date.toISOString() ?? today : null
          break
        case 'diary_streak_3':
          earned = diaryStreak >= 3
          earnedAt = earned ? today : null
          break
        case 'diary_streak_7':
          earned = diaryStreak >= 7
          earnedAt = earned ? today : null
          break
        case 'diary_30_entries':
          earned = diaryEntries.length >= 30
          earnedAt = earned ? diaryEntries[Math.max(0, diaryEntries.length - 1)]?.date.toISOString() ?? today : null
          break

        // ── Finance ──
        case 'first_transaction':
          earned = transactions.length > 0
          earnedAt = earned ? transactions[0]?.date.toISOString() ?? today : null
          break
        case 'savings_rate_positive':
          earned = savingsRate > 0
          earnedAt = earned ? today : null
          break
        case 'finance_100_transactions':
          earned = transactions.length >= 100
          earnedAt = earned ? today : null
          break

        // ── Workout ──
        case 'first_workout':
          earned = workouts.length > 0
          earnedAt = earned ? workouts[0]?.date.toISOString() ?? today : null
          break
        case 'workout_streak_3':
          earned = weekWorkouts >= 3
          earnedAt = earned ? today : null
          break
        case 'workout_marathon':
          earned = totalWorkoutMin >= 1000
          earnedAt = earned ? workouts[workouts.length - 1]?.date.toISOString() ?? today : null
          break

        // ── Habits ──
        case 'first_habit_complete':
          earned = hasAnyHabitCompleted
          earnedAt = earned ? today : null
          break
        case 'all_habits_complete':
          earned = allHabitsCompleted
          earnedAt = earned ? today : null
          break
        case 'habits_streak_7':
          earned = habitsStreak >= 7
          earnedAt = earned ? today : null
          break

        // ── Nutrition ──
        case 'first_meal':
          earned = meals.length > 0
          earnedAt = earned ? meals[0]?.date.toISOString() ?? today : null
          break
        case 'water_goal':
          earned = todayWaterMl >= 2000 // 8 glasses * 250ml
          earnedAt = earned ? today : null
          break

        // ── Collections ──
        case 'first_collection':
          earned = collectionItems.length > 0
          earnedAt = earned ? today : null
          break
        case 'collections_10':
          earned = collectionItems.length >= 10
          earnedAt = earned ? today : null
          break

        // ── Goals ──
        case 'first_goal_set':
          earned = goals.length > 0
          earnedAt = earned ? today : null
          break
        case 'first_goal_completed':
          earned = completedGoals.length > 0
          earnedAt = earned ? today : null
          break

        // ── Feed ──
        case 'first_post':
          earned = posts.length > 0
          earnedAt = earned ? today : null
          break

        // ── General ──
        case 'general_active_day':
          earned = activeDay
          earnedAt = earned ? today : null
          break
        case 'general_early_bird':
          earned = hasEarlyBirdEntry
          earnedAt = earned ? today : null
          break
      }

      allResults.push({ ...def, earned, earnedAt })

      if (earned) {
        newlyEarned.push(def)
      }
    }

    // ── Persist newly earned achievements (atomic with final read) ──
    const allPersisted = await db.$transaction(async (tx) => {
      if (newlyEarned.length > 0) {
        // Use upsert per item to avoid skipDuplicates issues in Prisma 7
        await Promise.all(
          newlyEarned.map((def) =>
            tx.achievement.upsert({
              where: { key: def.key },
              create: {
                key: def.key,
                title: def.title,
                description: def.description,
                icon: def.icon,
                category: def.category,
                userId: DEMO_USER_ID,
              },
              update: {}, // no-op if already exists
            }),
          ),
        )
      }

      return tx.achievement.findMany({
        where: { userId: DEMO_USER_ID },
        orderBy: { earnedAt: 'desc' },
      })
    })

    return apiSuccess({
      earned: newlyEarned.map((def) => ({
        key: def.key,
        title: def.title,
        description: def.description,
        icon: def.icon,
        category: def.category,
      })),
      all: allResults,
      persisted: allPersisted.map((a) => ({
        id: a.id,
        key: a.key,
        title: a.title,
        description: a.description,
        icon: a.icon,
        category: a.category,
        earnedAt: a.earnedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Achievements API error:', error)
    return apiServerError('Не удалось загрузить достижения')
  }
}
