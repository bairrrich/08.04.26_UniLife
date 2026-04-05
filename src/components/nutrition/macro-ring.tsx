'use client'

import { Card } from '@/components/ui/card'
import { MACRO_GOALS, formatMacro } from './constants'

interface MacroRingProps {
  value: number
  goal: number
  color: string
  label: string
  unit: string
  bgColor: string
  darkBgColor: string
  icon: React.ReactNode
}

export function MacroRing({
  value,
  goal,
  color,
  label,
  unit,
  icon,
}: MacroRingProps) {
  const pct = Math.min((value / goal) * 100, 100)
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const size = 48

  return (
    <Card className="rounded-xl border p-4" style={{ padding: '1rem' }}>
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
              className="text-muted/40"
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
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color }}
          >
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-bold leading-tight">
            {formatMacro(value, unit)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              / {goal}{unit}
            </span>
          </p>
          <p className="text-xs font-semibold mt-0.5 tabular-nums" style={{ color }}>
            {Math.round(pct)}%
          </p>
        </div>
      </div>
    </Card>
  )
}

// ─── All Macro Rings Container ──────────────────────────────────────────────

import { Flame, Beef, Milk, Wheat } from 'lucide-react'
import type { NutritionStats } from './types'

interface MacroRingsProps {
  stats: NutritionStats | null
}

export function MacroRings({ stats }: MacroRingsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4 stagger-children">
      <MacroRing
        value={stats?.totalKcal ?? 0}
        goal={MACRO_GOALS.kcal.value}
        color={MACRO_GOALS.kcal.color}
        label={MACRO_GOALS.kcal.label}
        unit={MACRO_GOALS.kcal.unit}
        bgColor={MACRO_GOALS.kcal.bgColor}
        darkBgColor={MACRO_GOALS.kcal.darkBgColor}
        icon={<Flame className="size-4" />}
      />
      <MacroRing
        value={stats?.totalProtein ?? 0}
        goal={MACRO_GOALS.protein.value}
        color={MACRO_GOALS.protein.color}
        label={MACRO_GOALS.protein.label}
        unit={MACRO_GOALS.protein.unit}
        bgColor={MACRO_GOALS.protein.bgColor}
        darkBgColor={MACRO_GOALS.protein.darkBgColor}
        icon={<Beef className="size-4" />}
      />
      <MacroRing
        value={stats?.totalFat ?? 0}
        goal={MACRO_GOALS.fat.value}
        color={MACRO_GOALS.fat.color}
        label={MACRO_GOALS.fat.label}
        unit={MACRO_GOALS.fat.unit}
        bgColor={MACRO_GOALS.fat.bgColor}
        darkBgColor={MACRO_GOALS.fat.darkBgColor}
        icon={<Milk className="size-4" />}
      />
      <MacroRing
        value={stats?.totalCarbs ?? 0}
        goal={MACRO_GOALS.carbs.value}
        color={MACRO_GOALS.carbs.color}
        label={MACRO_GOALS.carbs.label}
        unit={MACRO_GOALS.carbs.unit}
        bgColor={MACRO_GOALS.carbs.bgColor}
        darkBgColor={MACRO_GOALS.carbs.darkBgColor}
        icon={<Wheat className="size-4" />}
      />
    </div>
  )
}
