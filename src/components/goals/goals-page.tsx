'use client'

import { Crosshair, Plus, Target, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGoals } from './hooks'
import { getMotivationalPhrase } from './constants'
import { GoalStats } from './goal-stats'
import { GoalCard } from './goal-card'
import { GoalDialog } from './goal-dialog'
import { FilterTabs } from './filter-tabs'

export default function GoalsPage() {
  const {
    goals, stats, loading, filterTab, setFilterTab,
    dialogOpen, handleDialogChange, editingGoal, submitting,
    formTitle, setFormTitle, formDescription, setFormDescription,
    formCategory, setFormCategory, formTargetValue, setFormTargetValue,
    formCurrentValue, setFormCurrentValue, formUnit, setFormUnit,
    formDeadline, setFormDeadline, formStatus, setFormStatus,
    formProgress, setFormProgress,
    openAddDialog, openEditDialog, handleSubmit,
    handleUpdateProgress, handleComplete, handleDelete,
    filteredGoals,
  } = useGoals()

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 top-8 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-400/15 to-teal-500/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Crosshair className="h-6 w-6" />Цели
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Трекер целей и достижений</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />Новая цель
          </Button>
          <GoalDialog
            open={dialogOpen} onOpenChange={handleDialogChange}
            editingGoal={editingGoal}
            formTitle={formTitle} setFormTitle={setFormTitle}
            formDescription={formDescription} setFormDescription={setFormDescription}
            formCategory={formCategory} setFormCategory={setFormCategory}
            formTargetValue={formTargetValue} setFormTargetValue={setFormTargetValue}
            formCurrentValue={formCurrentValue} setFormCurrentValue={setFormCurrentValue}
            formUnit={formUnit} setFormUnit={setFormUnit}
            formDeadline={formDeadline} setFormDeadline={setFormDeadline}
            formStatus={formStatus} setFormStatus={setFormStatus}
            formProgress={formProgress} setFormProgress={setFormProgress}
            submitting={submitting} onSubmit={handleSubmit}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`stat-skel-${i}`} className="skeleton-shimmer h-[100px] rounded-xl" />
            ))}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`tab-skel-${i}`} className="h-9 w-24 rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`goal-skel-${i}`} className="skeleton-shimmer h-32 rounded-xl" />
            ))}
          </div>
        </div>
      ) : goals.length === 0 ? (
        <Card className="animate-slide-up overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />
          <CardContent className="relative py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Нет целей</h3>
            <p className="text-muted-foreground text-sm mb-1 max-w-xs mx-auto">
              Поставьте первую цель и начните двигаться к ней.
            </p>
            <p className="text-sm text-muted-foreground/70 italic mb-5 max-w-sm mx-auto">
              &ldquo;{getMotivationalPhrase()}&rdquo;
            </p>
            <Button
              onClick={openAddDialog}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />Поставить цель
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <GoalStats goals={goals} stats={stats} />
          <FilterTabs filterTab={filterTab} setFilterTab={setFilterTab} goals={goals} />

          {filteredGoals.length === 0 ? (
            <Card className="animate-slide-up overflow-hidden relative py-12">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-sky-500/5 pointer-events-none" />
              <CardContent className="relative flex flex-col items-center py-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-400/80 to-sky-400/80 flex items-center justify-center mb-3 shadow-lg shadow-violet-500/15">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-foreground/80">
                  {filterTab === 'active'
                    ? 'Нет активных целей'
                    : filterTab === 'completed'
                      ? 'Нет завершённых целей'
                      : 'Нет целей в этой категории'
                  }
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1 italic">
                  &ldquo;{getMotivationalPhrase()}&rdquo;
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="stagger-children space-y-3">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id} goal={goal}
                  onEdit={openEditDialog}
                  onUpdateProgress={handleUpdateProgress}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
