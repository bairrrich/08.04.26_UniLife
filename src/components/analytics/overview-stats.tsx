import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BookOpen,
  Wallet,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Target,
  Flame,
  Smile,
  Sparkles,
  Minus,
} from 'lucide-react'
import { MOOD_EMOJI, formatCurrency, RU_DAYS_SHORT, toDateStr } from '@/lib/format'
import { SkeletonCard } from './skeleton-components'
import { AnimatedNumber } from '@/components/ui/animated-number'
import type { DiaryEntry, Transaction } from './types'

interface PeriodComparison {
  diaryChange: number | null
  expenseChange: number | null
  workoutChange: number | null
  habitsChange: number | null
}

interface OverviewStatsProps {
  loading: boolean
  diaryCount: number
  avgMood: number
  totalExpenses: number
  totalIncome: number
  savingsRate: number
  workoutCount: number
  totalMinutes: number
  totalHabits: number
  completedHabits: number
  habitsRate: number
  diaryEntries: DiaryEntry[]
  transactions: Transaction[]
  periodComparison?: PeriodComparison
}

// ─── Period Comparison Badge ──────────────────────────────────────────────────

function PeriodChangeBadge({ change, label }: { change: number | null; label: string }) {
  if (change === null) return null
  const isPositive = change > 0
  const isStable = change === 0
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
      isStable
        ? 'bg-slate-50 text-slate-600 dark:bg-slate-950/40 dark:text-slate-400'
        : isPositive
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
          : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
    }`}>
      {isStable ? (
        <Minus className="h-2.5 w-2.5" />
      ) : isPositive ? (
        <TrendingUp className="h-2.5 w-2.5" />
      ) : (
        <TrendingDown className="h-2.5 w-2.5" />
      )}
      {Math.abs(change)}%
    </span>
  )
}

// ─── Sparkline Component ─────────────────────────────────────────────────────

function Sparkline({ data, color, height = 28 }: { data: number[]; color: string; height?: number }) {
  if (data.length === 0) return null
  const max = Math.max(...data, 1)

  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {data.map((value, i) => {
        const barHeight = Math.max(2, (value / max) * 100)
        return (
          <div
            key={i}
            className="sparkline-bar rounded-sm transition-all duration-300"
            style={{
              width: '4px',
              height: `${barHeight}%`,
              backgroundColor: color,
              opacity: 0.5 + (value / max) * 0.5,
            }}
          />
        )
      })}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDiarySparkline(entries: DiaryEntry[]): number[] {
  const now = new Date()
  const counts: number[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const dateStr = toDateStr(d)
    const dayCount = entries.filter((e) => toDateStr(new Date(e.date)) === dateStr).length
    counts.push(dayCount)
  }
  return counts
}

function getFinanceSparkline(transactions: Transaction[]): number[] {
  const now = new Date()
  const amounts: number[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const dateStr = toDateStr(d)
    const dayTotal = transactions
      .filter((t) => t.type === 'EXPENSE' && toDateStr(new Date(t.date)) === dateStr)
      .reduce((s, t) => s + t.amount, 0)
    amounts.push(dayTotal)
  }
  return amounts
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OverviewStats({
  loading,
  diaryCount,
  avgMood,
  totalExpenses,
  totalIncome,
  savingsRate,
  workoutCount,
  totalMinutes,
  totalHabits,
  completedHabits,
  habitsRate,
  diaryEntries,
  transactions,
  periodComparison,
}: OverviewStatsProps) {
  const diarySparkline = getDiarySparkline(diaryEntries)
  const financeSparkline = getFinanceSparkline(transactions)

  return (
    <div className="stagger-children grid grid-cols-2 gap-3 lg:grid-cols-4">
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          {/* Diary Stats */}
          <Card className="card-hover relative overflow-hidden rounded-xl border border-transparent bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 dark:border-emerald-800/30">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-emerald-400 to-teal-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Записи в дневнике
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <PeriodChangeBadge change={periodComparison?.diaryChange ?? null} label="дневник" />
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-end justify-between gap-2">
                <p className="text-xl font-bold tabular-nums"><AnimatedNumber value={diaryCount} /></p>
                <Sparkline data={diarySparkline} color="#10b981" />
              </div>
              <div className="mt-1 flex items-center gap-1">
                <Smile className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Ср. настроение:{' '}
                  <span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                    {avgMood > 0 ? `${avgMood.toFixed(1)} ${MOOD_EMOJI[Math.round(avgMood)] || ''}` : '—'}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Finance Stats */}
          <Card className="card-hover relative overflow-hidden rounded-xl border border-transparent bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 dark:border-amber-800/30">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-amber-400 to-yellow-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Расходы / Доходы
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <PeriodChangeBadge change={periodComparison?.expenseChange ?? null} label="расходы" />
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <Wallet className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-end justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-base font-bold tabular-nums text-red-600 dark:text-red-400">
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>
                <Sparkline data={financeSparkline} color="#f59e0b" />
              </div>
              <div className="mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <p className="text-xs text-muted-foreground">
                  Сбережения:{' '}
                  <span className={`font-medium tabular-nums ${savingsRate >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {savingsRate}%
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Workout Stats */}
          <Card className="card-hover relative overflow-hidden rounded-xl border border-transparent bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/30 dark:border-blue-800/30">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-blue-400 to-sky-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Тренировки
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <PeriodChangeBadge change={periodComparison?.workoutChange ?? null} label="тренировки" />
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <Dumbbell className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl font-bold tabular-nums"><AnimatedNumber value={workoutCount} /></p>
              <div className="mt-1 flex items-center gap-1">
                <Flame className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Всего минут:{' '}
                  <span className="font-medium tabular-nums text-blue-600 dark:text-blue-400">
                    <AnimatedNumber value={totalMinutes} />
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Habits Stats */}
          <Card className="card-hover relative overflow-hidden rounded-xl border border-transparent bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30 dark:border-violet-800/30">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-violet-400 to-purple-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-violet-700 dark:text-violet-300">
                Привычки
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50">
                <Target className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl font-bold tabular-nums"><AnimatedNumber value={habitsRate} /></p>
              <div className="mt-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {completedHabits} из {totalHabits} сегодня
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
