'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { formatDayBadge, formatMonthBadge } from '@/lib/date-format'
import {
  CalendarClock,
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Trash2,
  Edit2,
  Check,
  X,
  Moon,
  AlertCircle,
  Wallet,
} from 'lucide-react'
import { ModuleHeader } from '@/components/layout/module-header'
import { ModuleEmptyState, useSectionConfig, SectionCustomizer, type SectionDef } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import DashboardSection from '@/components/dashboard/dashboard-section'

import { useShifts } from './hooks'
import {
  formatMonthLabel,
  formatMoney,
  calcDuration,
  calcEarnings,
  RU_MONTHS,
  type Shift,
} from './hooks'
import { ShiftDialog } from './shift-dialog'
import { EarningsChart } from './earnings-chart'

// ─── Constants ──────────────────────────────────────────────────────────

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const STATUS_CONFIG: Record<Shift['status'], { label: string; className: string }> = {
  scheduled: {
    label: 'Запланирована',
    className: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  },
  completed: {
    label: 'Завершена',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  cancelled: {
    label: 'Отменена',
    className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800',
  },
}

// ─── Helpers ────────────────────────────────────────────────────────────

function isNightShift(startTime: string): boolean {
  const h = parseInt(startTime.split(':')[0], 10)
  return h >= 18 || h < 6
}

function isOvertime(startTime: string, endTime: string, breakMin: number): boolean {
  return calcDuration(startTime, endTime, breakMin) > 8
}

function getCalendarDays(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  // Monday = 0, Sunday = 6
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const days: { date: string; dayNum: number; currentMonth: boolean }[] = []

  // Previous month padding
  const prevMonthLast = new Date(year, month - 1, 0).getDate()
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevMonthLast - i
    const pm = month - 1 === 0 ? 12 : month - 1
    const py = month - 1 === 0 ? year - 1 : year
    days.push({
      date: `${py}-${String(pm).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      dayNum: d,
      currentMonth: false,
    })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      dayNum: d,
      currentMonth: true,
    })
  }

  // Next month padding
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const nm = month + 1 === 13 ? 1 : month + 1
    const ny = month + 1 === 13 ? year + 1 : year
    days.push({
      date: `${ny}-${String(nm).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      dayNum: d,
      currentMonth: false,
    })
  }

  return days
}

// ─── Stat Card ──────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent,
  loading,
}: {
  icon: string
  label: string
  value: string
  accent: string
  loading: boolean
}) {
  const accentGradients: Record<string, string> = {
    sky: 'from-sky-400 to-cyan-400',
    emerald: 'from-emerald-400 to-green-400',
    blue: 'from-blue-400 to-indigo-400',
    amber: 'from-amber-400 to-orange-400',
  }
  const accentBg: Record<string, string> = {
    sky: 'bg-sky-100 dark:bg-sky-500/15',
    emerald: 'bg-emerald-100 dark:bg-emerald-500/15',
    blue: 'bg-blue-100 dark:bg-blue-500/15',
    amber: 'bg-amber-100 dark:bg-amber-500/15',
  }
  return (
    <Card className="card-hover overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${accentGradients[accent] ?? 'from-gray-400 to-gray-500'}`} />
      <CardContent className="p-4">
        {loading ? (
          <div className="skeleton-shimmer h-20 rounded-lg" />
        ) : (
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${accentBg[accent] ?? 'bg-muted/50'}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{label}</p>
              <p className="text-lg font-bold tabular-nums mt-0.5 truncate">{value}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Shift Card ─────────────────────────────────────────────────────────

function ShiftCard({
  shift,
  onEdit,
  onDelete,
  onComplete,
}: {
  shift: Shift
  onEdit: (shift: Shift) => void
  onDelete: (id: string) => void
  onComplete: (id: string) => void
}) {
  const duration = calcDuration(shift.startTime, shift.endTime, shift.breakMin)
  const earnings = shift.status === 'completed' ? calcEarnings(duration, shift.payRate, shift.tips) : null
  const night = isNightShift(shift.startTime)
  const overtime = isOvertime(shift.startTime, shift.endTime, shift.breakMin)
  const statusConf = STATUS_CONFIG[shift.status]

  const formatDuration = (h: number) => {
    const hours = Math.floor(h)
    const mins = Math.round((h - hours) * 60)
    return mins > 0 ? `${hours}ч ${mins}мин` : `${hours}ч`
  }

  return (
    <Card className="card-hover overflow-hidden animate-slide-up">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          {/* Left: status + info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="outline" className={statusConf.className}>
                {statusConf.label}
              </Badge>
              {night && (
                <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Moon className="h-3 w-3" /> Ночная
                </span>
              )}
              {overtime && (
                <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3 w-3" /> Переработка
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-sm font-medium tabular-nums">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {shift.startTime} — {shift.endTime}
              <span className="text-muted-foreground font-normal ml-1">
                ({formatDuration(duration)})
              </span>
            </div>

            {shift.location && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{shift.location}</span>
              </div>
            )}

            {earnings !== null && (
              <div className="flex items-center gap-3 text-xs font-semibold mt-1.5">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Wallet className="h-3 w-3" />
                  {formatMoney(earnings)}
                </div>
                {shift.tips > 0 && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                    💰 +{shift.tips.toLocaleString('ru-RU')} ₽ чаевых
                  </div>
                )}
              </div>
            )}

            {shift.note && (
              <p className="text-xs text-muted-foreground/80 mt-1.5 italic truncate">
                {shift.note}
              </p>
            )}
          </div>

          {/* Right: actions */}
          {shift.status !== 'cancelled' && (
            <div className="flex items-center gap-1 shrink-0">
              {shift.status === 'scheduled' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-950"
                  onClick={() => onComplete(shift.id)}
                  title="Завершить смену"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(shift)}
                title="Редактировать"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-100 dark:hover:text-red-400 dark:hover:bg-red-950"
                onClick={() => onDelete(shift.id)}
                title="Удалить"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Shift Tips Card ────────────────────────────────────────────────────

const SHIFT_TIPS = [
  '💤 Не забывайте об отдыхе между сменами — это повышает продуктивность',
  '💧 Пейте достаточно воды во время смены, особенно если работаете физически',
  '🧘 Сделайте короткую разминку каждые 2 часа для здоровья спины',
  '📝 Ведите учёт рабочих часов — это поможет при расчёте зарплаты',
  '🌟 Ставьте цели на неделю — запланированные смены приносят больше дохода',
]

function ShiftTipsCard() {
  const tipIndex = new Date().getDate() % SHIFT_TIPS.length
  return (
    <Card className="glass-card card-hover overflow-hidden animate-slide-up">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/15 text-base">
            💡
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Совет дня</p>
            <p className="text-sm leading-relaxed">{SHIFT_TIPS[tipIndex]}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Upcoming Shifts ─────────────────────────────────────────────────────

function UpcomingShifts({ shifts }: { shifts: Shift[] }) {
  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  const upcoming = useMemo(() => {
    return shifts
      .filter(s => s.status === 'scheduled' && s.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 3)
  }, [shifts, todayStr])

  if (upcoming.length === 0) return null

  return (
    <Card className="card-hover overflow-hidden animate-slide-up">
      <div className="h-1 bg-gradient-to-r from-violet-400 to-purple-400" />
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50">
            <CalendarClock className="h-4 w-4 text-violet-500" />
          </div>
          <h3 className="text-sm font-semibold">Ближайшие смены</h3>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto">
            {upcoming.length}
          </Badge>
        </div>
        <div className="space-y-2">
          {upcoming.map(shift => {
            const shiftDate = shift.date.length > 10 ? shift.date.slice(0, 10) : shift.date
            const [, m, d] = shiftDate.split('-').map(Number)
            const dateLabel = `${d} ${RU_MONTHS[m - 1]}`
            return (
              <div
                key={shift.id}
                className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium tabular-nums">
                      {shift.startTime} — {shift.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground tabular-nums">{dateLabel}</span>
                    {shift.location && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[140px]">{shift.location}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 shrink-0"
                >
                  Запланирована
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Weekly Summary Bar ───────────────────────────────────────────────

function WeeklySummaryBar({ shifts }: { shifts: Shift[] }) {
  const weekData = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // Monday=0
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - dayOfWeek)
    weekStart.setHours(0, 0, 0, 0)

    const weekShifts = shifts.filter(s => {
      const shiftDate = new Date(s.date.length > 10 ? s.date : `${s.date}T00:00:00`)
      return shiftDate >= weekStart && s.status !== 'cancelled'
    })

    const totalHours = weekShifts.reduce((sum, s) => sum + calcDuration(s.startTime, s.endTime, s.breakMin), 0)
    const totalEarnings = weekShifts.reduce((sum, s) => {
      if (s.status !== 'completed') return sum
      const dur = calcDuration(s.startTime, s.endTime, s.breakMin)
      return sum + calcEarnings(dur, s.payRate, s.tips)
    }, 0)
    const completedCount = weekShifts.filter(s => s.status === 'completed').length
    const nightCount = weekShifts.filter(s => isNightShift(s.startTime)).length
    const overtimeCount = weekShifts.filter(s => isOvertime(s.startTime, s.endTime, s.breakMin)).length

    return { totalHours, totalEarnings, completedCount, nightCount, overtimeCount, totalShifts: weekShifts.length }
  }, [shifts])

  return (
    <Card className="card-hover overflow-hidden animate-slide-up">
      <div className="h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400" />
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/50">
            <CalendarClock className="h-4 w-4 text-sky-500" />
          </div>
          <h3 className="text-sm font-semibold">Итоги недели</h3>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto">
            {WEEKDAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] + 1}/7
          </Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums text-sky-600 dark:text-sky-400">{weekData.totalHours.toFixed(1)}ч</p>
            <p className="text-[10px] text-muted-foreground">Часов</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{formatMoney(weekData.totalEarnings)}</p>
            <p className="text-[10px] text-muted-foreground">Заработок</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums">{weekData.completedCount}<span className="text-xs font-normal text-muted-foreground">/{weekData.totalShifts}</span></p>
            <p className="text-[10px] text-muted-foreground">Завершено</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums">
              {weekData.nightCount > 0 && <span className="text-indigo-500" title="Ночных">{weekData.nightCount}🌙</span>}
              {weekData.overtimeCount > 0 && <span className="text-amber-500 ml-1" title="Переработок">{weekData.overtimeCount}⚡</span>}
              {weekData.nightCount === 0 && weekData.overtimeCount === 0 && <span className="text-muted-foreground">—</span>}
            </p>
            <p className="text-[10px] text-muted-foreground">Ночные / Переработки</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Current Streak Badge ─────────────────────────────────────────────

function CurrentStreakBadge({ shifts }: { shifts: Shift[] }) {
  const [streak, setStreak] = useState(0)
  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    const completedDates = new Set<string>()
    for (const s of shifts) {
      if (s.status === 'completed') {
        const key = s.date.length > 10 ? s.date.slice(0, 10) : s.date
        completedDates.add(key)
      }
    }

    if (completedDates.size === 0) {
      setStreak(0)
      return
    }

    // Calculate streak backwards from today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let count = 0
    let checkDate = new Date(today)

    while (true) {
      const y = checkDate.getFullYear()
      const m = String(checkDate.getMonth() + 1).padStart(2, '0')
      const d = String(checkDate.getDate()).padStart(2, '0')
      const dateStr = `${y}-${m}-${d}`
      if (completedDates.has(dateStr)) {
        count++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    setStreak(count)
  }, [shifts])

  // Animated counter
  useEffect(() => {
    if (streak <= 0) {
      setDisplayCount(0)
      return
    }
    setDisplayCount(0)
    let current = 0
    const timer = setInterval(() => {
      current++
      setDisplayCount(current)
      if (current >= streak) clearInterval(timer)
    }, 120)
    return () => clearInterval(timer)
  }, [streak])

  if (streak === 0) return null

  return (
    <Card className="glass-card card-hover overflow-hidden animate-slide-up">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-lg shadow-sm">
            🔥
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Текущая серия</p>
            <p className="text-lg font-bold tabular-nums">
              <span className="animate-count-fade-in inline-block">{displayCount}</span>
              {' '}
              <span className="text-sm font-medium text-muted-foreground">
                {displayCount === 1 ? 'день подряд' : displayCount < 5 ? 'дня подряд' : 'дней подряд'}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────

export function ShiftsPage() {
  const {
    shifts,
    stats,
    loading,
    month,
    setMonth,
    addShift,
    updateShift,
    deleteShift,
    completeShift,
  } = useShifts()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editShift, setEditShift] = useState<Shift | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [customizerOpen, setCustomizerOpen] = useState(false)

  // ─── Section Config ───────────────────────────────────────────────────
  const shiftSections: SectionDef[] = useMemo(() => [
    { id: 'stats', title: 'Статистика', icon: '📊', defaultVisible: true, defaultOrder: 0 },
    { id: 'week-summary', title: 'Итоги недели', icon: '📅', defaultVisible: true, defaultOrder: 1 },
    { id: 'streak', title: 'Серия', icon: '🔥', defaultVisible: true, defaultOrder: 2 },
    { id: 'tips', title: 'Совет дня', icon: '💡', defaultVisible: true, defaultOrder: 3 },
    { id: 'upcoming', title: 'Ближайшие смены', icon: '⏰', defaultVisible: true, defaultOrder: 4 },
    { id: 'earnings-chart', title: 'График заработка', icon: '📈', defaultVisible: true, defaultOrder: 5 },
    { id: 'calendar', title: 'Календарь', icon: '🗓️', defaultVisible: true, defaultOrder: 6 },
    { id: 'shifts-list', title: 'Список смен', icon: '📋', defaultVisible: true, defaultOrder: 7 },
  ], [])

  const { loaded, config, visibleOrder, toggleVisible, moveSection, resetConfig } = useSectionConfig('shifts', shiftSections)

  // Calendar days
  const calendarDays = useMemo(() => getCalendarDays(month), [month])

  // Normalize ISO date string to YYYY-MM-DD for consistent map keys
  const toDateKey = useCallback((isoDate: string) => {
    // Handle both "2026-04-01" and "2026-04-01T10:00:00.000Z" formats
    return isoDate.length > 10 ? isoDate.slice(0, 10) : isoDate
  }, [])

  // Group shifts by date (using normalized YYYY-MM-DD keys)
  const shiftsByDate = useMemo(() => {
    const map = new Map<string, Shift[]>()
    for (const s of shifts) {
      const key = toDateKey(s.date)
      const existing = map.get(key) || []
      existing.push(s)
      map.set(key, existing)
    }
    return map
  }, [shifts, toDateKey])

  // Daily earnings for chart (completed shifts only)
  const dailyEarnings = useMemo(() => {
    const grouped = new Map<string, number>()
    for (const s of shifts) {
      if (s.status !== 'completed') continue
      const key = toDateKey(s.date)
      const dur = calcDuration(s.startTime, s.endTime, s.breakMin)
      const earned = calcEarnings(dur, s.payRate, s.tips)
      grouped.set(key, (grouped.get(key) ?? 0) + earned)
    }
    return Array.from(grouped.entries()).map(([date, amount]) => ({ date, amount }))
  }, [shifts, toDateKey])

  // Filter shifts for selected date
  const selectedShifts = useMemo(() => {
    if (!selectedDate) return []
    return shiftsByDate.get(toDateKey(selectedDate)) || []
  }, [selectedDate, shiftsByDate, toDateKey])

  // Today
  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  // Month navigation
  const changeMonth = useCallback((dir: number) => {
    setMonth((prev) => {
      const [y, m] = prev.split('-').map(Number)
      let ny = y
      let nm = m + dir
      if (nm > 12) { nm = 1; ny++ }
      if (nm < 1) { nm = 12; ny-- }
      return `${ny}-${String(nm).padStart(2, '0')}`
    })
    setSelectedDate(null)
  }, [setMonth])

  // Dialog handlers
  const handleAdd = async (data: Parameters<typeof addShift>[0]) => {
    return addShift(data)
  }

  const handleEdit = async (data: Parameters<typeof updateShift>[1]) => {
    if (!editShift) return false
    return updateShift(editShift.id, data)
  }

  const openEditDialog = (shift: Shift) => {
    setEditShift(shift)
  }

  const handleDelete = async (id: string) => {
    await deleteShift(id)
    if (selectedDate) {
      const remaining = shiftsByDate.get(selectedDate)?.filter(s => s.id !== id) || []
      if (remaining.length === 0) setSelectedDate(null)
    }
  }

  // Calendar day dot summary (date is already YYYY-MM-DD from calendar)
  const getDaySummary = useCallback((date: string) => {
    const dayShifts = shiftsByDate.get(toDateKey(date))
    if (!dayShifts) return null
    return {
      completed: dayShifts.filter(s => s.status === 'completed').length,
      scheduled: dayShifts.filter(s => s.status === 'scheduled').length,
      cancelled: dayShifts.filter(s => s.status === 'cancelled').length,
      hasOvertime: dayShifts.some(s =>
        s.status !== 'cancelled' && isOvertime(s.startTime, s.endTime, s.breakMin)
      ),
    }
  }, [shiftsByDate, toDateKey])

  // ─── Render ─────────────────────────────────────────────────────────

  const monthLabel = formatMonthLabel(month)

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <ModuleHeader
        icon={CalendarClock}
        title="Смены"
        description="График работы и учёт часов"
        accent="sky"
        badge={
          <Badge variant="secondary" className="hidden gap-1 text-[10px] font-normal sm:inline-flex">
            <CalendarDays className="h-3 w-3" />
            {(() => { const [y, m] = month.split('-').map(Number); return formatMonthBadge(new Date(y, m - 1, 1)) })()}
          </Badge>
        }
        primaryAction={{
          label: 'Добавить смену',
          icon: <Plus className="h-4 w-4" />,
          onClick: () => { setEditShift(null); setDialogOpen(true) },
        }}
        onCustomize={() => setCustomizerOpen(true)}
      />

      {/* Month Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => changeMonth(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold tabular-nums">{monthLabel}</h2>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {stats.totalShifts} см.
          </Badge>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => changeMonth(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Configurable Widget Sections */}
      {loaded && visibleOrder.map(sectionId => {
        switch (sectionId) {
          case 'stats':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Статистика" icon="📊">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
                  <StatCard icon="🕐" label="Всего часов" value={`${stats.totalHours.toFixed(1)}ч`} accent="sky" loading={loading} />
                  <StatCard icon="💰" label="Заработок" value={formatMoney(stats.totalEarnings)} accent="emerald" loading={loading} />
                  <StatCard icon="📋" label="Смен" value={String(stats.totalShifts)} accent="blue" loading={loading} />
                  <StatCard icon="⏱️" label="Средняя смена" value={stats.avgHours > 0 ? `${stats.avgHours.toFixed(1)}ч` : '—'} accent="amber" loading={loading} />
                </div>
              </DashboardSection>
            )
          case 'week-summary':
            return !loading && shifts.length > 0 && (
              <DashboardSection key={sectionId} id={sectionId} title="Итоги недели" icon="📅">
                <WeeklySummaryBar shifts={shifts} />
              </DashboardSection>
            )
          case 'streak':
            return !loading && shifts.length > 0 && (
              <DashboardSection key={sectionId} id={sectionId} title="Серия" icon="🔥">
                <CurrentStreakBadge shifts={shifts} />
              </DashboardSection>
            )
          case 'tips':
            return !loading && shifts.length > 0 && (
              <DashboardSection key={sectionId} id={sectionId} title="Совет дня" icon="💡">
                <ShiftTipsCard />
              </DashboardSection>
            )
          case 'upcoming':
            return !loading && shifts.length > 0 && (
              <DashboardSection key={sectionId} id={sectionId} title="Ближайшие смены" icon="⏰">
                <UpcomingShifts shifts={shifts} />
              </DashboardSection>
            )
          case 'earnings-chart':
            return !loading && shifts.length > 0 && dailyEarnings.length > 0 && (
              <DashboardSection key={sectionId} id={sectionId} title="График заработка" icon="📈">
                <EarningsChart earnings={dailyEarnings} isLoading={loading} />
              </DashboardSection>
            )
          case 'calendar':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Календарь" icon="🗓️">
                <Card className="overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400" />
                  <CardContent className="p-3 sm:p-4">
                    {loading ? (
                      <div className="skeleton-shimmer h-72 rounded-lg" />
                    ) : (
                      <>
                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 mb-1">
                          {WEEKDAYS.map((wd) => (
                            <div
                              key={wd}
                              className="text-center text-[11px] font-medium text-muted-foreground py-1"
                            >
                              {wd}
                            </div>
                          ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {calendarDays.map((day, i) => {
                            const summary = getDaySummary(day.date)
                            const isToday = day.date === todayStr
                            const isSelected = day.date === selectedDate

                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  if (summary) {
                                    setSelectedDate(isSelected ? null : day.date)
                                  } else if (day.currentMonth) {
                                    // Click on empty day: open add dialog with pre-filled date
                                    setEditShift(null)
                                    setDialogOpen(true)
                                  }
                                }}
                                className={`
                        relative flex flex-col items-center justify-center
                        rounded-lg py-1.5 sm:py-2 min-h-[40px] sm:min-h-[48px]
                        transition-all active-press
                        ${day.currentMonth
                                    ? 'text-foreground hover:bg-muted/60'
                                    : 'text-muted-foreground/40'
                                  }
                        ${isToday ? 'ring-2 ring-cyan-500/60 dark:ring-cyan-400/50 font-bold' : ''}
                        ${isSelected ? 'bg-cyan-50 dark:bg-cyan-950/40 ring-2 ring-cyan-500 dark:ring-cyan-400' : ''}
                        ${summary?.hasOvertime && day.currentMonth ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}
                      `}
                              >
                                <span className="text-xs sm:text-sm tabular-nums">{day.dayNum}</span>
                                {summary && day.currentMonth && (
                                  <div className="flex items-center gap-0.5 mt-0.5">
                                    {summary.completed > 0 && (
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                                    )}
                                    {summary.scheduled > 0 && (
                                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
                                    )}
                                    {summary.cancelled > 0 && (
                                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 dark:bg-red-400" />
                                    )}
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Завершена
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Запланирована
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Отменена
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </DashboardSection>
            )
          case 'shifts-list':
            return selectedDate && selectedShifts.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">
                    {formatDateLabel(selectedDate)}
                  </h3>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {selectedShifts.length} {pluralize(selectedShifts.length, 'смена', 'смены', 'смен')}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto text-muted-foreground"
                    onClick={() => setSelectedDate(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="space-y-2 stagger-children">
                  {selectedShifts.map((shift) => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      onEdit={openEditDialog}
                      onDelete={handleDelete}
                      onComplete={completeShift}
                    />
                  ))}
                </div>
              </div>
            ) : null
          default:
            return null
        }
      })}

      {/* Add Dialog */}
      <ShiftDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shift={null}
        onSubmit={handleAdd}
        title="Новая смена"
        submitLabel="Добавить смену"
      />

      {/* Edit Dialog */}
      <ShiftDialog
        open={!!editShift}
        onOpenChange={(open) => { if (!open) setEditShift(null) }}
        shift={editShift}
        onSubmit={handleEdit}
        title="Редактирование смены"
        submitLabel="Сохранить изменения"
      />

      {/* Section Customizer */}
      <SectionCustomizer
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        sections={shiftSections}
        config={config}
        onToggle={toggleVisible}
        onMove={moveSection}
        onReset={resetConfig}
        moduleTitle="Смены"
      />
    </div>
  )
}

// ─── Local helpers ──────────────────────────────────────────────────────

function pluralize(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n)
  const mod10 = abs % 10
  const mod100 = abs % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const monthName = RU_MONTHS[m - 1]
  const day = d
  return `${day} ${monthName} ${y}`
}

export default ShiftsPage
