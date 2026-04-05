import { useState } from 'react'
import { Check, Calendar, Flame, Edit2, Trash2, Sparkles, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { HabitData } from './types'
import { getDayLabel } from './constants'

interface HabitCardProps {
  habit: HabitData
  last7Days: string[]
  onToggle: (habitId: string) => void
  onEdit: (habit: HabitData) => void
  onDeleteClick: (habitId: string) => void
  deleteConfirmId: string | null
}

// Difficulty colors
function getDifficultyBadge(frequency: string, targetCount: number) {
  // Simple heuristic based on frequency and target count
  const difficulty = targetCount >= 3 ? 'hard' : targetCount >= 2 ? 'medium' : 'easy'
  const colors = {
    easy: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Лёгкая' },
    medium: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', label: 'Средняя' },
    hard: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Сложная' },
  }
  return colors[difficulty]
}

// Completion sparkle animation component
function CompletionSparkle({ show, color }: { show: boolean; color: string }) {
  if (!show) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2
        const x = Math.cos(angle) * 20
        const y = Math.sin(angle) * 20
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 animate-sparkle"
            style={{
              '--sparkle-x': `${x}px`,
              '--sparkle-y': `${y}px`,
              animationDelay: `${i * 50}ms`,
            } as React.CSSProperties}
          >
            <Sparkles className="h-3 w-3" style={{ color }} />
          </div>
        )
      })}
    </div>
  )
}

export function HabitCard({ habit, last7Days, onToggle, onEdit, onDeleteClick, deleteConfirmId }: HabitCardProps) {
  const [showSparkle, setShowSparkle] = useState(false)
  const difficulty = getDifficultyBadge(habit.frequency, habit.targetCount)

  // Calculate completion rate for best streak display
  const completionRate = Object.values(habit.last7Days).filter(Boolean).length

  const handleToggle = () => {
    if (!habit.todayCompleted) {
      setShowSparkle(true)
    }
    onToggle(habit.id)
  }

  // Calculate week-over-week comparison
  const thisWeekCompleted = Object.values(habit.last7Days).filter(Boolean).length
  const lastWeekCompleted = Object.values(habit.lastMonthDays || {}).filter(Boolean).length

  return (
    <Card className="card-hover overflow-hidden relative group">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Toggle button */}
          <div className="relative">
            <button
              onClick={handleToggle}
              className="shrink-0 transition-transform hover:scale-110 active:scale-95"
              aria-label={habit.todayCompleted ? 'Отменить выполнение' : 'Отметить выполненным'}
            >
              {habit.todayCompleted ? (
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: habit.color }}
                >
                  <Check className="h-5 w-5" />
                </div>
              ) : (
                <div className="h-11 w-11 rounded-full border-2 border-muted-foreground/30 dark:border-muted-foreground/50 flex items-center justify-center" />
              )}
            </button>
            <CompletionSparkle show={showSparkle} color={habit.color} />
          </div>

          {/* Habit info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg">{habit.emoji}</span>
              <span className={`font-medium text-sm ${habit.todayCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {habit.name}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {habit.frequency === 'daily' ? 'Ежедневно' : 'Еженедельно'}
              </Badge>
              {/* Difficulty indicator */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${difficulty.bg} ${difficulty.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${difficulty.text.replace('text-', 'bg-')}`} />
                {difficulty.label}
              </span>
              {habit.streak >= 3 && (
                <span className="ml-auto flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  🔥 {habit.streak}д
                </span>
              )}
            </div>

            {/* Weekly mini-grid — GitHub-style contribution squares */}
            <div className="flex items-center gap-1.5 mt-2">
              <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
              <div className="flex gap-1">
                {last7Days.map((day) => {
                  const completed = habit.last7Days[day]
                  const isToday = day === new Date().toISOString().split('T')[0]
                  return (
                    <div
                      key={day}
                      className="flex flex-col items-center gap-0.5"
                      title={`${getDayLabel(day)} ${day}${completed ? ' ✓' : ''}`}
                    >
                      <div
                        className={`h-5 w-5 rounded-sm transition-all ${
                          completed ? 'scale-100 shadow-sm' : 'border border-muted-foreground/15 dark:border-muted-foreground/25'
                        } ${isToday ? 'ring-2 ring-offset-1 ring-background' : ''}`}
                        style={{
                          backgroundColor: completed ? habit.color : 'transparent',
                          opacity: completed ? 1 : 0.3,
                        }}
                      />
                      <span className="text-[9px] text-muted-foreground leading-none">
                        {getDayLabel(day)}
                      </span>
                    </div>
                  )
                })}
              </div>
              {/* Week comparison */}
              <span className="text-[9px] text-muted-foreground/50 ml-1 tabular-nums">
                {thisWeekCompleted}/7
              </span>
            </div>
          </div>

          {/* Streak + Best streak */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            {habit.streak > 0 ? (
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-bold tabular-nums">{habit.streak}</span>
                {habit.streak >= 3 && (
                  <span className="text-sm" role="img" aria-label="fire">🔥</span>
                )}
              </div>
            ) : (
              <div className="h-5" />
            )}
            {/* Best streak badge */}
            {completionRate >= 5 && (
              <div className="flex items-center gap-0.5 text-[9px] text-amber-500" title="Лучшая серия">
                <Trophy className="h-3 w-3" />
                <span className="font-medium tabular-nums">{completionRate}/7</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost" size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(habit)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            {deleteConfirmId === habit.id ? (
              <button
                onClick={() => onDeleteClick(habit.id)}
                className="flex h-9 items-center rounded-lg bg-destructive/10 px-2.5 text-xs font-medium text-destructive transition-all hover:bg-destructive/20"
              >
                Удалить?
              </button>
            ) : (
              <Button
                variant="ghost" size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => onDeleteClick(habit.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      {/* Left colored border accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: habit.color }}
      />
    </Card>
  )
}
