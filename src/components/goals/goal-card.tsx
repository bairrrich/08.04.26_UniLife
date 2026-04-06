'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Pencil, TrendingUp, CheckCircle, Target, Clock, Trash2, Calendar, Sparkles, Tag, Zap, ChevronRight, Flag, ArrowUp, Minus, ArrowDown, AlertTriangle, Gauge } from 'lucide-react'
import type { GoalData, Milestone } from './types'
import {
  CATEGORY_CONFIG,
  DEFAULT_CATEGORY,
  STATUS_CONFIG,
  DEFAULT_STATUS,
  PRIORITY_CONFIG,
  SUBCATEGORIES,
  getDeadlineCountdown,
  getDeadlineDaysLeft,
  getDeadlineBadgeClass,
  getProgressColor,
  getProgressTrackColor,
  getProgressTextColor,
  getProgressRingColor,
  getDeadlineWarning,
  getDeadlineUrgencyColor,
  getDeadlineIconColor,
  getProgressTrend,
  getRequiredPace,
  getDaysRemaining,
} from './constants'
import { cn } from '@/lib/utils'

interface GoalCardProps {
  goal: GoalData
  onEdit: (goal: GoalData) => void
  onUpdateProgress: (goal: GoalData) => void
  onComplete: (goal: GoalData) => void
  onDelete: (goalId: string) => void
}

// Milestone celebration definitions
const MILESTONES = [
  { threshold: 25, emoji: '🌱', label: 'Квартель!' },
  { threshold: 50, emoji: '🔥', label: 'Половина!' },
  { threshold: 75, emoji: '⭐', label: 'Почти!' },
  { threshold: 100, emoji: '🏆', label: 'Достигнуто!' },
]

// Progress timeline milestone points
const TIMELINE_MILESTONES = [
  { pct: 0, label: '0%', emoji: '🎯' },
  { pct: 25, label: '25%', emoji: '🌱' },
  { pct: 50, label: '50%', emoji: '🔥' },
  { pct: 75, label: '75%', emoji: '⭐' },
  { pct: 100, label: '100%', emoji: '🏆' },
]

// Predefined subcategory tags — using SUBCATEGORIES from constants

function getMilestone(progress: number) {
  return MILESTONES.find((m) => progress >= m.threshold && progress < m.threshold + 5) || null
}

// Calculate progress velocity (days to complete at current rate)
function calculateVelocity(goal: GoalData): string | null {
  if (goal.status === 'completed' || goal.progress === 0) return null

  const created = new Date(goal.createdAt)
  const now = new Date()
  const daysElapsed = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
  const progressPerDay = goal.progress / daysElapsed
  const remaining = 100 - goal.progress

  if (progressPerDay <= 0.1) return null

  const daysNeeded = Math.ceil(remaining / progressPerDay)

  if (daysNeeded <= 0) return 'Цель достигнута! 🎉'

  // Russian pluralization
  const lastDigit = daysNeeded % 10
  const lastTwo = daysNeeded % 100
  let plural = 'дней'
  if (lastTwo >= 11 && lastTwo <= 19) {
    plural = 'дней'
  } else if (lastDigit === 1) {
    plural = 'день'
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    plural = 'дня'
  }

  return `На этом темпе через ${daysNeeded} ${plural}`
}

