'use client'

import { Dumbbell, Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import { useWorkouts } from './hooks'
import { WORKOUT_TYPE_CONFIG } from './constants'
import { StatCards } from './stat-cards'
import { WorkoutCard } from './workout-card'
import { WorkoutDialog } from './workout-dialog'
import { MonthNav } from './month-nav'

// ─── Component ─────────────────────────────────────────────────────────────

export function WorkoutPage() {
  const {
    workouts, loading, month, expandedId,
    dialogOpen, editDialogOpen,
    formName, formDate, formDuration, formNote, formExercises,
    setDialogOpen,
    setFormName, setFormDate, setFormDuration, setFormNote, setFormExercises,
    totalWorkouts, totalMinutes, avgDuration, totalExercises,
    exerciseTypes, totalVolume, lastWorkoutTime,
    handleSubmit, handleEditSubmit, handleApplyPreset,
    openEditDialog, toggleExpand, changeMonth, closeEditDialog,
    totalHours,
  } = useWorkouts()

  const formProps = {
    formName, formDate, formDuration, formNote, formExercises,
    onNameChange: setFormName, onDateChange: setFormDate,
    onDurationChange: setFormDuration, onNoteChange: setFormNote,
    onExercisesChange: setFormExercises, onApplyPreset: handleApplyPreset,
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Dumbbell className="h-6 w-6" />
            Тренировки
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Журнал упражнений и тренировок
            {lastWorkoutTime && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs">
                · Последняя: <span className="font-medium text-foreground">{lastWorkoutTime}</span>
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      <StatCards
        totalWorkouts={totalWorkouts}
        totalMinutes={totalMinutes}
        avgDuration={avgDuration}
        totalExercises={totalExercises}
        totalVolume={totalVolume}
      />

      {/* Exercise Type Badges + Duration Row */}
      {!loading && workouts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {exerciseTypes.map((type) => {
            const config = WORKOUT_TYPE_CONFIG[type as keyof typeof WORKOUT_TYPE_CONFIG]
            return (
              <Badge key={type} variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs font-medium">
                {config?.icon}{config?.label || type}
              </Badge>
            )
          })}
          <Separator orientation="vertical" className="h-4 mx-1" />
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="font-semibold tabular-nums">{totalHours}ч</span> за месяц
          </span>
        </div>
      )}

      <MonthNav month={month} onChange={changeMonth} />

      {/* Workout List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-[100px] rounded-xl" />
          ))}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-24 rounded-xl" />
            ))}
          </div>
        </div>
      ) : workouts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">Нет тренировок</p>
            <p className="text-muted-foreground text-sm mt-1">Добавьте первую тренировку за этот месяц</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-3">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                isExpanded={expandedId === workout.id}
                onToggle={() => toggleExpand(workout.id)}
                onEdit={openEditDialog}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Dialogs */}
      <WorkoutDialog
        {...formProps}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        title="Новая тренировка"
        submitLabel="Сохранить тренировку"
        showPresets
      />
      <WorkoutDialog
        {...formProps}
        open={editDialogOpen}
        onOpenChange={(open) => { if (!open) closeEditDialog() }}
        onSubmit={handleEditSubmit}
        title="Редактирование тренировки"
        submitLabel="Сохранить изменения"
      />
    </div>
  )
}

export default WorkoutPage
