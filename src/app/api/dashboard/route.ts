import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiServerError, DEMO_USER_ID as USER_ID } from '@/lib/api'

// GET /api/dashboard — combined endpoint that returns all dashboard data in one request
// This prevents Turbopack from needing to compile 10+ separate API routes
// which causes development server instability
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)
    const today = searchParams.get('today') || new Date().toISOString().slice(0, 10)
    const weekFrom = searchParams.get('weekFrom') || ''
    const weekTo = searchParams.get('weekTo') || ''

    // Parse month YYYY-MM into Date objects for Prisma DateTime comparisons
    const [yearStr, monthStr] = month.split('-')
    const yearNum = parseInt(yearStr, 10)
    const monthNum = parseInt(monthStr, 10)
    const monthStart = new Date(yearNum, monthNum - 1, 1, 0, 0, 0, 0)
    // day=0 of next month = last day of current month
    const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59, 999)

    // Parse today into start/end of day for exact date matching
    const todayDate = new Date(today + 'T00:00:00.000')
    const todayEnd = new Date(today + 'T23:59:59.999')

    // Build habit date filter (last 7 days) as a proper Date object
    const habitFromDate = weekFrom
      ? new Date(weekFrom)
      : new Date(Date.now() - 7 * 86400000)

    // Run all queries in parallel
    const [
      diaryMonth,
      diaryWeek,
      allTransactions,
      mealsWithItems,
      workouts,
      feedPosts,
      rawHabits,
      rawBudgets,
      waterLogsToday,
      waterLogsWeek,
    ] = await Promise.all([
      // Monthly diary entries
      db.diaryEntry.findMany({
        where: { userId: USER_ID, date: { gte: monthStart, lte: monthEnd } },
        orderBy: { date: 'desc' },
      }),
      // Weekly diary entries
      weekFrom && weekTo
        ? db.diaryEntry.findMany({
            where: { userId: USER_ID, date: { gte: new Date(weekFrom), lte: new Date(weekTo) } },
            orderBy: { date: 'desc' },
          })
        : Promise.resolve([]),
      // All transactions for the month
      db.transaction.findMany({
        where: { userId: USER_ID, date: { gte: monthStart, lte: monthEnd } },
        include: { category: true },
      }),
      // Meals with items for today (nutrition stats) — use range for date matching
      db.meal.findMany({
        where: { userId: USER_ID, date: { gte: todayDate, lte: todayEnd } },
        include: { items: { select: { kcal: true, protein: true, fat: true, carbs: true } } },
      }),
      // Workouts for the month
      db.workout.findMany({
        where: { userId: USER_ID, date: { gte: monthStart, lte: monthEnd } },
        orderBy: { date: 'desc' },
      }),
      // Recent feed posts
      db.post.findMany({
        where: { userId: USER_ID },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      // Habits with recent logs
      db.habit.findMany({
        where: { userId: USER_ID },
        orderBy: { createdAt: 'asc' },
        include: {
          logs: {
            where: { date: { gte: habitFromDate } },
            orderBy: { date: 'desc' },
          },
        },
      }),
      // Budgets active during this month (startDate <= monthEnd AND (endDate >= monthStart OR endDate is null))
      db.budget.findMany({
        where: {
          userId: USER_ID,
          startDate: { lte: monthEnd },
          OR: [
            { endDate: { gte: monthStart } },
            { endDate: null },
          ],
        },
        include: { category: true },
      }),
      // Water logs for today
      db.waterLog.findMany({
        where: { userId: USER_ID, date: { gte: todayDate, lte: todayEnd } },
      }),
      // Water logs for the week (for weekly activity chart)
      weekFrom
        ? db.waterLog.findMany({
            where: { userId: USER_ID, date: { gte: new Date(weekFrom), lte: new Date(weekTo) } },
          })
        : Promise.resolve([]),
    ])

    // ── Finance stats ──
    let totalIncome = 0
    let totalExpense = 0
    const categoryMap = new Map<string, { categoryName: string; categoryColor: string; total: number }>()

    for (const t of allTransactions) {
      if (t.type === 'INCOME') {
        totalIncome += t.amount
      } else {
        totalExpense += t.amount
      }
      const cat = t.category
      const catName = (cat && cat.name) || 'Другое'
      const catColor = (cat && cat.color) || '#6b7280'
      const existing = categoryMap.get(catName)
      if (existing) {
        existing.total += t.amount
      } else {
        categoryMap.set(catName, { categoryName: catName, categoryColor: catColor, total: t.amount })
      }
    }

    const financeStats = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory: Array.from(categoryMap.values()),
    }

    // ── Nutrition stats ──
    let totalKcal = 0
    let totalProtein = 0
    let totalFat = 0
    let totalCarbs = 0
    for (const meal of mealsWithItems) {
      const items = meal.items
      if (Array.isArray(items)) {
        for (const item of items) {
          totalKcal += item.kcal || 0
          totalProtein += item.protein || 0
          totalFat += item.fat || 0
          totalCarbs += item.carbs || 0
        }
      }
    }

    // ── Habits ──
    const habitsData = rawHabits.map((h) => {
      const logs = Array.isArray(h.logs) ? h.logs : []
      // Compare dates as ISO strings (YYYY-MM-DD) for reliable matching
      const todayStr = todayDate.toISOString().slice(0, 10)
      const todayLog = logs.find((l) => {
        const logDateStr = l.date instanceof Date ? l.date.toISOString().slice(0, 10) : String(l.date).slice(0, 10)
        return logDateStr === todayStr
      })
      const last7Days: Record<string, boolean> = {}
      for (const log of logs) {
        const logDateStr = log.date instanceof Date ? log.date.toISOString().slice(0, 10) : String(log.date).slice(0, 10)
        last7Days[logDateStr] = true
      }
      const todayCompleted = !!todayLog

      // Calculate streak
      let streak = 0
      const checkDate = new Date()
      if (!todayCompleted) checkDate.setDate(checkDate.getDate() - 1)
      // Safety limit to prevent infinite loop
      let maxIter = 365
      while (maxIter-- > 0) {
        const dateStr = checkDate.toISOString().slice(0, 10)
        if (last7Days[dateStr]) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }

      return {
        id: h.id,
        name: h.name,
        emoji: h.emoji,
        todayCompleted,
        streak,
        last7Days,
      }
    })

    const totalActive = habitsData.length
    const completedToday = habitsData.filter((h) => h.todayCompleted).length
    const bestStreak = habitsData.length > 0
      ? Math.max(...habitsData.map((h) => h.streak))
      : 0
    const habitsStats = { totalActive, completedToday, bestStreak }

    // ── Budgets ──
    let totalBudget = 0
    let totalSpent = 0
    const budgetItems = rawBudgets.map((b) => {
      const cat = b.category
      const spent = allTransactions
        .filter((t) => t.type === 'EXPENSE' && t.categoryId === b.categoryId)
        .reduce((sum, t) => sum + t.amount, 0)
      totalBudget += b.amount
      totalSpent += spent
      const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0
      return {
        id: b.id,
        categoryId: b.categoryId,
        categoryName: (cat && cat.name) || 'Без категории',
        categoryIcon: (cat && cat.icon) || '',
        categoryColor: (cat && cat.color) || '#6b7280',
        amount: b.amount,
        spent,
        percentage,
      }
    })
    const totalRemaining = Math.max(0, totalBudget - totalSpent)
    const totalPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
    const budgetData = {
      budgets: budgetItems,
      totalBudget,
      totalSpent,
      totalRemaining,
      totalPercentage,
    }

    // ── Water stats ──
    const waterTodayMl = waterLogsToday.reduce((sum, w) => sum + (w.amountMl || 250), 0)

    return NextResponse.json({
      success: true,
      data: {
        diaryMonth,
        diaryWeek,
        financeStats,
        transactions: allTransactions,
        nutritionStats: { totalKcal, totalProtein, totalFat, totalCarbs },
        mealsToday: mealsWithItems.length > 0,
        workouts,
        feedPosts,
        habits: habitsData,
        habitsStats,
        budgetData,
        waterTodayMl,
        waterLogsWeek,
      },
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return apiServerError('Failed to load dashboard data')
  }
}
