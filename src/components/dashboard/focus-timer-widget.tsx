'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Timer, Play, Pause, RotateCcw, Clock, Flame, Zap, Coffee,
  Sparkles, Brain, SkipForward, VolumeX, Trophy, Volume1,
  CloudRain, Building2, Volume2, Hourglass, Rocket,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types & Config ────────────────────────────────────────────────────────

type TimerMode = 'express' | 'quickFocus' | 'focus' | 'deepWork' | 'marathon' | 'shortBreak' | 'longBreak'

interface ModeConfig {
  label: string
  shortLabel: string
  duration: number
  isBreak: boolean
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
  category: 'focus' | 'break'
}

const MODE_CONFIG: Record<TimerMode, ModeConfig> = {
  express: {
    label: 'Экспресс',
    shortLabel: '5 мин',
    duration: 5 * 60,
    isBreak: false,
    stroke: 'stroke-rose-500',
    strokeBg: 'stroke-rose-500/15',
    textClass: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconClass: 'text-rose-600 dark:text-rose-400',
    ringGradient: 'from-rose-500 to-pink-400',
    glowClass: 'shadow-rose-500/30',
    buttonFrom: 'from-rose-500',
    buttonTo: 'to-pink-500',
    icon: Hourglass,
    category: 'focus',
  },
  focus: {
    label: 'Помодоро',
    shortLabel: 'Фокус',
    duration: 25 * 60,
    isBreak: false,
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
    category: 'focus',
  },
  quickFocus: {
    label: 'Быстрый фокус',
    shortLabel: 'Быстрый',
    duration: 15 * 60,
    isBreak: false,
    stroke: 'stroke-sky-500',
    strokeBg: 'stroke-sky-500/15',
    textClass: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconClass: 'text-sky-600 dark:text-sky-400',
    ringGradient: 'from-sky-500 to-cyan-400',
    glowClass: 'shadow-sky-500/30',
    buttonFrom: 'from-sky-500',
    buttonTo: 'to-cyan-500',
    icon: Timer,
    category: 'focus',
  },
  deepWork: {
    label: 'Глубокая работа',
    shortLabel: '45 мин',
    duration: 45 * 60,
    isBreak: false,
    stroke: 'stroke-violet-500',
    strokeBg: 'stroke-violet-500/15',
    textClass: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconClass: 'text-violet-600 dark:text-violet-400',
    ringGradient: 'from-violet-500 to-purple-400',
    glowClass: 'shadow-violet-500/30',
    buttonFrom: 'from-violet-500',
    buttonTo: 'to-purple-500',
    icon: Brain,
    category: 'focus',
  },
  marathon: {
    label: 'Марафон',
    shortLabel: '60 мин',
    duration: 60 * 60,
    isBreak: false,
    stroke: 'stroke-orange-500',
    strokeBg: 'stroke-orange-500/15',
    textClass: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconClass: 'text-orange-600 dark:text-orange-400',
    ringGradient: 'from-orange-500 to-amber-400',
    glowClass: 'shadow-orange-500/30',
    buttonFrom: 'from-orange-500',
    buttonTo: 'to-amber-500',
    icon: Rocket,
    category: 'focus',
  },
  shortBreak: {
    label: 'Короткий перерыв',
    shortLabel: '5 мин',
    duration: 5 * 60,
    isBreak: true,
    stroke: 'stroke-sky-500',
    strokeBg: 'stroke-sky-500/15',
    textClass: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconClass: 'text-sky-600 dark:text-sky-400',
    ringGradient: 'from-sky-500 to-blue-400',
    glowClass: 'shadow-sky-500/30',
    buttonFrom: 'from-sky-500',
    buttonTo: 'to-blue-500',
    icon: Coffee,
    category: 'break',
  },
  longBreak: {
    label: 'Длинный перерыв',
    shortLabel: '15 мин',
    duration: 15 * 60,
    isBreak: true,
    stroke: 'stroke-amber-500',
    strokeBg: 'stroke-amber-500/15',
    textClass: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconClass: 'text-amber-600 dark:text-amber-400',
    ringGradient: 'from-amber-500 to-yellow-400',
    glowClass: 'shadow-amber-500/30',
    buttonFrom: 'from-amber-500',
    buttonTo: 'to-yellow-500',
    icon: Sparkles,
    category: 'break',
  },
}

const FOCUS_MODES: TimerMode[] = ['express', 'quickFocus', 'focus', 'deepWork', 'marathon']
const BREAK_MODES: TimerMode[] = ['shortBreak', 'longBreak']
const TOTAL_SESSIONS_IN_CYCLE = 4
const RING_RADIUS = 60
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const RING_SIZE = (RING_RADIUS + 10) * 2

