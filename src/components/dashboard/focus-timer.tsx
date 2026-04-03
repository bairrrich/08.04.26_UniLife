'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Timer, Play, Pause, RotateCcw, Flame } from 'lucide-react'

// ─── Timer Modes ─────────────────────────────────────────────────────────────

type TimerMode = 'work' | 'shortBreak' | 'longBreak'

interface TimerConfig {
  label: string
  duration: number
  color: string
  colorBg: string
  colorText: string
  colorDot: string
  gradientFrom: string
  gradientTo: string
}

const TIMER_MODES: Record<TimerMode, TimerConfig> = {
  work: {
    label: 'Работа',
    duration: 25 * 60,
    color: 'stroke-emerald-500',
    colorBg: 'stroke-emerald-500/10',
    colorText: 'text-emerald-600 dark:text-emerald-400',
    colorDot: 'fill-emerald-500',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-emerald-400',
  },
  shortBreak: {
    label: 'Перерыв',
    duration: 5 * 60,
    color: 'stroke-teal-500',
    colorBg: 'stroke-teal-500/10',
    colorText: 'text-teal-600 dark:text-teal-400',
    colorDot: 'fill-teal-500',
    gradientFrom: 'from-teal-500',
    gradientTo: 'to-teal-400',
  },
  longBreak: {
    label: 'Длинный перерыв',
    duration: 15 * 60,
    color: 'stroke-blue-500',
    colorBg: 'stroke-blue-500/10',
    colorText: 'text-blue-600 dark:text-blue-400',
    colorDot: 'fill-blue-500',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-400',
  },
}

const STORAGE_KEY = 'unilife-focus-sessions'
const RING_RADIUS = 58
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

// ─── Audio ───────────────────────────────────────────────────────────────────

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    ;[0, 0.25, 0.5].forEach((delay) => {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(680, ctx.currentTime + delay)
      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.2)
      oscillator.start(ctx.currentTime + delay)
      oscillator.stop(ctx.currentTime + delay + 0.2)
    })
    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Audio not supported
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTodaySessions(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    const today = new Date().toISOString().split('T')[0]
    return parsed.date === today ? parsed.count : 0
  } catch {
    return 0
  }
}

function saveTodaySessions(count: number) {
  if (typeof window === 'undefined') return
  try {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count }))
  } catch {
    // localStorage not available
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FocusTimer() {
  const [mode, setMode] = useState<TimerMode>('work')
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.work.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Keep a ref to the latest mode so the interval callback can read it
  const modeRef = useRef<TimerMode>(mode)
  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initialize sessions from localStorage after mount
  useEffect(() => {
    const stored = getTodaySessions()
    // Use a timeout to defer setState out of the synchronous effect body
    const id = setTimeout(() => {
      if (stored > 0) setSessions(stored)
      setMounted(true)
    }, 0)
    return () => clearTimeout(id)
  }, [])

  // Timer interval — subscribes to external timer, setState is in the async callback
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const currentMode = modeRef.current

          setIsRunning(false)
          playBeep()

          if (currentMode === 'work') {
            const newCount = getTodaySessions() + 1
            setSessions(newCount)
            saveTodaySessions(newCount)
            const nextMode: TimerMode = newCount % 4 === 0 ? 'longBreak' : 'shortBreak'
            setMode(nextMode)
            return TIMER_MODES[nextMode].duration
          } else {
            setMode('work')
            return TIMER_MODES.work.duration
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning])

  // Handle manual mode switch (from tab buttons)
  const handleModeChange = useCallback((newMode: TimerMode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(TIMER_MODES[newMode].duration)
  }, [])

  const handleToggle = useCallback(() => {
    if (timeLeft <= 0) {
      setTimeLeft(TIMER_MODES[mode].duration)
      setIsRunning(true)
    } else {
      setIsRunning((prev) => !prev)
    }
  }, [timeLeft, mode])

  const handleReset = useCallback(() => {
    setIsRunning(false)
    setTimeLeft(TIMER_MODES[mode].duration)
  }, [mode])

  // Progress calculation
  const totalDuration = TIMER_MODES[mode].duration
  const progress = 1 - timeLeft / totalDuration
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress)

  const currentModeConfig = TIMER_MODES[mode]
  const modeKeys: TimerMode[] = ['work', 'shortBreak', 'longBreak']

  return (
    <Card className="card-hover rounded-xl border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Timer className="h-4 w-4 text-emerald-500" />
          Фокус-таймер
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-5">
          {/* ── Circular Progress Ring ── */}
          <div
            className={`relative ${isRunning ? 'animate-pulse' : ''}`}
            style={isRunning ? { animationDuration: '2s' } : undefined}
          >
            <svg
              width="160"
              height="160"
              viewBox={`0 0 ${(RING_RADIUS + 8) * 2} ${(RING_RADIUS + 8) * 2}`}
              className="-rotate-90"
            >
              {/* Background track */}
              <circle
                cx={RING_RADIUS + 8}
                cy={RING_RADIUS + 8}
                r={RING_RADIUS}
                fill="none"
                strokeWidth="6"
                className={currentModeConfig.colorBg}
              />
              {/* Progress arc */}
              <circle
                cx={RING_RADIUS + 8}
                cy={RING_RADIUS + 8}
                r={RING_RADIUS}
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                className={`${currentModeConfig.color} transition-[stroke-dashoffset] duration-1000 ease-linear`}
              />
            </svg>
            {/* Center time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-4xl font-bold tracking-tight tabular-nums ${currentModeConfig.colorText}`}
              >
                {formatTime(timeLeft)}
              </span>
              <span className="mt-0.5 text-xs font-medium text-muted-foreground">
                {currentModeConfig.label}
              </span>
            </div>
          </div>

          {/* ── Mode Tabs ── */}
          <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
            {modeKeys.map((key) => {
              const isActive = mode === key
              const cfg = TIMER_MODES[key]
              return (
                <button
                  key={key}
                  onClick={() => handleModeChange(key)}
                  className={`relative rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? `${cfg.colorText} shadow-sm`
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-md bg-background/80 dark:bg-background/40" />
                  )}
                  <span className="relative z-10">{cfg.label}</span>
                </button>
              )
            })}
          </div>

          {/* ── Controls ── */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={handleReset}
              aria-label="Сбросить таймер"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              className={`h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 bg-gradient-to-br ${currentModeConfig.gradientFrom} ${currentModeConfig.gradientTo} hover:shadow-xl text-white`}
              onClick={handleToggle}
              aria-label={isRunning ? 'Пауза' : 'Старт'}
            >
              {isRunning ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>

            {/* Invisible spacer for centering */}
            <div className="h-10 w-10" />
          </div>

          {/* ── Session Counter ── */}
          {mounted && (
            <div className="flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-muted-foreground">
                Сегодня:{' '}
                <span className={`tabular-nums font-semibold ${currentModeConfig.colorText}`}>
                  {sessions}
                </span>{' '}
                помодоро
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
