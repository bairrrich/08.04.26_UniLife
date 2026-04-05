'use client'

import { useState, useMemo } from 'react'
import { Plus, Target, Calendar, Flame, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { getTodayDateBadge, getMotivationalPhrase, getDayOfWeekSubtitle, HABIT_PRESETS } from './constants'
import { useHabits } from './hooks'
import { HabitStats } from './habit-stats'
import { WeeklyProgress } from './weekly-progress'
import { BestStreakCard } from './best-streak-card'
import { StreakRecords } from './streak-records'
import { HabitCard } from './habit-card'
import { HabitDialog } from './habit-dialog'
import { HabitHeatmap } from './habit-heatmap'
import type { HabitPreset } from './constants'

export default function HabitsPage() {
  const {
    habits, stats, loading, last7Days, weeklyStats,
    addForm, setAddForm,
    editForm, setEditForm,
    deleteConfirmId, handleDeleteClick,
    handleCreate, handleToggle, handleEdit, handleUpdate,
  } = useHabits()

  // Toggle for hiding completed habits
  const [showCompleted, setShowCompleted] = useState(true)

  // Check if any habit has streak > 3
  const hasStreakFlame = useMemo(() => habits.some(h => h.streak > 3), [habits])

  // Filter habits based on toggle
  const filteredHabits = useMemo(() => {
    if (showCompleted) return habits
    return habits.filter(h => !h.todayCompleted)
  }, [habits, showCompleted])

  // Handle preset quick-add from empty state
  const handlePresetQuickAdd = (preset: HabitPreset) => {
    setAddForm({
      dialogOpen: true,
      name: preset.name,
      emoji: preset.emoji,
      color: preset.color,
      frequency: 'daily',
      targetCount: '1',
    })
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-32 w-64 rounded-full bg-gradient-to-br from-emerald-300/10 to-cyan-400/5 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Target className="h-6 w-6" />
              Привычки
              {hasStreakFlame && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500/15 to-amber-500/15 px-2 py-0.5 text-sm" role="img" aria-label="streak">
                  <Flame className="h-4 w-4 text-orange-500" />
                </span>
              )}
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal ml-1">
                <Calendar className="h-3 w-3 mr-1" />
                {getTodayDateBadge()}
              </Badge>
            </h2>
            <p className="text-muted-foreground text-sm mt-1">{getDayOfWeekSubtitle()}</p>
          </div>
          <Button onClick={() => setAddForm(f => ({ ...f, dialogOpen: true }))}>
            <Plus className="h-4 w-4 mr-2" />Добавить привычку
          </Button>
        </div>
      </div>

      {/* Habit Dialogs */}
      <HabitDialog
        open={addForm.dialogOpen} onOpenChange={(open) => { setAddForm(f => ({ ...f, dialogOpen: open })); if (!open) setAddForm({ dialogOpen: false, name: '', emoji: '✅', color: '#10b981', frequency: 'daily', targetCount: '1' }) }}
        title="Новая привычка" name={addForm.name} setName={(v) => setAddForm(f => ({ ...f, name: v }))}
        emoji={addForm.emoji} setEmoji={(v) => setAddForm(f => ({ ...f, emoji: v }))} color={addForm.color} setColor={(v) => setAddForm(f => ({ ...f, color: v }))}
        frequency={addForm.frequency} setFrequency={(v) => setAddForm(f => ({ ...f, frequency: v }))}
        targetCount={addForm.targetCount} setTargetCount={(v) => setAddForm(f => ({ ...f, targetCount: v }))}
        submitLabel="Создать привычку" onSubmit={handleCreate}
      />

      <HabitDialog
        open={editForm.dialogOpen} onOpenChange={(open) => setEditForm(f => ({ ...f, dialogOpen: open }))}
        title="Редактировать привычку" name={editForm.name} setName={(v) => setEditForm(f => ({ ...f, name: v }))}
        emoji={editForm.emoji} setEmoji={(v) => setEditForm(f => ({ ...f, emoji: v }))} color={editForm.color} setColor={(v) => setEditForm(f => ({ ...f, color: v }))}
        frequency={editForm.frequency} setFrequency={(v) => setEditForm(f => ({ ...f, frequency: v }))}
        targetCount={editForm.targetCount} setTargetCount={(v) => setEditForm(f => ({ ...f, targetCount: v }))}
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
          <CardContent className="relative py-12 text-center px-6">
            {/* Gradient Icon */}
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25">
              <Target className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Начните отслеживать привычки</h3>
            <p className="text-muted-foreground text-sm mb-2 max-w-xs mx-auto">
              Привычки помогают формировать дисциплину и достигать целей шаг за шагом.
            </p>
            <p className="text-sm text-muted-foreground/70 italic mb-6 max-w-sm mx-auto">
              &ldquo;{getMotivationalPhrase()}&rdquo;
            </p>

            {/* Step-by-step guide */}
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

            {/* Preset Quick-Add Buttons */}
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
              onClick={() => setAddForm(f => ({ ...f, dialogOpen: true }))}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />Создать свою привычку
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <HabitStats stats={stats} />

          {/* Heatmap Calendar */}
          <HabitHeatmap habits={habits} />

          {/* Best Streak */}
          <BestStreakCard habits={habits} />

          {/* Weekly Progress */}
          <WeeklyProgress rate={weeklyStats.rate} color={weeklyStats.color} />

          {/* Streak Records */}
          <StreakRecords habits={habits} />

          {/* "All habits" toggle + Habit List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                {showCompleted ? 'Все привычки' : 'Невыполненные'}
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 tabular-nums">
                  {filteredHabits.length}/{habits.length}
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
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id} habit={habit} last7Days={last7Days}
                  onToggle={handleToggle} onEdit={handleEdit}
                  onDeleteClick={handleDeleteClick} deleteConfirmId={deleteConfirmId}
                />
              ))}
            </div>

            {filteredHabits.length === 0 && (
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
        </>
      )}
    </div>
  )
}
