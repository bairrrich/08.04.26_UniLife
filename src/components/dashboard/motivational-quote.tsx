'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, RefreshCw } from 'lucide-react'
import { MOTIVATIONAL_QUOTES } from './constants'

// ─── Props ────────────────────────────────────────────────────────────────────

interface MotivationalQuoteProps {
  quoteIndex: number
  quoteRefreshing: boolean
  onRefresh: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MotivationalQuote({ quoteIndex, quoteRefreshing, onRefresh }: MotivationalQuoteProps) {
  return (
    <Card className="animate-slide-up card-hover overflow-hidden rounded-xl border border-transparent bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/20">
      {/* Decorative gradient accent bar at top */}
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400" />
      <CardContent className="relative p-5">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-200/30 blur-2xl dark:bg-emerald-800/20" />
        <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-teal-200/30 blur-xl dark:bg-teal-800/20" />
        <div className="relative">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Вдохновение дня
              </h3>
            </div>
            <button
              onClick={onRefresh}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/60 hover:text-emerald-600 dark:hover:bg-white/10 dark:hover:text-emerald-400"
              title="Другая цитата"
            >
              <RefreshCw className={`h-3.5 w-3.5 transition-transform duration-300 ${quoteRefreshing ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <blockquote className="relative pl-3">
            {/* Decorative quote icon */}
            <span className="text-gradient-emerald absolute -left-1 -top-3 text-3xl font-serif leading-none select-none">&ldquo;</span>
            <div className="absolute bottom-0 left-0 top-0 w-0.5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-400" />
            <p className="italic text-sm leading-relaxed text-muted-foreground">
              &laquo;{MOTIVATIONAL_QUOTES[quoteIndex].text}&raquo;
            </p>
            <footer className="mt-2 text-xs text-muted-foreground">
              — {MOTIVATIONAL_QUOTES[quoteIndex].author}
            </footer>
          </blockquote>
        </div>
      </CardContent>
    </Card>
  )
}