export function GoalCard({ goal, onEdit, onUpdateProgress, onComplete, onDelete }: GoalCardProps) {
  const catConfig = CATEGORY_CONFIG[goal.category] || DEFAULT_CATEGORY
  const statusConfig = STATUS_CONFIG[goal.status] || DEFAULT_STATUS
  const daysLeft = getDeadlineDaysLeft(goal.deadline)
  const countdown = getDeadlineCountdown(goal.deadline)
  const isOverdue = daysLeft !== null && daysLeft < 0 && goal.status !== 'completed'
  const isApproaching = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3 && goal.status !== 'completed'

  // ─── Animated progress ring ───────────────────────────────────────────────
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(goal.progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [goal.progress])

  // ─── Milestone celebration badge ──────────────────────────────────────────
  const milestone = useMemo(() => getMilestone(goal.progress), [goal.progress])

  // ─── Progress velocity ────────────────────────────────────────────────────
  const velocityText = useMemo(() => calculateVelocity(goal), [goal])

  // ─── Inline delete confirmation ───────────────────────────────────────────
  const [deleteConfirming, setDeleteConfirming] = useState(false)
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    }
  }, [])

  const handleDeleteClick = () => {
    if (deleteConfirming) {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
      setDeleteConfirming(false)
      onDelete(goal.id)
    } else {
      setDeleteConfirming(true)
      deleteTimerRef.current = setTimeout(() => {
        setDeleteConfirming(false)
      }, 3000)
    }
  }

  // ─── Milestones progress points ───────────────────────────────────────────
  const milestones = [25, 50, 75, 100]

  // ─── Category-specific gradient background (always visible, subtle) ───────
  const categoryGradientClass = cn(
    'absolute inset-0 pointer-events-none',
    catConfig.bgClass,
    'opacity-[0.03]',
  )

  // ─── SVG progress ring params ─────────────────────────────────────────────
  const radius = 32
  const strokeWidth = 4
  const circumference = 2 * Math.PI * radius

  const isCompleted = goal.status === 'completed'

  // ─── Suggested tags based on category (with icons from SUBCATEGORIES) ────
  const subcategoryDefs = SUBCATEGORIES[goal.category] || []

  // ─── Progress trend (on track / behind / ahead) ─────────────────────────
  const progressTrend = useMemo(() => getProgressTrend(goal), [goal])

  // ─── Required pace to reach goal ───────────────────────────────────────────
  const requiredPace = useMemo(() => getRequiredPace(goal), [goal])

  // ─── Days remaining ─────────────────────────────────────────────────────────
  const daysRemaining = useMemo(() => getDaysRemaining(goal), [goal])

  // ─── Priority badge ──────────────────────────────────────────────────────
  const priorityConfig = goal.priority ? PRIORITY_CONFIG[goal.priority] : null

  // ─── Milestones parsing ────────────────────────────────────────────────────
  const milestonesData = useMemo(() => {
    try {
      return JSON.parse(goal.milestones || '[]') as Milestone[]
    } catch {
      return []
    }
  }, [goal.milestones])

  const completedMilestones = milestonesData.filter(m => m.completed).length
  const totalMilestones = milestonesData.length
  const milestoneProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  return (
    <TooltipProvider delayDuration={200}>
    <Card
      ref={cardRef}
      className={cn(
        'card-hover hover-lift active-press overflow-hidden relative group transition-all duration-300',
        'hover:scale-[1.01]',
        catConfig.hoverGlow,
        isCompleted && statusConfig.borderClass && 'border',
        // Pulsing amber border glow for approaching deadlines (within 3 days)
        isApproaching && !isCompleted && 'animate-pulse-soft ring-2 ring-amber-400/30 ring-offset-2 ring-offset-background dark:ring-offset-card',
        // Red border for overdue
        isOverdue && 'ring-2 ring-rose-400/40 ring-offset-2 ring-offset-background dark:ring-offset-card',
      )}
    >
      {/* ─── Thin full-width progress bar at very top ─────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-1 z-10 rounded-t-xl overflow-hidden">
        <div
          className="h-full transition-all duration-1000 ease-out rounded-t-xl"
          style={{
            width: `${animatedProgress}%`,
            backgroundColor: isCompleted ? '#10b981' : getProgressRingColor(goal.progress),
          }}
        />
      </div>

      {/* Subtle category-specific gradient background */}
      <div className={categoryGradientClass} />

      {/* Hover gradient overlay */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
        catConfig.bgClass,
      )} />

      {/* Celebratory gradient border for completed goals */}
      {isCompleted && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 pointer-events-none" />
      )}

      {/* Priority pulsing red dot — high priority in top-right corner */}
      {goal.priority === 'high' && !isCompleted && (
        <div className="absolute top-2 right-2 z-10">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse-soft shadow-sm shadow-rose-500/50" />
        </div>
      )}

      <CardContent className="relative p-4 space-y-3 pt-5 pb-5">
        {/* Top row: Category icon + Badge + Status + Priority + Deadline + Progress Ring */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap gap-y-1">
            {/* ─── Enhanced Category Icon with gradient background ──────────── */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
                  catConfig.iconGradientClass,
                )}>
                  {catConfig.largeIcon}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {catConfig.label}
              </TooltipContent>
            </Tooltip>

            {/* Status indicator with icon */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className={cn('h-2 w-2 rounded-full shrink-0', statusConfig.dotClass)} />
              <span className={cn('text-[10px] font-medium shrink-0', statusConfig.color)}>
                {statusConfig.label}
              </span>
            </div>

            {/* ─── Enhanced Priority Badge with pulse ──────────────────────── */}
            {priorityConfig && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border shrink-0',
                    priorityConfig.bgClass, priorityConfig.borderClass, priorityConfig.color,
                    priorityConfig.pulseClass,
                    goal.priority === 'high' && !isCompleted && 'animate-pulse-soft',
                  )}>
                    <priorityConfig.icon className="h-3 w-3" />
                    {priorityConfig.label}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Приоритет: {priorityConfig.label}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Deadline countdown badge — enhanced with warning/completed states */}
            {countdown && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 text-[10px] gap-1 font-medium cursor-default',
                      isOverdue && !isCompleted && 'animate-pulse-soft',
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50'
                        : getDeadlineBadgeClass(daysLeft),
                      (isApproaching || isOverdue) && !isCompleted && 'font-bold',
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (isApproaching || isOverdue) ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <Calendar className="h-3 w-3" />
                    )}
                    {isCompleted ? 'Завершено' : countdown}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {goal.deadline ? new Date(goal.deadline).toLocaleDateString('ru-RU') : ''}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Milestone celebration badge */}
          {milestone && !isCompleted && (
            <div className="absolute -top-2 -right-2 z-10 animate-bounce">
              <div className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-lg',
                goal.progress >= 100
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white'
                  : goal.progress >= 75
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                    : goal.progress >= 50
                      ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white'
                      : 'bg-gradient-to-r from-violet-400 to-purple-400 text-white',
              )}>
                <Sparkles className="h-3 w-3" />
                {milestone.label}
              </div>
            </div>
          )}

          {/* Large Progress Ring */}
          <div className="relative flex h-[56px] sm:h-[72px] w-[56px] sm:w-[72px] shrink-0 items-center justify-center">
            <svg className="h-[56px] sm:h-[72px] w-[56px] sm:w-[72px] -rotate-90" viewBox="0 0 72 72">
              <defs>
                <linearGradient id={`ring-grad-${goal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={getProgressRingColor(goal.progress)} />
                  <stop offset="100%" stopColor={isCompleted ? '#059669' : getProgressRingColor(goal.progress)} />
                </linearGradient>
              </defs>
              <circle cx="36" cy="36" r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-muted/50" />
              <circle
                cx="36" cy="36" r={radius} fill="none"
                strokeWidth={strokeWidth} strokeLinecap="round"
                stroke={`url(#ring-grad-${goal.id})`}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - animatedProgress / 100)}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: animatedProgress >= 100 ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))' : 'none',
                }}
              />
            </svg>
              <p className={cn('absolute font-bold text-xs sm:text-sm tabular-nums', getProgressTextColor(goal.progress))}>
              {Math.round(animatedProgress)}%
            </p>
          </div>
        </div>

        {/* Title + Description */}
        <div>
          <h3 className="font-semibold text-sm leading-tight flex items-center gap-2">
            {isCompleted && (
              <span className="line-through text-muted-foreground">{goal.title}</span>
            )}
            {!isCompleted && goal.title}
            {isCompleted && (
              <CheckCircle className="inline h-3.5 w-3.5 text-emerald-500 shrink-0" />
            )}
          </h3>
          {goal.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
          )}
        </div>

        {/* ─── Progress Bar with Milestone Dots ───────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Прогресс</span>
            <div className="flex items-center gap-2">
              {/* Current value label for goals with target */}
              {goal.targetValue != null && goal.targetValue > 0 && (
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {goal.currentValue} / {goal.targetValue}{goal.unit ? ` ${goal.unit}` : ''}
                </span>
              )}
              <span className={cn('text-xs font-bold tabular-nums', getProgressTextColor(goal.progress))}>
                {goal.progress}%
              </span>
            </div>
          </div>
          <div className="relative">
            <Progress
              value={goal.progress}
              className={cn('h-2', getProgressTrackColor(goal.progress), getProgressColor(goal.progress))}
            />
            {/* Milestone dots — only show for goals with a target */}
            {goal.targetValue != null && goal.targetValue > 0 && (
              <div className="absolute -bottom-1.5 left-0 right-0 flex items-center">
                {milestones.map((ms) => {
                  const passed = goal.progress >= ms
                  const isCurrent = milestone && milestone.threshold === ms
                  return (
                    <div
                      key={ms}
                      className="absolute flex flex-col items-center"
                      style={{ left: `${ms}%`, transform: 'translateX(-50%)' }}
                    >
                      <div
                        className={cn(
                          'h-1.5 w-1.5 rounded-full transition-all duration-300',
                          isCurrent
                            ? 'bg-amber-500 scale-150'
                            : passed
                              ? goal.progress >= 100 ? 'bg-emerald-500' : 'bg-foreground/40'
                              : 'bg-muted-foreground/20',
                        )}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── Goal Progress Timeline ──────────────────────────────────────── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              Хронология прогресса
            </span>
          </div>
          <div className="relative px-1">
            {/* Timeline line */}
            <div className="absolute top-[7px] left-[6px] right-[6px] h-0.5 bg-muted rounded-full" />
            {/* Filled portion */}
            <div
              className="absolute top-[7px] left-[6px] h-0.5 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `calc(${Math.min(animatedProgress, 100)}% - 4px)`,
                backgroundColor: isCompleted ? '#10b981' : getProgressRingColor(goal.progress),
                opacity: 0.6,
              }}
            />
            {/* Timeline dots */}
            <div className="relative flex items-center justify-between">
              {TIMELINE_MILESTONES.map((tm) => {
                const reached = goal.progress >= tm.pct
                const isLatest = goal.progress >= tm.pct && goal.progress < tm.pct + 25
                return (
                  <Tooltip key={tm.pct}>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center gap-1 cursor-default">
                        <div
                          className={cn(
                            'h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-all duration-500',
                            reached
                              ? isCompleted
                                ? 'bg-emerald-500 border-emerald-500 scale-110'
                                : 'bg-background border-emerald-400 scale-105'
                              : 'bg-background border-muted-foreground/25',
                            isLatest && !isCompleted && 'ring-2 ring-emerald-400/30',
                          )}
                        >
                          {reached && !isCompleted && (
                            <div className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              tm.pct === 100 ? 'bg-emerald-500' : 'bg-emerald-400',
                            )} />
                          )}
                          {reached && isCompleted && (
                            <CheckCircle className="h-2.5 w-2.5 text-white" />
                          )}
                        </div>
                        <span className={cn(
                          'text-[9px] font-medium transition-colors',
                          reached ? 'text-foreground/70' : 'text-muted-foreground/50',
                        )}>
                          {tm.label}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px]">
                      {reached ? `${tm.emoji} ${tm.pct}% достигнуто` : `${tm.pct}% — в планах`}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        </div>

        {/* ─── Milestone Progress Bar (for user-defined milestones) ────────── */}
        {totalMilestones > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Flag className="h-3 w-3" />
                Этапы
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums flex items-center gap-1">
                <span className={cn(
                  'font-semibold',
                  milestoneProgress >= 70 ? 'text-emerald-600 dark:text-emerald-400'
                    : milestoneProgress >= 40 ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400',
                )}>
                  {completedMilestones}
                </span>
                <span>/</span>
                <span>{totalMilestones}</span>
              </span>
            </div>
            {/* Mini milestone progress bar */}
            <div className="flex items-center gap-2">
              <Progress
                value={milestoneProgress}
                className={cn(
                  'h-1.5',
                  milestoneProgress >= 70
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 [&>div]:bg-emerald-500'
                    : milestoneProgress >= 40
                      ? 'bg-amber-100 dark:bg-amber-900/30 [&>div]:bg-amber-500'
                      : 'bg-rose-100 dark:bg-rose-900/30 [&>div]:bg-rose-500',
                )}
              />
              <span className={cn(
                'text-[10px] font-bold tabular-nums w-8 text-right',
                milestoneProgress >= 70 ? 'text-emerald-600 dark:text-emerald-400'
                  : milestoneProgress >= 40 ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400',
              )}>
                {milestoneProgress}%
              </span>
            </div>
            {/* Milestones list */}
            <div className="space-y-1">
              {milestonesData.map((ms, idx) => (
                <div
                  key={ms.id || idx}
                  className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted/30"
                >
                  <div
                    className={cn(
                      'h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                      ms.completed
                        ? 'bg-emerald-500 border-emerald-500 scale-110'
                        : 'border-muted-foreground/30 hover:border-muted-foreground/50',
                      ms.completed && 'animate-count-fade-in',
                    )}
                  >
                    {ms.completed && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <span className={cn(
                    'text-[11px] flex-1 truncate',
                    ms.completed && 'line-through text-muted-foreground',
                  )}>
                    {ms.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subcategory tags with colored icons and gradients */}
        {subcategoryDefs.length > 0 && totalMilestones === 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            {subcategoryDefs.slice(0, 4).map((sub) => {
              const SubIcon = sub.icon
              return (
                <Badge
                  key={sub.label}
                  variant="secondary"
                  className={cn(
                    'text-[9px] px-1.5 py-0 h-4 font-normal gap-1 border',
                    catConfig.badgeClass,
                  )}
                >
                  <SubIcon className="h-2.5 w-2.5" />
                  {sub.label}
                </Badge>
              )
            })}
          </div>
        )}

        {/* ─── Required Pace & Days Remaining ─────────────────────────────── */}
        {(requiredPace || daysRemaining !== null) && !isCompleted && (
          <div className="flex items-center gap-3 flex-wrap">
            {requiredPace && requiredPace.value > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-medium border',
                    progressTrend.trend === 'ahead' || progressTrend.trend === 'on_track'
                      ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400 border-sky-200 dark:border-sky-800/50'
                      : progressTrend.trend === 'behind'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
                  )}>
                    <Gauge className="h-3 w-3" />
                    <span className="tabular-nums">{requiredPace.value}%/день</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {requiredPace.label}
                </TooltipContent>
              </Tooltip>
            )}
            {daysRemaining !== null && daysRemaining > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-medium',
                    daysRemaining <= 7
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-muted-foreground',
                  )}>
                    <Clock className="h-3 w-3" />
                    <span className="tabular-nums">осталось {daysRemaining} дн.</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {goal.deadline ? new Date(goal.deadline).toLocaleDateString('ru-RU') : ''}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Info row: Target + Deadline + Velocity */}
        <div className="flex items-center gap-4 flex-wrap">
          {goal.targetValue != null && goal.targetValue > 0 && (
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground tabular-nums">
                {goal.currentValue} / {goal.targetValue}{goal.unit ? ` ${goal.unit}` : ''}
              </span>
            </div>
          )}
          {/* Deadline info row — enhanced display */}
          {countdown && (
            <div className={cn(
              'flex items-center gap-1.5',
              isCompleted
                ? 'text-emerald-500 dark:text-emerald-400'
                : getDeadlineUrgencyColor(daysLeft),
              (isApproaching || isOverdue) && !isCompleted && 'font-bold',
            )}>
              {isCompleted ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : (isApproaching || isOverdue) ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                <Clock className={cn('h-3.5 w-3.5', getDeadlineIconColor(daysLeft))} />
              )}
              <span className="text-xs tabular-nums">{isCompleted ? 'Завершено в срок' : countdown}</span>
            </div>
          )}
          {/* Progress trend indicator (on track / behind / ahead) */}
          {progressTrend.trend !== 'no_data' && !isCompleted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border shrink-0',
                  progressTrend.bgClass, progressTrend.borderClass, progressTrend.color,
                )}>
                  <span className="text-[10px]">{progressTrend.emoji}</span>
                  {progressTrend.label}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {progressTrend.trend === 'ahead' ? 'Вы опережаете график'
                  : progressTrend.trend === 'on_track' ? 'Прогресс соответствует графику'
                    : progressTrend.trend === 'behind' ? 'Немного отстаёте от графика'
                      : 'Цель под угрозой — нужно ускориться'}
              </TooltipContent>
            </Tooltip>
          )}
          {/* Progress trend indicator (on track / behind / ahead) */}
          {progressTrend.trend !== 'no_data' && !isCompleted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border shrink-0',
                  progressTrend.bgClass, progressTrend.borderClass, progressTrend.color,
                )}>
                  <span className="text-[10px]">{progressTrend.emoji}</span>
                  {progressTrend.label}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {progressTrend.trend === 'ahead' ? 'Вы опережаете график'
                  : progressTrend.trend === 'on_track' ? 'Прогресс соответствует графику'
                    : progressTrend.trend === 'behind' ? 'Немного отстаёте от графика'
                      : 'Цель под угрозой — нужно ускориться'}
              </TooltipContent>
            </Tooltip>
          )}
          {/* Progress velocity */}
          {velocityText && !isCompleted && (
            <div className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400">
              <Zap className="h-3 w-3" />
              <span className="text-[10px]">{velocityText}</span>
            </div>
          )}
        </div>

        {/* Quick Actions — more prominent on hover */}
        <div className="flex items-center gap-1 pt-1 transition-opacity duration-200 group-hover:opacity-100 opacity-80">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground active-press"
            onClick={() => onEdit(goal)}
            title="Редактировать"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {goal.status === 'active' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-emerald-500 active-press"
                onClick={() => onUpdateProgress(goal)}
                title="+5% прогресса"
              >
                <TrendingUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-emerald-500 active-press"
                onClick={() => onComplete(goal)}
                title="Завершить"
              >
                <CheckCircle className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <div className="ml-auto">
            {deleteConfirming ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 active-press"
                onClick={handleDeleteClick}
              >
                Удалить?
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive active-press"
                onClick={handleDeleteClick}
                title="Удалить"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      {/* Left colored border accent — 3px */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl opacity-70"
        style={{ backgroundColor: catConfig.borderColor }}
      />

      {/* ─── Thin full-width progress bar at very bottom ──────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 z-10 overflow-hidden">
        <div
          className="h-full transition-all duration-1000 ease-out"
          style={{
            width: `${animatedProgress}%`,
            background: `linear-gradient(90deg, ${catConfig.borderColor}, ${catConfig.borderColor}88)`,
            borderRadius: animatedProgress >= 100 ? '0' : '0 4px 4px 0',
          }}
        />
      </div>
    </Card>
    </TooltipProvider>
  )
}
