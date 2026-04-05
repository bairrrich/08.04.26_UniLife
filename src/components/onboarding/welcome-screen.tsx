'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Wallet,
  UtensilsCrossed,
  Dumbbell,
  Target,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  User,
  Palette,
  PartyPopper,
} from 'lucide-react'

const TOTAL_STEPS = 3

const INTERESTS = [
  { id: 'diary', label: 'Дневник', icon: BookOpen, color: 'from-emerald-400 to-emerald-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'finance', label: 'Финансы', icon: Wallet, color: 'from-amber-400 to-amber-600', iconBg: 'bg-amber-100 dark:bg-amber-900/40', iconColor: 'text-amber-600 dark:text-amber-400' },
  { id: 'nutrition', label: 'Питание', icon: UtensilsCrossed, color: 'from-rose-400 to-rose-600', iconBg: 'bg-rose-100 dark:bg-rose-900/40', iconColor: 'text-rose-600 dark:text-rose-400' },
  { id: 'workout', label: 'Тренировки', icon: Dumbbell, color: 'from-blue-400 to-blue-600', iconBg: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400' },
  { id: 'habits', label: 'Привычки', icon: Target, color: 'from-violet-400 to-violet-600', iconBg: 'bg-violet-100 dark:bg-violet-900/40', iconColor: 'text-violet-600 dark:text-violet-400' },
  { id: 'goals', label: 'Цели', icon: Layers, color: 'from-purple-400 to-purple-600', iconBg: 'bg-purple-100 dark:bg-purple-900/40', iconColor: 'text-purple-600 dark:text-purple-400' },
]

const AVATAR_COLORS = [
  { id: 'emerald', label: 'Изумруд', bg: 'bg-emerald-500', ring: 'ring-emerald-400', text: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'sky', label: 'Небо', bg: 'bg-sky-500', ring: 'ring-sky-400', text: 'text-sky-600 dark:text-sky-400' },
  { id: 'violet', label: 'Фиалка', bg: 'bg-violet-500', ring: 'ring-violet-400', text: 'text-violet-600 dark:text-violet-400' },
  { id: 'rose', label: 'Роза', bg: 'bg-rose-500', ring: 'ring-rose-400', text: 'text-rose-600 dark:text-rose-400' },
  { id: 'amber', label: 'Янтарь', bg: 'bg-amber-500', ring: 'ring-amber-400', text: 'text-amber-600 dark:text-amber-400' },
  { id: 'teal', label: 'Бирюза', bg: 'bg-teal-500', ring: 'ring-teal-400', text: 'text-teal-600 dark:text-teal-400' },
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

// ─── Confetti Particle ────────────────────────────────────────────────────────

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

export function WelcomeScreen() {
  const [status, setStatus] = useState<'unknown' | 'show' | 'dismissed'>('unknown')
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [userName, setUserName] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedColor, setSelectedColor] = useState('emerald')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    try {
      const completed = localStorage.getItem('unilife-onboarding-complete')
      const savedName = localStorage.getItem('unilife-user-name')
      const savedInterests = localStorage.getItem('unilife-user-interests')
      const savedColor = localStorage.getItem('unilife-user-color')
      if (completed === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reading from external storage on mount
        setStatus('dismissed')
      } else {
        if (savedName) setUserName(savedName)
        if (savedInterests) {
          try { setSelectedInterests(JSON.parse(savedInterests)) } catch { /* ignore */ }
        }
        if (savedColor) setSelectedColor(savedColor)
        setStatus('show')
      }
    } catch {
      setStatus('dismissed')
    }
  }, [])

  const handleComplete = useCallback(() => {
    try {
      localStorage.setItem('unilife-onboarding-complete', 'true')
      if (userName.trim()) {
        localStorage.setItem('unilife-user-name', userName.trim())
      }
      if (selectedInterests.length > 0) {
        localStorage.setItem('unilife-user-interests', JSON.stringify(selectedInterests))
      }
      localStorage.setItem('unilife-user-color', selectedColor)
    } catch { /* localStorage unavailable */ }
    setShowConfetti(true)
    setTimeout(() => {
      setShowConfetti(false)
      setStatus('dismissed')
    }, 3200)
  }, [userName, selectedInterests, selectedColor])

  const handleSkip = useCallback(() => {
    try {
      localStorage.setItem('unilife-onboarding-complete', 'true')
    } catch { /* localStorage unavailable */ }
    setStatus('dismissed')
  }, [])

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

  const toggleInterest = useCallback((interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    )
  }, [])

  if (status === 'unknown') return null
  if (status === 'dismissed') return null

  const progressPercent = ((currentStep + 1) / TOTAL_STEPS) * 100
  const avatarColorObj = AVATAR_COLORS.find((c) => c.id === selectedColor) ?? AVATAR_COLORS[0]

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
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

            <CardContent className="relative p-0">
              {/* Decorative blobs */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-400/10 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-br from-amber-400/8 to-orange-400/8 blur-3xl" />
              </div>

              {/* Steps container */}
              <div className="relative min-h-[420px] max-h-[70vh] overflow-hidden sm:min-h-[440px]">
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
                    {/* Step 1: Welcome + Name */}
                    {currentStep === 0 && (
                      <div className="flex flex-col items-center text-center">
                        {/* Logo */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15, duration: 0.4, type: 'spring', stiffness: 200 }}
                          className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25"
                        >
                          <span className="text-3xl font-bold text-white">U</span>
                        </motion.div>

                        <motion.h1
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.25, duration: 0.3 }}
                          className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
                        >
                          Добро пожаловать в{' '}
                          <span className="text-gradient">UniLife</span>
                          !
                        </motion.h1>

                        <motion.p
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.35, duration: 0.3 }}
                          className="mb-6 text-base text-muted-foreground sm:text-lg"
                        >
                          Вся жизнь в одном месте
                        </motion.p>

                        {/* Name input */}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.45, duration: 0.3 }}
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

                        {/* Decorative icons row */}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.55, duration: 0.3 }}
                          className="mt-8 flex gap-3"
                        >
                          {INTERESTS.map((item) => (
                            <div
                              key={item.id}
                              className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg}`}
                            >
                              <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                            </div>
                          ))}
                        </motion.div>
                      </div>
                    )}

                    {/* Step 2: Select Interests */}
                    {currentStep === 1 && (
                      <div className="flex flex-col">
                        <div className="mb-5 text-center">
                          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <Sparkles className="h-3.5 w-3.5" />
                            Интересы
                          </div>
                          <h2 className="text-xl font-bold sm:text-2xl">
                            Что для вас важно?
                          </h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Выберите модули, которые планируете использовать
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {INTERESTS.map((item, idx) => {
                            const isChecked = selectedInterests.includes(item.id)
                            return (
                              <motion.button
                                key={item.id}
                                type="button"
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.05, duration: 0.3 }}
                                onClick={() => toggleInterest(item.id)}
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
                                    onCheckedChange={() => toggleInterest(item.id)}
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

                        {selectedInterests.length > 0 && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-3 text-center text-xs text-muted-foreground"
                          >
                            Выбрано: {selectedInterests.length} из {INTERESTS.length}
                          </motion.p>
                        )}
                      </div>
                    )}

                    {/* Step 3: Avatar Color + Ready */}
                    {currentStep === 2 && (
                      <div className="flex flex-col items-center text-center">
                        {/* Avatar Preview */}
                        <motion.div
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.4, type: 'spring', stiffness: 200 }}
                          className="mb-4"
                        >
                          <div className={`relative flex h-24 w-24 items-center justify-center rounded-full ${avatarColorObj.bg} shadow-xl`}>
                            <span className="text-4xl font-bold text-white">
                              {userName.trim() ? userName.trim()[0].toUpperCase() : 'U'}
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
                          Выберите цвет аватара
                        </motion.p>

                        {/* Color picker */}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.35, duration: 0.3 }}
                          className="mb-6 flex items-center justify-center gap-3"
                        >
                          {AVATAR_COLORS.map((color) => (
                            <button
                              key={color.id}
                              type="button"
                              onClick={() => setSelectedColor(color.id)}
                              className={`flex h-10 w-10 items-center justify-center rounded-full ${color.bg} transition-all duration-200 hover:scale-110 active:scale-95 ${
                                selectedColor === color.id
                                  ? `ring-2 ring-offset-2 ring-offset-background ${color.ring} scale-110`
                                  : 'opacity-60 hover:opacity-100'
                              }`}
                              aria-label={color.label}
                            >
                              {selectedColor === color.id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex h-4 w-4 items-center justify-center rounded-full bg-white/90"
                                >
                                  <CheckCircle2 className="h-3 w-3 text-foreground" />
                                </motion.div>
                              )}
                            </button>
                          ))}
                        </motion.div>

                        {/* Summary */}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.45, duration: 0.3 }}
                          className="w-full rounded-xl border bg-muted/30 p-4 text-left"
                        >
                          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Ваш профиль
                          </div>
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${avatarColorObj.bg}`}>
                                <User className="h-3.5 w-3.5 text-white" />
                              </div>
                              <div>
                                <div className="text-[11px] text-muted-foreground">Имя</div>
                                <div className="text-sm font-medium">{userName.trim() || 'Не указано'}</div>
                              </div>
                            </div>

                            {selectedInterests.length > 0 && (
                              <div className="flex items-start gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                  <Target className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div>
                                  <div className="text-[11px] text-muted-foreground">Интересы</div>
                                  <div className="flex flex-wrap gap-1 pt-0.5">
                                    {selectedInterests.map((id) => {
                                      const interest = INTERESTS.find((i) => i.id === id)
                                      if (!interest) return null
                                      const InterestIcon = interest.icon
                                      return (
                                        <span
                                          key={id}
                                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                                        >
                                          <InterestIcon className="h-2.5 w-2.5" />
                                          {interest.label}
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
                                <div className="text-[11px] text-muted-foreground">Цвет аватара</div>
                                <div className={`text-sm font-medium ${avatarColorObj.text}`}>
                                  {avatarColorObj.label}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.55, duration: 0.3 }}
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
