'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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

export function ThemeSection() {
  const { theme, setTheme } = useTheme()

  return (
    <Card className="rounded-xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-violet-400 to-violet-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Тема
        </CardTitle>
        <CardDescription>Выберите оформление приложения</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const isActive = theme === opt.value
            const Icon = opt.icon
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'relative flex flex-col items-center gap-3 rounded-xl p-3 transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 border-2 border-primary shadow-sm'
                    : 'bg-muted/40 border-2 border-transparent hover:bg-muted/60',
                )}
              >
                {/* Visual preview card */}
                <div className={cn(
                  'relative h-16 w-full rounded-lg border overflow-hidden transition-all',
                  opt.bgPreview, opt.borderPreview, opt.shadowPreview,
                )}>
                  {/* Top accent bar */}
                  <div className={cn('h-1.5 w-full', opt.accentPreview)} />
                  {/* Mini content lines */}
                  <div className="p-2 space-y-1.5">
                    <div className={cn(
                      'h-2 w-3/4 rounded-sm',
                      opt.value === 'dark' ? 'bg-slate-600' : 'bg-muted',
                    )} />
                    <div className={cn(
                      'h-1.5 w-full rounded-sm',
                      opt.value === 'dark' ? 'bg-slate-700' : 'bg-muted/70',
                    )} />
                    <div className={cn(
                      'h-1.5 w-2/3 rounded-sm',
                      opt.value === 'dark' ? 'bg-slate-700' : 'bg-muted/70',
                    )} />
                  </div>
                  {/* Check indicator */}
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="flex items-center gap-1.5">
                  <Icon className={cn(
                    'h-4 w-4',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )} />
                  <span className={cn(
                    'text-xs font-medium',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}>
                    {opt.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
