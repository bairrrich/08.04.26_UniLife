// ─── Collections Constants ────────────────────────────────────────────────────

import type { CollectionType } from './types'
import {
  BookOpen,
  Film,
  Sparkles,
  Tv,
  Music,
  ChefHat,
  Pill,
  ShoppingBag,
  MapPin,
} from 'lucide-react'

// ─── Labels ──────────────────────────────────────────────────────────────────

export const TYPE_LABELS: Record<CollectionType, string> = {
  BOOK: 'Книги',
  MOVIE: 'Фильмы',
  ANIME: 'Аниме',
  SERIES: 'Сериалы',
  MUSIC: 'Музыка',
  RECIPE: 'Рецепты',
  SUPPLEMENT: 'БАДы',
  PRODUCT: 'Продукты',
  PLACE: 'Места',
}

// ─── Type Emojis ────────────────────────────────────────────────────────────────

export const TYPE_EMOJIS: Record<CollectionType, string> = {
  BOOK: '📚',
  MOVIE: '🎬',
  ANIME: '🎌',
  SERIES: '📺',
  MUSIC: '🎵',
  RECIPE: '🍳',
  SUPPLEMENT: '💊',
  PRODUCT: '🛒',
  PLACE: '📍',
}

// ─── Type Icons ───────────────────────────────────────────────────────────────

export const TYPE_ICONS: Record<CollectionType, React.ReactNode> = {
  BOOK: <BookOpen className="h-4 w-4" />,
  MOVIE: <Film className="h-4 w-4" />,
  ANIME: <Sparkles className="h-4 w-4" />,
  SERIES: <Tv className="h-4 w-4" />,
  MUSIC: <Music className="h-4 w-4" />,
  RECIPE: <ChefHat className="h-4 w-4" />,
  SUPPLEMENT: <Pill className="h-4 w-4" />,
  PRODUCT: <ShoppingBag className="h-4 w-4" />,
  PLACE: <MapPin className="h-4 w-4" />,
}

export const TYPE_ICONS_LARGE: Record<CollectionType, React.ReactNode> = {
  BOOK: <BookOpen className="h-8 w-8" />,
  MOVIE: <Film className="h-8 w-8" />,
  ANIME: <Sparkles className="h-8 w-8" />,
  SERIES: <Tv className="h-8 w-8" />,
  MUSIC: <Music className="h-8 w-8" />,
  RECIPE: <ChefHat className="h-8 w-8" />,
  SUPPLEMENT: <Pill className="h-8 w-8" />,
  PRODUCT: <ShoppingBag className="h-8 w-8" />,
  PLACE: <MapPin className="h-8 w-8" />,
}

// ─── Type Colors ──────────────────────────────────────────────────────────────

export const TYPE_COLORS: Record<CollectionType, string> = {
  BOOK: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
  MOVIE: 'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300',
  ANIME: 'bg-pink-50 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300',
  SERIES: 'bg-sky-50 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300',
  MUSIC: 'bg-violet-50 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
  RECIPE: 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300',
  SUPPLEMENT: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-300',
  PRODUCT: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
  PLACE: 'bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300',
}

export const TYPE_ICON_BG: Record<CollectionType, string> = {
  BOOK: 'bg-amber-500',
  MOVIE: 'bg-purple-500',
  ANIME: 'bg-pink-500',
  SERIES: 'bg-sky-500',
  MUSIC: 'bg-violet-500',
  RECIPE: 'bg-rose-500',
  SUPPLEMENT: 'bg-cyan-500',
  PRODUCT: 'bg-emerald-500',
  PLACE: 'bg-orange-500',
}

export const TYPE_ICON_BG_LIGHT: Record<CollectionType, string> = {
  BOOK: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  MOVIE: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  ANIME: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  SERIES: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
  MUSIC: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  RECIPE: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  SUPPLEMENT: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  PRODUCT: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  PLACE: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
}

// ─── Author Label per Type ────────────────────────────────────────────────────

export const TYPE_AUTHOR_LABEL: Record<CollectionType, string> = {
  BOOK: 'Автор',
  MOVIE: 'Режиссёр',
  ANIME: 'Студия',
  SERIES: 'Создатель',
  MUSIC: 'Исполнитель',
  RECIPE: 'Источник',
  SUPPLEMENT: 'Бренд',
  PRODUCT: 'Бренд',
  PLACE: '',
}

// ─── Type-specific field definitions ──────────────────────────────────────────

export interface FieldDefinition {
  key: string
  label: string
  type: 'text' | 'number' | 'select'
  placeholder: string
  options?: string[]
}

