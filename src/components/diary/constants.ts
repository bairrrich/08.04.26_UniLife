export const TAG_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
]

export const QUICK_TEMPLATES = [
  { label: 'Рабочий день', emoji: '💼', content: 'Сегодняшний рабочий день был насыщенным. ' },
  { label: 'Выходной', emoji: '🌴', content: 'Отличный выходной день! ' },
  { label: 'Спорт', emoji: '🏋️', content: 'Сегодня тренировался. ' },
  { label: 'Утренние мысли', emoji: '🌅', title: 'Утренние мысли', content: 'Утро начинается с правильного настроя.\n\n3 вещи, которые я хочу сделать сегодня:\n1. \n2. \n3. \n\nМоё намерение на день: ' },
  { label: 'Вечерний обзор', emoji: '🌙', title: 'Вечерний обзор', content: 'Что сегодня было хорошего?\n\nЧто я сделал(а) сегодня:\n- \n- \n- \n\nЧему я научился(ась)?\n\nЧто можно улучшить завтра? ' },
  { label: 'Благодарности', emoji: '🙏', title: 'Благодарности', content: 'За что я благодарен(на) сегодня:\n\n1. \n2. \n3. \n\nСамый яркий момент дня: ' },
]

/** Hash a string to a stable index for tag color assignment */
export function hashTagColor(tag: string): number {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    const char = tag.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash) % TAG_COLORS.length
}