// Ambient Sound Options
const AMBIENT_SOUNDS = [
  { id: 'silence', label: 'Тишина', icon: VolumeX, color: 'text-muted-foreground' },
  { id: 'rain', label: 'Дождь', icon: CloudRain, color: 'text-blue-400' },
  { id: 'cafe', label: 'Кафе', icon: Building2, color: 'text-amber-400' },
] as const

type AmbientSound = typeof AMBIENT_SOUNDS[number]['id']

// Motivational quotes shown while running and after completion
const MOTIVATIONAL_MESSAGES = [
  'Сфокусируйся — ты можешь всё! 💪',
  'Один шаг за раз — и цель ближе! 🎯',
  'Тишина — лучший союзник продуктивности 🤫',
  'Делай лучшее, что можешь, с тем, что имеешь 🌟',
  'Настоящая дисциплина — делать то, что нужно 🧠',
  'Каждая минута фокуса — инвестиция в будущее 📈',
  'Твой потенциал безграничен! ✨',
  'Маленькие шаги ведут к большим результатам 🏔️',
  'Останься сосредоточенным — ты на верном пути 💎',
  'Упорство побеждает талант, когда талант не упорствует 🔥',
  'Отличная работа! Продолжай в том же духе! 🔥',
  'Фокус — это суперсила! 💪',
  'Ещё один шаг к целям! 🎯',
  'Ты потрясающий! Не останавливайся! ⚡',
  'Мозг благодарит тебя за перерыв! 🧠',
  'Сила воли растёт с каждой сессией! 🌱',
  'Дисциплина — путь к успеху! 🏆',
  'Невероятная концентрация! ✨',
]

// ─── Session History ───────────────────────────────────────────────────────

const SESSIONS_STORAGE_KEY = 'unilify-focus-sessions'

interface FocusSession {
  id: string
  date: string // YYYY-MM-DD
  duration: number // seconds
  type: TimerMode
  completedAt: string // ISO string
}

function loadSessions(): FocusSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (s: FocusSession) =>
        s.id && s.date && typeof s.duration === 'number' && s.completedAt
    )
  } catch {
    return []
  }
}

function saveSessions(sessions: FocusSession[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    // localStorage not available
  }
}

function addSession(mode: TimerMode, duration: number) {
  const sessions = loadSessions()
  const now = new Date()
  const newSession: FocusSession = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: now.toISOString().split('T')[0],
    duration,
    type: mode,
    completedAt: now.toISOString(),
  }
  sessions.push(newSession)
  // Keep last 500 sessions to prevent storage overflow
  if (sessions.length > 500) {
    sessions.splice(0, sessions.length - 500)
  }
  saveSessions(sessions)
  return newSession
}

function getTodaySessions(): FocusSession[] {
  const today = new Date().toISOString().split('T')[0]
  return loadSessions().filter((s) => s.date === today)
}

function getThisWeekSessions(): FocusSession[] {
  const now = new Date()
  const dayOfWeek = now.getDay()
  // Monday = 0, Sunday = 6 in our calculation
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - mondayOffset)
  monday.setHours(0, 0, 0, 0)
  const mondayStr = monday.toISOString().split('T')[0]
  const todayStr = now.toISOString().split('T')[0]
  return loadSessions().filter((s) => s.date >= mondayStr && s.date <= todayStr)
}

function calculateStreak(): number {
  const sessions = loadSessions()
  if (sessions.length === 0) return 0

  // Get unique dates with sessions
  const dates = [...new Set(sessions.map((s) => s.date))].sort().reverse()

  // Check if today or yesterday has a session (streak is active)
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (!dates.includes(today) && !dates.includes(yesterday)) return 0

  let streak = 0
  const checkDate = new Date()
  // Start from today
  checkDate.setHours(0, 0, 0, 0)

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0]
    if (dates.includes(dateStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (i === 0) {
      // Today might not have a session yet, check from yesterday
      checkDate.setDate(checkDate.getDate() - 1)
      continue
    } else {
      break
    }
  }

  return streak
}

// ─── Timer State Storage ───────────────────────────────────────────────────

const TIMER_STATE_KEY = 'unilife-focus-timer-state'

interface TimerState {
  mode: TimerMode
  timeLeft: number
  running: boolean
  sessions: number
  soundEnabled: boolean
  updatedAt: number
}

function loadTimerState(): TimerState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(TIMER_STATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as TimerState
    if (
      !parsed.mode ||
      typeof parsed.timeLeft !== 'number' ||
      typeof parsed.sessions !== 'number'
    ) {
      return null
    }
    if (parsed.running && parsed.updatedAt) {
      const elapsed = Math.floor((Date.now() - parsed.updatedAt) / 1000)
      const actualLeft = parsed.timeLeft - elapsed
      if (actualLeft <= 0) {
        return { ...parsed, timeLeft: 0, running: false }
      }
      return { ...parsed, timeLeft: actualLeft }
    }
    return parsed
  } catch {
    return null
  }
}

