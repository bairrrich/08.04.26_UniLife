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
  circle: <MoreHorizontal className="h-4 w-4" />,
}

export function getCategoryIcon(iconStr: string): React.ReactNode {
  return CATEGORY_ICON_MAP[iconStr] || <MoreHorizontal className="h-4 w-4" />
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
}
