import { useState } from 'react'
import { Check, Flame, Edit2, Trash2, Sparkles, Trophy, Archive } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { HabitData } from './types'
import { getDayLabel, getCategoryLabel, getCategoryEmoji, getCategoryBorderClass, getCategoryColor } from './constants'
import { cn } from '@/lib/utils'

interface HabitCardProps {
  habit: HabitData
  last7Days: string[]
  onToggle: (habitId: string) => void
  onEdit: (habit: HabitData) => void
  onDeleteClick: (habitId: string) => void
  deleteConfirmId: string | null
  onArchive?: (habitId: string) => void
}

// Difficulty colors
function getDifficultyBadge(frequency: string, targetCount: number) {
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

export function HabitCard({ habit, last7Days, onToggle, onEdit, onDeleteClick, deleteConfirmId, onArchive }: HabitCardProps) {
  const [showSparkle, setShowSparkle] = useState(false)
  const [checkAnim, setCheckAnim] = useState(false)
  const difficulty = getDifficultyBadge(habit.frequency, habit.targetCount)
  const categoryColor = getCategoryColor(habit.category)
  const categoryBorderClass = getCategoryBorderClass(habit.category)

  // Calculate completion rate for best streak display
  const completionRate = Object.values(habit.last7Days).filter(Boolean).length

  const handleToggle = () => {
    if (!habit.todayCompleted) {
      setShowSparkle(true)
      setCheckAnim(true)
      setTimeout(() => setCheckAnim(false), 600)
      setTimeout(() => setShowSparkle(false), 800)
    }
    onToggle(habit.id)
  }

  // Calculate week-over-week comparison
  const thisWeekCompleted = Object.values(habit.last7Days).filter(Boolean).length

  const categoryLabel = getCategoryLabel(habit.category)
  const categoryEmoji = getCategoryEmoji(habit.category)

  return (
    <Card className={cn(
      'card-hover overflow-hidden relative group',
      categoryBorderClass,
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Toggle button with checkmark animation */}
          <div className="relative">
            <button
              onClick={handleToggle}
              className="shrink-0 transition-transform hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              aria-label={habit.todayCompleted ? 'Отменить выполнение' : 'Отметить выполненным'}
            >
              {habit.todayCompleted ? (
                <div
                  className={cn(
                    'h-11 w-11 rounded-full flex items-center justify-center text-white transition-shadow duration-300',
                    checkAnim && 'animate-[checkBounce_0.5s_ease-out]',
                    !checkAnim && 'shadow-md',
                  )}
                  style={{ backgroundColor: habit.color }}
                >
                  <Check
                    className={cn(
                      'h-5 w-5 text-white',
                      checkAnim && 'animate-[checkPop_0.3s_ease-out]',
                    )}
                    strokeWidth={3}
                  />
                </div>
              ) : (
                <div
                  className="h-11 w-11 rounded-full border-2 border-dashed border-muted-foreground/25 dark:border-muted-foreground/40 flex items-center justify-center hover:border-muted-foreground/50 dark:hover:border-muted-foreground/60 transition-colors"
                >
                  <div
                    className="h-5 w-5 rounded-full opacity-20"
                    style={{ backgroundColor: habit.color }}
                  />
                </div>
              )}
            </button>
            <CompletionSparkle show={showSparkle} color={habit.color} />
          </div>

          {/* Habit info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg">{habit.emoji}</span>
              <span className={`font-medium text-sm transition-all duration-300 ${habit.todayCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {habit.name}
              </span>
              {/* Category badge with category color */}
              <span
                className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                style={{ backgroundColor: categoryColor }}
              >
                {categoryEmoji} {categoryLabel}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {habit.frequency === 'daily' ? 'Ежедневно' : habit.frequency === 'weekdays' ? 'Будни' : habit.frequency === 'weekends' ? 'Выходные' : 'Еженедельно'}
              </Badge>
              {/* Difficulty indicator */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${difficulty.bg} ${difficulty.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${difficulty.text.replace('text-', 'bg-')}`} />
                {difficulty.label}
              </span>
            </div>

            {/* 7-day streak dots */}
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-[9px] text-muted-foreground/60 font-medium shrink-0">7 дней</span>
              <div className="flex gap-1.5">
                {last7Days.map((day) => {
                  const completed = habit.last7Days[day]
                  const isToday = day === new Date().toISOString().split('T')[0]
                  return (
                    <div
                      key={day}
                      className="relative flex flex-col items-center gap-1"
                      title={`${getDayLabel(day)} ${day}${completed ? ' ✓' : ''}`}
                    >
                      <div
                        className={cn(
                          'h-3 w-3 rounded-full transition-all duration-300',
                          completed
                            ? 'scale-100'
                            : 'scale-90 opacity-30',
                          isToday && completed && 'streak-dot-active',
                        )}
                        style={{
                          backgroundColor: completed ? habit.color : undefined,
                          border: completed ? 'none' : `1.5px solid ${habit.color}40`,
                        }}
                      />
                      <span className={cn(
                        'text-[8px] leading-none',
                        isToday ? 'text-foreground font-bold' : 'text-muted-foreground/50'
                      )}>
                        {getDayLabel(day)}
                      </span>
                    </div>
                  )
                })}
              </div>
              <span className="text-[9px] text-muted-foreground/50 ml-auto tabular-nums font-medium">
                {thisWeekCompleted}/7
              </span>
              {/* Streak flame for streak >= 3 */}
              {habit.streak >= 3 && (
                <span className="inline-flex items-center gap-0.5 text-orange-500 shrink-0">
                  <Flame className={cn('h-3.5 w-3.5', habit.streak >= 7 && 'animate-pulse')} />
                  <span className="text-[10px] font-bold tabular-nums">{habit.streak}д</span>
                </span>
              )}
            </div>
          </div>

          {/* Streak display */}
          {habit.streak > 0 && (
            <div className="flex flex-col items-center gap-0.5 shrink-0 self-center">
              <div className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1',
                habit.streak >= 7
                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20'
                  : 'bg-muted/50',
              )}>
                <Flame className={cn(
                  'h-4 w-4 text-orange-500',
                  habit.streak >= 7 && 'animate-pulse',
                )} />
                <span className="text-sm font-bold tabular-nums text-orange-600 dark:text-orange-400">
                  {habit.streak}
                </span>
              </div>
              {habit.bestStreak > habit.streak && habit.bestStreak >= 3 && (
                <span className="flex items-center gap-0.5 text-[9px] text-amber-500" title="Лучшая серия">
                  <Trophy className="h-2.5 w-2.5" />
                  <span className="font-medium tabular-nums">{habit.bestStreak}</span>
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost" size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(habit)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            {onArchive && (
              <Button
                variant="ghost" size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-amber-500"
                onClick={() => onArchive(habit.id)}
                title="Архивировать"
              >
                <Archive className="h-3.5 w-3.5" />
              </Button>
            )}
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
    </Card>
  )
}

// ─── Archived Habit Card ────────────────────────────────────────────────────

export function ArchivedHabitCard({ habit, onUnarchive, onDeleteClick, deleteConfirmId }: {
  habit: HabitData
  onUnarchive: (habitId: string) => void
  onDeleteClick: (habitId: string) => void
  deleteConfirmId: string | null
}) {
  return (
    <Card className="overflow-hidden relative opacity-60 hover:opacity-100 transition-opacity">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
            <span className="text-base">{habit.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium line-through text-muted-foreground">{habit.name}</span>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-muted/50">Архив</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Серия: {habit.streak}д · Лучшая: {habit.bestStreak}д
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-emerald-500"
              onClick={() => onUnarchive(habit.id)}
              title="Восстановить"
            >
              <Archive className="h-3.5 w-3.5 rotate-180" />
            </Button>
            {deleteConfirmId === habit.id ? (
              <button
                onClick={() => onDeleteClick(habit.id)}
                className="flex h-8 items-center rounded-lg bg-destructive/10 px-2 text-[11px] font-medium text-destructive transition-all hover:bg-destructive/20"
              >
                Удалить?
              </button>
            ) : (
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDeleteClick(habit.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