function saveTimerState(state: TimerState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      TIMER_STATE_KEY,
      JSON.stringify({ ...state, updatedAt: Date.now() })
    )
  } catch {
    // localStorage not available
  }
}

// ─── Audio ─────────────────────────────────────────────────────────────────

function playCompletionSound() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)()
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
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + i * 0.15 + 0.5
      )
      osc.start(ctx.currentTime + i * 0.15)
      osc.stop(ctx.currentTime + i * 0.15 + 0.5)
    })
    setTimeout(() => ctx.close(), 2000)
  } catch {
    // Audio not supported
  }
}

// ─── Ambient Sound Engine (Web Audio API) ────────────────────────────────────

class AmbientSoundEngine {
  private ctx: AudioContext | null = null
  private nodes: { osc: OscillatorNode; gain: GainNode }[] = []
  private masterGain: GainNode | null = null
  private isPlaying = false
  private currentType: AmbientSound = 'silence'
  private fadeInTimeout: ReturnType<typeof setTimeout> | null = null

  async start(type: AmbientSound) {
    if (type === 'silence') {
      this.stop()
      return
    }
    this.stop()
    try {
      this.ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime)
      this.masterGain.connect(this.ctx.destination)

      this.currentType = type
      this.isPlaying = true

      if (type === 'rain') {
        // Rain: multiple layered sine waves at different frequencies to simulate rain
        // Using subtle chord-like frequencies with slight detuning
        const rainFreqs = [
          { freq: 200, vol: 0.03, type: 'sine' as OscillatorType },
          { freq: 400, vol: 0.02, type: 'sine' as OscillatorType },
          { freq: 800, vol: 0.015, type: 'sine' as OscillatorType },
          { freq: 1200, vol: 0.01, type: 'sine' as OscillatorType },
          { freq: 2400, vol: 0.008, type: 'sine' as OscillatorType },
          { freq: 300, vol: 0.025, type: 'triangle' as OscillatorType },
        ]
        for (const cfg of rainFreqs) {
          const osc = this.ctx.createOscillator()
          const gain = this.ctx.createGain()
          osc.type = cfg.type
          osc.frequency.setValueAtTime(cfg.freq, this.ctx.currentTime)
          // Add subtle frequency modulation for natural feel
          const lfo = this.ctx.createOscillator()
          const lfoGain = this.ctx.createGain()
          lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.3, this.ctx.currentTime)
          lfoGain.gain.setValueAtTime(cfg.freq * 0.01, this.ctx.currentTime)
          lfo.connect(lfoGain)
          lfoGain.connect(osc.frequency)
          lfo.start()

          gain.gain.setValueAtTime(0, this.ctx.currentTime)
          osc.connect(gain)
          gain.connect(this.masterGain)
          osc.start()
          this.nodes.push({ osc, gain })

          // Fade in each layer
          const delay = this.nodes.length * 200
          gain.gain.linearRampToValueAtTime(cfg.vol, this.ctx.currentTime + delay / 1000 + 1)
        }
      } else if (type === 'cafe') {
        // Cafe: warm low frequencies (brown-noise-like) with subtle murmur
        const cafeFreqs = [
          { freq: 80, vol: 0.04, type: 'sine' as OscillatorType },
          { freq: 120, vol: 0.035, type: 'sine' as OscillatorType },
          { freq: 180, vol: 0.025, type: 'triangle' as OscillatorType },
          { freq: 250, vol: 0.02, type: 'sine' as OscillatorType },
          { freq: 350, vol: 0.015, type: 'triangle' as OscillatorType },
          { freq: 500, vol: 0.01, type: 'sine' as OscillatorType },
        ]
        for (const cfg of cafeFreqs) {
          const osc = this.ctx.createOscillator()
          const gain = this.ctx.createGain()
          osc.type = cfg.type
          osc.frequency.setValueAtTime(cfg.freq, this.ctx.currentTime)
          // Slow modulation for warmth
          const lfo = this.ctx.createOscillator()
          const lfoGain = this.ctx.createGain()
          lfo.frequency.setValueAtTime(0.05 + Math.random() * 0.15, this.ctx.currentTime)
          lfoGain.gain.setValueAtTime(cfg.freq * 0.02, this.ctx.currentTime)
          lfo.connect(lfoGain)
          lfoGain.connect(osc.frequency)
          lfo.start()

          gain.gain.setValueAtTime(0, this.ctx.currentTime)
          osc.connect(gain)
          gain.connect(this.masterGain)
          osc.start()
          this.nodes.push({ osc, gain })

          const delay = this.nodes.length * 150
          gain.gain.linearRampToValueAtTime(cfg.vol, this.ctx.currentTime + delay / 1000 + 1.5)
        }
      }

