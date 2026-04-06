'use client'

import { useState, useMemo } from 'react'
import { Plus, Target, Calendar, Flame, Eye, EyeOff, CheckCircle, Clock, Trophy, Archive, Tag, Sparkles, TrendingUp, Zap, Rocket } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { getTodayDateBadge, getMotivationalPhrase, getDayOfWeekSubtitle, HABIT_PRESETS, HABIT_CATEGORIES } from './constants'
import { useHabits } from './hooks'
import { HabitStats } from './habit-stats'
import { WeeklyProgress } from './weekly-progress'
import { BestStreakCard } from './best-streak-card'
import { StreakRecords } from './streak-records'
import { HabitCard, ArchivedHabitCard } from './habit-card'
import { HabitDialog } from './habit-dialog'
import { HabitHeatmap } from './habit-heatmap'
import { WeeklyOverviewHeatmap } from './weekly-overview-heatmap'
import type { HabitPreset } from './constants'
import { cn } from '@/lib/utils'

// Motivational messages based on completion rate
function getMotivationalMessage(rate: number, remaining: number, total: number): { icon: React.ReactNode; text: string; className: string } {
  if (total === 0) {
    return { icon: <Rocket className="h-4 w-4" />, text: 'Добавьте привычки и начните свой путь к лучшей версии себя!', className: 'text-blue-600 dark:text-blue-400' }
  }
  if (rate === 100) {
    return { icon: <Trophy className="h-4 w-4" />, text: 'Все привычки выполнены! Ты невероятен! 🎉', className: 'text-emerald-600 dark:text-emerald-400' }
  }
  if (rate >= 80) {
    return { icon: <Flame className="h-4 w-4" />, text: 'Почти всё готово! Осталось совсем чуть-чуть! 🔥', className: 'text-orange-600 dark:text-orange-400' }
  }
  if (rate >= 50) {
    return { icon: <TrendingUp className="h-4 w-4" />, text: 'Отличный прогресс! Ты на верном пути! 💪', className: 'text-emerald-600 dark:text-emerald-400' }
  }
  if (rate > 0) {
    return { icon: <Zap className="h-4 w-4" />, text: `Хороший старт! Ещё ${remaining} ${remaining === 1 ? 'привычка' : remaining <= 4 ? 'привычки' : 'привычек'} до цели!`, className: 'text-amber-600 dark:text-amber-400' }
  }
  return { icon: <Sparkles className="h-4 w-4" />, text: 'Новый день — новые возможности! Начни прямо сейчас ✨', className: 'text-blue-600 dark:text-blue-400' }
}

