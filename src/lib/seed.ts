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

  const transferCategories = [
    { name: 'Перевод', icon: 'arrow-right-left', color: '#8b5cf6', type: 'TRANSFER' },
  ]

  for (const cat of [...expenseCategories, ...incomeCategories, ...transferCategories]) {
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

  // Seed accounts
  const accountData = [
    { id: 'acc_cash', name: 'Наличные', type: 'CASH', icon: 'wallet', color: '#10b981', balance: 5420, isDefault: true },
    { id: 'acc_sber', name: 'Сбербанк', type: 'BANK', icon: 'credit-card', color: '#21a038', balance: 85300 },
    { id: 'acc_tinkoff', name: 'Тинькофф', type: 'BANK', icon: 'landmark', color: '#ffdd2d', balance: 142700 },
    { id: 'acc_savings', name: 'Накопления', type: 'SAVINGS', icon: 'piggy-bank', color: '#6366f1', balance: 300000 },
  ]

  for (const acc of accountData) {
    await db.account.upsert({
      where: { id: acc.id },
      update: {},
      create: { ...acc, userId: USER_ID, currency: 'RUB' },
    })
  }

  // Seed investments
  const investmentData = [
    { name: 'Индексный фонд', type: 'FUND', icon: 'bar-chart-2', color: '#10b981', targetAmount: 500000, description: 'Индекс Мосбиржи (IMOEX)' },
    { name: 'Вклад Сбербанк', type: 'DEPOSIT', icon: 'landmark', color: '#21a038', targetAmount: 200000, description: 'Вклад на 12 месяцев, 18% годовых' },
    { name: 'ОФЗ 26234', type: 'BOND', icon: 'file-text', color: '#6366f1', targetAmount: 100000, description: 'ОФЗ с постоянным доходом' },
  ]

  const createdInvestments: { id: string }[] = []
  for (const inv of investmentData) {
    const created = await db.investment.create({
      data: { userId: USER_ID, ...inv },
    })
    createdInvestments.push(created)
  }

  // Seed investment transactions
  const investmentTxData: { investmentId: string; type: string; amount: number; units: number | null; pricePerUnit: number | null; daysAgo: number; note: string | null }[] = [
    { investmentId: createdInvestments[0].id, type: 'BUY', amount: 15000, units: 3.5, pricePerUnit: 4285.71, daysAgo: 30, note: 'Покупка индексного фонда' },
    { investmentId: createdInvestments[0].id, type: 'BUY', amount: 10000, units: 2.3, pricePerUnit: 4347.83, daysAgo: 15, note: 'Докупка' },
    { investmentId: createdInvestments[0].id, type: 'DIVIDEND', amount: 1200, units: null, pricePerUnit: null, daysAgo: 5, note: 'Дивиденды' },
    { investmentId: createdInvestments[1].id, type: 'DEPOSIT', amount: 100000, units: null, pricePerUnit: null, daysAgo: 60, note: 'Открытие вклада' },
    { investmentId: createdInvestments[1].id, type: 'WITHDRAWAL', amount: 2000, units: null, pricePerUnit: null, daysAgo: 30, note: 'Частичное снятие процентов' },
    { investmentId: createdInvestments[2].id, type: 'BUY', amount: 50000, units: 50, pricePerUnit: 1000, daysAgo: 20, note: 'Покупка ОФЗ' },
    { investmentId: createdInvestments[2].id, type: 'BUY', amount: 30000, units: 30, pricePerUnit: 1000, daysAgo: 10, note: 'Докупка ОФЗ' },
  ]

  for (const itx of investmentTxData) {
    const txDate = new Date(now)
    txDate.setDate(txDate.getDate() - itx.daysAgo)
    await db.investmentTx.create({
      data: {
        investmentId: itx.investmentId,
        type: itx.type,
        amount: itx.amount,
        units: itx.units,
        pricePerUnit: itx.pricePerUnit,
        date: txDate,
        note: itx.note,
      },
    })
  }

  // Seed transfer transactions
  const transferTxData = [
    { amount: 5000, daysAgo: 7, description: 'Перевод на карту Сбербанк', fromAccountId: 'acc_cash', toAccountId: 'acc_sber' },
    { amount: 10000, daysAgo: 3, description: 'Пополнение накоплений', fromAccountId: 'acc_tinkoff', toAccountId: 'acc_savings' },
    { amount: 3000, daysAgo: 1, description: 'Снятие наличных', fromAccountId: 'acc_sber', toAccountId: 'acc_cash' },
  ]

  for (const ttx of transferTxData) {
    const txDate = new Date(now)
    txDate.setDate(txDate.getDate() - ttx.daysAgo)
    await db.transaction.create({
      data: {
        userId: USER_ID,
        type: 'TRANSFER',
        amount: ttx.amount,
        categoryId: 'cat_перевод',
        date: txDate,
        description: ttx.description,
        fromAccountId: ttx.fromAccountId,
        toAccountId: ttx.toAccountId,
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
    { title: 'Атомные привычки', author: 'Джеймс Клир', rating: 5, details: JSON.stringify({ genre: 'Саморазвитие', pages: 320, year: 2018, language: 'Русский' }) },
    { title: 'Думай медленно, решай быстро', author: 'Даниэль Канеман', rating: 4, details: JSON.stringify({ genre: 'Психология', pages: 499, year: 2011, language: 'Русский' }) },
    { title: 'Sapiens', author: 'Юваль Ной Харари', rating: 5, details: JSON.stringify({ genre: 'Наука', pages: 464, year: 2015, language: 'Русский' }) },
    { title: 'Код да Винчи', author: 'Дэн Браун', rating: 3, details: JSON.stringify({ genre: 'Детектив', pages: 597, year: 2003, language: 'Русский' }) },
    { title: 'Мастер и Маргарита', author: 'Михаил Булгаков', rating: 5, details: JSON.stringify({ genre: 'Классика', pages: 480, year: 1967, language: 'Русский' }) },
    { title: '1984', author: 'Джордж Оруэлл', rating: null, details: JSON.stringify({ genre: 'Антиутопия', pages: 328, year: 1949, language: 'Русский' }) },
    { title: 'СовременныйJavaScript', author: 'Кайл Симпсон', rating: 4, details: JSON.stringify({ genre: 'Программирование', pages: 278, year: 2015, language: 'English' }) },
  ]

  const movies = [
    { title: 'Начало', author: 'Кристофер Нолан', rating: 5, details: JSON.stringify({ genre: 'Фантастика', year: 2010, durationMin: 148, platform: 'Кинопоиск' }) },
    { title: 'Интерстеллар', author: 'Кристофер Нолан', rating: 5, details: JSON.stringify({ genre: 'Фантастика', year: 2014, durationMin: 169, platform: 'Кинопоиск' }) },
    { title: 'Матрица', author: 'Лана и Лилли Вачовски', rating: 5, details: JSON.stringify({ genre: 'Фантастика', year: 1999, durationMin: 136, platform: 'Кинопоиск' }) },
    { title: 'Оппенгеймер', author: 'Кристофер Нолан', rating: null, details: JSON.stringify({ genre: 'Драма', year: 2023, durationMin: 180, platform: 'Кинопоиск' }) },
    { title: 'Дюна 2', author: 'Дени Вильнёв', rating: 4, details: JSON.stringify({ genre: 'Фантастика', year: 2024, durationMin: 166, platform: 'Кинопоиск' }) },
    { title: 'Побег из Шоушенка', author: 'Фрэнк Дарабонт', rating: 5, details: JSON.stringify({ genre: 'Драма', year: 1994, durationMin: 142, platform: 'Кинопоиск' }) },
  ]

  const recipes = [
    { title: 'Паста Карбонара', author: 'Итальянская кухня', rating: 5, details: JSON.stringify({ servings: 4, cookTimeMin: 25, difficulty: 'Средне', calories: 480, ingredients: 'Спагетти, бекон, яйца, пармезан, чёрный перец' }) },
    { title: 'Борщ', author: 'Русская кухня', rating: 4, details: JSON.stringify({ servings: 6, cookTimeMin: 90, difficulty: 'Средне', calories: 350, ingredients: 'Свёкла, капуста, картофель, говядина, морковь' }) },
    { title: 'Том Ям', author: 'Тайская кухня', rating: null, details: JSON.stringify({ servings: 3, cookTimeMin: 30, difficulty: 'Сложно', calories: 220, ingredients: 'Креветки, грибы, лемонграсс, кокосовое молоко' }) },
    { title: 'Суши', author: 'Японская кухня', rating: null, details: JSON.stringify({ servings: 4, cookTimeMin: 60, difficulty: 'Сложно', calories: 300, ingredients: 'Рис, нори, лосось, авокадо, огурец' }) },
    { title: 'Тирамису', author: 'Итальянская кухня', rating: 5, details: JSON.stringify({ servings: 8, cookTimeMin: 40, difficulty: 'Средне', calories: 380, ingredients: 'Маскарпоне, савоярди, кофе, какао' }) },
  ]

  const supplements = [
    { title: 'Витамин D3', author: 'Solgar', rating: null, details: JSON.stringify({ brand: 'Solgar', dosage: '2000 МЕ', frequency: '1 раз в день', courseDays: 90, purpose: 'Иммунитет, кости' }) },
    { title: 'Омега-3', author: 'Now Foods', rating: null, details: JSON.stringify({ brand: 'Now Foods', dosage: '1000 мг', frequency: '2 раза в день', courseDays: 60, purpose: 'Сердце, мозг' }) },
    { title: 'Магний', author: 'Doctor\'s Best', rating: null, details: JSON.stringify({ brand: "Doctor's Best", dosage: '400 мг', frequency: '1 раз в день', courseDays: 30, purpose: 'Нервная система, мышцы' }) },
    { title: 'Протеин сывороточный', author: 'Optimum Nutrition', rating: 4, details: JSON.stringify({ brand: 'Optimum Nutrition', dosage: '30 г', frequency: 'После тренировки', courseDays: 0, purpose: 'Восстановление, рост мышц' }) },
    { title: 'Креатин', author: 'MyProtein', rating: null, details: JSON.stringify({ brand: 'MyProtein', dosage: '5 г', frequency: 'Ежедневно', courseDays: 60, purpose: 'Сила, выносливость' }) },
  ]

  const anime = [
    { title: 'Магическая битва', author: 'MAPPA', rating: 5, details: JSON.stringify({ genre: 'Сёнэн', episodes: 24, studio: 'MAPPA', year: 2020 }) },
    { title: 'Атака титанов', author: 'WIT Studio / MAPPA', rating: 5, details: JSON.stringify({ genre: 'Экшен', episodes: 87, studio: 'WIT Studio', year: 2013 }) },
    { title: 'Клинок, рассекающий демонов', author: 'ufotable', rating: 4, details: JSON.stringify({ genre: 'Сёнэн', episodes: 44, studio: 'ufotable', year: 2019 }) },
    { title: 'Ванпанчмен', author: 'Madhouse', rating: null, details: JSON.stringify({ genre: 'Комедия', episodes: 12, studio: 'Madhouse', year: 2015 }) },
  ]

  const series = [
    { title: 'Во все тяжкие', author: 'Винс Гиллиган', rating: 5, details: JSON.stringify({ genre: 'Драма', seasons: 5, episodes: 62, platform: 'Netflix', year: 2008 }) },
    { title: 'Очень странные дела', author: 'Братья Даффер', rating: 4, details: JSON.stringify({ genre: 'Фантастика', seasons: 4, episodes: 34, platform: 'Netflix', year: 2016 }) },
    { title: 'Черное зеркало', author: 'Чарли Брукер', rating: 4, details: JSON.stringify({ genre: 'Антиутопия', seasons: 6, episodes: 22, platform: 'Netflix', year: 2011 }) },
    { title: 'Игра престолов', author: 'Дэвид Бениофф', rating: null, details: JSON.stringify({ genre: 'Фэнтези', seasons: 8, episodes: 73, platform: 'HBO', year: 2011 }) },
  ]

  const music = [
    { title: 'Bohemian Rhapsody', author: 'Queen', rating: 5, details: JSON.stringify({ artist: 'Queen', album: 'A Night at the Opera', genre: 'Рок', year: 1975 }) },
    { title: 'Stairway to Heaven', author: 'Led Zeppelin', rating: 5, details: JSON.stringify({ artist: 'Led Zeppelin', album: 'Led Zeppelin IV', genre: 'Рок', year: 1971 }) },
    { title: 'Hotel California', author: 'Eagles', rating: 4, details: JSON.stringify({ artist: 'Eagles', album: 'Hotel California', genre: 'Рок', year: 1977 }) },
    { title: 'Shape of You', author: 'Ed Sheeran', rating: null, details: JSON.stringify({ artist: 'Ed Sheeran', album: '÷ (Divide)', genre: 'Поп', year: 2017 }) },
  ]

  const products = [
    { title: 'MacBook Pro 14"', author: 'Apple', rating: 5, details: JSON.stringify({ brand: 'Apple', price: 249990, store: 'DNS', category: 'Электроника', url: 'https://apple.com' }) },
    { title: 'Sony WH-1000XM5', author: 'Sony', rating: 4, details: JSON.stringify({ brand: 'Sony', price: 29990, store: 'Яндекс Маркет', category: 'Аудио', url: 'https://sony.com' }) },
    { title: 'Kindle Paperwhite', author: 'Amazon', rating: 4, details: JSON.stringify({ brand: 'Amazon', price: 14990, store: 'Ozon', category: 'Электроника', url: 'https://amazon.com' }) },
  ]

  const places = [
    { title: 'Парк Горького', author: null, rating: null, details: JSON.stringify({ address: 'ул. Крымский Вал, 9, Москва', category: 'Парк', url: 'https://park-gorkogo.com' }) },
    { title: 'Третьяковская галерея', author: null, rating: 5, details: JSON.stringify({ address: 'Лаврушинский пер., 10, Москва', category: 'Музей', url: 'https://tretyakovgallery.ru' }) },
    { title: 'Белуга', author: null, rating: 4, details: JSON.stringify({ address: 'ул. Большая Дмитровка, 7/5, стр. 1, Москва', category: 'Ресторан', url: 'https://white-rabbit-cafe.ru' }) },
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
  for (const a of anime) {
    await db.collectionItem.create({
      data: { userId: USER_ID, type: 'ANIME', ...a, tags: JSON.stringify(['аниме']) },
    })
  }
  for (const s of series) {
    await db.collectionItem.create({
      data: { userId: USER_ID, type: 'SERIES', ...s, tags: JSON.stringify(['сериалы']) },
    })
  }
  for (const m of music) {
    await db.collectionItem.create({
      data: { userId: USER_ID, type: 'MUSIC', ...m, tags: JSON.stringify(['музыка']) },
    })
  }
  for (const p of products) {
    await db.collectionItem.create({
      data: { userId: USER_ID, type: 'PRODUCT', ...p, tags: JSON.stringify(['покупки']) },
    })
  }
  for (const pl of places) {
    await db.collectionItem.create({
      data: { userId: USER_ID, type: 'PLACE', ...pl, tags: JSON.stringify(['места']) },
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
