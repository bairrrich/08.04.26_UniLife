'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wind, Play, Square, RotateCcw, Moon, Sparkles, BoxSelect } from 'lucide-react'
import { toast } from 'sonner'

// ─── Types & Config ────────────────────────────────────────────────────────

type BreathingPattern = 'relaxing' | 'sleep' | 'box'
type BreathingPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

interface PhaseConfig {
  label: string // display text during this phase
  duration: number // seconds
  scale: number // 1 = 100% (expanded), 0.55 = 55% (contracted)
  colorClass: string // text color class for this phase
}

interface PatternConfig {
  id: BreathingPattern
  label: string
  description: string
  icon: typeof Wind
  phases: BreathingPhase[]
  phaseConfig: Record<BreathingPhase, PhaseConfig>
}

const PATTERNS: PatternConfig[] = [
  {
    id: 'relaxing',
    label: 'Расслабление',
    description: '4-4-4',
    icon: Wind,
    phases: ['inhale', 'holdIn', 'exhale', 'holdOut'],
    phaseConfig: {
      inhale: { label: 'Вдох...', duration: 4, scale: 1, colorClass: 'text-emerald-500 dark:text-emerald-400' },
      holdIn: { label: 'Задержка...', duration: 4, scale: 1, colorClass: 'text-teal-500 dark:text-teal-400' },
      exhale: { label: 'Выдох...', duration: 4, scale: 0.55, colorClass: 'text-emerald-400 dark:text-emerald-300' },
      holdOut: { label: 'Пауза...', duration: 0, scale: 0.55, colorClass: 'text-muted-foreground' },
    },
  },
  {
    id: 'sleep',
    label: 'Сон',
    description: '4-7-8',
    icon: Moon,
    phases: ['inhale', 'holdIn', 'exhale'],
    phaseConfig: {
      inhale: { label: 'Вдох...', duration: 4, scale: 1, colorClass: 'text-emerald-500 dark:text-emerald-400' },
      holdIn: { label: 'Задержка...', duration: 7, scale: 1, colorClass: 'text-teal-500 dark:text-teal-400' },
      exhale: { label: 'Выдох...', duration: 8, scale: 0.55, colorClass: 'text-emerald-400 dark:text-emerald-300' },
      holdOut: { label: '', duration: 0, scale: 0.55, colorClass: 'text-muted-foreground' },
    },
  },
  {
    id: 'box',
    label: 'Бокс',
    description: '4-4-4-4',
    icon: BoxSelect,
    phases: ['inhale', 'holdIn', 'exhale', 'holdOut'],
    phaseConfig: {
      inhale: { label: 'Вдох...', duration: 4, scale: 1, colorClass: 'text-emerald-500 dark:text-emerald-400' },
      holdIn: { label: 'Задержка...', duration: 4, scale: 1, colorClass: 'text-teal-500 dark:text-teal-400' },
      exhale: { label: 'Выдох...', duration: 4, scale: 0.55, colorClass: 'text-emerald-400 dark:text-emerald-300' },
      holdOut: { label: 'Пауза...', duration: 4, scale: 0.55, colorClass: 'text-cyan-500 dark:text-cyan-400' },
    },
  },
]

const CIRCLE_SIZE = 180
const CIRCLE_STROKE = 3
const CIRCLE_RADIUS = 70
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

// ─── Session Tracking ─────────────────────────────────────────────────────

const BREATHING_SESSIONS_KEY = 'unilife-breathing-sessions'

function loadBreathingSessions(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(BREATHING_SESSIONS_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    const today = new Date().toISOString().split('T')[0]
    if (parsed.date === today && typeof parsed.count === 'number') {
      return parsed.count
    }
    return 0
  } catch {
    return 0
  }
}

