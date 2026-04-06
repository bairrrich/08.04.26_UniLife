'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from 'next-themes'
import {
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  User,
  Palette,
  PartyPopper,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Heart,
  Target,
  TrendingUp,
  Zap,
  Dumbbell,
  Lightbulb,
} from 'lucide-react'

const TOTAL_STEPS = 3

const AVATAR_EMOJIS = [
  { id: '😀', label: 'Улыбка' },
  { id: '🌟', label: 'Звезда' },
  { id: '🎯', label: 'Цель' },
  { id: '💪', label: 'Сила' },
  { id: '📚', label: 'Знания' },
  { id: '🏆', label: 'Победа' },
]

const GOALS = [
  { id: 'health', label: 'Здоровье', icon: Heart, color: 'from-rose-400 to-rose-600', iconBg: 'bg-rose-100 dark:bg-rose-900/40', iconColor: 'text-rose-600 dark:text-rose-400' },
  { id: 'finance', label: 'Финансы', icon: TrendingUp, color: 'from-emerald-400 to-emerald-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'development', label: 'Развитие', icon: Lightbulb, color: 'from-amber-400 to-amber-600', iconBg: 'bg-amber-100 dark:bg-amber-900/40', iconColor: 'text-amber-600 dark:text-amber-400' },
  { id: 'productivity', label: 'Продуктивность', icon: Zap, color: 'from-blue-400 to-blue-600', iconBg: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400' },
  { id: 'sport', label: 'Спорт', icon: Dumbbell, color: 'from-violet-400 to-violet-600', iconBg: 'bg-violet-100 dark:bg-violet-900/40', iconColor: 'text-violet-600 dark:text-violet-400' },
  { id: 'creativity', label: 'Творчество', icon: Sparkles, color: 'from-pink-400 to-pink-600', iconBg: 'bg-pink-100 dark:bg-pink-900/40', iconColor: 'text-pink-600 dark:text-pink-400' },
]

const THEME_OPTIONS = [
  { id: 'light' as const, label: 'Светлая', icon: Sun, desc: 'Яркий и чистый' },
  { id: 'dark' as const, label: 'Тёмная', icon: Moon, desc: 'Комфорт для глаз' },
  { id: 'system' as const, label: 'Системная', icon: Monitor, desc: 'Как на устройстве' },
]

const MOTIVATIONAL_MESSAGES = [
  'Каждый день — это возможность стать лучше!',
  'Ваш путь к идеальной жизни начинается сейчас.',
  'Маленькие шаги ведут к большим достижениям.',
  'Инвестируйте в себя — это лучшая инвестиция.',
  'Начните сегодня, чтобы быть благодарными завтра.',
]

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

const slideTransition = {
  x: { type: 'spring', stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
}

// ─── Confetti Particle ────────────────────────────────────────────────

interface ConfettiParticle {
  id: number
  x: number
  color: string
  delay: number
  rotation: number
  size: number
}

function generateConfetti(): ConfettiParticle[] {
  const colors = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6']
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.8,
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
  }))
}

function ConfettiAnimation({ active }: { active: boolean }) {
  if (!active) return null
  const particles = generateConfetti()

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            y: -20,
            x: `${p.x}%`,
            rotate: p.rotation,
            opacity: 1,
            scale: 0,
          }}
          animate={{
            y: '100vh',
            opacity: [1, 1, 0],
            scale: [0, 1.2, 0.8],
            rotate: p.rotation + 720,
          }}
          transition={{
            duration: 2.5 + Math.random() * 1.5,
            delay: p.delay,
            ease: 'easeOut',
          }}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            left: `${p.x}%`,
            top: -10,
          }}
        />
      ))}
    </div>
  )
}

// ─── Loading Skeleton ────────────────────────────────────────────────

