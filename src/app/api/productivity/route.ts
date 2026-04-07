import { NextResponse } from 'next/server'
import { apiSuccess, apiServerError, DEMO_USER_ID } from '@/lib/api'
import { db } from '@/lib/db'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ProductivityBreakdown {
  habits: {
    completed: number
    total: number
    points: number
    maxPoints: number
    label: string
  }
  diary: {
    hasEntry: boolean
    count: number
    points: number
    maxPoints: number
    label: string
  }
  nutrition: {
    mealsLogged: number
    points: number
    maxPoints: number
    label: string
  }
  workout: {
    hasWorkout: boolean
    count: number
    points: number
    maxPoints: number
    label: string
  }
  finance: {
    withinBudget: boolean
    totalExpense: number
    totalBudget: number
    points: number
    maxPoints: number
    label: string
    hasBudget: boolean
  }
}

// ─── GET /api/productivity?date=YYYY-MM-DD&month=YYYY-MM ───────────────────────

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dateStr = today.toISOString().split('T')[0]
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

    // Start of month / end of month for finance queries
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)

    // ── Fetch all data in parallel with Promise.allSettled ──────────────────
    const [habitsResult, diaryResult, nutritionResult, workoutResult, budgetsResult] =
      await Promise.allSettled([
        // 1. Habits — today's completion
        db.habit.findMany({
          where: { userId: DEMO_USER_ID },
          include: {
            logs: {
              where: { date: { gte: today, lt: tomorrow } },
            },
          },
        }),
        // 2. Diary — today's entries
        db.diaryEntry.findMany({
          where: {
            userId: DEMO_USER_ID,
            date: { gte: today, lt: tomorrow },
          },
        }),
        // 3. Nutrition — today's meals
        db.meal.findMany({
          where: {
            userId: DEMO_USER_ID,
            date: { gte: today, lt: tomorrow },
          },
        }),
        // 4. Workout — today's workouts
        db.workout.findMany({
          where: {
            userId: DEMO_USER_ID,
            date: { gte: today, lt: tomorrow },
          },
        }),
        // 5. Budgets + month expenses — check overspending
        Promise.all([
          db.budget.findMany({
            where: {
              userId: DEMO_USER_ID,
              startDate: { lte: endOfMonth },
            },
          }),
          db.transaction.findMany({
            where: {
              userId: DEMO_USER_ID,
              type: 'EXPENSE',
              date: { gte: startOfMonth, lte: endOfMonth },
            },
          }),
        ]),
      ])

    // ── Parse results with graceful degradation ────────────────────────────
    const habits = habitsResult.status === 'fulfilled' ? habitsResult.value : []
    const diaryEntries = diaryResult.status === 'fulfilled' ? diaryResult.value : []
    const meals = nutritionResult.status === 'fulfilled' ? nutritionResult.value : []
    const workouts = workoutResult.status === 'fulfilled' ? workoutResult.value : []
    const [budgets, transactions] =
      budgetsResult.status === 'fulfilled' ? budgetsResult.value : [[], []]

    // ── Calculate score breakdown ──────────────────────────────────────────

    // 1. Habits: 30 points max (each habit = 30/totalHabits)
    const totalHabits = habits.length
    const completedHabits = habits.filter((h) => h.logs.length > 0).length
    const habitsPoints = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 30) : 0

    // 2. Diary entry: 20 points
    const diaryCount = diaryEntries.length
    const diaryPoints = diaryCount > 0 ? 20 : 0

    // 3. Meals logged (at least 3): 20 points (7 per meal, max 20)
    const mealsLogged = meals.length
    const nutritionPoints = Math.min(20, mealsLogged * 7)

    // 4. Workout: 20 points
    const workoutCount = workouts.length
    const workoutPoints = workoutCount > 0 ? 20 : 0

    // 5. No overspending: 10 points
    let totalExpense = 0
    for (const t of transactions) {
      totalExpense += t.amount
    }
    let totalBudget = 0
    for (const b of budgets) {
      totalBudget += b.amount
    }
    const hasBudget = budgets.length > 0
    const withinBudget = hasBudget ? totalExpense <= totalBudget : true
    const financePoints = (hasBudget && withinBudget) ? 10 : (hasBudget ? 0 : 5)

    const score = habitsPoints + diaryPoints + nutritionPoints + workoutPoints + financePoints

    const breakdown: ProductivityBreakdown = {
      habits: {
        completed: completedHabits,
        total: totalHabits,
        points: habitsPoints,
        maxPoints: 30,
        label: `Привычки: ${completedHabits} из ${totalHabits}`,
      },
      diary: {
        hasEntry: diaryCount > 0,
        count: diaryCount,
        points: diaryPoints,
        maxPoints: 20,
        label: diaryCount > 0 ? 'Дневник: записано' : 'Дневник: нет записи',
      },
      nutrition: {
        mealsLogged,
        points: nutritionPoints,
        maxPoints: 20,
        label: `Питание: ${mealsLogged} приём${mealsLogged === 1 ? '' : mealsLogged < 5 ? 'а' : 'ов'}`,
      },
      workout: {
        hasWorkout: workoutCount > 0,
        count: workoutCount,
        points: workoutPoints,
        maxPoints: 20,
        label: workoutCount > 0 ? 'Тренировка: выполнена' : 'Тренировка: нет',
      },
      finance: {
        withinBudget,
        totalExpense,
        totalBudget,
        points: financePoints,
        maxPoints: 10,
        label: hasBudget
          ? withinBudget
            ? 'Финансы: в рамках бюджета'
            : 'Финансы: превышен бюджет'
          : 'Финансы: бюджет не задан',
        hasBudget,
      },
    }

    return apiSuccess({
      score,
      breakdown,
      date: dateStr,
      month: monthStr,
    })
  } catch (error) {
    console.error('[GET /api/productivity] Error:', error)
    return apiServerError('Failed to calculate productivity score')
  }
}