export default function HabitsPage() {
  const {
    habits, archivedHabits, stats, loading, last7Days, weeklyStats,
    categoryFilter, setCategoryFilter,
    addForm, setAddForm,
    editForm, setEditForm,
    deleteConfirmId, handleDeleteClick,
    handleCreate, handleToggle, handleEdit, handleUpdate,
    handleArchive, handleUnarchive,
  } = useHabits()

  // Toggle for hiding completed habits
  const [showCompleted, setShowCompleted] = useState(true)

  // Toggle for archived section
  const [showArchived, setShowArchived] = useState(false)

  // Check if any habit has streak > 3
  const hasStreakFlame = useMemo(() => habits.some(h => h.streak > 3), [habits])

  // Filter active habits (non-archived)
  const activeHabits = useMemo(() => habits.filter(h => !h.archived), [habits])

  // Filter by category
  const categoryFiltered = useMemo(() => {
    if (categoryFilter === 'all') return activeHabits
    return activeHabits.filter(h => h.category === categoryFilter)
  }, [activeHabits, categoryFilter])

  // Filter habits based on completed toggle
  const filteredHabits = useMemo(() => {
    if (showCompleted) return categoryFiltered
    return categoryFiltered.filter(h => !h.todayCompleted)
  }, [categoryFiltered, showCompleted])

  // Today's plan summary
  const todaySummary = useMemo(() => {
    const planned = activeHabits.length
    const completed = activeHabits.filter(h => h.todayCompleted).length
    const remaining = planned - completed
    return { planned, completed, remaining }
  }, [activeHabits])

  // Today's completion rate
  const todayRate = useMemo(() => {
    if (todaySummary.planned === 0) return 0
    return Math.round((todaySummary.completed / todaySummary.planned) * 100)
  }, [todaySummary])

  // Uncompleted habits for today (shown prominently at top)
  const todayRemaining = useMemo(() => {
    return categoryFiltered.filter(h => !h.todayCompleted)
  }, [categoryFiltered])

  // Longest streak celebration
  const longestStreakHabit = useMemo(() => {
    if (activeHabits.length === 0) return null
    const best = activeHabits.reduce((a, b) => (a.streak > b.streak ? a : b))
    return best.streak >= 7 ? best : null
  }, [activeHabits])

  // Motivational message
  const motivation = useMemo(() => {
    return getMotivationalMessage(todayRate, todaySummary.remaining, todaySummary.planned)
  }, [todayRate, todaySummary])

  // Handle preset quick-add from empty state
  const handlePresetQuickAdd = (preset: HabitPreset) => {
    setAddForm({
      dialogOpen: true,
      name: preset.name,
      emoji: preset.emoji,
      color: preset.color,
      frequency: 'daily',
      targetCount: '1',
      category: preset.category || 'other',
      reminderTime: '',
    })
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        icon={Target}
        title="Привычки"
        description={
          <span className="flex items-center gap-2 flex-wrap">
            <span>{getDayOfWeekSubtitle()}</span>
            <Badge variant="secondary" className="text-[10px] gap-1 font-normal">
              <Calendar className="h-3 w-3" />
              {getTodayDateBadge()}
            </Badge>
            {hasStreakFlame && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500/15 to-amber-500/15 px-2 py-0.5 text-sm" role="img" aria-label="streak">
                <Flame className="h-4 w-4 text-orange-500" />
              </span>
            )}
          </span>
        }
        accent="cyan"
        actions={
          <Button onClick={() => setAddForm(f => ({ ...f, dialogOpen: true }))} size="sm" className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" /><span className="hidden sm:inline">Добавить привычку</span>
          </Button>
        }
      />

      {/* Habit Dialogs */}
      <HabitDialog
        open={addForm.dialogOpen} onOpenChange={(open) => { setAddForm(f => ({ ...f, dialogOpen: open })); if (!open) setAddForm({ dialogOpen: false, name: '', emoji: '✅', color: '#10b981', frequency: 'daily', targetCount: '1', category: 'health', reminderTime: '' }) }}
        title="Новая привычка" name={addForm.name} setName={(v) => setAddForm(f => ({ ...f, name: v }))}
        emoji={addForm.emoji} setEmoji={(v) => setAddForm(f => ({ ...f, emoji: v }))} color={addForm.color} setColor={(v) => setAddForm(f => ({ ...f, color: v }))}
        frequency={addForm.frequency} setFrequency={(v) => setAddForm(f => ({ ...f, frequency: v }))}
        targetCount={addForm.targetCount} setTargetCount={(v) => setAddForm(f => ({ ...f, targetCount: v }))}
        category={addForm.category} setCategory={(v) => setAddForm(f => ({ ...f, category: v }))}
        submitLabel="Создать привычку" onSubmit={handleCreate}
      />

      <HabitDialog
        open={editForm.dialogOpen} onOpenChange={(open) => setEditForm(f => ({ ...f, dialogOpen: open }))}
        title="Редактировать привычку" name={editForm.name} setName={(v) => setEditForm(f => ({ ...f, name: v }))}
        emoji={editForm.emoji} setEmoji={(v) => setEditForm(f => ({ ...f, emoji: v }))} color={editForm.color} setColor={(v) => setEditForm(f => ({ ...f, color: v }))}
        frequency={editForm.frequency} setFrequency={(v) => setEditForm(f => ({ ...f, frequency: v }))}
        targetCount={editForm.targetCount} setTargetCount={(v) => setEditForm(f => ({ ...f, targetCount: v }))}
        category={editForm.category} setCategory={(v) => setEditForm(f => ({ ...f, category: v }))}
        submitLabel="Сохранить изменения" onSubmit={handleUpdate}
      />

      {/* Loading State */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`stat-skel-${i}`} className="skeleton-shimmer h-[100px] rounded-xl" />
            ))}
          </div>
          <div className="skeleton-shimmer h-[160px] rounded-xl" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`habit-skel-${i}`} className="skeleton-shimmer h-20 rounded-xl" />
            ))}
          </div>
        </div>
      ) : habits.length === 0 ? (
        /* Empty State */
        <Card className="animate-slide-up overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />
          <CardContent className="relative py-14 text-center px-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25">
              <Target className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Начните отслеживать привычки</h3>
            <p className="text-muted-foreground text-sm mb-2 max-w-xs mx-auto">
              Привычки помогают формировать дисциплину и достигать целей шаг за шагом.
            </p>
            <p className="text-sm text-muted-foreground/70 italic mb-6 max-w-sm mx-auto">
              &ldquo;{getMotivationalPhrase()}&rdquo;
            </p>

            <div className="max-w-sm mx-auto mb-6">
              <div className="flex items-start gap-3 text-left mb-3">
                <div className="shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">1</div>
                <p className="text-sm text-muted-foreground">Выберите привычку из предложенных или создайте свою</p>
              </div>
              <div className="flex items-start gap-3 text-left mb-3">
                <div className="shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">2</div>
                <p className="text-sm text-muted-foreground">Отмечайте выполнение каждый день</p>
              </div>
              <div className="flex items-start gap-3 text-left">
                <div className="shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">3</div>
                <p className="text-sm text-muted-foreground">Наблюдайте за своими сериями 🔥</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {HABIT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetQuickAdd(preset)}
                  className="active-press inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-all hover:bg-muted/60 hover:border-muted-foreground/30 hover:scale-105"
                >
                  <span>{preset.emoji}</span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => setAddForm(f => ({ ...f, dialogOpen: true }))}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />Создать свою привычку
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Today's Plan Summary with motivational message */}
          <Card className="overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">План на сегодня</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-medium tabular-nums text-foreground">{todaySummary.planned}</span> запланировано
                      </span>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-3 w-3" />
                        <span className="font-medium tabular-nums">{todaySummary.completed}</span> выполнено
                      </span>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium tabular-nums">{todaySummary.remaining}</span> осталось
                      </span>
                    </div>
                  </div>
                </div>
                {/* Circular mini progress */}
                <div className="relative h-12 w-12 shrink-0">
                  <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3" className="stroke-muted/40" />
                    <circle
                      cx="24" cy="24" r="20" fill="none" strokeWidth="3" strokeLinecap="round"
                      stroke={todaySummary.remaining === 0 ? '#10b981' : todaySummary.completed > 0 ? '#3b82f6' : '#94a3b8'}
                      strokeDasharray={125.66}
                      strokeDashoffset={125.66 * (1 - (todaySummary.planned > 0 ? todaySummary.completed / todaySummary.planned : 0))}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums">
                    {todaySummary.planned > 0 ? Math.round((todaySummary.completed / todaySummary.planned) * 100) : 0}%
                  </span>
                </div>
              </div>

              {/* Motivational message */}
              {todaySummary.planned > 0 && (
                <div className={cn(
                  'flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-muted/30 dark:bg-muted/20 motivation-enter',
                )}>
                  <span className={motivation.className}>{motivation.icon}</span>
                  <span className={cn('text-xs font-medium', motivation.className)}>{motivation.text}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <HabitStats stats={stats} habits={activeHabits} />

          {/* Longest streak celebration banner */}
          {longestStreakHabit && (
            <div className="relative overflow-hidden rounded-xl border border-amber-200 dark:border-amber-800/50 animate-slide-up">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 pointer-events-none" />
              <div className="relative flex items-center gap-3 p-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    Рекордная серия!
                    <span className="text-base">🔥</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="font-medium text-foreground">{longestStreakHabit.emoji} {longestStreakHabit.name}</span>
                    {' '}— {longestStreakHabit.streak} дней подряд!
                  </p>
                </div>
                <Badge className="shrink-0 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/50 text-xs font-bold tabular-nums px-2.5">
                  {longestStreakHabit.streak}д
                </Badge>
              </div>
            </div>
          )}

          {/* Week Overview Heatmap — completion rates per day */}
          <WeeklyOverviewHeatmap habits={activeHabits} last7Days={last7Days} />

          {/* Heatmap Calendar */}
          <HabitHeatmap habits={activeHabits} />

          {/* Best Streak */}
          <BestStreakCard habits={activeHabits} />

          {/* Weekly Progress */}
          <WeeklyProgress rate={weeklyStats.rate} color={weeklyStats.color} />

          {/* Streak Records */}
          <StreakRecords habits={activeHabits} />

          {/* Category Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Категории</h3>
              </div>
              {archivedHabits.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowArchived(!showArchived)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showArchived ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <Archive className="h-3.5 w-3.5" />
                  {showArchived ? 'Скрыть архив' : `Архив (${archivedHabits.length})`}
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all whitespace-nowrap active-press',
                  categoryFilter === 'all'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted',
                )}
              >
                Все
              </button>
              {HABIT_CATEGORIES.map((cat) => {
                const count = activeHabits.filter(h => h.category === cat.value).length
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategoryFilter(cat.value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all whitespace-nowrap active-press',
                      categoryFilter === cat.value
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted',
                      count === 0 && categoryFilter !== cat.value && 'opacity-40',
                    )}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    {count > 0 && (
                      <span className={cn(
                        'inline-flex items-center justify-center min-w-[16px] h-4 rounded-full text-[9px] font-bold px-1 tabular-nums',
                        categoryFilter === cat.value ? 'bg-primary/20' : 'bg-muted-foreground/10',
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* "Сегодня" section — uncompleted habits prominently */}
          {todayRemaining.length > 0 && (
            <div className="space-y-3 animate-slide-up">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Zap className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  Сегодня
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 tabular-nums bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                    {todayRemaining.length} осталось
                  </Badge>
                </h3>
              </div>
              <div className="stagger-children space-y-3">
                {todayRemaining.map((habit) => (
                  <HabitCard
                    key={habit.id} habit={habit} last7Days={last7Days}
                    onToggle={handleToggle} onEdit={handleEdit}
                    onDeleteClick={handleDeleteClick} deleteConfirmId={deleteConfirmId}
                    onArchive={handleArchive}
                  />
                ))}
              </div>
            </div>
          )}

          {/* "All habits" toggle + Habit List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                {showCompleted ? 'Все привычки' : 'Невыполненные'}
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 tabular-nums">
                  {filteredHabits.length}/{activeHabits.length}
                </Badge>
              </h3>
              <div className="flex items-center gap-2">
                {showCompleted ? (
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">
                  {showCompleted ? 'Все' : 'Без выполненных'}
                </span>
                <Switch
                  checked={showCompleted}
                  onCheckedChange={setShowCompleted}
                  className="scale-90"
                />
              </div>
            </div>

            <div className="stagger-children space-y-3">
              {/* When showing all, only show completed habits (uncompleted are in "Сегодня" section) */}
              {/* When hiding completed, show nothing here (uncompleted are in "Сегодня") */}
              {(showCompleted
                ? categoryFiltered.filter(h => h.todayCompleted)
                : []
              ).map((habit) => (
                <HabitCard
                  key={habit.id} habit={habit} last7Days={last7Days}
                  onToggle={handleToggle} onEdit={handleEdit}
                  onDeleteClick={handleDeleteClick} deleteConfirmId={deleteConfirmId}
                  onArchive={handleArchive}
                />
              ))}
            </div>

            {/* When hiding completed and all are done (and we already showed today's remaining) */}
            {!showCompleted && filteredHabits.length === 0 && todayRemaining.length === 0 && (
              <Card className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Все привычки на сегодня выполнены! 🎉
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowCompleted(true)}
                >
                  Показать все
                </Button>
              </Card>
            )}
          </div>

          {/* Archived Section */}
          {showArchived && archivedHabits.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground">Архивированные</h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 tabular-nums">
                    {archivedHabits.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {archivedHabits.map((habit) => (
                    <ArchivedHabitCard
                      key={habit.id}
                      habit={habit}
                      onUnarchive={handleUnarchive}
                      onDeleteClick={handleDeleteClick}
                      deleteConfirmId={deleteConfirmId}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
