'use client'

import { Dumbbell, Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import { useWorkouts } from './hooks'
import { WORKOUT_TYPE_CONFIG, WORKOUT_PRESETS, WORKOUT_PHRASES, detectWorkoutType } from './constants'
import { StatCards } from './stat-cards'
import { WorkoutCard } from './workout-card'
import { WorkoutDialog } from './workout-dialog'
import { MonthNav } from './month-nav'
import { WorkoutVolumeChart } from './volume-chart'
import { PersonalRecords } from './personal-records'

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
    personalRecords,
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

  const phraseIdx = new Date().getDate() % WORKOUT_PHRASES.length

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
            if (!config) return null
            return (
              <Badge key={type} variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs font-medium">
                {config.icon}{config.label || type}
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

      {/* Personal Records */}
      {!loading && workouts.length > 0 && (
        <PersonalRecords
          heaviestWeight={personalRecords.heaviestWeight}
          longestDuration={personalRecords.longestDuration}
          mostExercises={personalRecords.mostExercises}
          totalVolumeAllTime={personalRecords.totalVolumeAllTime}
        />
      )}

      {/* Volume Chart */}
      {!loading && workouts.length > 0 && (
        <WorkoutVolumeChart />
      )}

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
        <Card className="animate-slide-up overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
          <CardContent className="relative flex flex-col items-center justify-center py-12 text-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25">
              <Dumbbell className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Нет тренировок</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-1">
              {WORKOUT_PHRASES[phraseIdx]}
            </p>
            <p className="text-xs text-muted-foreground/70 mb-6">
              Запиши свою первую тренировку и начни отслеживать прогресс
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {WORKOUT_PRESETS.map((preset) => {
                const pType = detectWorkoutType(preset.name)
                const pConfig = WORKOUT_TYPE_CONFIG[pType]
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      handleApplyPreset(preset)
                      setDialogOpen(true)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/60 hover:border-muted-foreground/30 active-press"
                  >
                    <span className={pConfig?.iconColor}>{pConfig?.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                )
              })}
            </div>
            <Button
              size="lg"
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active-press"
            >
              <Plus className="h-5 w-5 mr-2" />
              Добавить тренировку
            </Button>
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
