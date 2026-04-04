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
} from 'lucide-react'
import { MOOD_EMOJI, formatCurrency, RU_DAYS_SHORT, toDateStr } from '@/lib/format'
import { SkeletonCard } from './skeleton-components'
import type { DiaryEntry, Transaction } from './types'

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
          <Card className="card-hover rounded-xl border border-transparent bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 dark:border-emerald-800/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Записи в дневнике
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-end justify-between gap-2">
                <p className="text-xl font-bold tabular-nums">{diaryCount}</p>
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
          <Card className="card-hover rounded-xl border border-transparent bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 dark:border-amber-800/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Расходы / Доходы
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <Wallet className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
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
          <Card className="card-hover rounded-xl border border-transparent bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/30 dark:border-blue-800/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Тренировки
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Dumbbell className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl font-bold tabular-nums">{workoutCount}</p>
              <div className="mt-1 flex items-center gap-1">
                <Flame className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Всего минут:{' '}
                  <span className="font-medium tabular-nums text-blue-600 dark:text-blue-400">
                    {totalMinutes}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Habits Stats */}
          <Card className="card-hover rounded-xl border border-transparent bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30 dark:border-violet-800/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-violet-700 dark:text-violet-300">
                Привычки
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50">
                <Target className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl font-bold tabular-nums">{habitsRate}%</p>
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
