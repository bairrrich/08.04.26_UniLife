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
    weeklyFrequency,
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
      <div className="relative">
        <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -top-8 -left-4 w-40 h-40 rounded-full bg-gradient-to-amber-400/15 to-rose-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6" />
              Тренировки
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Журнал упражнений и тренировок
              {lastWorkoutTime && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs">
                  · Последняя: <span className="font-medium text-foreground">{lastWorkoutTime}</span>
                </span>
              )}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm" className="shrink-0 sm:size-default">
            <Plus className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Добавить</span>
          </Button>
        </div>
      </div>

      <StatCards
        totalWorkouts={totalWorkouts}
        totalMinutes={totalMinutes}
        avgDuration={avgDuration}
        totalExercises={totalExercises}
        totalVolume={totalVolume}
        prCount={personalRecords.prCount}
        weeklyFrequency={weeklyFrequency}
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
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-teal-500/5 to-cyan-500/8 pointer-events-none" />
          <CardContent className="relative flex flex-col items-center justify-center py-14 text-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25">
              <Dumbbell className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Нет тренировок</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
              {WORKOUT_PHRASES[phraseIdx]}
            </p>
            <p className="text-xs text-muted-foreground/70 mb-6">
              Запиши свою первую тренировку и начни отслеживать прогресс
            </p>
            <p className="text-xs text-muted-foreground/50 mb-6 italic">
              Каждый великий путь начинается с одного шага 💪
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
          <div className="space-y-3 stagger-children">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                isExpanded={expandedId === workout.id}
                onToggle={() => toggleExpand(workout.id)}
                onEdit={openEditDialog}
                exerciseMaxWeights={personalRecords.maxWeightsByName}
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
