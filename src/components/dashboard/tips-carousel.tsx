'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DashboardSection from '@/components/dashboard/dashboard-section'

// ─── Tip Data ─────────────────────────────────────────────────────────────────

interface Tip {
  emoji: string
  text: string
}

const TIPS: Tip[] = [
  {
    emoji: '🧠',
    text: 'Правило 2 минут: если дело занимает меньше 2 минут — сделайте его сейчас',
  },
  {
    emoji: '📚',
    text: 'Чтение 20 минут в день = 12 книг в год',
  },
  {
    emoji: '💧',
    text: 'Выпивайте стакан воды каждое утро перед едой',
  },
  {
    emoji: '🏃',
    text: 'Даже 10 минут движения лучше, чем ничего',
  },
  {
    emoji: '😴',
    text: '7-8 часов сна — основа продуктивности',
  },
  {
    emoji: '🎯',
    text: 'Ставьте 3 главные цели на каждый день',
  },
  {
    emoji: '📝',
    text: 'Ведение дневника снижает уровень стресса на 30%',
  },
  {
    emoji: '💰',
    text: 'Откладывайте 10% от каждого дохода',
  },
]

// ─── Animation Config ─────────────────────────────────────────────────────────

const TIP_ANIMATION_DURATION = 0.4
const AUTO_ROTATION_INTERVAL = 8000

const tipVariants = {
  enter: { opacity: 0, y: 10, filter: 'blur(4px)' },
  center: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: TIP_ANIMATION_DURATION, ease: 'easeInOut' as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(4px)',
    transition: { duration: TIP_ANIMATION_DURATION * 0.7, ease: 'easeInOut' as const },
  },
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TipsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isManualRef = useRef(false)

  // Shuffle tips deterministically based on the day of the year
  const shuffledTips = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const dayOfYear = Math.floor(
      (now.getTime() - start.getTime()) / 86_400_000
    )

    // Fisher-Yates shuffle with day-based seed
    const arr = [...TIPS]
    let seed = dayOfYear
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 16807 + 0) % 2147483647
      const j = seed % (i + 1)
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [])

  const currentTip = shuffledTips[currentIndex]

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % shuffledTips.length)
  }, [shuffledTips.length])

  const goToTip = useCallback(
    (index: number) => {
      isManualRef.current = true
      setCurrentIndex(index)
      // Reset the timer after manual navigation
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      timerRef.current = setInterval(() => {
        if (!isManualRef.current) {
          goToNext()
        }
        isManualRef.current = false
      }, AUTO_ROTATION_INTERVAL)
    },
    [goToNext]
  )

  // Auto-rotation timer
  useEffect(() => {
    timerRef.current = setInterval(goToNext, AUTO_ROTATION_INTERVAL)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [goToNext])

  return (
    <DashboardSection
      id="tips-carousel"
      title="Советы дня"
      icon={<Lightbulb className="h-3.5 w-3.5" />}
    >
      <Card className="card-hover overflow-hidden rounded-xl border">
        {/* Top gradient accent */}
        <div className="pointer-events-none h-1 w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 opacity-80" />

        <CardContent className="p-5">
          {/* Tip display */}
          <div className="relative min-h-[72px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                variants={tipVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex items-start gap-3"
              >
                {/* Emoji badge */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-xl shadow-sm dark:from-amber-900/40 dark:to-orange-900/40">
                  {currentTip.emoji}
                </div>

                {/* Text */}
                <p className="flex-1 pt-1.5 text-sm leading-relaxed text-foreground/90">
                  {currentTip.text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots + Next button */}
          <div className="mt-4 flex items-center justify-between">
            {/* Dot indicators */}
            <div className="flex gap-1.5">
              {shuffledTips.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToTip(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                    ? 'w-5 bg-gradient-to-r from-amber-400 to-orange-400'
                    : 'w-1.5 bg-foreground/15 dark:bg-foreground/20'
                    }`}
                  aria-label={`Совет ${idx + 1}`}
                />
              ))}
            </div>

            {/* Manual next */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToNext()}
              className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Далее
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardSection>
  )
}
