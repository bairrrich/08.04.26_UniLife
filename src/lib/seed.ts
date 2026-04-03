import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

export async function seed() {
  console.log('🌱 Seeding database...')

  // Create demo user
  await db.user.upsert({
    where: { id: USER_ID },
    update: {},
    create: {
      id: USER_ID,
      email: 'demo@unilife.app',
      name: 'Алексей',
      avatar: '/unilife-logo.png',
      bio: 'Люблю отслеживать всё в жизни 🚀',
    },
  })

  // Seed categories
  const expenseCategories = [
    { name: 'Продукты', icon: 'ShoppingCart', color: '#10b981', type: 'EXPENSE' },
    { name: 'Кафе и рестораны', icon: 'UtensilsCrossed', color: '#f59e0b', type: 'EXPENSE' },
    { name: 'Транспорт', icon: 'Car', color: '#6366f1', type: 'EXPENSE' },
    { name: 'Жильё', icon: 'Home', color: '#ef4444', type: 'EXPENSE' },
    { name: 'Развлечения', icon: 'Gamepad2', color: '#ec4899', type: 'EXPENSE' },
    { name: 'Здоровье', icon: 'Heart', color: '#14b8a6', type: 'EXPENSE' },
    { name: 'Одежда', icon: 'Shirt', color: '#8b5cf6', type: 'EXPENSE' },
    { name: 'Образование', icon: 'GraduationCap', color: '#0ea5e9', type: 'EXPENSE' },
    { name: 'Подарки', icon: 'Gift', color: '#f97316', type: 'EXPENSE' },
    { name: 'Другое', icon: 'MoreHorizontal', color: '#6b7280', type: 'EXPENSE' },
  ]

  const incomeCategories = [
    { name: 'Зарплата', icon: 'Banknote', color: '#10b981', type: 'INCOME' },
    { name: 'Фриланс', icon: 'Laptop', color: '#0ea5e9', type: 'INCOME' },
    { name: 'Инвестиции', icon: 'TrendingUp', color: '#8b5cf6', type: 'INCOME' },
    { name: 'Подарки', icon: 'Gift', color: '#f97316', type: 'INCOME' },
  ]

  for (const cat of [...expenseCategories, ...incomeCategories]) {
    await db.category.upsert({
      where: { id: `cat_${cat.name.toLowerCase().replace(/\s+/g, '_')}` },
      update: {},
      create: {
        id: `cat_${cat.name.toLowerCase().replace(/\s+/g, '_')}`,
        ...cat,
        isDefault: true,
      },
    })
  }

  // Seed subcategories
  const subcategories = [
    { name: 'Супермаркеты', categoryId: 'cat_продукты' },
    { name: 'Доставка еды', categoryId: 'cat_продукты' },
    { name: 'Обеды', categoryId: 'cat_кафе_и_рестораны' },
    { name: 'Ужины', categoryId: 'cat_кафе_и_рестораны' },
    { name: 'Метро', categoryId: 'cat_транспорт' },
    { name: 'Такси', categoryId: 'cat_транспорт' },
    { name: 'Аренда', categoryId: 'cat_жильё' },
    { name: 'Коммунальные', categoryId: 'cat_жильё' },
  ]

  for (const sub of subcategories) {
    await db.subCategory.upsert({
      where: { id: `sub_${sub.name.toLowerCase().replace(/\s+/g, '_')}` },
      update: {},
      create: {
        id: `sub_${sub.name.toLowerCase().replace(/\s+/g, '_')}`,
        ...sub,
      },
    })
  }

  // Seed transactions (last 10 days, fewer per day)
  const now = new Date()
  for (let i = 0; i < 10; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60))

    // 1-3 transactions per day
    const numTransactions = Math.floor(Math.random() * 3) + 1
    for (let j = 0; j < numTransactions; j++) {
      const isExpense = Math.random() > 0.15
      const expCats = expenseCategories.slice(0, 6)
      const cat = isExpense
        ? expCats[Math.floor(Math.random() * expCats.length)]
        : incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
      
      const amount = isExpense
        ? Math.round((Math.random() * 3000 + 100) * 100) / 100
        : Math.round((Math.random() * 10000 + 2000) * 100) / 100

      const descriptions: Record<string, string[]> = {
        'Продукты': ['Перекрёсток', 'Пятёрочка', 'Вкусвилл', 'Азбука Вкуса'],
        'Кафе и рестораны': ['Старбакс', 'Кофемания', 'Токио-City', 'Додо Пицца'],
        'Транспорт': ['Метро', 'Яндекс Такси', 'Автобус'],
        'Жильё': ['Аренда квартиры', 'Электричество', 'Интернет'],
        'Развлечения': ['Кинотеатр', 'Netflix', 'Steam'],
        'Здоровье': ['Аптека', 'Фитнес', 'Витамины'],
        'Зарплата': ['Зарплата ООО "Компания"'],
        'Фриланс': ['Upwork перевод', 'Fiverr проект'],
        'Инвестиции': ['Дивиденды', 'Проценты по вкладу'],
      }

      const descList = descriptions[cat.name] || ['Расход']
      const desc = Array.isArray(descList) ? descList[Math.floor(Math.random() * descList.length)] : descList

      await db.transaction.create({
        data: {
          userId: USER_ID,
          type: isExpense ? 'EXPENSE' : 'INCOME',
          amount,
          categoryId: `cat_${cat.name.toLowerCase().replace(/\s+/g, '_')}`,
          date,
          description: desc as string,
        },
      })
    }
  }

  // Seed diary entries (last 7 days)
  for (let i = 0; i < 7; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const moods = [
      'Сегодня был отличный день! Много успел сделать.',
      'Обычный день, ничего особенного.',
      'Чувствую себя немного уставшим, но продуктивным.',
      'Замечательный день! Провёл время с друзьями.',
      'Был сложный день, но справился.',
      'Новый день — новые возможности!',
      'Отличная тренировка, чувствую прилив энергии.',
      'День полный открытий и новых знаний.',
      'Спокойный день, почитал книгу.',
      'Сделал большой шаг к своей цели.',
      'Провёл время на природе, очень расслабило.',
      'Продуктивный рабочий день.',
      'Встретился со старыми друзьями.',
      'День самопознания и рефлексии.',
    ]

    const titles = [
      'Продуктивный день',
      'Встреча с друзьями',
      'Новая цель',
      'Тренировка',
      'Чтение',
      'Природа',
      'Работа',
      'Отдых',
      null,
    ]

    const tagsOptions = [
      ['работа', 'продуктивность'],
      ['друзья', 'отдых'],
      ['спорт', 'здоровье'],
      ['учёба', 'развитие'],
      ['семья', 'счастье'],
      ['путешествие', 'природа'],
      ['чтение', 'знания'],
      ['медитация', 'спокойствие'],
    ]

    await db.diaryEntry.create({
      data: {
        userId: USER_ID,
        date,
        title: i % 2 === 0 ? titles[i % titles.length] : null,
        content: moods[i],
        mood: Math.floor(Math.random() * 3) + 3,
        tags: JSON.stringify(tagsOptions[i % tagsOptions.length]),
      },
    })
  }

  // Seed meals (last 4 days)
  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']
  const mealNames: Record<string, string[][]> = {
    BREAKFAST: [
      ['Овсянка с ягодами', 'Овсянка', 'Ягоды'],
      ['Яичница с тостами', 'Яйца', 'Хлеб'],
      ['Смузи-боул', 'Банан', 'Молоко'],
      ['Панкейки', 'Мука', 'Сироп'],
      ['Творог с мёдом', 'Творог', 'Мёд'],
      ['Гранола с йогуртом', 'Гранола', 'Йогурт'],
      ['Бутерброды', 'Хлеб', 'Сыр'],
    ],
    LUNCH: [
      ['Куриная грудка с рисом', 'Курица', 'Рис'],
      ['Борщ', 'Свёкла', 'Говядина'],
      ['Паста с соусом', 'Макароны', 'Соус'],
      ['Салат Цезарь', 'Курица', 'Салат'],
      ['Суп-пюре', 'Тыква', 'Сливки'],
      ['Стейк с овощами', 'Говядина', 'Брокколи'],
      ['Гречка с котлетой', 'Гречка', 'Котлета'],
    ],
    DINNER: [
      ['Рыба на гриле', 'Лосось', 'Лимон'],
      ['Овощное рагу', 'Картофель', 'Морковь'],
      ['Куриные наггетсы', 'Курица', 'Панировка'],
      ['Плов', 'Рис', 'Баранина'],
      ['Шашлык', 'Свинина', 'Лук'],
      ['Омлет с овощами', 'Яйца', 'Помидоры'],
      ['Запечённая курица', 'Курица', 'Картофель'],
    ],
    SNACK: [
      ['Фрукты', 'Яблоко', 'Банан'],
      ['Орехи', 'Миндаль', 'Грецкий'],
      ['Протеиновый батончик', 'Протеин', 'Овсянка'],
      ['Йогурт', 'Йогурт', 'Фрукты'],
      ['Сырники', 'Творог', 'Мука'],
    ],
  }

  for (let i = 0; i < 4; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    for (const mealType of mealTypes) {
      if (mealType === 'SNACK' && Math.random() > 0.5) continue
      
      const options = mealNames[mealType]
      const option = options[Math.floor(Math.random() * options.length)]

      await db.meal.create({
        data: {
          userId: USER_ID,
          type: mealType,
          date,
          items: {
            create: option.map((name, idx) => ({
              name,
              kcal: Math.round(Math.random() * 300 + 100),
              protein: Math.round(Math.random() * 30 + 5),
              fat: Math.round(Math.random() * 20 + 2),
              carbs: Math.round(Math.random() * 40 + 10),
            })),
          },
        },
      })
    }
  }

  // Seed water logs (last 7 days)
  for (let i = 0; i < 4; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const numGlasses = Math.floor(Math.random() * 5) + 4
    for (let g = 0; g < numGlasses; g++) {
      await db.waterLog.create({
        data: {
          userId: USER_ID,
          date,
          amountMl: 250,
          createdAt: new Date(date.getTime() + g * 3600000),
        },
      })
    }
  }

  // Seed workouts (last 14 days, every 2-3 days)
  const workoutNames = [
    'Тренировка груди',
    'Тренировка спины',
    'Тренировка ног',
    'Тренировка плеч',
    'Кардио',
    'HIIT',
    'Полное тело',
  ]

  const exerciseLibrary: Record<string, string[]> = {
    'Тренировка груди': ['Жим штанги лёжа', 'Разводка гантелей', 'Жим на наклонной', 'Отжимания'],
    'Тренировка спины': ['Подтягивания', 'Тяга штанги', 'Тяга верхнего блока', 'Гиперэкстензия'],
    'Тренировка ног': ['Приседания', 'Жим ногами', 'Выпады', 'Румынская тяга'],
    'Тренировка плеч': ['Жим гантелей стоя', 'Махи в стороны', 'Тяга к подбородку', 'Жим Арнольда'],
    'Кардио': ['Бег', 'Велотренажёр', 'Эллипс', 'Прыжки на скакалке'],
    'HIIT': ['Бёрпи', 'Прыжки', 'Отжимания', 'Планка'],
    'Полное тело': ['Приседания', 'Отжимания', 'Подтягивания', 'Планка'],
  }

  for (let i = 0; i < 14; i += 2 + (i % 3 === 0 ? 1 : 0)) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const name = workoutNames[Math.floor(Math.random() * workoutNames.length)]
    const exercises = exerciseLibrary[name]

    await db.workout.create({
      data: {
        userId: USER_ID,
        date,
        name,
        durationMin: Math.floor(Math.random() * 45) + 30,
        exercises: {
          create: exercises.map((exName, idx) => ({
            name: exName,
            sets: JSON.stringify(
              Array.from({ length: 3 }, () => ({
                weight: Math.floor(Math.random() * 40 + 10),
                reps: Math.floor(Math.random() * 8 + 6),
                completed: true,
              }))
            ),
            order: idx,
          })),
        },
      },
    })
  }

  // Seed collections
  const books = [
    { title: 'Атомные привычки', author: 'Джеймс Клир', status: 'COMPLETED', rating: 5 },
    { title: 'Думай медленно, решай быстро', author: 'Даниэль Канеман', status: 'IN_PROGRESS', rating: 4 },
    { title: 'Sapiens', author: 'Юваль Ной Харари', status: 'COMPLETED', rating: 5 },
    { title: 'Код да Винчи', author: 'Дэн Браун', status: 'COMPLETED', rating: 3 },
    { title: 'Мастер и Маргарита', author: 'Михаил Булгаков', status: 'IN_PROGRESS', rating: 5 },
    { title: '1984', author: 'Джордж Оруэлл', status: 'WANT', rating: null },
    { title: 'СовременныйJavaScript', author: 'Кайл Симпсон', status: 'IN_PROGRESS', rating: 4 },
  ]

  const movies = [
    { title: 'Начало', author: 'Кристофер Нолан', status: 'COMPLETED', rating: 5 },
    { title: 'Интерстеллар', author: 'Кристофер Нолан', status: 'COMPLETED', rating: 5 },
    { title: 'Матрица', author: 'Лана и Лилли Вачовски', status: 'COMPLETED', rating: 5 },
    { title: 'Оппенгеймер', author: 'Кристофер Нолан', status: 'WANT', rating: null },
    { title: 'Дюна 2', author: 'Дени Вильнёв', status: 'COMPLETED', rating: 4 },
    { title: 'Побег из Шоушенка', author: 'Фрэнк Дарабонт', status: 'COMPLETED', rating: 5 },
  ]

  const recipes = [
    { title: 'Паста Карбонара', author: 'Итальянская кухня', status: 'COMPLETED', rating: 5 },
    { title: 'Борщ', author: 'Русская кухня', status: 'COMPLETED', rating: 4 },
    { title: 'Том Ям', author: 'Тайская кухня', status: 'IN_PROGRESS', rating: null },
    { title: 'Суши', author: 'Японская кухня', status: 'WANT', rating: null },
    { title: 'Тирамису', author: 'Итальянская кухня', status: 'COMPLETED', rating: 5 },
  ]

  const supplements = [
    { title: 'Витамин D3', author: null, status: 'COMPLETED', rating: null },
    { title: 'Омега-3', author: null, status: 'COMPLETED', rating: null },
    { title: 'Магний', author: null, status: 'IN_PROGRESS', rating: null },
    { title: 'Протеин сывороточный', author: 'Optimum Nutrition', status: 'COMPLETED', rating: 4 },
    { title: 'Креатин', author: 'MyProtein', status: 'WANT', rating: null },
  ]

  for (const book of books) {
    await db.collectionItem.create({
      data: { userId: USER_ID, type: 'BOOK', ...book, tags: JSON.stringify(['чтение']) },
    })
  }
  for (const movie of movies) {
    await db.collectionItem.create({
      data: { userId: USER_ID, type: 'MOVIE', ...movie, tags: JSON.stringify(['кино']) },
    })
  }
  for (const recipe of recipes) {
    await db.collectionItem.create({
      data: { userId: USER_ID, type: 'RECIPE', ...recipe, tags: JSON.stringify(['готовка']) },
    })
  }
  for (const sup of supplements) {
    await db.collectionItem.create({
      data: { userId: USER_ID, type: 'SUPPLEMENT', ...sup, tags: JSON.stringify(['здоровье']) },
    })
  }

  // Seed feed posts (likes/comments only from the demo user to avoid FK issues)
  const postCaptions = [
    'Отличный день для тренировки! 💪',
    'Новый личный рекорд!',
    'Вкусный обед 😋',
    'Хорошая книга для выходных 📚',
    'Продуктивный день в офисе',
    'Утренняя пробежка 🏃',
    'Новый рецепт освоен 🍳',
    'Цель достигнута 🎯',
  ]

  // Get existing entities for linking
  const allDiaryEntries = await db.diaryEntry.findMany({ take: 8 })
  const allWorkouts = await db.workout.findMany({ take: 8 })
  const allMeals = await db.meal.findMany({ take: 8 })
  const allCollections = await db.collectionItem.findMany({ take: 8 })

  for (let i = 0; i < 8; i++) {
    const entityTypes = ['diary', 'workout', 'meal', 'collection'] as const
    const entityType = entityTypes[i % entityTypes.length]

    let entityId = ''
    switch (entityType) {
      case 'diary': entityId = allDiaryEntries[i % allDiaryEntries.length]?.id || ''; break
      case 'workout': entityId = allWorkouts[i % allWorkouts.length]?.id || ''; break
      case 'meal': entityId = allMeals[i % allMeals.length]?.id || ''; break
      case 'collection': entityId = allCollections[i % allCollections.length]?.id || ''; break
    }

    if (!entityId) continue

    const postDate = new Date(now)
    postDate.setDate(postDate.getDate() - i * 2)
    postDate.setHours(Math.floor(Math.random() * 12) + 8)

    await db.post.create({
      data: {
        userId: USER_ID,
        entityType,
        entityId,
        caption: postCaptions[i],
        createdAt: postDate,
      },
    })
  }

  console.log('✅ Database seeded successfully!')
}

