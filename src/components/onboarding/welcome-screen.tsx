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
} from 'lucide-react'

const TOTAL_STEPS = 4

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Дневник',
    description: 'Записывайте мысли, настроение и важные события каждого дня',
    color: 'from-emerald-400 to-emerald-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Wallet,
    title: 'Финансы',
    description: 'Отслеживайте доходы и расходы, контролируйте бюджет',
    color: 'from-amber-400 to-amber-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: UtensilsCrossed,
    title: 'Питание',
    description: 'Следите за рационом, калориями и балансом нутриентов',
    color: 'from-rose-400 to-rose-600',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    icon: Dumbbell,
    title: 'Тренировки',
    description: 'Планируйте занятия, записывайте упражнения и прогресс',
    color: 'from-blue-400 to-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Target,
    title: 'Привычки',
    description: 'Формируйте полезные привычки и отслеживайте их выполнение',
    color: 'from-violet-400 to-violet-600',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: Layers,
    title: 'Коллекции',
    description: 'Сохраняйте книги, фильмы, рецепты и другие интересы',
    color: 'from-purple-400 to-purple-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
]

const DAILY_GOALS = [
  { id: 'diary', label: 'Вести дневник', icon: BookOpen },
  { id: 'finance', label: 'Отслеживать расходы', icon: Wallet },
  { id: 'workout', label: 'Записывать тренировки', icon: Dumbbell },
  { id: 'nutrition', label: 'Следить за питанием', icon: UtensilsCrossed },
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

export function WelcomeScreen() {
  const [status, setStatus] = useState<'unknown' | 'show' | 'dismissed'>('unknown')
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [userName, setUserName] = useState('Алексей')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  useEffect(() => {
    try {
      const completed = localStorage.getItem('unilife-onboarding-complete')
      const savedName = localStorage.getItem('unilife-user-name')
      if (completed === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reading from external storage on mount
        setStatus('dismissed')
      } else {
        if (savedName) setUserName(savedName)
        setStatus('show')
      }
    } catch {
      setStatus('show')
    }
  }, [])

  const handleComplete = useCallback(() => {
    try {
      localStorage.setItem('unilife-onboarding-complete', 'true')
      if (userName.trim()) {
        localStorage.setItem('unilife-user-name', userName.trim())
      }
    } catch { /* localStorage unavailable */ }
    setStatus('dismissed')
  }, [userName])

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

  const toggleGoal = useCallback((goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    )
  }, [])

  // Don't render anything until we know the status (avoid flash)
  if (status === 'unknown') return null
  if (status === 'dismissed') return null

  const progressPercent = ((currentStep + 1) / TOTAL_STEPS) * 100

  return (
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
                      {/* Step 1: Welcome */}
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
                            className="mb-2 text-base text-muted-foreground sm:text-lg"
                          >
                            Вся жизнь в одном месте
                          </motion.p>

                          <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.45, duration: 0.3 }}
                            className="max-w-xs text-sm text-muted-foreground/80"
                          >
                            Дневник, финансы, питание, тренировки, привычки и коллекции — всё в одном приложении для баланса и продуктивности.
                          </motion.p>

                          {/* Decorative icons row */}
                          <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.55, duration: 0.3 }}
                            className="mt-8 flex gap-3"
                          >
                            {FEATURES.map((f) => (
                              <div
                                key={f.title}
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.iconBg}`}
                              >
                                <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                              </div>
                            ))}
                          </motion.div>
                        </div>
                      )}

                      {/* Step 2: Features */}
                      {currentStep === 1 && (
                        <div className="flex flex-col">
                          <div className="mb-5 text-center">
                            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                              <Sparkles className="h-3.5 w-3.5" />
                              Возможности
                            </div>
                            <h2 className="text-xl font-bold sm:text-2xl">
                              Что для вас есть в UniLife
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Шесть модулей для полноценной организации жизни
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {FEATURES.map((feature, idx) => (
                              <motion.div
                                key={feature.title}
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.06, duration: 0.3 }}
                              >
                                <div className="group rounded-xl border bg-card p-3.5 transition-all duration-200 hover:border-primary/30 hover:shadow-md active-press">
                                  <div
                                    className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg ${feature.iconBg} transition-transform duration-200 group-hover:scale-110`}
                                  >
                                    <feature.icon className={`h-4.5 w-4.5 ${feature.iconColor}`} />
                                  </div>
                                  <h3 className="mb-0.5 text-sm font-semibold">
                                    {feature.title}
                                  </h3>
                                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                                    {feature.description}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 3: Personalization */}
                      {currentStep === 2 && (
                        <div className="flex flex-col">
                          <div className="mb-5 text-center">
                            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                              <User className="h-3.5 w-3.5" />
                              Персонализация
                            </div>
                            <h2 className="text-xl font-bold sm:text-2xl">
                              Настройте под себя
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Поможем адаптировать UniLife для вас
                            </p>
                          </div>

                          {/* Name input */}
                          <div className="mb-5">
                            <label className="mb-2 block text-sm font-medium">
                              Как вас зовут?
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Ваше имя"
                                className="pl-9 h-11"
                                autoFocus
                              />
                            </div>
                          </div>

                          {/* Daily goals */}
                          <div>
                            <label className="mb-3 block text-sm font-medium">
                              Что хотите отслеживать ежедневно?
                            </label>
                            <div className="space-y-2">
                              {DAILY_GOALS.map((goal) => {
                                const isChecked = selectedGoals.includes(goal.id)
                                return (
                                  <motion.button
                                    key={goal.id}
                                    type="button"
                                    onClick={() => toggleGoal(goal.id)}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all duration-200 ${
                                      isChecked
                                        ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                                        : 'border-border hover:border-primary/20 hover:bg-muted/50'
                                    }`}
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={() => toggleGoal(goal.id)}
                                      className="pointer-events-none"
                                    />
                                    <goal.icon
                                      className={`h-4 w-4 shrink-0 ${
                                        isChecked
                                          ? 'text-primary'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                    <span
                                      className={`text-sm ${
                                        isChecked
                                          ? 'font-medium text-foreground'
                                          : 'text-muted-foreground'
                                      }`}
                                    >
                                      {goal.label}
                                    </span>
                                    {isChecked && (
                                      <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
                                    )}
                                  </motion.button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Ready */}
                      {currentStep === 3 && (
                        <div className="flex flex-col items-center text-center">
                          <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.4, type: 'spring', stiffness: 200 }}
                            className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25"
                          >
                            <CheckCircle2 className="h-8 w-8 text-white" />
                          </motion.div>

                          <motion.h2
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="mb-2 text-2xl font-bold sm:text-3xl"
                          >
                            Готово!
                          </motion.h2>

                          <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                            className="mb-6 text-sm text-muted-foreground"
                          >
                            {userName.trim()
                              ? `${userName.trim()}, отлично! Всё готово к началу работы.`
                              : 'Всё готово к началу работы.'}
                          </motion.p>

                          {/* Summary card */}
                          <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                            className="mb-6 w-full rounded-xl border bg-muted/30 p-4 text-left"
                          >
                            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Ваш профиль
                            </div>
                            <div className="space-y-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                  <User className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div>
                                  <div className="text-[11px] text-muted-foreground">Имя</div>
                                  <div className="text-sm font-medium">
                                    {userName.trim() || 'Не указано'}
                                  </div>
                                </div>
                              </div>

                              {selectedGoals.length > 0 && (
                                <div className="flex items-start gap-2.5">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                    <Target className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <div>
                                    <div className="text-[11px] text-muted-foreground">Цели</div>
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                      {selectedGoals.map((goalId) => {
                                        const goal = DAILY_GOALS.find((g) => g.id === goalId)
                                        return goal ? (
                                          <span
                                            key={goalId}
                                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                                          >
                                            <goal.icon className="h-2.5 w-2.5" />
                                            {goal.label}
                                          </span>
                                        ) : null
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div>
                                  <div className="text-[11px] text-muted-foreground">Модули</div>
                                  <div className="text-sm font-medium">
                                    6 модулей доступны
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                          >
                            <Button
                              onClick={handleComplete}
                              size="lg"
                              className="h-12 gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 text-base font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/35"
                            >
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
                        <button
                          key={i}
                          onClick={() => {
                            setDirection(i > currentStep ? 1 : -1)
                            setCurrentStep(i)
                          }}
                          className={`rounded-full transition-all duration-300 ${
                            i === currentStep
                              ? 'h-2 w-6 bg-primary'
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
  )
}
