'use client'

import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

import { useNutrition } from './hooks'
import { MacroRings } from './macro-ring'
import { WaterTracker } from './water-tracker'
import { MealTimeline } from './meal-timeline'
import { AddMealDialog, EditMealDialog } from './meal-dialog'
import { TimeIndicator } from './time-indicator'

export default function NutritionPage() {
  const {
    meals,
    stats,
    waterStats,
    waterAnimating,
    waterChartDays,
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
  } = useNutrition()

  return (
    <div className="animate-slide-up min-h-screen bg-gradient-to-b from-orange-50/40 to-white">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Питание</h1>
            <p className="text-sm text-muted-foreground">Отслеживай своё питание и воду</p>
          </div>
          <Badge variant="secondary" className="text-xs font-normal">
            {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </Badge>
        </div>

        <MacroRings stats={stats} />
        <WaterTracker
          waterStats={waterStats}
          waterAnimating={waterAnimating}
          waterChartDays={waterChartDays}
          onAddWater={handleAddWater}
          onResetWater={handleResetWater}
        />

        {/* Meal Timeline */}
        <div className="mb-4 flex items-center justify-between">
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
        />
      </div>

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

      {/* FAB Button */}
      <button
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95"
        onClick={() => setShowNewMealDialog(true)}
      >
        <Plus className="size-6" />
      </button>
    </div>
  )
}
