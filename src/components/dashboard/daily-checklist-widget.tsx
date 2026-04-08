'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ClipboardCheck, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────

interface ChecklistItem {
  id: string
  text: string
  emoji: string
  completed: boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: 'water', text: 'Выпить стакан воды', emoji: '💧', completed: false },
  { id: 'activity', text: '30 минут активности', emoji: '🏃', completed: false },
  { id: 'diary', text: 'Записать мысли в дневник', emoji: '📝', completed: false },
  { id: 'lunch', text: 'Полезный обед', emoji: '🥗', completed: false },
  { id: 'meditation', text: '10 минут медитации', emoji: '🧘', completed: false },
]

// ─── Helpers ──────────────────────────────────────────────────────────────

function getTodayKey(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `unilife-daily-checklist-${y}-${m}-${d}`
}

function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Component ────────────────────────────────────────────────────────────

export default function DailyChecklistWidget() {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_ITEMS
    try {
      const raw = localStorage.getItem(getTodayKey())
      if (raw) {
        const parsed = JSON.parse(raw) as ChecklistItem[]
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ITEMS
      }
    } catch {
      // ignore
    }
    return DEFAULT_ITEMS
  })
  const [newItemText, setNewItemText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Persist to localStorage ─────────────────────────────────────────
  const persist = useCallback((updatedItems: ChecklistItem[]) => {
    try {
      localStorage.setItem(getTodayKey(), JSON.stringify(updatedItems))
    } catch {
      // ignore storage errors
    }
  }, [])

  // ── Toggle item ─────────────────────────────────────────────────────
  const handleToggle = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
        persist(next)
        return next
      })
    },
    [persist]
  )

  // ── Add item ────────────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    const text = newItemText.trim()
    if (!text) return

    // Pick a random emoji for custom items
    const emojis = ['✨', '🎯', '💡', '⭐', '📌', '🔖', '🎪', '🌟']
    const emoji = emojis[Math.floor(Math.random() * emojis.length)]

    const newItem: ChecklistItem = {
      id: generateId(),
      text,
      emoji,
      completed: false,
    }

    setItems((prev) => {
      const next = [...prev, newItem]
      persist(next)
      return next
    })
    setNewItemText('')
    inputRef.current?.focus()
  }, [newItemText, persist])

  // ── Delete item ─────────────────────────────────────────────────────
  const handleDelete = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((item) => item.id !== id)
        persist(next)
        return next
      })
    },
    [persist]
  )

  // ── Keyboard: Enter to add ──────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAdd()
      }
    },
    [handleAdd]
  )

  // ── Derived ─────────────────────────────────────────────────────────
  const totalItems = items.length
  const completedCount = items.filter((i) => i.completed).length
  const percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0
  const allComplete = totalItems > 0 && completedCount === totalItems

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-4 w-4 text-emerald-500" />
            Задачи на сегодня
          </CardTitle>
          {totalItems > 0 && (
            <span
              className={cn(
                'animate-count-fade-in text-xs font-medium tabular-nums',
                allComplete
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground'
              )}
            >
              {completedCount} из {totalItems}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Progress bar ──────────────────────────────────────────── */}
        {totalItems > 0 && (
          <div className="space-y-1.5">
            <Progress
              value={percentage}
              className="h-2 [&>div]:bg-emerald-500"
            />
          </div>
        )}

        {/* ── Items list ────────────────────────────────────────────── */}
        {items.length > 0 ? (
          <div className="stagger-children space-y-1 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'group flex min-h-[40px] items-center gap-3 rounded-lg px-2.5 py-2 transition-all duration-200',
                  'hover:bg-accent/50',
                  item.completed && 'bg-muted/30'
                )}
              >
                {/* Checkbox */}
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => handleToggle(item.id)}
                  className="shrink-0 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  aria-label={`Отметить: ${item.text}`}
                />

                {/* Emoji */}
                <span
                  className={cn(
                    'shrink-0 text-sm transition-all duration-200',
                    item.completed && 'grayscale opacity-50'
                  )}
                >
                  {item.emoji}
                </span>

                {/* Text */}
                <span
                  className={cn(
                    'flex-1 text-sm transition-all duration-200',
                    item.completed
                      ? 'text-muted-foreground line-through'
                      : 'text-foreground'
                  )}
                >
                  {item.text}
                </span>

                {/* Delete button — shown on hover */}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className={cn(
                    'shrink-0 flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200',
                    'opacity-0 group-hover:opacity-100',
                    'text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10'
                  )}
                  aria-label={`Удалить: ${item.text}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {/* ── Celebration ───────────────────────────────────────────── */}
        {allComplete && (
          <div
            className={cn(
              'animate-scale-in rounded-lg px-4 py-2.5 text-center',
              'bg-gradient-to-r from-emerald-50 to-teal-50',
              'dark:from-emerald-950/30 dark:to-teal-950/30'
            )}
          >
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Все задачи выполнены! 🎉
            </p>
          </div>
        )}

        {/* ── Add item ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 pt-1">
          <Input
            ref={inputRef}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Новая задача..."
            className="h-9 flex-1 rounded-lg text-sm"
            maxLength={100}
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!newItemText.trim()}
            className="h-9 shrink-0 gap-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Добавить</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
