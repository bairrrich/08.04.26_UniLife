'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Timer, Play, Pause, RotateCcw, Clock, Flame, Zap, Coffee, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

// ─── Types & Config ────────────────────────────────────────────────────────

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

interface ModeConfig {
  label: string
  duration: number
  stroke: string
  strokeBg: string
  textClass: string
  iconBg: string
  iconClass: string
  ringGradient: string
  glowClass: string
  buttonFrom: string
  buttonTo: string
  icon: typeof Timer
}

const MODE_CONFIG: Record<TimerMode, ModeConfig> = {
  focus: {
    label: 'Фокус',
    duration: 25 * 60,
    stroke: 'stroke-emerald-500',
    strokeBg: 'stroke-emerald-500/15',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    ringGradient: 'from-emerald-500 to-teal-400',
    glowClass: 'shadow-emerald-500/30',
    buttonFrom: 'from-emerald-500',
    buttonTo: 'to-teal-500',
    icon: Zap,
  },
  shortBreak: {
    label: 'Короткий перерыв',
    duration: 5 * 60,
    stroke: 'stroke-amber-500',
    strokeBg: 'stroke-amber-500/15',
    textClass: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconClass: 'text-amber-600 dark:text-amber-400',
    ringGradient: 'from-amber-500 to-orange-400',
    glowClass: 'shadow-amber-500/30',
    buttonFrom: 'from-amber-500',
    buttonTo: 'to-orange-500',
    icon: Coffee,
  },
  longBreak: {
    label: 'Длинный перерыв',
    duration: 15 * 60,
    stroke: 'stroke-violet-500',
    strokeBg: 'stroke-violet-500/15',
    textClass: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconClass: 'text-violet-600 dark:text-violet-400',
    ringGradient: 'from-violet-500 to-purple-400',
    glowClass: 'shadow-violet-500/30',
    buttonFrom: 'from-violet-500',
    buttonTo: 'to-purple-500',
    icon: Sparkles,
  },
}

const MODE_KEYS: TimerMode[] = ['focus', 'shortBreak', 'longBreak']
const TOTAL_SESSIONS_IN_CYCLE = 4
const RING_RADIUS = 52
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const RING_SIZE = (RING_RADIUS + 8) * 2

// ─── Storage ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'unilife-focus-timer-state'

interface TimerState {
  mode: TimerMode
  timeLeft: number
  running: boolean
  sessions: number
  updatedAt: number
}

function loadState(): TimerState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as TimerState
    if (
      !parsed.mode ||
      typeof parsed.timeLeft !== 'number' ||
      typeof parsed.sessions !== 'number'
    ) {
      return null
    }
    // If running, calculate how much time has passed since last save
    if (parsed.running && parsed.updatedAt) {
      const elapsed = Math.floor((Date.now() - parsed.updatedAt) / 1000)
      const actualLeft = parsed.timeLeft - elapsed
      if (actualLeft <= 0) {
        // Timer would have completed while away
        return {
          ...parsed,
          timeLeft: 0,
          running: false,
        }
      }
      return { ...parsed, timeLeft: actualLeft }
    }
    return parsed
  } catch {
    return null
  }
}

function saveState(state: TimerState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      updatedAt: Date.now(),
    }))
  } catch {
    // localStorage not available
  }
}

// ─── Audio ─────────────────────────────────────────────────────────────────

