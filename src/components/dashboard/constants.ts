// ─── Dashboard Constants ────────────────────────────────────────────────────────

import type { ChartConfig } from '@/components/ui/chart'
import { MOOD_EMOJI, MOOD_LABELS, RU_DAYS_SHORT } from '@/lib/format'

export { MOOD_EMOJI as moodEmojis, MOOD_LABELS as moodLabels, RU_DAYS_SHORT as dayNamesShort }

export const MOTIVATIONAL_QUOTES = [
  { text: 'Каждый день — это новая возможность стать лучше.', author: 'Неизвестный автор' },
  { text: 'Маленькие шаги каждый день приводят к большим результатам.', author: 'Неизвестный автор' },
  { text: 'Дисциплина — это мост между целями и достижениями.', author: 'Джим Рон' },
  { text: 'Успех — это сумма маленьких усилий, повторяемых день за днём.', author: 'Роберт Кольер' },
  { text: 'Не бойся идти медленно, бойся стоять на месте.', author: 'Китайская пословица' },
  { text: 'Лучшее время посадить дерево было 20 лет назад. Следующее лучшее время — сейчас.', author: 'Китайская пословица' },
  { text: 'Единственный способ сделать отличную работу — любить то, что делаешь.', author: 'Стив Джобс' },
  { text: 'Трудности — это не препятствия, а указатели на пути.', author: 'Ральф Уолдо Эмерсон' },
  { text: 'Будь тем изменением, которое хочешь видеть в мире.', author: 'Махатма Ганди' },
  { text: 'Сила не в том, чтобы не падать, а в том, чтобы каждый раз вставать.', author: 'Конфуций' },
  { text: 'Ваше будущее создаётся тем, что вы делаете сегодня, а не завтра.', author: 'Роберт Кийосаки' },
  { text: 'Повседневные привычки — невидимая архитектура счастливой жизни.', author: 'Джеймс Клир' },
]

export const PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-1) / 0.5)',
  'hsl(var(--chart-2) / 0.5)',
  'hsl(var(--chart-3) / 0.5)',
]

export const moodChartConfig: ChartConfig = {
  mood: {
    label: 'Настроение',
    color: 'hsl(var(--chart-1))',
  },
}

export const expensePieConfig: ChartConfig = {
  amount: {
    label: 'Расходы',
    color: 'hsl(var(--chart-1))',
  },
}

export const spendingTrendConfig: ChartConfig = {
  spending: {
    label: 'Расходы',
    color: 'hsl(var(--chart-1))',
  },
}

export const getEntityTypeLabel = (type: string) => {
  switch (type) {
    case 'diary':
      return 'Дневник'
    case 'workout':
      return 'Тренировка'
    case 'meal':
      return 'Питание'
    case 'transaction':
      return 'Финансы'
    default:
      return type
  }
}

export const getEntityBorderColor = (type: string) => {
  switch (type) {
    case 'diary':
      return 'border-l-blue-500'
    case 'workout':
      return 'border-l-orange-500'
    case 'meal':
      return 'border-l-green-500'
    case 'transaction':
      return 'border-l-yellow-500'
    default:
      return 'border-l-pink-500'
  }
}

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
