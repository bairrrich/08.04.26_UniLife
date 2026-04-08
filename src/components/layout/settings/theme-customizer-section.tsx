'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Sun,
  Moon,
  Monitor,
  Check,
  Minimize2,
  Maximize2,
  Palette,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

// ── Accent Color Presets ────────────────────────────────────────────

interface AccentPreset {
  name: string
  value: string
  primaryHsl: string
  previewGradient: string
  ringClass: string
}

const ACCENT_PRESETS: AccentPreset[] = [
  {
    name: 'Emerald',
    value: 'emerald',
    primaryHsl: '160 84% 39%',
    previewGradient: 'from-emerald-400 to-teal-500',
    ringClass: 'ring-emerald-500',
  },
  {
    name: 'Amber',
    value: 'amber',
    primaryHsl: '38 92% 50%',
    previewGradient: 'from-amber-400 to-orange-500',
    ringClass: 'ring-amber-500',
  },
  {
    name: 'Rose',
    value: 'rose',
    primaryHsl: '347 77% 50%',
    previewGradient: 'from-rose-400 to-pink-500',
    ringClass: 'ring-rose-500',
  },
  {
    name: 'Violet',
    value: 'violet',
    primaryHsl: '263 70% 50%',
    previewGradient: 'from-violet-400 to-purple-500',
    ringClass: 'ring-violet-500',
  },
  {
    name: 'Teal',
    value: 'teal',
    primaryHsl: '174 80% 40%',
    previewGradient: 'from-teal-400 to-cyan-500',
    ringClass: 'ring-teal-500',
  },
  {
    name: 'Blue',
    value: 'blue',
    primaryHsl: '217 91% 60%',
    previewGradient: 'from-blue-400 to-indigo-500',
    ringClass: 'ring-blue-500',
  },
]

const STORAGE_KEY_ACCENT = 'unilife-accent-color'
const STORAGE_KEY_COMPACT = 'unilife-compact-mode'

// ── Theme Options ───────────────────────────────────────────────────

const THEME_OPTIONS = [
  {
    value: 'light',
    label: 'Светлая',
    icon: Sun,
    bgPreview: 'bg-white',
    borderPreview: 'border-border',
    accentPreview: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    shadowPreview: 'shadow-sm',
  },
  {
    value: 'dark',
    label: 'Тёмная',
    icon: Moon,
    bgPreview: 'bg-slate-900',
    borderPreview: 'border-slate-700',
    accentPreview: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    shadowPreview: 'shadow-lg shadow-black/30',
  },
  {
    value: 'system',
    label: 'Системная',
    icon: Monitor,
    bgPreview: 'bg-gradient-to-br from-white to-slate-900',
    borderPreview: 'border-border',
    accentPreview: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    shadowPreview: 'shadow-sm',
  },
]

// ── Helper: get/set localStorage with SSR safety ────────────────────

function getAccentFromStorage(): string {
  if (typeof window === 'undefined') return 'emerald'
  return localStorage.getItem(STORAGE_KEY_ACCENT) || 'emerald'
}

function setAccentToStorage(value: string) {
  try {
    localStorage.setItem(STORAGE_KEY_ACCENT, value)
    window.dispatchEvent(
      new StorageEvent('storage', { key: STORAGE_KEY_ACCENT }),
    )
  } catch {
    /* ignore */
  }
}

function getCompactFromStorage(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY_COMPACT) === 'true'
}

