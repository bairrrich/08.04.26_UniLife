'use client'

import { useMemo, useCallback, useState, useEffect } from 'react'
import { Crosshair, Plus, Target, AlertCircle, Calendar, AlertTriangle, ChevronRight, Quote, Sparkles, BookOpen, PiggyBank, Dumbbell, GraduationCap, Heart, Briefcase, ArrowRight, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useGoals } from './hooks'
import { PageHeader } from '@/components/layout/page-header'
import { getMotivationalPhrase, getMotivationalQuote } from './constants'
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

// ─── Sample goal suggestions for empty state ────────────────────────────────
const SAMPLE_GOALS = [
  {
    title: 'Прочитать 12 книг за год',
    description: 'По 1 книге в месяц',
    category: 'personal',
    targetValue: '12',
    unit: 'книг',
    icon: <BookOpen className="h-4 w-4" />,
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderLight: 'border-emerald-200 dark:border-emerald-800/40',
    textColor: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    title: 'Накопить 100 000 ₽',
    description: 'Финансовая подушка безопасности',
    category: 'finance',
    targetValue: '100000',
    unit: '₽',
    icon: <PiggyBank className="h-4 w-4" />,
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50 dark:bg-amber-900/20',
    borderLight: 'border-amber-200 dark:border-amber-800/40',
    textColor: 'text-amber-700 dark:text-amber-400',
  },
  {
    title: 'Пробежать 10 км',
    description: 'Беговая подготовка',
    category: 'health',
    targetValue: '10',
    unit: 'км',
    icon: <Heart className="h-4 w-4" />,
    gradient: 'from-rose-500 to-pink-500',
    bgLight: 'bg-rose-50 dark:bg-rose-900/20',
    borderLight: 'border-rose-200 dark:border-rose-800/40',
    textColor: 'text-rose-700 dark:text-rose-400',
  },
  {
    title: 'Выучить английский B2',
    description: '100 уроков за полгода',
    category: 'learning',
    targetValue: '100',
    unit: 'уроков',
    icon: <GraduationCap className="h-4 w-4" />,
    gradient: 'from-violet-500 to-purple-500',
    bgLight: 'bg-violet-50 dark:bg-violet-900/20',
    borderLight: 'border-violet-200 dark:border-violet-800/40',
    textColor: 'text-violet-700 dark:text-violet-400',
  },
  {
    title: 'Получить повышение',
    description: 'Развить навыки лидерства',
    category: 'career',
    targetValue: '5',
    unit: 'навыков',
    icon: <Briefcase className="h-4 w-4" />,
    gradient: 'from-blue-500 to-indigo-500',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    borderLight: 'border-blue-200 dark:border-blue-800/40',
    textColor: 'text-blue-700 dark:text-blue-400',
  },
  {
    title: '30 дней тренировок',
    description: 'Фитнес-челлендж',
    category: 'personal',
    targetValue: '30',
    unit: 'тренировок',
    icon: <Dumbbell className="h-4 w-4" />,
    gradient: 'from-orange-500 to-red-500',
    bgLight: 'bg-orange-50 dark:bg-orange-900/20',
    borderLight: 'border-orange-200 dark:border-orange-800/40',
    textColor: 'text-orange-700 dark:text-orange-400',
  },
]

