import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

export async function POST() {
  try {
    const cats = [
      { name: 'Продукты', icon: 'ShoppingCart', color: '#10b981', type: 'EXPENSE' },
      { name: 'Кафе и рестораны', icon: 'UtensilsCrossed', color: '#f59e0b', type: 'EXPENSE' },
      { name: 'Транспорт', icon: 'Car', color: '#6366f1', type: 'EXPENSE' },
      { name: 'Жильё', icon: 'Home', color: '#ef4444', type: 'EXPENSE' },
      { name: 'Развлечения', icon: 'Gamepad2', color: '#ec4899', type: 'EXPENSE' },
      { name: 'Здоровье', icon: 'Heart', color: '#14b8a6', type: 'EXPENSE' },
      { name: 'Зарплата', icon: 'Banknote', color: '#10b981', type: 'INCOME' },
      { name: 'Фриланс', icon: 'Laptop', color: '#0ea5e9', type: 'INCOME' },
    ]
    for (const c of cats) {
      await db.category.upsert({
        where: { id: `cat_${c.name.toLowerCase().replace(/\s+/g, '_')}` },
        update: {},
        create: { id: `cat_${c.name.toLowerCase().replace(/\s+/g, '_')}`, ...c, isDefault: true },
      })
    }

    await db.user.upsert({
      where: { id: USER_ID },
      update: {},
      create: { id: USER_ID, email: 'demo@unilife.app', name: 'Алексей', avatar: '/unilife-logo.png', bio: 'Люблю отслеживать всё в жизни 🚀' },
    })

    const now = new Date()
    const txDescs: Record<string, string[]> = {
      'cat_продукты': ['Перекрёсток', 'Пятёрочка', 'Вкусвилл'],
      'cat_кафе_и_рестораны': ['Старбакс', 'Кофемания'],
      'cat_транспорт': ['Метро', 'Яндекс Такси'],
      'cat_жильё': ['Электричество', 'Интернет'],
      'cat_развлечения': ['Netflix', 'Steam'],
      'cat_здоровье': ['Аптека', 'Фитнес'],
    }

    for (let i = 0; i < 5; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(10 + Math.floor(Math.random() * 8))
      const catIds = Object.keys(txDescs)
      for (let j = 0; j < 2; j++) {
        const catId = catIds[Math.floor(Math.random() * catIds.length)]
        const descs = txDescs[catId]!
        await db.transaction.create({
          data: {
            userId: USER_ID,
            type: Math.random() > 0.15 ? 'EXPENSE' : 'INCOME',
            amount: Math.round((Math.random() * 3000 + 100) * 100) / 100,
            categoryId: catId,
            date: d,
            description: descs[Math.floor(Math.random() * descs.length)],
          },
        })
      }
    }

    const diaries = [
      'Отличный день! Много успел сделать.',
      'Обычный день, ничего особенного.',
      'Замечательный день с друзьями!',
      'Продуктивный рабочий день.',
      'День самопознания и рефлексии.',
    ]
    for (let i = 0; i < 5; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i)
      await db.diaryEntry.create({
        data: { userId: USER_ID, date: d, content: diaries[i], mood: Math.floor(Math.random() * 3) + 3, tags: JSON.stringify(['тег']) },
      })
    }

    const mealOpts = [
      { type: 'BREAKFAST' as const, items: [{ name: 'Овсянка', kcal: 250, protein: 12, fat: 8, carbs: 40 }] },
      { type: 'LUNCH' as const, items: [{ name: 'Курица с рисом', kcal: 450, protein: 35, fat: 12, carbs: 50 }] },
      { type: 'DINNER' as const, items: [{ name: 'Рыба на гриле', kcal: 350, protein: 30, fat: 15, carbs: 20 }] },
    ]
    for (let i = 0; i < 3; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i)
      for (const m of mealOpts) {
        await db.meal.create({
          data: { userId: USER_ID, type: m.type, date: d, items: { create: m.items } },
        })
      }
    }

    const wData = [
      { name: 'Тренировка груди', exercises: ['Жим штанги', 'Разводка', 'Отжимания'] },
      { name: 'Тренировка спины', exercises: ['Подтягивания', 'Тяга штанги', 'Гиперэкстензия'] },
    ]
    for (let i = 0; i < 2; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i * 2)
      const w = wData[i]
      await db.workout.create({
        data: {
          userId: USER_ID, date: d, name: w.name, durationMin: 50,
          exercises: {
            create: w.exercises.map((name, idx) => ({
              name,
              sets: JSON.stringify([{ weight: 25, reps: 10, completed: true }]),
              order: idx,
            })),
          },
        },
      })
    }

    const cols = [
      { type: 'BOOK', title: 'Атомные привычки', author: 'Джеймс Клир', status: 'COMPLETED', rating: 5 },
      { type: 'BOOK', title: 'Sapiens', author: 'Юваль Харари', status: 'COMPLETED', rating: 5 },
      { type: 'MOVIE', title: 'Интерстеллар', author: 'Нолан', status: 'COMPLETED', rating: 5 },
      { type: 'RECIPE', title: 'Паста Карбонара', author: 'Итальянская', status: 'COMPLETED', rating: 5 },
    ]
    for (const c of cols) {
      await db.collectionItem.create({ data: { userId: USER_ID, ...c, tags: JSON.stringify([]) } })
    }

    const posts = ['Отличный день для тренировки! 💪', 'Вкусный обед 😋', 'Хорошая книга 📚']
    for (let i = 0; i < 3; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i * 3)
      await db.post.create({
        data: { userId: USER_ID, entityType: ['diary', 'workout', 'meal'][i], entityId: 'demo', caption: posts[i], createdAt: d },
      })
    }

    return NextResponse.json({ success: true, message: 'Lite seed complete' })
  } catch (error) {
    console.error('Lite seed error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
