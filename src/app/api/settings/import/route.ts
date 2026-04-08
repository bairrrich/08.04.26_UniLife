import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiServerError } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const imported: Record<string, number> = {}

    // Diary
    if (body.diary && Array.isArray(body.diary)) {
      const diaryData = body.diary.map((entry: Record<string, unknown>) => ({
        userId: DEMO_USER_ID,
        date: entry.date ? new Date(entry.date as string) : new Date(),
        title: (entry.title as string) || null,
        content: (entry.content as string) || '',
        mood: entry.mood != null ? Number(entry.mood) : null,
        tags: (entry.tags as string) || '[]',
        photos: (entry.photos as string) || '[]',
      }))
      if (diaryData.length > 0) {
        const result = await db.diaryEntry.createMany({ data: diaryData })
        imported.diary = result.count
      }
    }

    // Finance (transactions + categories)
    if (body.finance) {
      const { transactions, categories } = body.finance as {
        transactions?: Record<string, unknown>[]
        categories?: Record<string, unknown>[]
      }

      if (categories && Array.isArray(categories)) {
        const catData = categories.map((cat: Record<string, unknown>) => ({
          name: (cat.name as string) || 'Imported',
          type: (cat.type as string) || 'EXPENSE',
          icon: (cat.icon as string) || 'circle',
          color: (cat.color as string) || '#6b7280',
          userId: DEMO_USER_ID,
          isDefault: (cat.isDefault as boolean) || false,
        }))
        if (catData.length > 0) {
          const catResult = await db.category.createMany({ data: catData })
          imported.financeCategories = catResult.count
        }
      }

      if (transactions && Array.isArray(transactions)) {
        // For transactions we need to handle category relations carefully
        // We'll skip the category/subCategory relation and just create transactions
        const txData = transactions.map((tx: Record<string, unknown>) => {
          // Try to find a matching category or use a fallback
          return {
            userId: DEMO_USER_ID,
            type: (tx.type as string) || 'EXPENSE',
            amount: Number(tx.amount) || 0,
            currency: (tx.currency as string) || 'RUB',
            categoryId: (tx.categoryId as string) || 'none',
            date: tx.date ? new Date(tx.date as string) : new Date(),
            description: (tx.description as string) || null,
            note: (tx.note as string) || null,
            isRecurring: (tx.isRecurring as boolean) || false,
          }
        })
        // Filter out transactions without valid category references
        // For safety, we'll only import transactions that have valid categoryIds
        // Actually, since we're importing, let's just skip invalid ones
        try {
          if (txData.length > 0) {
            // Get all valid category IDs
            const validCategories = await db.category.findMany({
              where: { userId: DEMO_USER_ID },
              select: { id: true },
            })
            const validCatIds = new Set(validCategories.map(c => c.id))
            const validTxData = txData.filter(tx => validCatIds.has(tx.categoryId))
            if (validTxData.length > 0) {
              const txResult = await db.transaction.createMany({ data: validTxData })
              imported.financeTransactions = txResult.count
            }
            imported.finance = (imported.financeCategories || 0) + (imported.financeTransactions || 0)
          }
        } catch {
          imported.finance = 0
        }
      }
    }

    // Nutrition (meals with items + waterLogs)
    if (body.nutrition) {
      const { meals, waterLogs } = body.nutrition as {
        meals?: Record<string, unknown>[]
        waterLogs?: Record<string, unknown>[]
      }

      if (meals && Array.isArray(meals)) {
        let mealCount = 0
        for (const meal of meals) {
          try {
            const mealItems = Array.isArray(meal.items)
              ? meal.items.map((item: Record<string, unknown>) => ({
                  name: (item.name as string) || 'Imported',
                  kcal: Number(item.kcal) || 0,
                  protein: Number(item.protein) || 0,
                  fat: Number(item.fat) || 0,
                  carbs: Number(item.carbs) || 0,
                  servingSize: (item.servingSize as string) || null,
                  servingUnit: (item.servingUnit as string) || null,
                }))
              : []
            await db.meal.create({
              data: {
                userId: DEMO_USER_ID,
                type: (meal.type as string) || 'LUNCH',
                date: meal.date ? new Date(meal.date as string) : new Date(),
                note: (meal.note as string) || null,
                items: mealItems.length > 0 ? { create: mealItems } : undefined,
              },
            })
            mealCount++
          } catch {
            // Skip invalid meals
          }
        }
        imported.nutritionMeals = mealCount
      }

      if (waterLogs && Array.isArray(waterLogs)) {
        const waterData = waterLogs.map((log: Record<string, unknown>) => ({
          userId: DEMO_USER_ID,
          date: log.date ? new Date(log.date as string) : new Date(),
          amountMl: Number(log.amountMl) || 250,
        }))
        if (waterData.length > 0) {
          const waterResult = await db.waterLog.createMany({ data: waterData })
          imported.nutritionWater = waterResult.count
        }
        imported.nutrition = (imported.nutritionMeals || 0) + (imported.nutritionWater || 0)
      }
    }

    // Workouts
    if (body.workout && Array.isArray(body.workout)) {
      let workoutCount = 0
      for (const w of body.workout) {
        try {
          const exercises = Array.isArray(w.exercises)
            ? w.exercises.map((ex: Record<string, unknown>, idx: number) => ({
                name: (ex.name as string) || 'Exercise',
                sets: (ex.sets as string) || '[]',
                notes: (ex.notes as string) || null,
                order: Number(ex.order) ?? idx,
              }))
            : []
          await db.workout.create({
            data: {
              userId: DEMO_USER_ID,
              date: w.date ? new Date(w.date as string) : new Date(),
              name: (w.name as string) || 'Imported workout',
              durationMin: w.durationMin != null ? Number(w.durationMin) : null,
              note: (w.note as string) || null,
              exercises: exercises.length > 0 ? { create: exercises } : undefined,
            },
          })
          workoutCount++
        } catch {
          // Skip invalid workouts
        }
      }
      imported.workout = workoutCount
    }

    // Collections
    if (body.collections && Array.isArray(body.collections)) {
      const colData = body.collections.map((item: Record<string, unknown>) => ({
        userId: DEMO_USER_ID,
        type: (item.type as string) || 'BOOK',
        title: (item.title as string) || 'Imported',
        author: (item.author as string) || null,
        description: (item.description as string) || null,
        coverUrl: (item.coverUrl as string) || null,
        rating: item.rating != null ? Number(item.rating) : null,
        details: item.details ? JSON.stringify(item.details) : '{}',
        date: item.date ? new Date(item.date as string) : null,
        tags: (item.tags as string) || '[]',
        notes: (item.notes as string) || null,
      }))
      if (colData.length > 0) {
        const result = await db.collectionItem.createMany({ data: colData })
        imported.collections = result.count
      }
    }

    // Feed (posts)
    if (body.feed && Array.isArray(body.feed)) {
      const postData = body.feed.map((post: Record<string, unknown>) => ({
        userId: DEMO_USER_ID,
        entityType: (post.entityType as string) || 'diary',
        entityId: (post.entityId as string) || 'unknown',
        caption: (post.caption as string) || null,
      }))
      if (postData.length > 0) {
        const result = await db.post.createMany({ data: postData })
        imported.feed = result.count
      }
    }

    return NextResponse.json({ success: true, imported })
  } catch (error) {
    console.error('Import error:', error)
    return apiServerError('Failed to import data')
  }
}
