import {
  Coffee,
  UtensilsCrossed,
  Car,
  TrainFront,
  ShoppingBag,
  Home,
  Heart,
  Gamepad2,
  GraduationCap,
  Plane,
  Zap,
  Gift,
  MoreHorizontal,
  DollarSign,
  Briefcase,
  CreditCard,
  Cookie,
  ArrowRightLeft,
  Wallet,
  Landmark,
  PiggyBank,
  TrendingUp,
  Bitcoin,
  BarChart3,
  Gem,
  Banknote,
} from 'lucide-react'

// ─── Category Icon Map ──────────────────────────────────────────────────────

export const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  coffee: <Coffee className="h-4 w-4" />,
  food: <UtensilsCrossed className="h-4 w-4" />,
  taxi: <Car className="h-4 w-4" />,
  transport: <TrainFront className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  home: <Home className="h-4 w-4" />,
  health: <Heart className="h-4 w-4" />,
  entertainment: <Gamepad2 className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  travel: <Plane className="h-4 w-4" />,
  utilities: <Zap className="h-4 w-4" />,
  gifts: <Gift className="h-4 w-4" />,
  salary: <DollarSign className="h-4 w-4" />,
  freelance: <Briefcase className="h-4 w-4" />,
  'arrow-right-left': <ArrowRightLeft className="h-4 w-4" />,
  circle: <MoreHorizontal className="h-4 w-4" />,
}

export function getCategoryIcon(iconStr: string): React.ReactNode {
  return CATEGORY_ICON_MAP[iconStr] || <MoreHorizontal className="h-4 w-4" />
}

// ─── Account Icon Map ──────────────────────────────────────────────────────

export const ACCOUNT_ICON_MAP: Record<string, React.ReactNode> = {
  wallet: <Wallet className="h-4 w-4" />,
  bank: <Landmark className="h-4 w-4" />,
  piggy: <PiggyBank className="h-4 w-4" />,
  trending: <TrendingUp className="h-4 w-4" />,
  bitcoin: <Bitcoin className="h-4 w-4" />,
  cash: <Banknote className="h-4 w-4" />,
  chart: <BarChart3 className="h-4 w-4" />,
  gem: <Gem className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
}

export function getAccountIcon(iconStr: string): React.ReactNode {
  return ACCOUNT_ICON_MAP[iconStr] || <Wallet className="h-4 w-4" />
}

// ─── Account Type Labels ───────────────────────────────────────────────────

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CASH: 'Наличные',
  BANK: 'Банк',
  SAVINGS: 'Накопления',
  INVESTMENT: 'Инвестиции',
  CRYPTO: 'Крипто',
}

// ─── Investment Type Labels & Icons ────────────────────────────────────────

export const INVESTMENT_TYPE_LABELS: Record<string, string> = {
  STOCK: 'Акции',
  BOND: 'Облигации',
  FUND: 'ПИФ/Фонд',
  CRYPTO: 'Крипто',
  DEPOSIT: 'Вклад',
  METAL: 'Драгметаллы',
  OTHER: 'Другое',
}

export const INVESTMENT_TX_TYPE_LABELS: Record<string, string> = {
  BUY: 'Покупка',
  SELL: 'Продажа',
  DEPOSIT: 'Пополнение',
  WITHDRAWAL: 'Вывод',
  DIVIDEND: 'Дивиденды',
}

export const INVESTMENT_TX_TYPE_COLORS: Record<string, string> = {
  BUY: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10',
  SELL: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10',
  DEPOSIT: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10',
  WITHDRAWAL: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10',
  DIVIDEND: 'text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-500/10',
}

// ─── Quick Expense Presets ──────────────────────────────────────────────────

export const QUICK_EXPENSES = [
  { label: 'Кофе', amount: 200, icon: <Coffee className="h-3.5 w-3.5" /> },
  { label: 'Обед', amount: 500, icon: <UtensilsCrossed className="h-3.5 w-3.5" /> },
  { label: 'Такси', amount: 300, icon: <Car className="h-3.5 w-3.5" /> },
  { label: 'Проезд', amount: 50, icon: <TrainFront className="h-3.5 w-3.5" /> },
  { label: 'Подписка', amount: 500, icon: <CreditCard className="h-3.5 w-3.5" /> },
  { label: 'Снек', amount: 150, icon: <Cookie className="h-3.5 w-3.5" /> },
]

// ─── Chart Config ───────────────────────────────────────────────────────────

export const chartConfig = {
  expense: { label: 'Расходы', color: '#ef4444' },
  income: { label: 'Доходы', color: '#10b981' },
  transfer: { label: 'Переводы', color: '#8b5cf6' },
}