function saveBreathingSession(count: number) {
  if (typeof window === 'undefined') return
  try {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(BREATHING_SESSIONS_KEY, JSON.stringify({ date: today, count }))
  } catch {
    // localStorage not available
  }
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function BreathingWidget() {
  const [isActive, setIsActive] = useState(false)
  const [pattern, setPattern] = useState<BreathingPattern>('relaxing')
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [transitionMs, setTransitionMs] = useState(4000)
  const [sessionsToday, setSessionsToday] = useState(0)
  const [mounted, setMounted] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cycleCountRef = useRef(0)

  // ── Load sessions from localStorage on mount ──────────────────────────
  useEffect(() => {
    const loaded = loadBreathingSessions()
    const id = setTimeout(() => {
      setSessionsToday(loaded)
      setMounted(true)
    }, 0)
    return () => clearTimeout(id)
  }, [])

  // ── Cleanup ──────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // ── Get current pattern config ────────────────────────────────────────
  const currentPattern = PATTERNS.find((p) => p.id === pattern) ?? PATTERNS[0]
  const currentPhase = currentPattern.phases[phaseIndex]
  const currentPhaseConfig = currentPattern.phaseConfig[currentPhase]

  // ── Advance to next phase ────────────────────────────────────────────
  const advancePhase = useCallback(() => {
    setPhaseIndex((prev) => {
      const nextIndex = (prev + 1) % currentPattern.phases.length

      // Check if we completed exhale (end of a full cycle)
      if (currentPattern.phases[prev] === 'exhale') {
        const newCycleCount = cycleCountRef.current + 1
        cycleCountRef.current = newCycleCount
        setCycleCount(newCycleCount)

        // Save session to localStorage
        const today = new Date().toISOString().split('T')[0]
        try {
          const raw = localStorage.getItem(BREATHING_SESSIONS_KEY)
          const parsed = raw ? JSON.parse(raw) : { count: 0 }
          if (parsed.date === today) {
            const newCount = (parsed.count || 0) + 1
            saveBreathingSession(newCount)
            setSessionsToday(newCount)
          } else {
            saveBreathingSession(1)
            setSessionsToday(1)
          }
        } catch {
          saveBreathingSession(1)
          setSessionsToday(1)
        }

        // Show toast every 3 cycles
        if (newCycleCount > 0 && newCycleCount % 3 === 0) {
          toast.success(`${newCycleCount} циклов завершено!`, {
            description: 'Отличная работа, продолжай!',
            duration: 3000,
          })
        }
      }

      const nextPhase = currentPattern.phases[nextIndex]
      const nextConfig = currentPattern.phaseConfig[nextPhase]
      setTransitionMs(nextConfig.duration * 1000)

      return nextIndex
    })
  }, [currentPattern])

  // ── Phase timer effect ────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) return

    timerRef.current = setTimeout(advancePhase, currentPhaseConfig.duration * 1000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isActive, phaseIndex, advancePhase, currentPhaseConfig.duration])

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleStartStop = useCallback(() => {
    if (isActive) {
      setIsActive(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    } else {
      setPhaseIndex(0)
      setCycleCount(0)
      cycleCountRef.current = 0
      const firstPhase = currentPattern.phases[0]
      const firstConfig = currentPattern.phaseConfig[firstPhase]
      setTransitionMs(firstConfig.duration * 1000)
      setIsActive(true)
    }
  }, [isActive, currentPattern])

  const handleReset = useCallback(() => {
    setIsActive(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    setPhaseIndex(0)
    setCycleCount(0)
    cycleCountRef.current = 0
    setTransitionMs(currentPattern.phaseConfig[currentPattern.phases[0]].duration * 1000)
  }, [currentPattern])

  const handlePatternChange = useCallback((newPattern: BreathingPattern) => {
    if (isActive) {
      setIsActive(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    setPattern(newPattern)
    setPhaseIndex(0)
    setCycleCount(0)
    cycleCountRef.current = 0
    const p = PATTERNS.find((pp) => pp.id === newPattern) ?? PATTERNS[0]
    const firstPhase = p.phases[0]
    const firstConfig = p.phaseConfig[firstPhase]
    setTransitionMs(firstConfig.duration * 1000)
  }, [isActive])

  // ── Derived values ────────────────────────────────────────────────────
  const scalePercent = currentPhaseConfig.scale * 100

  // Phase progress ring
  const phaseProgress = isActive ? CIRCLE_CIRCUMFERENCE : 0

  // ── Pre-mount skeleton ────────────────────────────────────────────────
  if (!mounted) {
    return (
      <Card className="rounded-xl border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Wind className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Дыхательная практика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="skeleton-shimmer h-[120px] w-[120px] rounded-full" />
            <div className="skeleton-shimmer h-8 w-32 rounded-lg" />
            <div className="skeleton-shimmer h-9 w-40 rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-slide-up card-hover rounded-xl border overflow-hidden">
      {/* Calming gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-teal-500/[0.03]" />

      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <Wind className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span>Дыхательная практика</span>
          {/* Session count badge */}
          {sessionsToday > 0 && (
            <span className="ml-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {sessionsToday} сегодня
            </span>
          )}
          {/* Cycle count */}
          {cycleCount > 0 && (
            <span className="ml-auto rounded-full bg-teal-100 dark:bg-teal-900/40 px-2 py-0.5 text-[10px] font-semibold text-teal-600 dark:text-teal-400 tabular-nums">
              Цикл {cycleCount}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* ── Pattern Selector ── */}
        <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
          {PATTERNS.map((p) => {
            const isActivePattern = pattern === p.id
            const PatternIcon = p.icon
            return (
              <button
                key={p.id}
                onClick={() => handlePatternChange(p.id)}
                className={`relative flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                  isActivePattern
                    ? 'text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActivePattern && (
                  <span className="absolute inset-0 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 opacity-10" />
                )}
                <span className="absolute inset-0 rounded-md bg-background/80 dark:bg-background/40" />
                {isActivePattern && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  <PatternIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">{p.label}</span>
                  <span className="sm:hidden">{p.description}</span>
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Breathing Circle ── */}
        <div className="flex items-center justify-center py-2">
          <div className="relative">
            {/* Glow effect when active */}
            {isActive && (
              <motion.div
                key={`glow-${currentPhase}`}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: currentPhaseConfig.duration, ease: 'easeInOut' }}
                className={`absolute inset-[-20px] rounded-full blur-2xl ${
                  currentPhase === 'inhale'
                    ? 'bg-emerald-400/30'
                    : currentPhase === 'holdIn'
                    ? 'bg-teal-400/25'
                    : currentPhase === 'exhale'
                    ? 'bg-cyan-400/20'
                    : 'bg-emerald-300/15'
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
                transform: `scale(${currentPhaseConfig.scale})`,
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
                  className="text-emerald-100 dark:text-emerald-900/40"
                />
                {/* Progress ring */}
                <circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={CIRCLE_RADIUS}
                  fill="none"
                  stroke="url(#breathingGradientEmerald)"
                  strokeWidth={CIRCLE_STROKE}
                  strokeLinecap="round"
                  strokeDasharray={CIRCLE_CIRCUMFERENCE}
                  strokeDashoffset={
                    isActive ? 0 : CIRCLE_CIRCUMFERENCE
                  }
                  className="transition-[stroke-dashoffset] duration-300"
                  style={{
                    transition: isActive
                      ? `stroke-dashoffset ${transitionMs}ms linear`
                      : 'stroke-dashoffset 0.3s ease',
                  }}
                />
                {/* Emerald/teal gradient definition */}
                <defs>
                  <linearGradient id="breathingGradientEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(160, 84%, 39%)" />
                    <stop offset="100%" stopColor="hsl(168, 76%, 42%)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isActive ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPhase}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center"
                    >
                      <span
                        className={`text-xl font-semibold transition-colors duration-500 ${currentPhaseConfig.colorClass}`}
                      >
                        {currentPhaseConfig.label}
                      </span>
                      <span className="mt-1 text-xs text-muted-foreground tabular-nums">
                        {currentPhaseConfig.duration > 0 ? `${currentPhaseConfig.duration} сек` : ''}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Нажмите старт
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Phase Indicators ── */}
        <div className="flex items-center justify-center gap-2">
          {currentPattern.phases.map((p, i) => (
            <div
              key={p}
              className={`
                h-1.5 rounded-full transition-all duration-500
                ${
                  isActive && phaseIndex === i
                    ? 'w-6 bg-gradient-to-r from-emerald-400 to-teal-400'
                    : 'w-1.5 bg-muted-foreground/20'
                }
              `}
            />
          ))}
        </div>

        {/* ── Controls ── */}
        <div className="flex items-center justify-center gap-3">
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

          <Button
            onClick={handleStartStop}
            variant={isActive ? 'outline' : 'default'}
            size="sm"
            className={`
              rounded-lg px-6
              ${
                !isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 border-0'
                  : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
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

          {/* Invisible spacer for centering */}
          {!isActive && cycleCount === 0 && <div className="w-[60px]" />}
        </div>
      </CardContent>
    </Card>
  )
}
