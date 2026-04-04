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

  return (
    <Card className="card-hover overflow-hidden relative">
      <CardContent className="p-4 space-y-3">
        {/* Top row: Category badge + Status + Progress Ring */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Badge variant="secondary" className={`text-xs gap-1 shrink-0 ${catConfig.badgeClass}`}>
              {catConfig.icon}
              {catConfig.label}
            </Badge>
            {getDeadlineWarning(goal.deadline) && goal.status === 'active' && (
              <Badge className="shrink-0 text-[10px] bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/50 animate-pulse-soft">
                ⚠️ Скоро дедлайн
              </Badge>
            )}
            <div className={`h-2 w-2 rounded-full shrink-0 ${statusConfig.dotClass}`} />
            <span className={`text-xs font-medium shrink-0 ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          {/* Progress Ring */}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <svg className="h-10 w-10 -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" className="stroke-muted" />
              <circle
                cx="20" cy="20" r="16" fill="none"
                strokeWidth="3" strokeLinecap="round"
                stroke={getProgressRingColor(goal.progress)}
                strokeDasharray={100.5}
                strokeDashoffset={100.5 * (1 - goal.progress / 100)}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className={`absolute text-[9px] font-bold tabular-nums ${getProgressTextColor(goal.progress)}`}>
              {goal.progress}%
            </span>
          </div>
        </div>

        {/* Title + Description */}
        <div>
          <h3 className="font-semibold text-sm leading-tight">
            {goal.status === 'completed' && (
              <span className="line-through text-muted-foreground mr-1.5">{goal.title}</span>
            )}
            {goal.status !== 'completed' && goal.title}
            {goal.status === 'completed' && (
              <CheckCircle className="inline h-3.5 w-3.5 text-blue-500 ml-1" />
            )}
          </h3>
          {goal.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Прогресс</span>
            <span className={`text-xs font-bold tabular-nums ${getProgressTextColor(goal.progress)}`}>
              {goal.progress}%
            </span>
          </div>
          <Progress
            value={goal.progress}
            className={`h-2 ${getProgressTrackColor(goal.progress)} ${getProgressColor(goal.progress)}`}
          />
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
            <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-500' : 'text-muted-foreground'}`}>
              <Clock className="h-3.5 w-3.5" />
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
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(goal.id)} title="Удалить">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
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