function playCompletionSound() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5 chord
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15)
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.15 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.5)
      osc.start(ctx.currentTime + i * 0.15)
      osc.stop(ctx.currentTime + i * 0.15 + 0.5)
    })
    setTimeout(() => ctx.close(), 2000)
  } catch {
    // Audio not supported
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Component ─────────────────────────────────────────────────────────────

export function FocusTimerWidget() {
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.focus.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)

  const modeRef = useRef<TimerMode>(mode)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionsRef = useRef(sessions)
  const toastShownRef = useRef(false)

  // Keep refs in sync
  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { sessionsRef.current = sessions }, [sessions])

  // ── Handle timer completion ──────────────────────────────────────────
  const handleCompletion = useCallback((currentMode: TimerMode, currentSessions: number) => {
    playCompletionSound()

    if (currentMode === 'focus') {
      const newSessions = currentSessions + 1
      setSessions(newSessions)
      sessionsRef.current = newSessions
      toast.success(`Помодоро завершён! Сессия ${newSessions} из ${TOTAL_SESSIONS_IN_CYCLE}`, {
        description: newSessions % TOTAL_SESSIONS_IN_CYCLE === 0
          ? 'Отличная работа! Пора сделать длинный перерыв'
          : 'Сделайте короткий перерыв',
        duration: 4000,
      })

      const nextMode: TimerMode = newSessions % TOTAL_SESSIONS_IN_CYCLE === 0
        ? 'longBreak'
        : 'shortBreak'
      setMode(nextMode)
      modeRef.current = nextMode
      setTimeLeft(MODE_CONFIG[nextMode].duration)
    } else {
      const label = currentMode === 'shortBreak' ? 'Короткий перерыв' : 'Длинный перерыв'
      toast.success(`${label} завершён!`, {
        description: 'Время сфокусироваться',
        duration: 3000,
      })
      setMode('focus')
      modeRef.current = 'focus'
      setTimeLeft(MODE_CONFIG.focus.duration)
    }

    setIsRunning(false)
    toastShownRef.current = true
  }, [])

  // ── Initialize from localStorage ─────────────────────────────────────
  useEffect(() => {
    const stored = loadState()
    const id = setTimeout(() => {
      setMounted(true)
      if (stored) {
        setMode(stored.mode)
        setTimeLeft(stored.timeLeft)
        setSessions(stored.sessions)
        // If the timer was running and time ran out, handle completion
        if (stored.running === false && stored.timeLeft === 0) {
          handleCompletion(stored.mode, stored.sessions)
        }
      }
    }, 0)
    return () => clearTimeout(id)
  }, [handleCompletion])

  // ── Persist state to localStorage ────────────────────────────────────
  useEffect(() => {
    if (!mounted) return
    saveState({ mode, timeLeft, running: isRunning, sessions, updatedAt: Date.now() })
  }, [mode, timeLeft, isRunning, sessions, mounted])

  // ── Timer tick ───────────────────────────────────────────────────────
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
          handleCompletion(modeRef.current, sessionsRef.current)
          return 0
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
  }, [isRunning, handleCompletion])

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleModeChange = useCallback((newMode: TimerMode) => {
    setIsRunning(false)
    setMode(newMode)
    modeRef.current = newMode
    setTimeLeft(MODE_CONFIG[newMode].duration)
  }, [])

  const handleToggle = useCallback(() => {
    if (timeLeft <= 0) {
      setTimeLeft(MODE_CONFIG[mode].duration)
      setIsRunning(true)
    } else {
      setIsRunning((prev) => !prev)
    }
  }, [timeLeft, mode])

  const handleReset = useCallback(() => {
    setIsRunning(false)
    setTimeLeft(MODE_CONFIG[mode].duration)
  }, [mode])

  // ── Derived values ───────────────────────────────────────────────────
  const config = MODE_CONFIG[mode]
  const totalDuration = config.duration
  const progress = totalDuration > 0 ? 1 - timeLeft / totalDuration : 0
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress)
  const sessionInCycle = ((sessions % TOTAL_SESSIONS_IN_CYCLE) || TOTAL_SESSIONS_IN_CYCLE)

  // ── Pre-mount skeleton ──────────────────────────────────────────────
  if (!mounted) {
    return (
      <Card className="rounded-xl border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Timer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Фокус-таймер
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="skeleton-shimmer h-[120px] w-[120px] rounded-full" />
            <div className="skeleton-shimmer h-8 w-48 rounded-lg" />
            <div className="skeleton-shimmer h-10 w-40 rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-slide-up card-hover rounded-xl border overflow-hidden">
      {/* Subtle gradient background based on mode */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.ringGradient} opacity-[0.03]`} />

      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.iconBg}`}>
            <Timer className={`h-4 w-4 ${config.iconClass}`} />
          </div>
          <span>Фокус-таймер</span>
          {/* Session badge */}
          <span className="ml-auto flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
            <Flame className="h-3 w-3 text-orange-500" />
            {sessions}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="flex flex-col items-center gap-4">
          {/* ── Circular Progress Ring ── */}
          <div className="relative">
            {/* Glow effect behind the ring when running */}
            {isRunning && (
              <div className={`absolute inset-[-8px] rounded-full bg-gradient-to-br ${config.ringGradient} opacity-20 blur-lg transition-opacity duration-500`} />
            )}

            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              className="-rotate-90"
            >
              {/* Background track */}
              <circle
                cx={RING_RADIUS + 8}
                cy={RING_RADIUS + 8}
                r={RING_RADIUS}
                fill="none"
                strokeWidth="7"
                className={config.strokeBg}
              />
              {/* Progress arc */}
              <circle
                cx={RING_RADIUS + 8}
                cy={RING_RADIUS + 8}
                r={RING_RADIUS}
                fill="none"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                className={`${config.stroke} transition-[stroke-dashoffset] duration-1000 ease-linear`}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold tracking-tight tabular-nums ${config.textClass}`}>
                {formatTime(timeLeft)}
              </span>
              <div className={`mt-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${config.textClass} opacity-70`}>
                <config.icon className="h-3 w-3" />
                {config.label}
              </div>
            </div>
          </div>

          {/* ── Session Counter ── */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_SESSIONS_IN_CYCLE }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < sessionInCycle
                    ? `w-5 bg-gradient-to-r ${config.ringGradient}`
                    : 'w-3 bg-muted-foreground/20'
                }`}
              />
            ))}
            <span className="ml-1.5 text-[10px] text-muted-foreground tabular-nums">
              {sessionInCycle}/{TOTAL_SESSIONS_IN_CYCLE}
            </span>
          </div>

          {/* ── Mode Tabs ── */}
          <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
            {MODE_KEYS.map((key) => {
              const isActive = mode === key
              const cfg = MODE_CONFIG[key]
              return (
                <button
                  key={key}
                  onClick={() => handleModeChange(key)}
                  className={`relative flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                    isActive
                      ? `${cfg.textClass} shadow-sm`
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-md bg-background/80 dark:bg-background/40" />
                  )}
                  <span className="relative z-10 flex items-center gap-1">
                    <cfg.icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* ── Controls ── */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={handleReset}
              aria-label="Сбросить таймер"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>

            <Button
              size="icon"
              className={`h-12 w-12 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 bg-gradient-to-br ${config.buttonFrom} ${config.buttonTo} hover:shadow-xl text-white ${config.glowClass}`}
              onClick={handleToggle}
              aria-label={isRunning ? 'Пауза' : 'Старт'}
            >
              {isRunning ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            {/* Invisible spacer for centering */}
            <div className="h-9 w-9" />
          </div>

          {/* ── Bottom info ── */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
            <Clock className="h-3 w-3" />
            <span>
              {isRunning ? 'Таймер работает...' : timeLeft === 0 ? 'Время вышло' : 'Нажмите старт'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
