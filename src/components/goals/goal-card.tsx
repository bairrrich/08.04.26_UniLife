'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Pencil, TrendingUp, CheckCircle, Target, Clock, Trash2, Calendar, Sparkles, Star } from 'lucide-react'
import type { GoalData } from './types'
import {
  CATEGORY_CONFIG,
  DEFAULT_CATEGORY,
  STATUS_CONFIG,
  DEFAULT_STATUS,
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

function getMilestone(progress: number) {
  return MILESTONES.find((m) => progress >= m.threshold && progress < m.threshold + 5) || null
}

export function GoalCard({ goal, onEdit, onUpdateProgress, onComplete, onDelete }: GoalCardProps) {
  const catConfig = CATEGORY_CONFIG[goal.category] || DEFAULT_CATEGORY
  const statusConfig = STATUS_CONFIG[goal.status] || DEFAULT_STATUS
  const daysLeft = getDeadlineDaysLeft(goal.deadline)
  const countdown = getDeadlineCountdown(goal.deadline)
  const isOverdue = daysLeft !== null && daysLeft < 0 && goal.status !== 'completed'
  const isApproaching = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && goal.status !== 'completed'

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

  // ─── Milestones ───────────────────────────────────────────────────────────
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

  return (
    <Card
      ref={cardRef}
      className={cn(
        'card-hover overflow-hidden relative group transition-all duration-300',
        'hover:scale-[1.01]',
        catConfig.hoverGlow,
        isCompleted && statusConfig.borderClass && 'border',
        // Pulsing amber border glow for approaching deadlines
        isApproaching && !isCompleted && 'animate-pulse-soft ring-2 ring-amber-400/30 ring-offset-2 ring-offset-background dark:ring-offset-card',
        // Red border for overdue
        isOverdue && 'ring-2 ring-rose-400/40 ring-offset-2 ring-offset-background dark:ring-offset-card',
      )}
    >
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

      <CardContent className="relative p-4 space-y-3">
        {/* Top row: Category icon+badge + Status + Deadline Badge + Progress Ring */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap gap-y-1">
            {/* Category icon inside colored circle */}
            <div className={cn('h-7 w-7 rounded-full flex items-center justify-center shrink-0', catConfig.iconBgClass)}>
              {catConfig.icon}
            </div>
            <Badge variant="secondary" className={cn('text-[10px] gap-1 shrink-0', catConfig.badgeClass)}>
              {catConfig.label}
            </Badge>

            {/* Status indicator with icon */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className={cn('h-2 w-2 rounded-full shrink-0', statusConfig.dotClass)} />
              <span className={cn('text-[10px] font-medium shrink-0', statusConfig.color)}>
                {statusConfig.label}
              </span>
            </div>

            {/* Deadline countdown badge */}
            {countdown && !isCompleted && (
              <Badge
                variant="outline"
                className={cn(
                  'shrink-0 text-[10px] gap-1 font-medium',
                  isOverdue && 'animate-pulse-soft',
                  getDeadlineBadgeClass(daysLeft),
                )}
              >
                <Calendar className="h-3 w-3" />
                {countdown}
              </Badge>
            )}

          {/* Warning badge for approaching deadlines */}
            {getDeadlineWarning(goal.deadline) && goal.status === 'active' && !isOverdue && daysLeft !== null && daysLeft > 3 && (
              <Badge className="shrink-0 text-[10px] bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/50 animate-pulse-soft hidden sm:inline-flex">
                ⚠️ Скоро
              </Badge>
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

        {/* Progress Bar with Milestone Dots */}
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

        {/* Info row: Target + Deadline (simpler, only when no badge shown above) */}
        <div className="flex items-center gap-4 flex-wrap">
          {goal.targetValue != null && goal.targetValue > 0 && (
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground tabular-nums">
                {goal.currentValue} / {goal.targetValue}{goal.unit ? ` ${goal.unit}` : ''}
              </span>
            </div>
          )}
          {countdown && !isCompleted && (
            <div className={cn('flex items-center gap-1.5', getDeadlineUrgencyColor(daysLeft))}>
              <Clock className={cn('h-3.5 w-3.5', getDeadlineIconColor(daysLeft))} />
              <span className="text-xs tabular-nums">{countdown}</span>
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
      {/* Left colored border accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-60"
        style={{ backgroundColor: catConfig.borderColor }}
      />
    </Card>
  )
}
