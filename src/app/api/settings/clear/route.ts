import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

export async function POST() {
  try {
    // ── Children before parents (respect FK constraints) ──

    // Feed children
    await db.comment.deleteMany({ where: { post: { userId: USER_ID } } })
    await db.like.deleteMany({ where: { post: { userId: USER_ID } } })
    await db.post.deleteMany({ where: { userId: USER_ID } })

    // Habit children
    await db.habitLog.deleteMany({ where: { habit: { userId: USER_ID } } })
    await db.habit.deleteMany({ where: { userId: USER_ID } })

    // Goals
    await db.goal.deleteMany({ where: { userId: USER_ID } })

    // Achievements
    await db.achievement.deleteMany({ where: { userId: USER_ID } })

    // Finance children
    await db.transaction.deleteMany({ where: { userId: USER_ID } })
    await db.recurringTransaction.deleteMany({ where: { userId: USER_ID } })
    await db.budget.deleteMany({ where: { userId: USER_ID } })
    await db.account.deleteMany({ where: { userId: USER_ID } })

    // Investment children
    await db.investmentTx.deleteMany({ where: { investment: { userId: USER_ID } } })
    await db.investment.deleteMany({ where: { userId: USER_ID } })

    // Savings goals
    await db.savingsGoal.deleteMany({ where: { userId: USER_ID } })

    // Nutrition children
    await db.mealItem.deleteMany({ where: { meal: { userId: USER_ID } } })
    await db.meal.deleteMany({ where: { userId: USER_ID } })
    await db.waterLog.deleteMany({ where: { userId: USER_ID } })
    await db.nutritionGoal.deleteMany({ where: { userId: USER_ID } })

    // Workout children
    await db.workoutExercise.deleteMany({ where: { workout: { userId: USER_ID } } })
    await db.workout.deleteMany({ where: { userId: USER_ID } })

    // Collections
    await db.collectionItem.deleteMany({ where: { userId: USER_ID } })

    // Diary
    await db.diaryEntry.deleteMany({ where: { userId: USER_ID } })

    // Finance categories last (no FK deps)
    await db.category.deleteMany({ where: { userId: USER_ID } })

    return NextResponse.json({ success: true, message: 'Все данные очищены' })
  } catch (error) {
    console.error('Clear data error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear data' },
      { status: 500 }
    )
  }
}
