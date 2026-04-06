'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Settings2, Flame, UtensilsCrossed, CalendarDays } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { useNutrition } from './hooks'
import { MacroRings } from './macro-ring'
import { WaterTracker } from './water-tracker'
import { MealTimeline } from './meal-timeline'
import { AddMealDialog, EditMealDialog } from './meal-dialog'
import type { MealFormItem } from './meal-dialog'
import { TimeIndicator } from './time-indicator'
import { NutritionGoalsDialog } from './nutrition-goals-dialog'
import { WeeklyNutritionChart } from './weekly-nutrition-chart'
import { WeeklyOverview } from './weekly-overview'
import { DailyNutritionScore } from './daily-nutrition-score'
import { QuickFoodBar } from './quick-food-bar'

export default function NutritionPage() {
  // ── Hydration guard for timezone-dependent date display ──
  const [mounted, setMounted] = useState(false)
  const todayFormatted = useMemo(() => {
    if (!mounted) return ''
    return new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  }, [mounted])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const {
    meals,
    stats,
    goals,
    waterStats,
    waterAnimating,
    waterChartDays,
    nutritionStreak,
    expandedMealId,
    deletingMealId,
    showNewMealDialog,
    setShowNewMealDialog,
    mealType,
    setMealType,
    mealItems,
    setMealItems,
    isSubmitting,
    handleSubmitMeal,
    showEditDialog,
    setShowEditDialog,
    editMealType,
    setEditMealType,
    editMealItems,
    setEditMealItems,
    editNote,
    setEditNote,
    isEditSubmitting,
    handleEditMeal,
    openEditDialog,
    handleDeleteMeal,
    toggleExpandMeal,
    handleAddWater,
    handleResetWater,
    showGoalsDialog,
    setShowGoalsDialog,
    handleGoalsSaved,
  } = useNutrition()

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        icon={UtensilsCrossed}
        title="Питание"
        description="Отслеживай питание, макронутриенты и воду"
        accent="orange"
        badge={
          todayFormatted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <CalendarDays className="h-3 w-3" />
              {todayFormatted}
            </span>
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-8" onClick={() => setShowGoalsDialog(true)}>
              <Settings2 className="size-4 text-muted-foreground" />
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setShowNewMealDialog(true)}>
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">Добавить</span>
            </Button>
          </div>
        }
      />

      {/* Macro Rings + Daily Score — side by side on desktop */}
      <div className="grid gap-4 lg:grid-cols-2 stagger-children">
        <MacroRings stats={stats} goals={goals} />
        <DailyNutritionScore stats={stats} goals={goals} />
      </div>

      {/* Quick Food Presets */}
      <QuickFoodBar onAddFood={(item: MealFormItem) => {
        setMealItems([item])
        setShowNewMealDialog(true)
      }} />

      {/* Weekly Overview Card */}
      <WeeklyOverview goals={goals} />

      {/* Nutrition Streak Card */}
      {nutritionStreak > 0 && (
        <Card className="overflow-hidden card-hover">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-orange-500/5 pointer-events-none" />
          <CardContent className="relative flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-md shadow-orange-500/20">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Серия отслеживания</p>
              <p className="text-xs text-muted-foreground">
                {nutritionStreak === 1
                  ? 'Вчера ты начал(а) отслеживать питание'
                  : nutritionStreak < 7
                    ? `Отличное начало — продолжай в том же духе!`
                    : nutritionStreak < 30
                      ? `Невероятная дисциплина — так держать!`
                      : `Месяц непрерывного отслеживания!`}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold tabular-nums text-orange-600 dark:text-orange-400">{nutritionStreak}</p>
              <p className="text-xs text-muted-foreground">
                {nutritionStreak === 1 ? 'день' : nutritionStreak < 5 ? 'дня' : 'дней'} подряд
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Water Tracker */}
      <WaterTracker
        waterStats={waterStats}
        waterAnimating={waterAnimating}
        waterChartDays={waterChartDays}
        goals={goals}
        onAddWater={handleAddWater}
        onResetWater={handleResetWater}
      />

      {/* Weekly Nutrition Chart */}
      <WeeklyNutritionChart goals={goals} />

      {/* Meal Timeline */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Приёмы пищи</h2>
        <Badge variant="secondary">{meals.length} записей</Badge>
      </div>

      <TimeIndicator stats={stats} />
      <MealTimeline
        meals={meals}
        expandedMealId={expandedMealId}
        deletingMealId={deletingMealId}
        onToggleExpand={toggleExpandMeal}
        onEdit={openEditDialog}
        onDelete={handleDeleteMeal}
        onAddNew={() => setShowNewMealDialog(true)}
      />

      {/* Add Meal Dialog */}
      <AddMealDialog
        open={showNewMealDialog}
        onOpenChange={setShowNewMealDialog}
        mealType={mealType}
        mealItems={mealItems}
        isSubmitting={isSubmitting}
        onMealTypeChange={setMealType}
        onMealItemsChange={setMealItems}
        onSubmit={handleSubmitMeal}
      />
      <EditMealDialog
        open={showEditDialog}
        onOpenChange={(open) => { if (!open) setShowEditDialog(false) }}
        mealType={editMealType}
        mealItems={editMealItems}
        isSubmitting={isEditSubmitting}
        note={editNote}
        onMealTypeChange={setEditMealType}
        onMealItemsChange={setEditMealItems}
        onNoteChange={setEditNote}
        onSubmit={handleEditMeal}
      />

      {/* Goals Dialog */}
      <NutritionGoalsDialog
        open={showGoalsDialog}
        onOpenChange={setShowGoalsDialog}
        goals={goals}
        onGoalsSaved={handleGoalsSaved}
      />
    </div>
  )
}