      // Master fade in
      if (this.masterGain) {
        this.masterGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 2)
      }
    } catch {
      // Audio not supported
    }
  }

  stop() {
    if (this.fadeInTimeout) {
      clearTimeout(this.fadeInTimeout)
      this.fadeInTimeout = null
    }
    if (this.ctx && this.masterGain && this.isPlaying) {
      try {
        // Fade out master
        this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5)
        const ctxRef = this.ctx
        setTimeout(() => {
          try { ctxRef.close() } catch { /* already closed */ }
        }, 600)
      } catch {
        // ignore
      }
    }
    this.nodes = []
    this.ctx = null
    this.masterGain = null
    this.isPlaying = false
    this.currentType = 'silence'
  }

  getIsPlaying() {
    return this.isPlaying
  }
}

// Singleton ambient sound engine
let ambientEngine: AmbientSoundEngine | null = null
function getAmbientEngine(): AmbientSoundEngine {
  if (!ambientEngine) {
    ambientEngine = new AmbientSoundEngine()
  }
  return ambientEngine
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatTimeShort(seconds: number): string {
  const m = Math.floor(seconds / 60)
  return `${m} мин`
}

function formatTimeHHMM(isoString: string): string {
  const d = new Date(isoString)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function FocusTimerWidget() {
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.focus.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false)
  const [todaySessions, setTodaySessions] = useState<FocusSession[]>([])
  const [streak, setStreak] = useState(0)
  const [motivationalMsg, setMotivationalMsg] = useState<string | null>(null)
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('silence')
  const [showCelebration, setShowCelebration] = useState(false)
  const [runningQuote, setRunningQuote] = useState<string | null>(null)
  const motivationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const runningQuoteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const modeRef = useRef<TimerMode>(mode)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionsRef = useRef(sessions)
  const soundRef = useRef(soundEnabled)
  const completionHandledRef = useRef(false)

  // Keep refs in sync
  useEffect(() => {
    modeRef.current = mode
  }, [mode])
  useEffect(() => {
    sessionsRef.current = sessions
  }, [sessions])
  useEffect(() => {
    soundRef.current = soundEnabled
  }, [soundEnabled])

  // ── Refresh stats ────────────────────────────────────────────────────
  const refreshStats = useCallback(() => {
    setTodaySessions(getTodaySessions())
    setStreak(calculateStreak())
  }, [])

  // ── Handle timer completion ──────────────────────────────────────────
  const handleCompletion = useCallback(
    (currentMode: TimerMode, currentSessions: number) => {
      if (completionHandledRef.current) return
      completionHandledRef.current = true

      // Stop ambient sound on completion
      getAmbientEngine().stop()

      if (soundRef.current) {
        playCompletionSound()
      }

      if (!MODE_CONFIG[currentMode].isBreak) {
        // Focus session completed — show celebration animation
        setShowCelebration(true)
        if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current)
        celebrationTimeoutRef.current = setTimeout(() => setShowCelebration(false), 2500)

        // Focus session completed — save to history
        const newSession = addSession(currentMode, MODE_CONFIG[currentMode].duration)
        const newSessions = currentSessions + 1
        setSessions(newSessions)
        sessionsRef.current = newSessions
        refreshStats()

        toast.success(
          `${MODE_CONFIG[currentMode].shortLabel} завершён! Сессия ${newSessions} из ${TOTAL_SESSIONS_IN_CYCLE}`,
          {
            description:
              newSessions % TOTAL_SESSIONS_IN_CYCLE === 0
                ? 'Отличная работа! Пора сделать длинный перерыв'
                : 'Сделайте короткий перерыв',
            duration: 4000,
          }
        )

        // Show motivational message
        const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
        setMotivationalMsg(msg)
        if (motivationTimeoutRef.current) clearTimeout(motivationTimeoutRef.current)
        motivationTimeoutRef.current = setTimeout(() => setMotivationalMsg(null), 5000)

        // Show break suggestion
        setShowBreakSuggestion(true)
      } else {
        // Break completed
        const label =
          currentMode === 'shortBreak'
            ? 'Короткий перерыв'
            : 'Длинный перерыв'
        toast.success(`${label} завершён!`, {
          description: 'Время сфокусироваться',
          duration: 3000,
        })
        setShowBreakSuggestion(false)
      }

      setIsRunning(false)
    },
    [refreshStats]
  )

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current)
      if (runningQuoteIntervalRef.current) clearInterval(runningQuoteIntervalRef.current)
    }
  }, [])

  // ── Rotating motivational quote while running ─────────────────────
  useEffect(() => {
    if (!isRunning) return

    // Rotate every 30 seconds
    const tick = () => setRunningQuote(MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)])
    runningQuoteIntervalRef.current = setInterval(tick, 30000)
    // Show initial quote via setTimeout to avoid sync setState lint
    const initTimeout = setTimeout(tick, 0)

    return () => {
      clearTimeout(initTimeout)
      if (runningQuoteIntervalRef.current) {
        clearInterval(runningQuoteIntervalRef.current)
        runningQuoteIntervalRef.current = null
      }
      // Clear quote when effect is cleaned up (timer stops)
      setRunningQuote(null)
    }
  }, [isRunning])

  // ── Initialize from localStorage ─────────────────────────────────────
  useEffect(() => {
    const stored = loadTimerState()
    const id = setTimeout(() => {
      setMounted(true)
      if (stored) {
        setMode(stored.mode)
        setTimeLeft(stored.timeLeft)
        setSessions(stored.sessions)
        if (stored.soundEnabled !== undefined) {
          setSoundEnabled(stored.soundEnabled)
        }
        // If the timer ran out while away, handle completion
        if (stored.running === false && stored.timeLeft === 0 && !MODE_CONFIG[stored.mode as TimerMode]?.isBreak) {
          handleCompletion(stored.mode as TimerMode, stored.sessions)
        }
      }
      refreshStats()
    }, 0)
    return () => clearTimeout(id)
  }, [handleCompletion, refreshStats])

  // ── Persist timer state to localStorage ──────────────────────────────
  useEffect(() => {
    if (!mounted) return
    saveTimerState({
      mode,
      timeLeft,
      running: isRunning,
      sessions,
      soundEnabled,
      updatedAt: Date.now(),
    })
  }, [mode, timeLeft, isRunning, sessions, soundEnabled, mounted])

  // ── Timer tick ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      // Stop ambient sound when timer stops
      getAmbientEngine().stop()
      return
    }

    completionHandledRef.current = false

    // Start ambient sound if enabled and a non-silence sound is selected
    if (ambientSound !== 'silence') {
      getAmbientEngine().start(ambientSound)
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
  }, [isRunning, handleCompletion, ambientSound])

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleModeChange = useCallback((newMode: TimerMode) => {
    setIsRunning(false)
    setMode(newMode)
    modeRef.current = newMode
    setTimeLeft(MODE_CONFIG[newMode].duration)
    setShowBreakSuggestion(false)
    completionHandledRef.current = false
    setMotivationalMsg(null)
  }, [])

  const handleToggle = useCallback(() => {
    if (timeLeft <= 0) {
      setTimeLeft(MODE_CONFIG[mode].duration)
      setIsRunning(true)
      setShowBreakSuggestion(false)
      setMotivationalMsg(null)
    } else {
      setIsRunning((prev) => !prev)
    }
  }, [timeLeft, mode])

  const handleReset = useCallback(() => {
    setIsRunning(false)
    setTimeLeft(MODE_CONFIG[mode].duration)
    completionHandledRef.current = false
  }, [mode])

  const handleSkip = useCallback(() => {
    setIsRunning(false)
    const currentConfig = MODE_CONFIG[modeRef.current]

    if (currentConfig.isBreak) {
      // Skip break → go to focus
      const nextMode: TimerMode = 'focus'
      setMode(nextMode)
      modeRef.current = nextMode
      setTimeLeft(MODE_CONFIG[nextMode].duration)
      setShowBreakSuggestion(false)
    } else {
      // Skip focus → suggest break
      handleCompletion(modeRef.current, sessionsRef.current)
    }
  }, [handleCompletion])

  const handleBreakSuggestion = useCallback(
    (breakMode: TimerMode) => {
      handleModeChange(breakMode)
      // Auto-start break
      setTimeout(() => setIsRunning(true), 100)
    },
    [handleModeChange]
  )

  const handleDismissBreakSuggestion = useCallback(() => {
    setShowBreakSuggestion(false)
  }, [])

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev)
  }, [])

  const cycleAmbientSound = useCallback(() => {
    setAmbientSound((prev) => {
      const idx = AMBIENT_SOUNDS.findIndex((s) => s.id === prev)
      const nextSound = AMBIENT_SOUNDS[(idx + 1) % AMBIENT_SOUNDS.length].id
      // Start/stop ambient sound based on selection
      if (nextSound !== 'silence' && isRunning) {
        getAmbientEngine().start(nextSound)
      } else {
        getAmbientEngine().stop()
      }
      return nextSound
    })
  }, [isRunning])

  // ── Derived values ───────────────────────────────────────────────────
  const config = MODE_CONFIG[mode]

  // Time-based ring color (green → amber → red)
  const timeBasedRingColor = useMemo(() => {
    if (config.isBreak) return config.stroke
    const fraction = timeLeft / config.duration
    if (fraction > 0.5) return 'stroke-emerald-500'
    if (fraction > 0.2) return 'stroke-amber-500'
    return 'stroke-red-500'
  }, [timeLeft, config.duration, config.isBreak, config.stroke])

  const timeBasedGlowColor = useMemo(() => {
    if (config.isBreak) return config.glowClass
    const fraction = timeLeft / config.duration
    if (fraction > 0.5) return 'shadow-emerald-500/30'
    if (fraction > 0.2) return 'shadow-amber-500/30'
    return 'shadow-red-500/30'
  }, [timeLeft, config.duration, config.isBreak, config.glowClass])

  const timeBasedGradient = useMemo(() => {
    if (config.isBreak) return config.ringGradient
    const fraction = timeLeft / config.duration
    if (fraction > 0.5) return 'from-emerald-500 to-teal-400'
    if (fraction > 0.2) return 'from-amber-500 to-orange-400'
    return 'from-red-500 to-rose-400'
  }, [timeLeft, config.duration, config.isBreak, config.ringGradient])

  const timeBasedButtonFrom = useMemo(() => {
    if (config.isBreak) return config.buttonFrom
    const fraction = timeLeft / config.duration
    if (fraction > 0.5) return 'from-emerald-500'
    if (fraction > 0.2) return 'from-amber-500'
    return 'from-red-500'
  }, [timeLeft, config.duration, config.isBreak, config.buttonFrom])

  const timeBasedButtonTo = useMemo(() => {
    if (config.isBreak) return config.buttonTo
    const fraction = timeLeft / config.duration
    if (fraction > 0.5) return 'to-teal-500'
    if (fraction > 0.2) return 'to-orange-500'
    return 'to-rose-500'
  }, [timeLeft, config.duration, config.isBreak, config.buttonTo])

  const totalDuration = config.duration
  const progress = totalDuration > 0 ? 1 - timeLeft / totalDuration : 0
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress)
  const sessionInCycle =
    (sessions % TOTAL_SESSIONS_IN_CYCLE) || TOTAL_SESSIONS_IN_CYCLE
  const isBreakMode = config.isBreak

  const todayFocusMinutes = useMemo(
    () => Math.round(todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60),
    [todaySessions]
  )

  const weekFocusMinutes = useMemo(
    () => Math.round(getThisWeekSessions().reduce((sum, s) => sum + s.duration, 0) / 60),
    [todaySessions]
  )

  const todayPills = useMemo(() => {
    return [...todaySessions].reverse().slice(0, 5)
  }, [todaySessions])

  const todayOverflow = useMemo(() => {
    return Math.max(0, todaySessions.length - 5)
  }, [todaySessions])

  const shouldSuggestLongBreak = useMemo(() => {
    return sessions % TOTAL_SESSIONS_IN_CYCLE === 0 && sessions > 0
  }, [sessions])

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
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.ringGradient} opacity-[0.03]`}
      />

      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.iconBg}`}
          >
            <Timer className={`h-4 w-4 ${config.iconClass}`} />
          </div>
          <span>Фокус-таймер</span>
          {/* Streak badge */}
          {streak > 0 && (
            <span className="flex items-center gap-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 tabular-nums">
              <Flame className="h-3 w-3" />
              {streak}
            </span>
          )}
          {/* Sound + Ambient controls */}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={cycleAmbientSound}
              className="flex h-7 items-center gap-1 rounded-lg px-2 text-[10px] font-medium transition-all duration-200 hover:scale-105 active:scale-95 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Фоновый звук"
            >
              {(() => {
                const current = AMBIENT_SOUNDS.find((s) => s.id === ambientSound)
                return current ? <current.icon className={`h-3.5 w-3.5 ${current.color}`} /> : null
              })()}
              <span className="hidden sm:inline">{AMBIENT_SOUNDS.find((s) => s.id === ambientSound)?.label}</span>
            </button>
            <button
              onClick={toggleSound}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                soundEnabled
                  ? `${config.iconBg} ${config.iconClass} hover:scale-105 active:scale-95`
                  : 'bg-muted/50 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted'
              }`}
              aria-label={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            >
              {soundEnabled ? (
                <Volume1 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="flex flex-col items-center gap-4">
          {/* ── Break Suggestion Card ── */}
          {showBreakSuggestion && (
            <div className="w-full rounded-xl border border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-3 animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🧘</span>
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Время перерыва!
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-8 flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-medium text-white hover:from-amber-600 hover:to-orange-600"
                  onClick={() => handleBreakSuggestion('shortBreak')}
                >
                  <Coffee className="mr-1 h-3 w-3" />
                  5 мин перерыв
                </Button>
                {shouldSuggestLongBreak && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 flex-1 rounded-lg border-orange-200 dark:border-orange-700 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                    onClick={() => handleBreakSuggestion('longBreak')}
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    15 мин перерыв
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleDismissBreakSuggestion}
                >
                  Пропустить
                </Button>
              </div>
            </div>
          )}

          {/* ── Celebration Animation ── */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute inset-0 z-20 flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-200/60 dark:border-emerald-700/40 bg-background/95 backdrop-blur-sm px-6 py-5 shadow-xl">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30"
                  >
                    <Trophy className="h-7 w-7 text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <p className="text-sm font-bold text-foreground">Сессия завершена!</p>
                    <p className="text-xs text-muted-foreground">Отличная работа 🎉</p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Motivational Quote (while running) ── */}
          {runningQuote && !motivationalMsg && !showCelebration && (
            <div className="w-full max-w-[280px] rounded-xl border border-emerald-200/40 dark:border-emerald-800/30 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/10 dark:to-teal-950/10 px-4 py-2 text-center">
              <p className="text-[12px] font-medium text-emerald-600/80 dark:text-emerald-400/80 leading-relaxed">
                {runningQuote}
              </p>
            </div>
          )}

          {/* ── Completion Motivational Message ── */}
          {motivationalMsg && !showCelebration && (
            <div className="motivation-enter w-full max-w-[280px] rounded-xl border border-emerald-200/60 dark:border-emerald-700/40 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 px-4 py-2.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                <Trophy className="h-4 w-4" />
                <span>{motivationalMsg}</span>
              </div>
            </div>
          )}

          {/* ── Circular Progress Ring ── */}
          <div className="relative">
            {/* Glow effect behind the ring when running */}
            {isRunning && (
              <div
                className={`absolute inset-[-12px] rounded-full bg-gradient-to-br ${config.ringGradient} opacity-20 blur-xl transition-opacity duration-500 ${isBreakMode ? 'timer-glow-amber' : 'timer-glow-emerald'}`}
              />
            )}

            {/* Outer ring pulse animation when running */}
            {isRunning && (
              <div
                className={`absolute inset-[-2px] rounded-full ring-pulse-anim ${config.textClass}`}
              />
            )}

            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              className="-rotate-90"
            >
              {/* Clock tick marks (12 marks like a clock) */}
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = (i * 6) * Math.PI / 180
                const isHour = i % 5 === 0
                const outerR = RING_RADIUS + 10
                const innerR = isHour ? RING_RADIUS + 4 : RING_RADIUS + 7
                const x1 = RING_RADIUS + 10 + outerR * Math.cos(angle)
                const y1 = RING_RADIUS + 10 + outerR * Math.sin(angle)
                const x2 = RING_RADIUS + 10 + innerR * Math.cos(angle)
                const y2 = RING_RADIUS + 10 + innerR * Math.sin(angle)
                return (
                  <line
                    key={`tick-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="currentColor"
                    strokeWidth={isHour ? 1.5 : 0.5}
                    className={`${isHour ? config.textClass : 'text-muted-foreground/30'} transition-colors duration-300`}
                    strokeLinecap="round"
                  />
                )
              })}

              {/* Background track */}
              <circle
                cx={RING_RADIUS + 10}
                cy={RING_RADIUS + 10}
                r={RING_RADIUS}
                fill="none"
                strokeWidth="8"
                className={config.strokeBg}
              />
              {/* Progress arc */}
              <circle
                cx={RING_RADIUS + 10}
                cy={RING_RADIUS + 10}
                r={RING_RADIUS}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                className={`${isRunning && !config.isBreak ? timeBasedRingColor : config.stroke} transition-[stroke-dashoffset,stroke] duration-1000 ease-linear`}
                style={{
                  filter: isRunning ? `drop-shadow(0 0 6px ${timeBasedRingColor.includes('emerald') ? 'oklch(0.55 0.17 155 / 0.5)' : timeBasedRingColor.includes('amber') ? 'oklch(0.75 0.15 70 / 0.5)' : timeBasedRingColor.includes('red') ? 'oklch(0.55 0.2 25 / 0.5)' : config.stroke.includes('violet') ? 'oklch(0.55 0.2 290 / 0.5)' : config.stroke.includes('sky') ? 'oklch(0.55 0.15 230 / 0.5)' : 'oklch(0.55 0.2 30 / 0.5)'})` : 'none',
                }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-4xl font-extrabold tracking-tight tabular-nums ${config.textClass}`}
              >
                {formatTime(timeLeft)}
              </span>
              <div
                className={`mt-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${config.textClass} opacity-70`}
              >
                <config.icon className="h-3.5 w-3.5" />
                {config.shortLabel}
              </div>
            </div>
          </div>

          {/* ── Session Counter ── */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: TOTAL_SESSIONS_IN_CYCLE }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i < sessionInCycle
                      ? `w-6 bg-gradient-to-r ${config.ringGradient}`
                      : 'w-3 bg-muted-foreground/20'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
              Сессия {sessionInCycle} из {TOTAL_SESSIONS_IN_CYCLE}
            </span>
          </div>

          {/* ── Mode Tabs ── */}
          <div className="flex flex-col gap-1.5 w-full max-w-[260px]">
            {/* Focus modes */}
            <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
              {FOCUS_MODES.map((key) => {
                const isActive = mode === key
                const cfg = MODE_CONFIG[key]
                return (
                  <button
                    key={key}
                    onClick={() => handleModeChange(key)}
                    className={`relative flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                      isActive
                        ? `${cfg.textClass} shadow-sm`
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <span className={`absolute inset-0 rounded-md bg-gradient-to-r ${cfg.buttonFrom} ${cfg.buttonTo} opacity-10`} />
                    )}
                    <span className="absolute inset-0 rounded-md bg-background/80 dark:bg-background/40" />
                    {isActive && (
                      <span className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gradient-to-r ${cfg.buttonFrom} ${cfg.buttonTo}`} />
                    )}
                    <span className="relative z-10 flex items-center gap-1">
                      <cfg.icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{cfg.shortLabel}</span>
                      <span className="sm:hidden">
                        {MODE_CONFIG[key].duration / 60}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
            {/* Break modes */}
            <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
              {BREAK_MODES.map((key) => {
                const isActive = mode === key
                const cfg = MODE_CONFIG[key]
                return (
                  <button
                    key={key}
                    onClick={() => handleModeChange(key)}
                    className={`relative flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                      isActive
                        ? `${cfg.textClass} shadow-sm`
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <span className={`absolute inset-0 rounded-md bg-gradient-to-r ${cfg.buttonFrom} ${cfg.buttonTo} opacity-10`} />
                    )}
                    <span className="absolute inset-0 rounded-md bg-background/80 dark:bg-background/40" />
                    {isActive && (
                      <span className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gradient-to-r ${cfg.buttonFrom} ${cfg.buttonTo}`} />
                    )}
                    <span className="relative z-10 flex items-center gap-1">
                      <cfg.icon className="h-3 w-3" />
                      {cfg.shortLabel}
                    </span>
                  </button>
                )
              })}
            </div>
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
              className={`h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 bg-gradient-to-br ${timeBasedButtonFrom} ${timeBasedButtonTo} hover:shadow-xl text-white ${timeBasedGlowColor}`}
              onClick={handleToggle}
              aria-label={isRunning ? 'Пауза' : 'Старт'}
            >
              {isRunning ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={handleSkip}
              aria-label="Пропустить"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* ── Today's Stats ── */}
          <div className="w-full max-w-[260px] space-y-2">
            {/* Today stat line */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="tabular-nums font-medium text-foreground">
                {todaySessions.length} сессий
              </span>
              <span>·</span>
              <span className="tabular-nums font-medium text-foreground">
                {todayFocusMinutes} минут сегодня
              </span>
            </div>
            {/* Week stat line */}
            {weekFocusMinutes > 0 && (
              <div className="text-center text-[11px] text-muted-foreground/70">
                <span className="tabular-nums">{weekFocusMinutes} минут за неделю</span>
              </div>
            )}
          </div>

          {/* ── Today's Session History Pills ── */}
          {todayPills.length > 0 && (
            <div className="w-full max-w-[260px]">
              <div className="flex flex-wrap items-center gap-1.5">
                {todayPills.map((session) => (
                  <span
                    key={session.id}
                    className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2.5 py-1 text-[10px] font-medium text-muted-foreground tabular-nums"
                  >
                    <span>{formatTimeShort(session.duration)}</span>
                    <span className="text-muted-foreground/50">·</span>
                    <span>{formatTimeHHMM(session.completedAt)}</span>
                  </span>
                ))}
                {todayOverflow > 0 && (
                  <span className="text-[10px] text-muted-foreground/60">
                    ещё {todayOverflow}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Bottom info ── */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
            <Clock className="h-3 w-3" />
            <span>
              {isRunning
                ? 'Таймер работает...'
                : timeLeft === 0
                  ? 'Время вышло'
                  : 'Нажмите старт'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