export default function GoalsPage() {
  // ── Hydration guard — timezone-dependent date formatting ──
  const [mounted, setMounted] = useState(false)
  const todayBadge = useMemo(() => mounted ? getTodayBadge() : '', [mounted])
  const motivationalSubtitle = useMemo(() => mounted ? getMotivationalSubtitle() : '', [mounted])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const {
    goals, stats, loading, filterTab, setFilterTab,
    categoryFilter, setCategoryFilter,
    dialogOpen, handleDialogChange, editingGoal, submitting,
    formTitle, setFormTitle, formDescription, setFormDescription,
    formCategory, setFormCategory, formTargetValue, setFormTargetValue,
    formCurrentValue, setFormCurrentValue, formUnit, setFormUnit,
    formDeadline, setFormDeadline, formStatus, setFormStatus,
    formProgress, setFormProgress,
    formStartDate, setFormStartDate,
    formPriority, setFormPriority,
    formMilestones, setFormMilestones,
    openAddDialog, openEditDialog, handleSubmit,
    handleUpdateProgress, handleComplete, handleDelete,
    handleMilestoneToggle,
    filteredGoals,
  } = useGoals()

  // ─── Pre-fill from sample suggestion ──────────────────────────────────────
  const handleSampleClick = useCallback((sample: typeof SAMPLE_GOALS[number]) => {
    setFormTitle(sample.title)
    setFormDescription(sample.description)
    setFormCategory(sample.category)
    setFormTargetValue(sample.targetValue)
    setFormCurrentValue('0')
    setFormUnit(sample.unit)
    setFormProgress('0')
    setFormPriority('medium')
    setFormStatus('active')
    setFormDeadline('')
    setFormStartDate('')
    setFormMilestones('[]')
    handleDialogChange(true)
  }, [setFormTitle, setFormDescription, setFormCategory, setFormTargetValue, setFormCurrentValue, setFormUnit, setFormProgress, setFormPriority, setFormStatus, setFormDeadline, setFormStartDate, setFormMilestones, handleDialogChange])

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

  // ─── Search state ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')

  // Debounced search filter (300ms via useMemo re-evaluation on each render)
  const searchedGoals = useMemo(() => {
    if (!searchQuery.trim()) return filteredGoals
    const q = searchQuery.trim().toLowerCase()
    return filteredGoals.filter((g) => g.title.toLowerCase().includes(q))
  }, [filteredGoals, searchQuery])

  // Motivational quote
  const quote = useMemo(() => getMotivationalQuote(), [])

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <PageHeader
        icon={Crosshair}
        title="Цели"
        description={
          <span className="flex items-center gap-2 flex-wrap">
            <span>Трекер целей и достижений</span>
            <Badge variant="secondary" className="text-[10px] gap-1 font-normal">
              <Calendar className="h-3 w-3" />
              {todayBadge}
            </Badge>
          </span>
        }
        accent="indigo"
        actions={
          <div className="flex items-center gap-2 shrink-0">
            <Button onClick={openAddDialog} size="sm" className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">Новая цель</span>
            </Button>
            {goals.length > 0 && (
              <div className="relative max-w-xs shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Поиск целей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-9 text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Очистить поиск"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
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
              formStartDate={formStartDate} setFormStartDate={setFormStartDate}
              formPriority={formPriority} setFormPriority={setFormPriority}
              formMilestones={formMilestones} setFormMilestones={setFormMilestones}
              submitting={submitting} onSubmit={handleSubmit}
            />
          </div>
        }
      />

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
        /* ─── Enhanced Empty State with CSS Illustration ──────────────────── */
        <div className="space-y-6 animate-slide-up">
          <Card className="overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />
            <CardContent className="relative py-12 sm:py-16 text-center">
              {/* CSS Illustration — abstract target/bullseye */}
              <div className="relative mx-auto mb-6 w-32 h-32 sm:w-40 sm:h-40">
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-xl" />
                {/* Concentric rings */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-200/40 dark:border-emerald-700/30" />
                <div className="absolute inset-4 rounded-full border-2 border-dashed border-emerald-300/30 dark:border-emerald-600/25" />
                <div className="absolute inset-8 rounded-full border-2 border-emerald-300/40 dark:border-emerald-500/30" />
                <div className="absolute inset-12 rounded-full border-2 border-emerald-400/50 dark:border-emerald-400/40" />
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 float-animation">
                    <Target className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                </div>
                {/* Floating decorative elements */}
                <div className="absolute top-2 right-4 h-3 w-3 rounded-full bg-amber-400/60 particle-dot" />
                <div className="absolute bottom-4 left-2 h-2.5 w-2.5 rounded-full bg-violet-400/60 particle-dot" />
                <div className="absolute top-8 left-6 h-2 w-2 rounded-full bg-rose-400/50 particle-dot" />
                <div className="absolute bottom-8 right-6 h-3 w-3 rounded-full bg-blue-400/50 particle-dot" />
              </div>

              <h3 className="text-lg font-semibold mb-1.5">Нет целей</h3>
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

          {/* Sample Goal Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold">Идеи для целей</h3>
              <span className="text-xs text-muted-foreground">— нажмите, чтобы начать</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
              {SAMPLE_GOALS.map((sample) => (
                <button
                  key={sample.title}
                  type="button"
                  onClick={() => handleSampleClick(sample)}
                  className={cn(
                    'group text-left rounded-xl border p-4 transition-all duration-200 active-press',
                    'hover:scale-[1.02] hover:shadow-md',
                    'bg-card border-border hover:border-border',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-200 group-hover:shadow-md bg-gradient-to-br',
                      sample.gradient,
                    )}>
                      <div className="text-white">{sample.icon}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight group-hover:text-foreground transition-colors">
                        {sample.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{sample.description}</p>
                      {sample.targetValue && (
                        <p className="text-[10px] text-muted-foreground/60 mt-1 tabular-nums">
                          Цель: {Number(sample.targetValue).toLocaleString('ru-RU')} {sample.unit}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <GoalStats goals={goals} stats={stats} />

          {/* Motivational Quote */}
          <Card className="overflow-hidden relative card-hover">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-amber-500/5 pointer-events-none" />
            <CardContent className="relative p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Quote className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/90 italic leading-relaxed">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    — {quote.author}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {searchedGoals.length === 0 ? (
            <Card className="animate-slide-up overflow-hidden relative py-12">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-sky-500/5 pointer-events-none" />
              <CardContent className="relative flex flex-col items-center py-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-400/80 to-sky-400/80 flex items-center justify-center mb-3 shadow-lg shadow-violet-500/15">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-foreground/80">
                  {searchQuery.trim()
                    ? 'Ничего не найдено'
                    : filterTab === 'active'
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
              {searchedGoals.map((goal) => (
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
