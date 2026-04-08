import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccessMessage, apiServerError } from '@/lib/api'

export async function POST() {
  try {
    // ── Children before parents (respect FK constraints) ──

    // Feed children
    await db.comment.deleteMany({ where: { post: { userId: DEMO_USER_ID } } })
    await db.like.deleteMany({ where: { post: { userId: DEMO_USER_ID } } })
    await db.post.deleteMany({ where: { userId: DEMO_USER_ID } })

    // Habit children
    await db.habitLog.deleteMany({ where: { habit: { userId: DEMO_USER_ID } } })
    await db.habit.deleteMany({ where: { userId: DEMO_USER_ID } })

    // Goals
    await db.goal.deleteMany({ where: { userId: DEMO_USER_ID } })

    // Achievements
    await db.achievement.deleteMany({ where: { userId: DEMO_USER_ID } })

    // Finance children
    await db.transaction.deleteMany({ where: { userId: DEMO_USER_ID } })
    await db.recurringTransaction.deleteMany({ where: { userId: DEMO_USER_ID } })
    await db.budget.deleteMany({ where: { userId: DEMO_USER_ID } })
    await db.account.deleteMany({ where: { userId: DEMO_USER_ID } })

    // Investment children
    await db.investmentTx.deleteMany({ where: { investment: { userId: DEMO_USER_ID } } })
    await db.investment.deleteMany({ where: { userId: DEMO_USER_ID } })

    // Savings goals
    await db.savingsGoal.deleteMany({ where: { userId: DEMO_USER_ID } })

    // Nutrition children
    await db.mealItem.deleteMany({ where: { meal: { userId: DEMO_USER_ID } } })
    await db.meal.deleteMany({ where: { userId: DEMO_USER_ID } })
    await db.waterLog.deleteMany({ where: { userId: DEMO_USER_ID } })
    await db.nutritionGoal.deleteMany({ where: { userId: DEMO_USER_ID } })

    // Workout children
    await db.workoutExercise.deleteMany({ where: { workout: { userId: DEMO_USER_ID } } })
    await db.workout.deleteMany({ where: { userId: DEMO_USER_ID } })

    // Collections
    await db.collectionItem.deleteMany({ where: { userId: DEMO_USER_ID } })

    // Diary
    await db.diaryEntry.deleteMany({ where: { userId: DEMO_USER_ID } })

    // Finance categories last (no FK deps)
    await db.category.deleteMany({ where: { userId: DEMO_USER_ID } })

    return apiSuccessMessage('Все данные очищены')
  } catch (error) {
    console.error('Clear data error:', error)
    return apiServerError('Failed to clear data')
  }
}
