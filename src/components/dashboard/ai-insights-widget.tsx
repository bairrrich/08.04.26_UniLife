'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Brain, Sparkles, RefreshCw, AlertCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────

interface InsightsData {
  summary: string
  tips: string[]
  mood: string
  score: number
  generatedAt: string
}

// ── Circular Progress Ring ──────────────────────────────────────────────

function ScoreRing({ score, mood }: { score: number; mood: string }) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  const color =
    score >= 80 ? 'text-emerald-500' :
    score >= 60 ? 'text-teal-500' :
    score >= 40 ? 'text-amber-500' :
    'text-red-400'
  const strokeColor =
    score >= 80 ? 'stroke-emerald-500' :
    score >= 60 ? 'stroke-teal-500' :
    score >= 40 ? 'stroke-amber-500' :
    'stroke-red-400'

  return (
    <div className="relative flex items-center justify-center">
      <svg width="76" height="76" className="-rotate-90">
        <circle
          cx="38"
          cy="38"
          r={radius}
          fill="none"
          strokeWidth="5"
          className="stroke-muted"
        />
        <circle
          cx="38"
          cy="38"
          r={radius}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className={cn(strokeColor, 'transition-all duration-1000 ease-out')}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg">{mood}</span>
        <span className={cn('text-xs font-bold tabular-nums', color)}>{score}</span>
      </div>
    </div>
  )
}

// ── Typing Animation for Summary ────────────────────────────────────────

function TypingSummary({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    setDisplayed('')
    setIsTyping(true)

    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayed(prev => prev + text[index])
        index++
      } else {
        setIsTyping(false)
        clearInterval(interval)
        onComplete?.()
      }
    }, 18)

    return () => clearInterval(interval)
  }, [text, onComplete])

  return (
    <p className="text-sm leading-relaxed text-foreground/90">
      {displayed}
      {isTyping && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary" />
      )}
    </p>
  )
}

// ── Expandable Tip Item ─────────────────────────────────────────────────

function TipItem({ tip, index }: { tip: string; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={cn(
        'group flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left transition-all duration-200',
        'hover:bg-muted/60 active:scale-[0.98]',
        expanded && 'bg-muted/40',
      )}
    >
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
        <Lightbulb className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Совет {index + 1}
          </span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
          )}
        </div>
        <p className={cn(
          'text-sm text-foreground/85 transition-all duration-200',
          !expanded && 'line-clamp-2',
        )}>
          {tip}
        </p>
      </div>
    </button>
  )
}

// ── Skeleton State ──────────────────────────────────────────────────────

function InsightsSkeleton() {
  return (
    <Card className="overflow-hidden rounded-xl border border-border/50">
      {/* Gradient header skeleton */}
      <div className="h-2 w-full bg-gradient-to-r from-muted to-muted" />

      <CardContent className="space-y-4 p-5">
        {/* Title skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-5 w-40" />
        </div>

        {/* Summary skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Score + tips skeleton */}
        <div className="flex items-start gap-4">
          <Skeleton className="h-[76px] w-[76px] rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Error State ─────────────────────────────────────────────────────────

function InsightsError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="overflow-hidden rounded-xl border border-destructive/30">
      <div className="h-2 bg-gradient-to-r from-red-400 to-orange-400" />
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Не удалось загрузить инсайты</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Произошла ошибка при генерации AI-инсайтов
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Попробовать снова
        </Button>
      </CardContent>
    </Card>
  )
}

// ── Main Widget ─────────────────────────────────────────────────────────

export default function AiInsightsWidget() {
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [typingDone, setTypingDone] = useState(false)

  const fetchInsights = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
      setError(false)
      setTypingDone(false)
    } else {
      setLoading(true)
      setError(false)
    }

    try {
      const today = new Date().toISOString().slice(0, 10)
      const res = await fetch(`/api/ai/insights?date=${today}`, {
        signal: AbortSignal.timeout(30000),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const text = await res.text()
      if (text.trimStart().startsWith('<')) throw new Error('Received HTML')

      const json = JSON.parse(text)
      if (!json.success || !json.data) throw new Error('Invalid response')

      setInsights(json.data)
      setTypingDone(false)
    } catch (err) {
      console.error('Failed to fetch AI insights:', err)
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  // ── Render ──────────────────────────────────────────────────────────

  if (loading) return <InsightsSkeleton />

  if (error && !insights) return <InsightsError onRetry={() => fetchInsights(true)} />

  if (!insights) return null

  const scoreLabel =
    insights.score >= 80 ? 'Отлично!' :
    insights.score >= 60 ? 'Хорошо' :
    insights.score >= 40 ? 'Нормально' :
    'Есть над чем работать'

  return (
    <div className="animate-slide-up">
      <Card className="group overflow-hidden rounded-xl border border-border/50 shadow-sm transition-shadow duration-300 hover:shadow-md">
        {/* ── Gradient Header Bar ─────────────────────────────────── */}
        <div className="relative h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

        <CardContent className="p-5">
          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                <Brain className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-foreground">AI-инсайты</h3>
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Персонализированный анализ дня
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchInsights(true)}
              disabled={refreshing}
              className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw
                className={cn(
                  'h-3.5 w-3.5',
                  refreshing && 'animate-spin',
                )}
              />
              <span className="hidden sm:inline">Обновить</span>
            </Button>
          </div>

          {/* ── Main Content ──────────────────────────────────────── */}
          <div className="mt-4 flex items-start gap-4">
            {/* Score Ring */}
            <div className="shrink-0 pt-0.5">
              <ScoreRing score={insights.score} mood={insights.mood} />
              <p className="mt-1.5 text-center text-[10px] font-medium text-muted-foreground">
                {scoreLabel}
              </p>
            </div>

            {/* Summary + Tips */}
            <div className="min-w-0 flex-1 space-y-3">
              {/* Summary with typing effect */}
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Brain className="h-3 w-3" />
                  Итог дня
                </p>
                <TypingSummary
                  text={insights.summary}
                  onComplete={() => setTypingDone(true)}
                />
              </div>

              {/* Expandable Tips */}
              {typingDone && insights.tips.length > 0 && (
                <div className="fade-in-bottom space-y-1">
                  <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    <Lightbulb className="h-3 w-3 text-amber-500" />
                    Рекомендации
                  </p>
                  <div className="max-h-64 space-y-0.5 overflow-y-auto rounded-lg border border-border/40 p-1 scrollbar-thin">
                    {insights.tips.map((tip, i) => (
                      <TipItem key={i} tip={tip} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Error retry when refreshing fails */}
              {error && insights && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/5 p-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                  <p className="text-xs text-destructive/80">Ошибка обновления</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchInsights(true)}
                    className="ml-auto h-6 px-2 text-[11px]"
                  >
                    Повторить
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ─────────────────────────────────────────────── */}
          <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5">
            <p className="text-[10px] text-muted-foreground/60">
              Создано с помощью AI
            </p>
            {insights.generatedAt && (
              <p className="text-[10px] text-muted-foreground/60">
                {new Date(insights.generatedAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
