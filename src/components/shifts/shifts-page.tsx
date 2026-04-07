'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  CalendarClock,
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
  Timer,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { ModuleEmptyState } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

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
  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-4">
        {loading ? (
          <div className="skeleton-shimmer h-20 rounded-lg" />
        ) : (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-lg">
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
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5">
                <Wallet className="h-3 w-3" />
                {formatMoney(earnings)}
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

  // Calendar days
  const calendarDays = useMemo(() => getCalendarDays(month), [month])

  // Group shifts by date
  const shiftsByDate = useMemo(() => {
    const map = new Map<string, Shift[]>()
    for (const s of shifts) {
      const existing = map.get(s.date) || []
      existing.push(s)
      map.set(s.date, existing)
    }
    return map
  }, [shifts])

  // Filter shifts for selected date
  const selectedShifts = useMemo(() => {
    if (!selectedDate) return []
    return shiftsByDate.get(selectedDate) || []
  }, [selectedDate, shiftsByDate])

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
    return addShift({ ...data, status: 'scheduled' })
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

  // Calendar day dot summary
  const getDaySummary = useCallback((date: string) => {
    const dayShifts = shiftsByDate.get(date)
    if (!dayShifts) return null
    return {
      completed: dayShifts.filter(s => s.status === 'completed').length,
      scheduled: dayShifts.filter(s => s.status === 'scheduled').length,
      cancelled: dayShifts.filter(s => s.status === 'cancelled').length,
      hasOvertime: dayShifts.some(s =>
        s.status !== 'cancelled' && isOvertime(s.startTime, s.endTime, s.breakMin)
      ),
    }
  }, [shiftsByDate])

  // ─── Render ─────────────────────────────────────────────────────────

  const monthLabel = formatMonthLabel(month)

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <PageHeader
        icon={CalendarClock}
        title="Смены"
        description="График работы и учёт часов"
        accent="sky"
        badge={
          <Badge variant="secondary" className="text-xs font-medium">
            {monthLabel}
          </Badge>
        }
        actions={
          <Button onClick={() => { setEditShift(null); setDialogOpen(true) }} size="sm" className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Добавить смену</span>
          </Button>
        }
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <StatCard
          icon="🕐"
          label="Всего часов"
          value={`${stats.totalHours.toFixed(1)}ч`}
          accent="sky"
          loading={loading}
        />
        <StatCard
          icon="💰"
          label="Заработок"
          value={formatMoney(stats.totalEarnings)}
          accent="emerald"
          loading={loading}
        />
        <StatCard
          icon="📋"
          label="Смен"
          value={String(stats.totalShifts)}
          accent="blue"
          loading={loading}
        />
        <StatCard
          icon="⏱️"
          label="Средняя смена"
          value={stats.avgHours > 0 ? `${stats.avgHours.toFixed(1)}ч` : '—'}
          accent="amber"
          loading={loading}
        />
      </div>

      {/* Calendar View */}
      <Card className="overflow-hidden">
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

      {/* Shifts List */}
      {selectedDate && selectedShifts.length > 0 ? (
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
      ) : shifts.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Все смены</h3>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {shifts.length} {pluralize(shifts.length, 'смена', 'смены', 'смен')}
            </Badge>
          </div>
          <ScrollArea className="max-h-96">
            <div className="space-y-2 stagger-children">
              {shifts
                .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                .map((shift) => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    onEdit={openEditDialog}
                    onDelete={handleDelete}
                    onComplete={completeShift}
                  />
                ))}
            </div>
          </ScrollArea>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <ModuleEmptyState
          icon={CalendarClock}
          title="Нет смен"
          description="Добавьте свою первую рабочую смену, чтобы начать отслеживать график"
          accent="sky"
          actionLabel="Добавить смену"
          onAction={() => { setEditShift(null); setDialogOpen(true) }}
        />
      )}

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
