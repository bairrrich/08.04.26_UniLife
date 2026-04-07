'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Settings2, Flame, UtensilsCrossed, CalendarDays } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSectionConfig, SectionCustomizer, CustomizeButton, type SectionDef } from '@/components/shared'
import DashboardSection from '@/components/dashboard/dashboard-section'

import { useNutrition } from './hooks'
import { MacroRings } from './macro-ring'
import { WaterTracker } from './water-tracker'
import { MealTimeline } from './meal-timeline'
import { AddMealDialog, EditMealDialog } from './meal-dialog'
import type { MealFormItem } from './meal-dialog'
import type { MealWithItems } from './types'
import { TimeIndicator } from './time-indicator'
import { NutritionGoalsDialog } from './nutrition-goals-dialog'
import { WeeklyNutritionChart } from './weekly-nutrition-chart'
import { WeeklyOverview } from './weekly-overview'
import { DailyNutritionScore } from './daily-nutrition-score'
import { QuickFoodBar } from './quick-food-bar'
import { NutritionScoreRing } from './nutrition-score-ring'

// ─── Weekly Nutrition Summary Card ──────────────────────────────────────

function WeeklyNutritionSummary({ meals }: { meals: MealWithItems[] }) {
  const weeklyData = useMemo(() => {
    const today = new Date()
    const last7: { date: string; kcal: number; protein: number; fat: number; carbs: number }[] = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const dayMeals = meals.filter(m => m.date && m.date.slice(0, 10) === dateStr)
      const totals = dayMeals.reduce(
        (acc, m) => {
          for (const item of m.items) {
            acc.kcal += item.kcal
            acc.protein += item.protein
            acc.fat += item.fat
            acc.carbs += item.carbs
          }
          return acc
        },
        { kcal: 0, protein: 0, fat: 0, carbs: 0 },
      )
      last7.push({ date: dateStr, ...totals })
    }

    const daysWithData = last7.filter(d => d.kcal > 0)
    const avgKcal = daysWithData.length > 0
      ? Math.round(daysWithData.reduce((s, d) => s + d.kcal, 0) / daysWithData.length)
      : 0
    const avgProtein = daysWithData.length > 0
      ? Math.round(daysWithData.reduce((s, d) => s + d.protein, 0) / daysWithData.length)
      : 0
    const avgFat = daysWithData.length > 0
      ? Math.round(daysWithData.reduce((s, d) => s + d.fat, 0) / daysWithData.length)
      : 0
    const avgCarbs = daysWithData.length > 0
      ? Math.round(daysWithData.reduce((s, d) => s + d.carbs, 0) / daysWithData.length)
      : 0

    const totalMacros = avgProtein + avgFat + avgCarbs
    const proteinPct = totalMacros > 0 ? Math.round((avgProtein / totalMacros) * 100) : 0
    const fatPct = totalMacros > 0 ? Math.round((avgFat / totalMacros) * 100) : 0
    const carbsPct = totalMacros > 0 ? 100 - proteinPct - fatPct : 0

    return { avgKcal, avgProtein, avgFat, avgCarbs, proteinPct, fatPct, carbsPct, daysWithData: daysWithData.length }
  }, [meals])

  if (weeklyData.daysWithData === 0) return null

  return (
    <Card className="card-hover overflow-hidden animate-slide-up">
      <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/50">
            <span className="text-sm">📊</span>
          </div>
          <h3 className="text-sm font-semibold">Сводка за неделю</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {weeklyData.daysWithData} из 7 дней
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-[10px] text-muted-foreground">Среднее ккал/день</p>
            <p className="text-lg font-bold tabular-nums text-orange-600 dark:text-orange-400">
              {weeklyData.avgKcal}
            </p>
          </div>
          <div className="space-y-1.5 px-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Белки</span>
              <span className="font-medium tabular-nums text-sky-600 dark:text-sky-400">{weeklyData.avgProtein}г</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Жиры</span>
              <span className="font-medium tabular-nums text-rose-500 dark:text-rose-400">{weeklyData.avgFat}г</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Углеводы</span>
              <span className="font-medium tabular-nums text-amber-600 dark:text-amber-400">{weeklyData.avgCarbs}г</span>
            </div>
          </div>
        </div>
        {/* Macro bar chart */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted/60">
          <div className="flex h-full w-full">
            <div
              className="bg-sky-500 transition-all duration-500 rounded-l-full"
              style={{ width: `${weeklyData.proteinPct}%` }}
              title={`Белки ${weeklyData.proteinPct}%`}
            />
            <div
              className="bg-rose-400 dark:bg-rose-500 transition-all duration-500"
              style={{ width: `${weeklyData.fatPct}%` }}
              title={`Жиры ${weeklyData.fatPct}%`}
            />
            <div
              className="bg-amber-400 dark:bg-amber-500 transition-all duration-500 rounded-r-full"
              style={{ width: `${weeklyData.carbsPct}%` }}
              title={`Углеводы ${weeklyData.carbsPct}%`}
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-1.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-500" /> Б
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-400 dark:bg-rose-500" /> Ж
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-500" /> У
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

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

  // Compute last meal relative time (in ms) for the indicator
  const lastMealRelative = useMemo(() => {
    if (!meals.length) return null
    const sorted = [...meals].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    const lastDate = new Date(sorted[0].date).getTime()
    return Date.now() - lastDate
  }, [meals])

  const lastMealText = useMemo(() => {
    if (lastMealRelative === null) return null
    const totalMinutes = Math.floor(lastMealRelative / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0 && minutes > 0) return `${hours}ч ${minutes}м назад`
    if (hours > 0) return `${hours}ч назад`
    if (minutes > 0) return `${minutes}м назад`
    return 'Только что'
  }, [lastMealRelative])

  const nutritionSections: SectionDef[] = useMemo(() => [
    { id: 'daily-ring', title: 'Оценка дня', icon: '🏆', defaultVisible: true, defaultOrder: 0 },
    { id: 'macros', title: 'Макронутриенты', icon: '🎯', defaultVisible: true, defaultOrder: 1 },
    { id: 'quick-food', title: 'Быстрое добавление', icon: '🍔', defaultVisible: true, defaultOrder: 2 },
    { id: 'weekly-overview', title: 'Обзор за неделю', icon: '📊', defaultVisible: true, defaultOrder: 3 },
    { id: 'streak', title: 'Серия отслеживания', icon: '🔥', defaultVisible: true, defaultOrder: 4 },
    { id: 'water', title: 'Вода', icon: '💧', defaultVisible: true, defaultOrder: 5 },
    { id: 'weekly-chart', title: 'График за неделю', icon: '📈', defaultVisible: true, defaultOrder: 6 },
  ], [])

  const { config, loaded, visibleOrder, toggleVisible, moveSection, resetConfig } = useSectionConfig('nutrition', nutritionSections)
  const [customizerOpen, setCustomizerOpen] = useState(false)

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Gradient header area */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-amber-500/5 to-orange-400/8 dark:from-orange-500/5 dark:via-amber-500/3 dark:to-orange-400/5 pointer-events-none" />
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-orange-400/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
        <div className="relative px-1 py-1">
      <PageHeader
        icon={UtensilsCrossed}
        title="Питание"
        description="Отслеживай питание, макронутриенты и воду"
        accent="orange"
        badge={
          todayFormatted ? (
            <Badge variant="secondary" className="hidden gap-1 text-[10px] font-normal sm:inline-flex">
              <CalendarDays className="h-3 w-3" />
              {todayFormatted}
            </Badge>
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            <CustomizeButton onClick={() => setCustomizerOpen(true)} />
            <Button variant="outline" size="icon" className="size-8" onClick={() => setShowGoalsDialog(true)}>
              <Settings2 className="size-4 text-muted-foreground" />
            </Button>
            <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setShowNewMealDialog(true)}>
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">Добавить</span>
            </Button>
          </div>
        }
      />
        </div>
      </div>

      {/* Weekly Nutrition Summary */}
      {loaded && meals.length > 0 && (
        <WeeklyNutritionSummary meals={meals} />
      )}

      {loaded && visibleOrder.map(sectionId => {
        switch (sectionId) {
          case 'daily-ring':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Оценка дня" icon={<span>🏆</span>}>
                <div className="flex justify-center">
                  <div className="w-full max-w-xs">
                    <NutritionScoreRing stats={stats} goals={goals} />
                  </div>
                </div>
              </DashboardSection>
            )
          case 'macros':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Макронутриенты" icon={<span>🎯</span>}>
                <div className="grid gap-4 lg:grid-cols-2 stagger-children">
                  <MacroRings stats={stats} goals={goals} />
                  <DailyNutritionScore stats={stats} goals={goals} />
                </div>
              </DashboardSection>
            )
          case 'quick-food':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Быстрое добавление" icon={<span>🍔</span>}>
                <QuickFoodBar onAddFood={(item) => { setMealItems([item]); setShowNewMealDialog(true) }} />
              </DashboardSection>
            )
          case 'weekly-overview':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Обзор за неделю" icon={<span>📊</span>}>
                <WeeklyOverview goals={goals} />
              </DashboardSection>
            )
          case 'streak':
            return nutritionStreak > 0 ? (
              <DashboardSection key={sectionId} id={sectionId} title="Серия отслеживания" icon={<span>🔥</span>}>
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
              </DashboardSection>
            ) : null
          case 'water':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="Вода" icon={<span>💧</span>}>
                <WaterTracker waterStats={waterStats} waterAnimating={waterAnimating} waterChartDays={waterChartDays} goals={goals} onAddWater={handleAddWater} onResetWater={handleResetWater} />
              </DashboardSection>
            )
          case 'weekly-chart':
            return (
              <DashboardSection key={sectionId} id={sectionId} title="График за неделю" icon={<span>📈</span>}>
                <WeeklyNutritionChart goals={goals} />
              </DashboardSection>
            )
          default:
            return null
        }
      })}

      {/* Visual separator between summary sections and meal timeline */}
      <div className="relative py-1">
        <Separator className="opacity-50" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3">
          <span className="text-xs text-muted-foreground/60">📖</span>
        </div>
      </div>

      {/* Meal Timeline */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Приёмы пищи</h2>
        <Badge variant="secondary">{meals.length} записей</Badge>
      </div>

      {lastMealText && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground -mt-3">
          <UtensilsCrossed className="size-3.5" />
          <span>Последний приём: {lastMealText}</span>
        </div>
      )}

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

      <SectionCustomizer
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        sections={nutritionSections}
        config={config}
        onToggle={toggleVisible}
        onMove={moveSection}
        onReset={resetConfig}
        moduleTitle="Питание"
      />
    </div>
  )
}