export async function seedHabits() {
  console.log('🌱 Seeding habits...')

  const habitData = [
    { name: 'Утренняя зарядка', emoji: '✅', color: '#10b981', frequency: 'daily', targetCount: 1 },
    { name: 'Чтение 30 минут', emoji: '📚', color: '#3b82f6', frequency: 'daily', targetCount: 1 },
    { name: '8 стаканов воды', emoji: '💧', color: '#06b6d4', frequency: 'daily', targetCount: 1 },
    { name: 'Медитация', emoji: '🧘‍♂️', color: '#8b5cf6', frequency: 'daily', targetCount: 1 },
    { name: 'Бег 5 км', emoji: '🏃‍♂️', color: '#f97316', frequency: 'weekly', targetCount: 1 },
  ]

  const now = new Date()

  for (const h of habitData) {
    // Create habit
    const habit = await db.habit.create({
      data: {
        userId: USER_ID,
        name: h.name,
        emoji: h.emoji,
        color: h.color,
        frequency: h.frequency,
        targetCount: h.targetCount,
      },
    })

    // Generate 14 days of logs with ~80% completion rate
    for (let i = 0; i < 14; i++) {
      // Skip today for weekly habits randomly
      if (h.frequency === 'weekly' && Math.random() > 0.3) continue
      // 80% completion
      if (Math.random() > 0.8) continue

      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(8, 0, 0, 0)

      try {
        await db.habitLog.create({
          data: {
            habitId: habit.id,
            date,
            count: 1,
          },
        })
      } catch {
        // Unique constraint violation — skip duplicate dates
      }
    }
  }

  console.log('✅ Habits seeded successfully!')
}
