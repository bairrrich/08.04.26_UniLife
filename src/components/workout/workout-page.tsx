'use client'

import { useState, useMemo, useSyncExternalStore } from 'react'
import { Dumbbell, Plus, Clock, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import { useSectionConfig, SectionCustomizer, CustomizeButton, ModuleEmptyState, type SectionDef } from '@/components/shared'
import { Card, CardContent } from '@/components/ui/card'
import DashboardSection from '@/components/dashboard/dashboard-section'

import { useWorkouts } from './hooks'
import { WORKOUT_TYPE_CONFIG, WORKOUT_PRESETS, WORKOUT_PHRASES, detectWorkoutType } from './constants'
import { StatCards } from './stat-cards'
import { WorkoutCard } from './workout-card'
import { WorkoutDialog } from './workout-dialog'
import { MonthNav } from './month-nav'
import { WorkoutVolumeChart } from './volume-chart'
import { PersonalRecords } from './personal-records'
import { PersonalRecordsSummary } from './personal-records-summary'
import { WorkoutTemplates } from './workout-templates'
import { WarmUpReminder } from './warm-up-reminder'
import { PerExerciseRecords } from './per-exercise-records'
import type { ExerciseData } from './types'

const WORKOUT_TIPS = [
  '🏋️ Начинайте тренировку с 5-минутной разминки для подготовки мышц',
  '💧 Пейте воду до, во время и после тренировки',
  '😴 Не забывайте о дне отдыха — мышцы растут во время восстановления',
  '📊 Ведите дневник тренировок для отслеживания прогресса',
  '🥗 Убедитесь, что получаете достаточно белка после тренировки',
]

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
    openEditDialog, toggleExpand, changeMonth, closeEditDialog, handleDelete,
    totalHours,
    sparklineData,
    periodComparison,
  } = useWorkouts()

  const formProps = {
    formName, formDate, formDuration, formNote, formExercises,
    onNameChange: setFormName, onDateChange: setFormDate,
    onDurationChange: setFormDuration, onNoteChange: setFormNote,
    onExercisesChange: setFormExercises, onApplyPreset: handleApplyPreset,
  }

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const phraseIdx = mounted ? new Date().getDate() % WORKOUT_PHRASES.length : 0
  const tipIdx = mounted ? new Date().getDate() % WORKOUT_TIPS.length : 0

  const workoutSections: SectionDef[] = useMemo(() => [
    { id: 'stats', title: 'Статистика', icon: '📊', defaultVisible: true, defaultOrder: 0 },
    { id: 'templates', title: 'Шаблоны', icon: '📋', defaultVisible: true, defaultOrder: 1 },
    { id: 'records', title: 'Рекорды', icon: '🏆', defaultVisible: true, defaultOrder: 2 },
    { id: 'volume-chart', title: 'График объёма', icon: '📈', defaultVisible: true, defaultOrder: 3 },
  ], [])

  const { loaded, config, visibleOrder, toggleVisible, moveSection, resetConfig } = useSectionConfig('workout', workoutSections)
  const [customizerOpen, setCustomizerOpen] = useState(false)

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Gradient header area */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/8 via-rose-500/5 to-orange-400/8 dark:from-red-500/5 dark:via-rose-500/3 dark:to-orange-400/5 pointer-events-none" />
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-red-400/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-rose-400/10 blur-2xl pointer-events-none" />
        <div className="relative px-1 py-1">
      <PageHeader
        icon={Dumbbell}
        title="Тренировки"
        description={
          <>
            Журнал упражнений и тренировок
            {lastWorkoutTime && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs">
                · Последняя: <span className="font-medium text-foreground">{lastWorkoutTime}</span>
              </span>
            )}
          </>
        }
        accent="red"
        actions={
          <>
            <CustomizeButton onClick={() => setCustomizerOpen(true)} />
            <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">Добавить</span>
            </Button>
          </>
        }
      />
        </div>
      </div>

      {/* Motivational daily tip */}
      <Card className="overflow-hidden card-hover">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-amber-500/3 to-rose-500/5 pointer-events-none" />
        <CardContent className="relative flex items-center gap-3 py-3 px-4">
          <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            {WORKOUT_PHRASES[phraseIdx]}
          </p>
        </CardContent>
      </Card>

      {!loading && visibleOrder.map(sectionId => {
        switch (sectionId) {
          case 'stats':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Статистика" icon={<span>📊</span>}>
                <StatCards
                  totalWorkouts={totalWorkouts}
                  totalMinutes={totalMinutes}
                  avgDuration={avgDuration}
                  totalExercises={totalExercises}
                  totalVolume={totalVolume}
                  prCount={personalRecords.prCount}
                  weeklyFrequency={weeklyFrequency}
                  sparklineData={sparklineData}
                  periodComparison={periodComparison}
                />
                {!loading && workouts.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {exerciseTypes.map((type) => {
                      const config = WORKOUT_TYPE_CONFIG[type as keyof typeof WORKOUT_TYPE_CONFIG]
                      if (!config) return null
                      const typeCount = workouts.filter((w) => detectWorkoutType(w.name) === type).length
                      return (
                        <Badge key={type} variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs font-medium">
                          <span className={config.iconColor}>{config.icon}</span>
                          {config.label || type}
                          <span className="ml-0.5 tabular-nums font-semibold">{typeCount}</span>
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
                {!loading && (
                  <Card className="glass-card mt-4 overflow-hidden">
                    <CardContent className="flex items-center gap-3 py-3 px-4">
                      <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        <span className="font-medium text-foreground/80 not-italic">Совет дня: </span>
                        {WORKOUT_TIPS[tipIdx]}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </DashboardSection>
            )
          case 'templates':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Шаблоны" icon={<span>📋</span>}>
                <MonthNav month={month} onChange={changeMonth} />
                <WorkoutTemplates
                  onLoadTemplate={(name, duration, exercises) => {
                    handleApplyPreset({ label: name, name, duration, exercises })
                    setDialogOpen(true)
                  }}
                />
                <WarmUpReminder workoutCount={workouts.length} />
              </DashboardSection>
            )
          case 'records':
            return !loading && workouts.length > 0 ? (
              <DashboardSection key={sectionId} id={sectionId} title="Рекорды" icon={<span>🏆</span>}>
                <PersonalRecords
                  heaviestWeight={personalRecords.heaviestWeight}
                  longestDuration={personalRecords.longestDuration}
                  mostExercises={personalRecords.mostExercises}
                  totalVolumeAllTime={personalRecords.totalVolumeAllTime}
                />
                {workouts.length > 1 && <PerExerciseRecords workouts={workouts} />}
              </DashboardSection>
            ) : null
          case 'volume-chart':
            return !loading && workouts.length > 0 ? (
              <DashboardSection key={sectionId} id={sectionId} title="График объёма" icon={<span>📈</span>}>
                <WorkoutVolumeChart />
              </DashboardSection>
            ) : null
          default:
            return null
        }
      })}

      {/* Workout type legend with colored dots */}
      {!loading && workouts.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Тип:</span>
          {exerciseTypes.map((type) => {
            const config = WORKOUT_TYPE_CONFIG[type as keyof typeof WORKOUT_TYPE_CONFIG]
            if (!config) return null
            const typeCount = workouts.filter((w) => detectWorkoutType(w.name) === type).length
            return (
              <div key={type} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{
                  backgroundColor: type === 'strength' ? '#f43f5e'
                    : type === 'cardio' ? '#a855f7'
                    : type === 'hiit' ? '#f97316'
                    : type === 'stretch' || type === 'flexibility' ? '#10b981'
                    : type === 'calisthenics' ? '#06b6d4'
                    : '#94a3b8',
                }} />
                <span className="text-xs text-muted-foreground">{config.label}</span>
                <span className="text-[10px] tabular-nums font-semibold text-foreground">{typeCount}</span>
              </div>
            )
          })}
        </div>
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
        <ModuleEmptyState
          icon={Dumbbell}
          title="Нет тренировок"
          description={WORKOUT_PHRASES[phraseIdx]}
          accent="red"
          actionLabel="Добавить тренировку"
          onAction={() => setDialogOpen(true)}
        >
          <p className="text-xs text-muted-foreground/70 mb-4">
            Запиши свою первую тренировку и начни отслеживать прогресс
          </p>
          <p className="text-xs text-muted-foreground/50 mb-4 italic">
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
        </ModuleEmptyState>
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
                onDelete={handleDelete}
                exerciseMaxWeights={personalRecords.maxWeightsByName}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Personal Records Summary — below workout list */}
      {!loading && workouts.length > 0 && (
        <PersonalRecordsSummary
          heaviestWeight={personalRecords.heaviestWeight}
          longestDuration={personalRecords.longestDuration}
          totalWorkouts={totalWorkouts}
        />
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
        exerciseMaxWeights={personalRecords.maxWeightsByName}
      />
      <WorkoutDialog
        {...formProps}
        open={editDialogOpen}
        onOpenChange={(open) => { if (!open) closeEditDialog() }}
        onSubmit={handleEditSubmit}
        title="Редактирование тренировки"
        submitLabel="Сохранить изменения"
        exerciseMaxWeights={personalRecords.maxWeightsByName}
      />

      <SectionCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} sections={workoutSections} config={config} onToggle={toggleVisible} onMove={moveSection} onReset={resetConfig} moduleTitle="Тренировки" />
    </div>
  )
}

export default WorkoutPage
