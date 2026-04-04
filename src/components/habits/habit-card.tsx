import { Check, Calendar, Flame, Edit2, Trash2 } from 'lucide-react'
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

export function HabitCard({ habit, last7Days, onToggle, onEdit, onDeleteClick, deleteConfirmId }: HabitCardProps) {
  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Toggle button */}
          <button
            onClick={() => onToggle(habit.id)}
            className="shrink-0 transition-transform hover:scale-110 active:scale-95"
          >
            {habit.todayCompleted ? (
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: habit.color }}
              >
                <Check className="h-4.5 w-4.5" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center" />
            )}
          </button>

          {/* Habit info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{habit.emoji}</span>
              <span className={`font-medium text-sm ${habit.todayCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {habit.name}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {habit.frequency === 'daily' ? 'Ежедневно' : 'Еженедельно'}
              </Badge>
              {habit.streak >= 3 && (
                <span className="ml-auto flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  🔥 {habit.streak}д
                </span>
              )}
            </div>

            {/* Weekly mini-grid */}
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
                      title={`${getDayLabel(day)} ${day}`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full transition-all ${
                          completed ? 'scale-100' : 'border border-muted-foreground/20'
                        } ${isToday ? 'ring-2 ring-offset-1 ring-background' : ''}`}
                        style={{
                          backgroundColor: completed ? habit.color : undefined,
                          opacity: completed ? 1 : 0.4,
                        }}
                      />
                      <span className="text-[9px] text-muted-foreground leading-none">
                        {getDayLabel(day)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Streak */}
          {habit.streak > 0 && (
            <div className="flex items-center gap-1 text-orange-500 shrink-0">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-bold tabular-nums">{habit.streak}</span>
              {habit.streak >= 3 && (
                <span className="text-sm" role="img" aria-label="fire">🔥</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(habit)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            {deleteConfirmId === habit.id ? (
              <button
                onClick={() => onDeleteClick(habit.id)}
                className="flex h-8 items-center rounded-lg bg-destructive/10 px-2.5 text-xs font-medium text-destructive transition-all hover:bg-destructive/20"
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
      {/* Left colored border accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: habit.color }}
      />
    </Card>
  )
}
