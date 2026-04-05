'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/store/use-app-store'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, ArrowRight, CalendarDays } from 'lucide-react'
import { MOOD_EMOJI, MOOD_LABELS, getRelativeTime } from '@/lib/format'
import type { DiaryEntry } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecentDiaryWidgetProps {
  loading: boolean
  diaryEntries: DiaryEntry[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

function getMoodGradient(mood: number | null): string {
  if (!mood) return ''
  switch (mood) {
    case 1: return 'from-red-50/40 to-transparent dark:from-red-950/20'
    case 2: return 'from-orange-50/40 to-transparent dark:from-orange-950/20'
    case 3: return 'from-yellow-50/40 to-transparent dark:from-yellow-950/20'
    case 4: return 'from-lime-50/40 to-transparent dark:from-lime-950/20'
    case 5: return 'from-emerald-50/40 to-transparent dark:from-emerald-950/20'
    default: return ''
  }
}

function getMoodText(mood: number): string {
  return MOOD_LABELS[mood] || ''
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecentDiaryWidget({ loading, diaryEntries }: RecentDiaryWidgetProps) {
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  // Get last 3 diary entries sorted by date descending
  const recentEntries = useMemo(() => {
    return [...diaryEntries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
  }, [diaryEntries])

  return (
    <Card className="animate-slide-up card-hover rounded-xl border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
            <BookOpen className="h-4 w-4 text-emerald-500" />
          </div>
          Последние записи
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-muted-foreground"
          onClick={() => setActiveModule('diary')}
        >
          Все записи
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-40 rounded" />
                  <Skeleton className="h-2.5 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recentEntries.length === 0 ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <BookOpen className="h-6 w-6 text-emerald-500/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Нет записей</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Начните записывать свои мысли
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={() => setActiveModule('diary')}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Создать запись
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {recentEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setActiveModule('diary')}
                className={`flex min-h-[44px] w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-muted/50 active-press ${getMoodGradient(entry.mood)}`}
              >
                {/* Mood emoji */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-lg">
                  {entry.mood ? MOOD_EMOJI[entry.mood] : '📝'}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate leading-tight">
                    {entry.title || (entry.mood ? getMoodText(entry.mood) : 'Без заголовка')}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDateShort(entry.date)}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{getRelativeTime(entry.date)}</span>
                  </div>
                </div>

                {/* Mood indicator badge */}
                {entry.mood && (
                  <span className="shrink-0 text-[10px] font-medium text-muted-foreground/60">
                    {MOOD_EMOJI[entry.mood]} {getMoodText(entry.mood)}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