function subscribeToStorage(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

// ── Component ───────────────────────────────────────────────────────

export function ThemeCustomizerSection() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [accentColor, setAccentColor] = useState(() => getAccentFromStorage())
  const [compactMode, setCompactMode] = useState(() => getCompactFromStorage())

  // Hydrate compact mode data attribute on mount
  useEffect(() => {
    if (compactMode) {
      document.documentElement.setAttribute('data-compact', 'true')
    }
  }, [compactMode])

  // Apply accent color via CSS variable
  useEffect(() => {
    const preset = ACCENT_PRESETS.find((p) => p.value === accentColor)
    if (preset) {
      document.documentElement.style.setProperty('--accent-hsl', preset.primaryHsl)
    }
  }, [accentColor])

  const handleAccentChange = useCallback((value: string) => {
    setAccentColor(value)
    setAccentToStorage(value)
    toast.success(`Акцент: ${ACCENT_PRESETS.find((p) => p.value === value)?.name ?? value}`)
  }, [])

  const handleCompactToggle = useCallback((checked: boolean) => {
    setCompactMode(checked)
    try {
      localStorage.setItem(STORAGE_KEY_COMPACT, String(checked))
      if (checked) {
        document.documentElement.setAttribute('data-compact', 'true')
      } else {
        document.documentElement.removeAttribute('data-compact')
      }
      window.dispatchEvent(
        new StorageEvent('storage', { key: STORAGE_KEY_COMPACT }),
      )
      toast.info(
        checked ? 'Компактный режим включён' : 'Стандартный режим включён',
      )
    } catch {
      /* ignore */
    }
  }, [])

  // Determine the current effective accent gradient for previews
  const currentAccent = ACCENT_PRESETS.find((p) => p.value === accentColor)

  return (
    <Card className="rounded-xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-violet-400 to-violet-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Тема и внешний вид
        </CardTitle>
        <CardDescription>
          Настройте тему, акцентный цвет и оформление приложения
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* ── Theme Toggle ──────────────────────────────────────── */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Тема оформления</Label>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((opt) => {
              const isActive = theme === opt.value
              const Icon = opt.icon
              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    'relative flex flex-col items-center gap-3 rounded-xl p-3 transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 border-2 border-primary shadow-sm'
                      : 'bg-muted/40 border-2 border-transparent hover:bg-muted/60',
                  )}
                >
                  {/* Visual preview card */}
                  <div
                    className={cn(
                      'relative h-16 w-full rounded-lg border overflow-hidden transition-all',
                      opt.bgPreview,
                      opt.borderPreview,
                      opt.shadowPreview,
                    )}
                  >
                    {/* Top accent bar — use current accent color */}
                    <div
                      className={cn(
                        'h-1.5 w-full',
                        currentAccent?.previewGradient ?? opt.accentPreview,
                      )}
                    />
                    {/* Mini content lines */}
                    <div className="p-2 space-y-1.5">
                      <div
                        className={cn(
                          'h-2 w-3/4 rounded-sm',
                          opt.value === 'dark' ? 'bg-slate-600' : 'bg-muted',
                        )}
                      />
                      <div
                        className={cn(
                          'h-1.5 w-full rounded-sm',
                          opt.value === 'dark'
                            ? 'bg-slate-700'
                            : 'bg-muted/70',
                        )}
                      />
                      <div
                        className={cn(
                          'h-1.5 w-2/3 rounded-sm',
                          opt.value === 'dark'
                            ? 'bg-slate-700'
                            : 'bg-muted/70',
                        )}
                      />
                    </div>
                    {/* Check indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                      </motion.div>
                    )}
                  </div>
                  {/* Label */}
                  <div className="flex items-center gap-1.5">
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground',
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground',
                      )}
                    >
                      {opt.label}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── Accent Color Picker ────────────────────────────────── */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Акцентный цвет</Label>
          <div className="flex flex-wrap gap-3">
            {ACCENT_PRESETS.map((preset) => {
              const isActive = accentColor === preset.value
              return (
                <motion.button
                  key={preset.value}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAccentChange(preset.value)}
                  title={preset.name}
                  className={cn(
                    'relative h-10 w-10 rounded-xl transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    preset.ringClass,
                    isActive
                      ? 'ring-2 ring-offset-2 ring-offset-background shadow-lg'
                      : 'hover:shadow-md hover:scale-105',
                  )}
                >
                  {/* Swatch */}
                  <div
                    className={cn(
                      'h-full w-full rounded-xl bg-gradient-to-br',
                      preset.previewGradient,
                    )}
                  />
                  {/* Check indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="h-5 w-5 rounded-full bg-white/90 dark:bg-black/60 flex items-center justify-center">
                        <Check className="h-3 w-3 text-foreground" />
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>
          {/* Accent preview strip */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'h-2 flex-1 rounded-full bg-gradient-to-r',
                currentAccent?.previewGradient ?? 'from-emerald-400 to-teal-500',
              )}
            />
            <span className="text-xs text-muted-foreground tabular-nums min-w-[60px] text-right">
              {ACCENT_PRESETS.find((p) => p.value === accentColor)?.name ?? accentColor}
            </span>
          </div>
        </div>

        {/* ── Compact Mode ───────────────────────────────────────── */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Плотность интерфейса</Label>

          <div className="flex items-center justify-between py-2 rounded-lg px-3 bg-muted/20">
            <div className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-2">
                <Minimize2 className="h-4 w-4 text-muted-foreground" />
                Компактный режим
              </p>
              <p className="text-xs text-muted-foreground">
                Уменьшает отступы и размеры карточек
              </p>
            </div>
            <Switch
              checked={compactMode}
              onCheckedChange={handleCompactToggle}
            />
          </div>

          {/* Preview of compact vs normal mode */}
          <div className="grid grid-cols-2 gap-3">
            {/* Normal mode preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Maximize2 className="h-3 w-3" />
                Стандартный
              </div>
              <div className="rounded-xl border bg-card p-4 space-y-2">
                <div className="h-3.5 w-3/4 rounded bg-muted" />
                <div className="h-2.5 w-full rounded bg-muted/60" />
                <div className="h-2.5 w-5/6 rounded bg-muted/60" />
                <div className="h-2.5 w-2/3 rounded bg-muted/60" />
                <div className="flex gap-1.5 mt-2">
                  <div
                    className={cn(
                      'h-5 w-12 rounded-full bg-gradient-to-r opacity-20',
                      currentAccent?.previewGradient ?? 'from-emerald-400 to-teal-500',
                    )}
                  />
                  <div
                    className={cn(
                      'h-5 w-12 rounded-full bg-gradient-to-r opacity-20',
                      currentAccent?.previewGradient ?? 'from-emerald-400 to-teal-500',
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Compact mode preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Minimize2 className="h-3 w-3" />
                Компактный
              </div>
              <div className="rounded-xl border bg-card p-2.5 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-muted" />
                <div className="h-2 w-full rounded bg-muted/60" />
                <div className="h-2 w-5/6 rounded bg-muted/60" />
                <div className="h-2 w-2/3 rounded bg-muted/60" />
                <div className="flex gap-1 mt-1">
                  <div
                    className={cn(
                      'h-4 w-10 rounded-full bg-gradient-to-r opacity-20',
                      currentAccent?.previewGradient ?? 'from-emerald-400 to-teal-500',
                    )}
                  />
                  <div
                    className={cn(
                      'h-4 w-10 rounded-full bg-gradient-to-r opacity-20',
                      currentAccent?.previewGradient ?? 'from-emerald-400 to-teal-500',
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active mode indicator */}
          <motion.div
            layout
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg p-2.5 text-xs font-medium transition-all',
              compactMode
                ? 'bg-primary/10 text-primary'
                : 'bg-muted/50 text-muted-foreground',
            )}
          >
            {compactMode ? (
              <>
                <Minimize2 className="h-3 w-3" />
                Компактный режим активен
              </>
            ) : (
              <>
                <Maximize2 className="h-3 w-3" />
                Стандартный режим активен
              </>
            )}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
