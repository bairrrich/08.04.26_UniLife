'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { formatMacro } from './constants'
import type { NutritionStats, NutritionGoals } from './types'

interface MacroRingProps {
  value: number
  goal: number
  color: string
  label: string
  unit: string
  bgColor: string
  darkBgColor: string
  icon: React.ReactNode
  animated?: boolean
}

export function MacroRing({
  value,
  goal,
  color,
  label,
  unit,
  icon,
  animated = true,
}: MacroRingProps) {
  const pct = Math.min((value / goal) * 100, 100)
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const [displayPct, setDisplayPct] = useState(animated ? 0 : pct)
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value)
  const size = 48

  useEffect(() => {
    if (!animated) return
    const duration = 800
    const startTime = Date.now()
 const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayPct(eased * pct)
      setDisplayValue(eased * value)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value, pct, animated])

  const offset = circumference - (displayPct / 100) * circumference

  return (
    <Card className="rounded-xl border p-4 card-hover" style={{ padding: '1rem' }}>
      <div className="flex items-center gap-3">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted-foreground/40"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </svg>
          {/* Center percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-bold tabular-nums" style={{ color }}>
              {Math.round(displayPct)}%
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-bold leading-tight tabular-nums">
            {formatMacro(displayValue, unit)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              / {goal}{unit}
            </span>
          </p>
          <p className="text-xs font-semibold mt-0.5 tabular-nums" style={{ color }}>
            {Math.round(displayPct)}% от нормы
          </p>
        </div>
      </div>
    </Card>
  )
}

// ─── All Macro Rings Container ──────────────────────────────────────────────

import { Flame, Beef, Milk, Wheat } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const MACRO_COLORS = {
  kcal: { color: '#f97316', bgColor: '#fff7ed', darkBgColor: '#431407', label: 'Ккал', unit: '' },
  protein: { color: '#3b82f6', bgColor: '#eff6ff', darkBgColor: '#172554', label: 'Белки', unit: 'г' },
  fat: { color: '#f59e0b', bgColor: '#fffbeb', darkBgColor: '#451a03', label: 'Жиры', unit: 'г' },
  carbs: { color: '#22c55e', bgColor: '#f0fdf4', darkBgColor: '#052e16', label: 'Углеводы', unit: 'г' },
}

const DEFAULT_GOALS: NutritionGoals = {
  dailyKcal: 2200,
  dailyProtein: 150,
  dailyFat: 80,
  dailyCarbs: 250,
  dailyWater: 2000,
}

interface MacroRingsProps {
  stats: NutritionStats | null
  goals?: NutritionGoals | null
}

export function MacroRings({ stats, goals }: MacroRingsProps) {
  const g = goals ?? DEFAULT_GOALS
  const remaining = Math.max(g.dailyKcal - (stats?.totalKcal ?? 0), 0)

  return (
    <div className="space-y-4">
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4 stagger-children">
        <MacroRing
          value={stats?.totalKcal ?? 0}
          goal={g.dailyKcal}
          color={MACRO_COLORS.kcal.color}
          label={MACRO_COLORS.kcal.label}
          unit={MACRO_COLORS.kcal.unit}
          bgColor={MACRO_COLORS.kcal.bgColor}
          darkBgColor={MACRO_COLORS.kcal.darkBgColor}
          icon={<Flame className="size-4" />}
        />
        <MacroRing
          value={stats?.totalProtein ?? 0}
          goal={g.dailyProtein}
          color={MACRO_COLORS.protein.color}
          label={MACRO_COLORS.protein.label}
          unit={MACRO_COLORS.protein.unit}
          bgColor={MACRO_COLORS.protein.bgColor}
          darkBgColor={MACRO_COLORS.protein.darkBgColor}
          icon={<Beef className="size-4" />}
        />
        <MacroRing
          value={stats?.totalFat ?? 0}
          goal={g.dailyFat}
          color={MACRO_COLORS.fat.color}
          label={MACRO_COLORS.fat.label}
          unit={MACRO_COLORS.fat.unit}
          bgColor={MACRO_COLORS.fat.bgColor}
          darkBgColor={MACRO_COLORS.fat.darkBgColor}
          icon={<Milk className="size-4" />}
        />
        <MacroRing
          value={stats?.totalCarbs ?? 0}
          goal={g.dailyCarbs}
          color={MACRO_COLORS.carbs.color}
          label={MACRO_COLORS.carbs.label}
          unit={MACRO_COLORS.carbs.unit}
          bgColor={MACRO_COLORS.carbs.bgColor}
          darkBgColor={MACRO_COLORS.carbs.darkBgColor}
          icon={<Wheat className="size-4" />}
        />
      </div>
      {/* Calories remaining badge */}
      <div className="flex justify-center">
        <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm font-semibold tabular-nums border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300">
          <Flame className="size-3.5 text-orange-500" />
          Осталось {remaining} ккал
        </Badge>
      </div>
    </div>
  )
}