function OnboardingSkeleton() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md dark:bg-black/70" />
      <div className="relative z-10 mx-4 w-full max-w-lg">
        <div className="overflow-hidden border-0 shadow-2xl dark:shadow-black/50 rounded-xl">
          <Skeleton className="h-1.5 w-full" />
          <div className="p-6 sm:p-8 space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-11 w-full max-w-xs mx-auto" />
            <div className="flex justify-center gap-3 pt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-14 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WelcomeScreen() {
  const { setTheme } = useTheme()

  // Lazy initializer — reads localStorage once at mount (SSR-safe)
  const [status, setStatus] = useState<'unknown' | 'show' | 'dismissed'>(() => {
    if (typeof window === 'undefined') return 'unknown'
    try {
      const completed = localStorage.getItem('unilife-onboarding-completed')
        || localStorage.getItem('unilife-onboarding-complete')
      return completed === 'true' ? 'dismissed' : 'show'
    } catch {
      return 'dismissed'
    }
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [userName, setUserName] = useState(() => {
    if (typeof window === 'undefined') return ''
    try {
      const profile = localStorage.getItem('unilife-user-profile')
      if (profile) {
        const parsed = JSON.parse(profile)
        if (parsed.name?.trim()) return parsed.name.trim()
      }
      const saved = localStorage.getItem('unilife-user-name')
      return saved?.trim() || ''
    } catch { return '' }
  })
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    if (typeof window === 'undefined') return '😀'
    try {
      const profile = localStorage.getItem('unilife-user-profile')
      if (profile) {
        const parsed = JSON.parse(profile)
        if (parsed.avatar) return parsed.avatar
      }
      return '😀'
    } catch { return '😀' }
  })
  const [selectedGoals, setSelectedGoals] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const profile = localStorage.getItem('unilife-user-profile')
      if (profile) {
        const parsed = JSON.parse(profile)
        if (Array.isArray(parsed.goals)) return parsed.goals
      }
      return []
    } catch { return [] }
  })
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window === 'undefined') return 'system'
    try {
      const profile = localStorage.getItem('unilife-user-profile')
      if (profile) {
        const parsed = JSON.parse(profile)
        if (parsed.theme) return parsed.theme
      }
      return 'system'
    } catch { return 'system' }
  })
  const [showConfetti, setShowConfetti] = useState(false)

  const saveProfile = useCallback((skip = false) => {
    try {
      localStorage.setItem('unilife-onboarding-completed', 'true')
      localStorage.setItem('unilife-onboarding-complete', 'true')

      const profile = {
        name: skip ? '' : (userName.trim() || ''),
        avatar: skip ? '😀' : selectedAvatar,
        goals: skip ? [] : selectedGoals,
        theme: skip ? 'system' : selectedTheme,
      }
      localStorage.setItem('unilife-user-profile', JSON.stringify(profile))

      // Keep legacy keys for backward compat
      if (profile.name) localStorage.setItem('unilife-user-name', profile.name)
      if (profile.goals.length > 0) localStorage.setItem('unilife-user-goals', JSON.stringify(profile.goals))

      // Apply theme preference
      if (!skip) {
        setTheme(profile.theme)
      }
    } catch { /* localStorage unavailable */ }
  }, [userName, selectedAvatar, selectedGoals, selectedTheme, setTheme])

  const handleComplete = useCallback(() => {
    saveProfile()
    setShowConfetti(true)
    setTimeout(() => {
      setShowConfetti(false)
      setStatus('dismissed')
    }, 3200)
  }, [saveProfile])

  const handleSkip = useCallback(() => {
    saveProfile(true)
    setStatus('dismissed')
  }, [saveProfile])

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const toggleGoal = useCallback((goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    )
  }, [])

  if (status === 'unknown') return <OnboardingSkeleton />
  if (status === 'dismissed') return null

  const progressPercent = ((currentStep + 1) / TOTAL_STEPS) * 100
  const motivationalMessage = MOTIVATIONAL_MESSAGES[userName.length % MOTIVATIONAL_MESSAGES.length]
  const avatarObj = AVATAR_EMOJIS.find((a) => a.id === selectedAvatar) ?? AVATAR_EMOJIS[0]

  return (
    <>
      <ConfettiAnimation active={showConfetti} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md dark:bg-black/70" />

        {/* Main container */}
        <div className="relative z-10 mx-4 w-full max-w-lg">
          {/* Skip button */}
          <div className="absolute -top-1 right-0 z-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs"
            >
              Пропустить
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Card */}
          <Card className="overflow-hidden border-0 shadow-2xl dark:shadow-black/50">
            {/* Gradient header bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 via-30% to-amber-400" />

            <CardContent className="relative p-0">
              {/* Decorative blobs */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-emerald-400/15 to-teal-400/10 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-400/8 blur-3xl" />
                <div className="absolute right-1/4 top-1/3 h-32 w-32 rounded-full bg-gradient-to-br from-violet-400/8 to-pink-400/5 blur-3xl" />
              </div>

              {/* Steps container */}
              <div className="relative min-h-[440px] max-h-[72vh] overflow-hidden sm:min-h-[460px]">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={slideTransition}
                    className="px-6 pb-2 pt-8 sm:px-8 sm:pt-10"
                  >
                    {/* ──── Step 1: Name + Avatar Emoji Picker ──── */}
                    {currentStep === 0 && (
                      <div className="flex flex-col items-center text-center">
                        {/* Logo */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15, duration: 0.4, type: 'spring', stiffness: 200 }}
                          className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25"
                        >
                          <span className="text-3xl font-bold text-white">U</span>
                        </motion.div>

                        <motion.h1
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.25, duration: 0.3 }}
                          className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl"
                        >
                          Добро пожаловать в{' '}
                          <span className="text-gradient">UniLife</span>
                          !
                        </motion.h1>

                        <motion.p
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.3 }}
                          className="mb-6 text-sm text-muted-foreground sm:text-base"
                        >
                          Вся жизнь в одном месте
                        </motion.p>

                        {/* Name input */}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                          className="w-full max-w-xs"
                        >
                          <label className="mb-2 block text-sm font-medium text-left">
                            Как вас зовут?
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              placeholder="Ваше имя"
                              className="pl-9 h-11 glass-card border-border/50"
                              autoFocus
                            />
                          </div>
                        </motion.div>

                        {/* Avatar Emoji Picker */}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                          className="mt-6 w-full max-w-xs"
                        >
                          <label className="mb-3 block text-sm font-medium text-left">
                            Выберите аватар
                          </label>
                          <div className="grid grid-cols-6 gap-2">
                            {AVATAR_EMOJIS.map((emoji, idx) => (
                              <motion.button
                                key={emoji.id}
                                type="button"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.55 + idx * 0.05, duration: 0.25, type: 'spring', stiffness: 400, damping: 20 }}
                                onClick={() => setSelectedAvatar(emoji.id)}
                                className={`relative flex h-14 w-full items-center justify-center rounded-2xl text-2xl transition-all duration-200 active-press ${
                                  selectedAvatar === emoji.id
                                    ? 'bg-primary/15 ring-2 ring-primary/50 shadow-sm scale-105'
                                    : 'bg-muted/50 hover:bg-muted hover:scale-105'
                                }`}
                                title={emoji.label}
                              >
                                {emoji.id}
                                {selectedAvatar === emoji.id && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1"
                                  >
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                  </motion.div>
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>

                        {/* Preview */}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.85, duration: 0.3 }}
                          className="mt-5 flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-2.5"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-lg shadow-sm">
                            {selectedAvatar}
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium">
                              {userName.trim() || 'Ваше имя'}
                            </div>
                            <div className="text-xs text-muted-foreground">Новый участник UniLife</div>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* ──── Step 2: Select Primary Goals ──── */}
                    {currentStep === 1 && (
                      <div className="flex flex-col">
                        <div className="mb-5 text-center">
                          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <Target className="h-3.5 w-3.5" />
                            Цели
                          </div>
                          <h2 className="text-xl font-bold sm:text-2xl">
                            Что для вас важно?
                          </h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Выберите основные направления
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {GOALS.map((item, idx) => {
                            const isChecked = selectedGoals.includes(item.id)
                            return (
                              <motion.button
                                key={item.id}
                                type="button"
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.06, duration: 0.3 }}
                                onClick={() => toggleGoal(item.id)}
                                className={`group relative rounded-xl border p-3.5 text-left transition-all duration-200 active-press ${
                                  isChecked
                                    ? 'border-primary/40 bg-primary/5 shadow-sm dark:bg-primary/10'
                                    : 'border-border hover:border-primary/20 hover:bg-muted/50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.iconBg} transition-transform duration-200 group-hover:scale-110`}
                                  >
                                    <item.icon className={`h-4.5 w-4.5 ${item.iconColor}`} />
                                  </div>
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => toggleGoal(item.id)}
                                    className="pointer-events-none"
                                  />
                                </div>
                                <h3 className={`text-sm font-semibold transition-colors ${isChecked ? 'text-foreground' : 'text-foreground/80'}`}>
                                  {item.label}
                                </h3>
                                {isChecked && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 right-2"
                                  >
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                  </motion.div>
                                )}
                              </motion.button>
                            )
                          })}
                        </div>

                        {selectedGoals.length > 0 && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-3 text-center text-xs text-muted-foreground"
                          >
                            Выбрано: {selectedGoals.length} из {GOALS.length}
                          </motion.p>
                        )}
                      </div>
                    )}

                    {/* ──── Step 3: Theme + Motivational Message ──── */}
                    {currentStep === 2 && (
                      <div className="flex flex-col items-center text-center">
                        {/* Avatar Preview */}
                        <motion.div
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.4, type: 'spring', stiffness: 200 }}
                          className="mb-4"
                        >
                          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl">
                            <span className="text-5xl">
                              {selectedAvatar}
                            </span>
                            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-border shadow-sm">
                              <Sparkles className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </motion.div>

                        <motion.h2
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                          className="mb-1 text-xl font-bold sm:text-2xl"
                        >
                          {userName.trim() ? `${userName.trim()}, отлично!` : 'Отлично!'}
                        </motion.h2>

                        <motion.p
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.3 }}
                          className="mb-5 text-sm text-muted-foreground"
                        >
                          Выберите тему оформления
                        </motion.p>

                        {/* Theme picker */}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.35, duration: 0.3 }}
                          className="mb-5 grid grid-cols-3 gap-2 w-full max-w-xs"
                        >
                          {THEME_OPTIONS.map((option) => {
                            const isActive = selectedTheme === option.id
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setSelectedTheme(option.id)}
                                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-200 active-press ${
                                  isActive
                                    ? 'border-primary/50 bg-primary/5 shadow-sm dark:bg-primary/10'
                                    : 'border-border hover:border-primary/20 hover:bg-muted/50'
                                }`}
                              >
                                <option.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {option.label}
                                </span>
                              </button>
                            )
                          })}
                        </motion.div>

                        {/* Motivational Message */}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.45, duration: 0.3 }}
                          className="w-full max-w-xs rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-amber-500/10 border border-primary/10 p-4 mb-5"
                        >
                          <div className="flex items-start gap-2.5 text-left">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
                              <Lightbulb className="h-3.5 w-3.5 text-white" />
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed italic">
                              &ldquo;{motivationalMessage}&rdquo;
                            </p>
                          </div>
                        </motion.div>

                        {/* Profile Summary */}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.55, duration: 0.3 }}
                          className="w-full rounded-xl border bg-muted/30 p-4 text-left"
                        >
                          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Ваш профиль
                          </div>
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-sm">
                                {selectedAvatar}
                              </div>
                              <div>
                                <div className="text-[11px] text-muted-foreground">Имя</div>
                                <div className="text-sm font-medium">{userName.trim() || 'Не указано'}</div>
                              </div>
                            </div>

                            {selectedGoals.length > 0 && (
                              <div className="flex items-start gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                  <Target className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div>
                                  <div className="text-[11px] text-muted-foreground">Цели</div>
                                  <div className="flex flex-wrap gap-1 pt-0.5">
                                    {selectedGoals.map((id) => {
                                      const goal = GOALS.find((g) => g.id === id)
                                      if (!goal) return null
                                      const GoalIcon = goal.icon
                                      return (
                                        <span
                                          key={id}
                                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                                        >
                                          <GoalIcon className="h-2.5 w-2.5" />
                                          {goal.label}
                                        </span>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                <Palette className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div>
                                <div className="text-[11px] text-muted-foreground">Тема</div>
                                <div className="text-sm font-medium">
                                  {THEME_OPTIONS.find((t) => t.id === selectedTheme)?.label}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.65, duration: 0.3 }}
                        >
                          <Button
                            onClick={handleComplete}
                            size="lg"
                            className="h-12 gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 text-base font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/35"
                          >
                            <PartyPopper className="h-5 w-5" />
                            Начать
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer: progress + navigation */}
              <div className="border-t bg-muted/30 px-6 py-4 sm:px-8">
                {/* Progress bar */}
                <div className="mb-3">
                  <Progress value={progressPercent} className="h-1.5" />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <div>
                    {currentStep > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="gap-1.5 text-muted-foreground"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Назад
                      </Button>
                    ) : (
                      <div className="w-[68px]" />
                    )}
                  </div>

                  {/* Step dots */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                      <motion.button
                        key={i}
                        onClick={() => {
                          setDirection(i > currentStep ? 1 : -1)
                          setCurrentStep(i)
                        }}
                        className={`rounded-full transition-all duration-300 ${
                          i === currentStep
                            ? 'h-2 w-6 bg-primary'
                            : i < currentStep
                              ? 'h-2 w-2 bg-primary/60'
                              : 'h-2 w-2 bg-muted-foreground/25 hover:bg-muted-foreground/40'
                        }`}
                        aria-label={`Шаг ${i + 1}`}
                      />
                    ))}
                  </div>

                  <div>
                    {currentStep < TOTAL_STEPS - 1 ? (
                      <Button
                        size="sm"
                        onClick={handleNext}
                        className="gap-1.5"
                      >
                        Далее
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <div className="w-[68px]" />
                    )}
                  </div>
                </div>

                {/* Step label */}
                <div className="mt-2.5 text-center text-[11px] text-muted-foreground/60">
                  Шаг {currentStep + 1} из {TOTAL_STEPS}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  )
}