export const TYPE_FIELD_DEFINITIONS: Record<CollectionType, FieldDefinition[]> = {
  BOOK: [
    { key: 'genre', label: 'Жанр', type: 'text', placeholder: 'Фантастика, детектив...' },
    { key: 'pages', label: 'Страницы', type: 'number', placeholder: '320' },
    { key: 'year', label: 'Год издания', type: 'number', placeholder: '2024' },
    { key: 'language', label: 'Язык', type: 'text', placeholder: 'Русский, English...' },
  ],
  MOVIE: [
    { key: 'director', label: 'Режиссёр', type: 'text', placeholder: 'Кристофер Нолан' },
    { key: 'genre', label: 'Жанр', type: 'text', placeholder: 'Боевик, драма...' },
    { key: 'year', label: 'Год', type: 'number', placeholder: '2024' },
    { key: 'durationMin', label: 'Длительность (мин)', type: 'number', placeholder: '120' },
    { key: 'platform', label: 'Платформа', type: 'text', placeholder: 'Netflix, Кинопоиск...' },
  ],
  ANIME: [
    { key: 'genre', label: 'Жанр', type: 'text', placeholder: 'Сёнэн, романтика...' },
    { key: 'episodes', label: 'Серий', type: 'number', placeholder: '24' },
    { key: 'studio', label: 'Студия', type: 'text', placeholder: 'MAPPA, Ufotable...' },
    { key: 'year', label: 'Год', type: 'number', placeholder: '2024' },
  ],
  SERIES: [
    { key: 'genre', label: 'Жанр', type: 'text', placeholder: 'Драма, комедия...' },
    { key: 'seasons', label: 'Сезонов', type: 'number', placeholder: '3' },
    { key: 'episodes', label: 'Серий', type: 'number', placeholder: '30' },
    { key: 'platform', label: 'Платформа', type: 'text', placeholder: 'Netflix, Кинопоиск...' },
    { key: 'year', label: 'Год', type: 'number', placeholder: '2024' },
  ],
  MUSIC: [
    { key: 'artist', label: 'Исполнитель', type: 'text', placeholder: 'Imagine Dragons' },
    { key: 'album', label: 'Альбом', type: 'text', placeholder: 'Night Visions' },
    { key: 'genre', label: 'Жанр', type: 'text', placeholder: 'Рок, поп...' },
    { key: 'year', label: 'Год', type: 'number', placeholder: '2024' },
  ],
  RECIPE: [
    { key: 'servings', label: 'Порций', type: 'number', placeholder: '4' },
    { key: 'cookTimeMin', label: 'Время готовки (мин)', type: 'number', placeholder: '30' },
    { key: 'difficulty', label: 'Сложность', type: 'select', placeholder: '', options: ['Легко', 'Средне', 'Сложно'] },
    { key: 'calories', label: 'Калорий/порция', type: 'number', placeholder: '350' },
    { key: 'ingredients', label: 'Ингредиенты', type: 'text', placeholder: 'Мука, яйца, молоко...' },
  ],
  SUPPLEMENT: [
    { key: 'brand', label: 'Бренд', type: 'text', placeholder: 'Solgar, Now Foods...' },
    { key: 'dosage', label: 'Дозировка', type: 'text', placeholder: '1000 мг' },
    { key: 'frequency', label: 'Частота приёма', type: 'text', placeholder: '1 раз в день' },
    { key: 'courseDays', label: 'Курс (дней)', type: 'number', placeholder: '30' },
    { key: 'purpose', label: 'Назначение', type: 'text', placeholder: 'Витамин D, Омега-3...' },
  ],
  PRODUCT: [
    { key: 'brand', label: 'Бренд', type: 'text', placeholder: 'Apple, Samsung...' },
    { key: 'price', label: 'Цена (₽)', type: 'number', placeholder: '5990' },
    { key: 'store', label: 'Магазин', type: 'text', placeholder: 'Ozon, Wildberries...' },
    { key: 'category', label: 'Категория', type: 'text', placeholder: 'Электроника, одежда...' },
    { key: 'url', label: 'Ссылка', type: 'text', placeholder: 'https://...' },
  ],
  PLACE: [
    { key: 'address', label: 'Адрес', type: 'text', placeholder: 'ул. Пушкина, д. 1' },
    { key: 'category', label: 'Тип места', type: 'text', placeholder: 'Ресторан, парк, музей...' },
    { key: 'url', label: 'Ссылка', type: 'text', placeholder: 'https://...' },
  ],
}

// ─── Cover Gradients ──────────────────────────────────────────────────────────

const COVER_COLORS: string[] = [
  'from-rose-400 to-pink-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-purple-400 to-violet-500',
  'from-cyan-400 to-sky-500',
  'from-fuchsia-400 to-pink-500',
  'from-lime-400 to-green-500',
]

export function getCoverGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function parseTags(tagsStr: string): string[] {
  try {
    return JSON.parse(tagsStr)
  } catch {
    return []
  }
}

const GENITIVE_MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

