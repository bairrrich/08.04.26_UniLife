'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wind, Play, Square, RotateCcw } from 'lucide-react'

// ─── Types & Config ────────────────────────────────────────────────────────

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause'

interface PhaseConfig {
  label: string
  duration: number // seconds
  scale: number // 1 = 100%, 0.6 = 60%
}

const PHASES: Record<BreathingPhase, PhaseConfig> = {
  inhale: { label: 'Вдох', duration: 4, scale: 1 },
  hold: { label: 'Задержка', duration: 4, scale: 1 },
  exhale: { label: 'Выдох', duration: 6, scale: 0.6 },
  pause: { label: '', duration: 2, scale: 0.6 },
}

const PHASE_ORDER: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'pause']

const CIRCLE_SIZE = 200
const CIRCLE_STROKE = 3
const CIRCLE_RADIUS = 80
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

// ─── Component ─────────────────────────────────────────────────────────────

export default function BreathingWidget() {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<BreathingPhase>('inhale')
  const [cycleCount, setCycleCount] = useState(0)
  const [transitionMs, setTransitionMs] = useState(4000)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phaseIndexRef = useRef(0)

  // ── Advance to next phase ──────────────────────────────────────────────
  const advancePhase = useCallback(() => {
    setPhase((prevPhase) => {
      const currentIndex = PHASE_ORDER.indexOf(prevPhase)
      const nextIndex = (currentIndex + 1) % PHASE_ORDER.length
      phaseIndexRef.current = nextIndex

      const nextPhase = PHASE_ORDER[nextIndex]
      const nextConfig = PHASES[nextPhase]
      setTransitionMs(nextConfig.duration * 1000)

      // Increment cycle when we complete exhale and go to pause
      if (prevPhase === 'exhale') {
        setCycleCount((prev) => prev + 1)
      }

      return nextPhase
    })
  }, [])

  // ── Phase timer effect ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) return

    const config = PHASES[phase]
    timerRef.current = setTimeout(advancePhase, config.duration * 1000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isActive, phase, advancePhase])

  // ── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleStartStop = useCallback(() => {
    if (isActive) {
      setIsActive(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    } else {
      setPhase('inhale')
      phaseIndexRef.current = 0
      setTransitionMs(PHASES.inhale.duration * 1000)
      setIsActive(true)
    }
  }, [isActive])

  const handleReset = useCallback(() => {
    setIsActive(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    setPhase('inhale')
    setCycleCount(0)
    phaseIndexRef.current = 0
    setTransitionMs(4000)
  }, [])

  // ── Derived values ────────────────────────────────────────────────────
  const currentConfig = PHASES[phase]
  const scalePercent = currentConfig.scale * 100
  const isCircleSmall = currentConfig.scale < 1

  // Phase progress ring — shows progress through current phase
  const phaseProgress = isActive && phase !== 'pause' ? 1 : 0

  return (
    <Card className="animate-slide-up card-hover rounded-xl border overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/40">
            <Wind className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <span>Дыхательная практика</span>
          {cycleCount > 0 && (
            <span className="ml-auto rounded-full bg-sky-100 dark:bg-sky-900/40 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
              Цикл {cycleCount}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Breathing Circle ──────────────────────────────────────────── */}
        <div className="flex items-center justify-center py-2">
          <div className="relative">
            {/* Glow effect when active */}
            {isActive && phase !== 'pause' && (
              <div
                className={`absolute inset-[-16px] rounded-full blur-2xl transition-opacity duration-700 ${
                  phase === 'inhale'
                    ? 'bg-sky-400/25'
                    : phase === 'hold'
                    ? 'bg-teal-400/20'
                    : 'bg-sky-300/15'
                }`}
              />
            )}

            {/* SVG circle with animated scale */}
            <div
              className="relative flex items-center justify-center"
              style={{
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                transition: `transform ${transitionMs}ms ease-in-out`,
                transform: `scale(${currentConfig.scale})`,
              }}
            >
              <svg
                width={CIRCLE_SIZE}
                height={CIRCLE_SIZE}
                viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
                className="-rotate-90"
              >
                {/* Background ring */}
                <circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={CIRCLE_RADIUS}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={CIRCLE_STROKE}
                  className="text-sky-100 dark:text-sky-900/40"
                />
                {/* Progress ring (animate dash offset on phase change) */}
                <circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={CIRCLE_RADIUS}
                  fill="none"
                  stroke="url(#breathingGradient)"
                  strokeWidth={CIRCLE_STROKE}
                  strokeLinecap="round"
                  strokeDasharray={CIRCLE_CIRCUMFERENCE}
                  strokeDashoffset={
                    isActive && phase !== 'pause' ? 0 : CIRCLE_CIRCUMFERENCE
                  }
                  className="transition-[stroke-dashoffset] duration-300"
                  style={{
                    transition: isActive
                      ? `stroke-dashoffset ${transitionMs}ms linear`
                      : 'stroke-dashoffset 0.3s ease',
                  }}
                />
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="breathingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(199, 89%, 48%)" />
                    <stop offset="100%" stopColor="hsl(168, 76%, 42%)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isActive ? (
                  <>
                    <span
                      className="text-2xl font-semibold transition-colors duration-500"
                      style={{
                        color: phase === 'inhale'
                          ? 'hsl(199, 89%, 48%)'
                          : phase === 'hold'
                          ? 'hsl(168, 76%, 42%)'
                          : phase === 'exhale'
                          ? 'hsl(199, 89%, 60%)'
                          : 'hsl(0, 0%, 60%)',
                      }}
                    >
                      {currentConfig.label}
                    </span>
                    {phase !== 'pause' && (
                      <span className="mt-1 text-xs text-muted-foreground">
                        {currentConfig.duration} сек
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Нажмите старт
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Controls ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={handleStartStop}
            variant={isActive ? 'outline' : 'default'}
            size="sm"
            className={`
              rounded-lg px-5
              ${
                !isActive
                  ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white hover:from-sky-600 hover:to-teal-600 border-0'
                  : 'border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30'
              }
            `}
          >
            {isActive ? (
              <>
                <Square className="mr-1.5 h-3.5 w-3.5" />
                Стоп
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-3.5 w-3.5" />
                Старт
              </>
            )}
          </Button>

          {(isActive || cycleCount > 0) && (
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="rounded-lg text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Сброс
            </Button>
          )}
        </div>

        {/* ── Phase indicators ──────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2">
          {PHASE_ORDER.map((p, i) => (
            <div
              key={p}
              className={`
                h-1.5 rounded-full transition-all duration-500
                ${
                  isActive && phase === p
                    ? 'w-6 bg-gradient-to-r from-sky-400 to-teal-400'
                    : 'w-1.5 bg-muted-foreground/20'
                }
              `}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
