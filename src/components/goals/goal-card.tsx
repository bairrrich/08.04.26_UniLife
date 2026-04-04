'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Pencil, TrendingUp, CheckCircle, Target, Clock, Trash2 } from 'lucide-react'
import type { GoalData } from './types'
import {
  CATEGORY_CONFIG,
  STATUS_CONFIG,
  getDeadlineCountdown,
  getProgressColor,
  getProgressTrackColor,
  getProgressTextColor,
  getProgressRingColor,
  getDeadlineWarning,
} from './constants'

interface GoalCardProps {
  goal: GoalData
  onEdit: (goal: GoalData) => void
  onUpdateProgress: (goal: GoalData) => void
  onComplete: (goal: GoalData) => void
  onDelete: (goalId: string) => void
}

export function GoalCard({ goal, onEdit, onUpdateProgress, onComplete, onDelete }: GoalCardProps) {
  const catConfig = CATEGORY_CONFIG[goal.category] || CATEGORY_CONFIG.personal
  const statusConfig = STATUS_CONFIG[goal.status] || STATUS_CONFIG.active
  const countdown = getDeadlineCountdown(goal.deadline)
  const isOverdue = countdown && goal.deadline && new Date(goal.deadline) < new Date() && goal.status === 'active'

  // ─── Animated progress ring ───────────────────────────────────────────────
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(goal.progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [goal.progress])

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
      // Second click — confirm delete
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
      setDeleteConfirming(false)
      onDelete(goal.id)
    } else {
      // First click — show confirmation
      setDeleteConfirming(true)
      deleteTimerRef.current = setTimeout(() => {
        setDeleteConfirming(false)
      }, 3000)
    }
  }

  // ─── Deadline urgency color ───────────────────────────────────────────────
  const getDeadlineUrgencyColor = () => {
    if (!goal.deadline) return ''
    const now = new Date()
    const dl = new Date(goal.deadline)
    const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (isOverdue || diffDays < 0) return 'text-rose-500 dark:text-rose-400'
    if (diffDays <= 7) return 'text-amber-500 dark:text-amber-400'
    return 'text-emerald-500 dark:text-emerald-400'
  }

  const getDeadlineIconColor = () => {
    if (!goal.deadline) return 'text-muted-foreground'
    const now = new Date()
    const dl = new Date(goal.deadline)
    const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (isOverdue || diffDays < 0) return 'text-rose-500'
    if (diffDays <= 7) return 'text-amber-500'
    return 'text-emerald-500'
  }

  // ─── Milestones ───────────────────────────────────────────────────────────
  const milestones = [25, 50, 75, 100]

  // ─── SVG progress ring params ─────────────────────────────────────────────
  const radius = 32
  const strokeWidth = 4
  const circumference = 2 * Math.PI * radius

  return (
    <Card
      ref={cardRef}
      className="card-hover overflow-hidden relative group"
    >
      {/* Subtle gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${catConfig.bgClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      <CardContent className="relative p-4 space-y-3">
        {/* Top row: Category icon+badge + Status + Progress Ring */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Category icon inside colored circle */}
            <div className={`h-7 w-7 rounded-full ${catConfig.iconBgClass} flex items-center justify-center shrink-0`}>
              {catConfig.icon}
            </div>
            <Badge variant="secondary" className={`text-[10px] gap-1 shrink-0 ${catConfig.badgeClass}`}>
              {catConfig.label}
            </Badge>
            {getDeadlineWarning(goal.deadline) && goal.status === 'active' && (
              <Badge className="shrink-0 text-[10px] bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/50 animate-pulse-soft">
                ⚠️ Скоро
              </Badge>
            )}
            <div className={`h-2 w-2 rounded-full shrink-0 ${statusConfig.dotClass}`} />
            <span className={`text-[10px] font-medium shrink-0 ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          {/* Large Progress Ring */}
          <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center">
            <svg className="h-[72px] w-[72px] -rotate-90" viewBox="0 0 72 72">
              <defs>
                <linearGradient id={`ring-grad-${goal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
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
                  filter: animatedProgress >= 100 ? 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))' : 'none',
                }}
              />
            </svg>
            <span className={`absolute font-bold text-sm tabular-nums ${getProgressTextColor(goal.progress)}`}>
              {Math.round(animatedProgress)}%
            </span>
          </div>
        </div>

        {/* Title + Description */}
        <div>
          <h3 className="font-semibold text-sm leading-tight flex items-center gap-2">
            {goal.status === 'completed' && (
              <span className="line-through text-muted-foreground">{goal.title}</span>
            )}
            {goal.status !== 'completed' && goal.title}
            {goal.status === 'completed' && (
              <CheckCircle className="inline h-3.5 w-3.5 text-blue-500 shrink-0" />
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
            <span className={`text-xs font-bold tabular-nums ${getProgressTextColor(goal.progress)}`}>
              {goal.progress}%
            </span>
          </div>
          <div className="relative">
            <Progress
              value={goal.progress}
              className={`h-2 ${getProgressTrackColor(goal.progress)} ${getProgressColor(goal.progress)}`}
            />
            {/* Milestone dots */}
            <div className="absolute -bottom-1.5 left-0 right-0 flex items-center">
              {milestones.map((ms) => {
                const passed = goal.progress >= ms
                return (
                  <div
                    key={ms}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${ms}%`, transform: 'translateX(-50%)' }}
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                        passed
                          ? goal.progress >= 100 ? 'bg-emerald-500' : 'bg-foreground/40'
                          : 'bg-muted-foreground/20'
                      }`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Info row: Target + Deadline */}
        <div className="flex items-center gap-4 flex-wrap">
          {goal.targetValue != null && (
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground tabular-nums">
                {goal.currentValue} / {goal.targetValue}{goal.unit ? ` ${goal.unit}` : ''}
              </span>
            </div>
          )}
          {countdown && (
            <div className={`flex items-center gap-1.5 ${getDeadlineUrgencyColor()}`}>
              <Clock className={`h-3.5 w-3.5 ${getDeadlineIconColor()}`} />
              <span className="text-xs tabular-nums">{countdown}</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 pt-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(goal)} title="Редактировать">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {goal.status === 'active' && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-500"
                onClick={() => onUpdateProgress(goal)} title="+5% прогресса">
                <TrendingUp className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                onClick={() => onComplete(goal)} title="Завершить">
                <CheckCircle className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <div className="ml-auto">
            {deleteConfirming ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                onClick={handleDeleteClick}
              >
                Удалить?
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={handleDeleteClick} title="Удалить">
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
