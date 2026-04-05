'use client'

import { useMemo } from 'react'
import { Crosshair, Plus, Target, AlertCircle, Calendar, AlertTriangle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useGoals } from './hooks'
import { getMotivationalPhrase } from './constants'
import { GoalStats } from './goal-stats'
import { GoalCard } from './goal-card'
import { GoalDialog } from './goal-dialog'
import { FilterTabs } from './filter-tabs'
import type { GoalData } from './types'

const MOTIVATIONAL_SUBTITLES = [
  'Каждый шаг приближает вас к мечте',
  'Начните с чего-нибудь малого сегодня',
  'Ваши амбиции заслуживают плана',
  'Будущее начинается с одного решения',
]

function getMotivationalSubtitle(): string {
  const idx = new Date().getDate() % MOTIVATIONAL_SUBTITLES.length
  return MOTIVATIONAL_SUBTITLES[idx]
}

function getTodayBadge() {
  const now = new Date()
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`
}

export default function GoalsPage() {
  const {
    goals, stats, loading, filterTab, setFilterTab,
    categoryFilter, setCategoryFilter,
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

  // Compute overdue goals for the notification banner
  const overdueGoals = useMemo(() => {
    const now = new Date()
    return goals
      .filter((g) => {
        if (!g.deadline || g.status === 'completed') return false
        const dl = new Date(g.deadline)
        const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays < 0
      })
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
  }, [goals])

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
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground text-sm">Трекер целей и достижений</p>
              <Badge variant="secondary" className="text-[10px] gap-1 font-normal">
                <Calendar className="h-3 w-3" />
                {getTodayBadge()}
              </Badge>
            </div>
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
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25">
              <Target className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Нет целей</h3>
            <p className="text-muted-foreground text-sm mb-1 max-w-xs mx-auto">
              Поставьте первую цель и начните двигаться к ней.
            </p>
            <p className="text-sm text-muted-foreground/70 italic mb-6 max-w-sm mx-auto">
              &ldquo;{getMotivationalSubtitle()}&rdquo;
            </p>
            <Button
              onClick={openAddDialog}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active-press"
            >
              <Plus className="h-5 w-5 mr-2" />Поставить цель
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <GoalStats goals={goals} stats={stats} />

          {/* Overdue Goals Attention Banner */}
          {overdueGoals.length > 0 && (
            <OverdueBanner overdueGoals={overdueGoals} />
          )}

          <FilterTabs
            filterTab={filterTab}
            setFilterTab={setFilterTab}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            goals={goals}
          />

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

// ─── Overdue Goals Notification Banner ───────────────────────────────────────
function OverdueBanner({ overdueGoals }: { overdueGoals: GoalData[] }) {
  const displayGoals = overdueGoals.slice(0, 3)

  return (
    <div className="relative overflow-hidden rounded-xl border border-rose-200 dark:border-rose-800/50 animate-slide-up">
      {/* Red/amber gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-rose-500/10 pointer-events-none" />

      <div className="relative flex items-start gap-3 p-4">
        {/* Alert icon */}
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
          <AlertTriangle className="h-5 w-5 text-white" />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-400">
              {overdueGoals.length === 1
                ? '1 цель просрочена'
                : overdueGoals.length < 5
                  ? `${overdueGoals.length} цели просрочены`
                  : `${overdueGoals.length} целей просрочено`
              }
            </h3>
            <Badge className="text-[10px] bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800/50">
              Требует внимания
            </Badge>
          </div>

          {/* List up to 3 overdue goal names */}
          <div className="space-y-1">
            {displayGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-xs text-rose-600 dark:text-rose-400 truncate">
                  {goal.title}
                </span>
                {goal.deadline && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    (просрочено на {Math.abs(Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} дн.)
                  </span>
                )}
              </div>
            ))}
            {overdueGoals.length > 3 && (
              <p className="text-[10px] text-muted-foreground pl-3">
                и ещё {overdueGoals.length - 3}...
              </p>
            )}
          </div>
        </div>

        {/* Chevron indicator */}
        <ChevronRight className="h-5 w-5 text-rose-400/50 shrink-0 mt-1" />
      </div>
    </div>
  )
}