export function formatDateRussian(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = GENITIVE_MONTHS[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

export function formatDaysAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return 'Добавлено сегодня'
  if (diffDays === 1) return 'Добавлено вчера'
  if (diffDays < 5) {
    return `Добавлено ${diffDays} дня назад`
  }
  if (diffDays < 21) {
    const lastDigit = diffDays % 10
    const lastTwo = diffDays % 100
    if (lastTwo >= 11 && lastTwo <= 19) return `Добавлено ${diffDays} дней назад`
    if (lastDigit === 1) return `Добавлено ${diffDays} день назад`
    if (lastDigit >= 2 && lastDigit <= 4) return `Добавлено ${diffDays} дня назад`
    return `Добавлено ${diffDays} дней назад`
  }
  if (diffDays < 30) {
    return `Добавлено ${diffDays} дней назад`
  }
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return 'Добавлено 1 месяц назад'
  if (diffMonths < 5) return `Добавлено ${diffMonths} месяца назад`
  return `Добавлено ${diffMonths} месяцев назад`
}

// ─── Detail display helpers ───────────────────────────────────────────────────

export function getDetailDisplayLabel(key: string): string {
  const labels: Record<string, string> = {
    genre: 'Жанр',
    pages: 'Страницы',
    year: 'Год',
    language: 'Язык',
    director: 'Режиссёр',
    durationMin: 'Длительность',
    platform: 'Платформа',
    episodes: 'Серий',
    studio: 'Студия',
    seasons: 'Сезонов',
    artist: 'Исполнитель',
    album: 'Альбом',
    servings: 'Порций',
    cookTimeMin: 'Время готовки',
    difficulty: 'Сложность',
    calories: 'Калории',
    ingredients: 'Ингредиенты',
    brand: 'Бренд',
    dosage: 'Дозировка',
    frequency: 'Частота',
    courseDays: 'Курс',
    purpose: 'Назначение',
    price: 'Цена',
    store: 'Магазин',
    category: 'Категория',
    url: 'Ссылка',
    address: 'Адрес',
  }
  return labels[key] || key
}

export function formatDetailValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return ''
  switch (key) {
    case 'durationMin':
      return `${value} мин`
    case 'cookTimeMin':
      return `${value} мин`
    case 'calories':
      return `${value} ккал`
    case 'courseDays':
      return `${value} дн.`
    case 'pages':
      return `${value} стр.`
    case 'episodes':
      return `${value} серий`
    case 'seasons':
      return `${value} сезон(ов)`
    case 'servings':
      return `${value} порц.`
    case 'price':
      return `${Number(value).toLocaleString('ru-RU')} ₽`
    case 'difficulty':
    case 'genre':
    case 'language':
    case 'platform':
    case 'studio':
    case 'artist':
    case 'album':
    case 'ingredients':
    case 'brand':
    case 'dosage':
    case 'frequency':
    case 'purpose':
    case 'store':
    case 'category':
    case 'address':
    case 'director':
    case 'url':
      return String(value)
    default:
      return String(value)
  }
}

// ─── Sort options ─────────────────────────────────────────────────────────────

export const SORT_OPTIONS = [
  { value: 'date', label: 'По дате добавления' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'name', label: 'По названию' },
  { value: 'type', label: 'По типу' },
] as const

export type SortOption = (typeof SORT_OPTIONS)[number]['value']

// ─── Quick add templates ─────────────────────────────────────────────────────

export const QUICK_ADD_TEMPLATES: { type: CollectionType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'BOOK', label: 'Книгу', icon: <BookOpen className="h-3.5 w-3.5" />, color: 'bg-amber-500 hover:bg-amber-600 text-white' },
  { type: 'MOVIE', label: 'Фильм', icon: <Film className="h-3.5 w-3.5" />, color: 'bg-purple-500 hover:bg-purple-600 text-white' },
  { type: 'ANIME', label: 'Аниме', icon: <Sparkles className="h-3.5 w-3.5" />, color: 'bg-pink-500 hover:bg-pink-600 text-white' },
  { type: 'SERIES', label: 'Сериал', icon: <Tv className="h-3.5 w-3.5" />, color: 'bg-sky-500 hover:bg-sky-600 text-white' },
  { type: 'MUSIC', label: 'Музыку', icon: <Music className="h-3.5 w-3.5" />, color: 'bg-violet-500 hover:bg-violet-600 text-white' },
  { type: 'RECIPE', label: 'Рецепт', icon: <ChefHat className="h-3.5 w-3.5" />, color: 'bg-rose-500 hover:bg-rose-600 text-white' },
  { type: 'SUPPLEMENT', label: 'БАД', icon: <Pill className="h-3.5 w-3.5" />, color: 'bg-cyan-500 hover:bg-cyan-600 text-white' },
  { type: 'PRODUCT', label: 'Продукт', icon: <ShoppingBag className="h-3.5 w-3.5" />, color: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
  { type: 'PLACE', label: 'Место', icon: <MapPin className="h-3.5 w-3.5" />, color: 'bg-orange-500 hover:bg-orange-600 text-white' },
]
