'use client'

import { Plus, Target, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getTodayDateBadge, getMotivationalPhrase } from './constants'
import { useHabits } from './hooks'
import { HabitStats } from './habit-stats'
import { WeeklyProgress } from './weekly-progress'
import { BestStreakCard } from './best-streak-card'
import { StreakRecords } from './streak-records'
import { HabitCard } from './habit-card'
import { HabitDialog } from './habit-dialog'

export default function HabitsPage() {
  const {
    habits, stats, loading, last7Days, weeklyStats,
    addForm, setAddForm,
    editForm, setEditForm,
    deleteConfirmId, handleDeleteClick,
    handleCreate, handleToggle, handleEdit, handleUpdate,
  } = useHabits()

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Target className="h-6 w-6" />
              Привычки
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal ml-1">
                <Calendar className="h-3 w-3 mr-1" />
                {getTodayDateBadge()}
              </Badge>
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Трекер привычек и достижений</p>
          </div>
          <Button onClick={() => setAddForm(f => ({ ...f, dialogOpen: true }))}>
            <Plus className="h-4 w-4 mr-2" />Добавить привычку
          </Button>
        </div>
      </div>

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

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`stat-skel-${i}`} className="skeleton-shimmer h-[100px] rounded-xl" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`habit-skel-${i}`} className="skeleton-shimmer h-20 rounded-xl" />
            ))}
          </div>
        </div>
      ) : habits.length === 0 ? (
        <Card className="animate-slide-up overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />
          <CardContent className="relative py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Нет привычек</h3>
            <p className="text-muted-foreground text-sm mb-1 max-w-xs mx-auto">
              Начните отслеживать свои привычки прямо сейчас.
            </p>
            <p className="text-sm text-muted-foreground/70 italic mb-5 max-w-sm mx-auto">
              &ldquo;{getMotivationalPhrase()}&rdquo;
            </p>
            <Button
              onClick={() => setAddForm(f => ({ ...f, dialogOpen: true }))}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />Создать первую привычку
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <HabitStats stats={stats} />

          <BestStreakCard habits={habits} />

          <WeeklyProgress rate={weeklyStats.rate} color={weeklyStats.color} />

          <StreakRecords habits={habits} />

          {/* Habit List */}
          <div className="stagger-children space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id} habit={habit} last7Days={last7Days}
                onToggle={handleToggle} onEdit={handleEdit}
                onDeleteClick={handleDeleteClick} deleteConfirmId={deleteConfirmId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
