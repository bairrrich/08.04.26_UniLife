'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { UtensilsCrossed, Flame, Beef, Milk, Wheat, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/use-app-store'
import { getTodayStr } from '@/lib/format'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NutritionData {
  totalKcal: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
}

interface MacroItem {
  label: string
  value: number
  goal: number
  unit: string
  color: string
  strokeClass: string
  bgClass: string
  icon: typeof Flame
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NutritionSummaryWidget() {
  const [data, setData] = useState<NutritionData | null>(null)
  const [loading, setLoading] = useState(true)
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  useEffect(() => {
    async function fetchNutrition() {
      try {
        const today = getTodayStr()
        const res = await fetch(`/api/nutrition/stats?date=${today}`)
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            setData({
              totalKcal: json.data.totalKcal ?? 0,
              totalProtein: json.data.totalProtein ?? 0,
              totalFat: json.data.totalFat ?? 0,
              totalCarbs: json.data.totalCarbs ?? 0,
            })
          }
        }
      } catch (err) {
        console.error('Nutrition summary fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchNutrition()
  }, [])

  const macros: MacroItem[] = [
    {
      label: 'Ккал',
      value: data?.totalKcal ?? 0,
      goal: 2200,
      unit: 'ккал',
      color: '#f97316',
      strokeClass: 'stroke-orange-500',
      bgClass: 'bg-orange-100 dark:bg-orange-900/40',
      icon: Flame,
    },
    {
      label: 'Белки',
      value: data?.totalProtein ?? 0,
      goal: 150,
      unit: 'г',
      color: '#3b82f6',
      strokeClass: 'stroke-blue-500',
      bgClass: 'bg-blue-100 dark:bg-blue-900/40',
      icon: Beef,
    },
    {
      label: 'Жиры',
      value: data?.totalFat ?? 0,
      goal: 80,
      unit: 'г',
      color: '#f59e0b',
      strokeClass: 'stroke-amber-500',
      bgClass: 'bg-amber-100 dark:bg-amber-900/40',
      icon: Milk,
    },
    {
      label: 'Углеводы',
      value: data?.totalCarbs ?? 0,
      goal: 250,
      unit: 'г',
      color: '#22c55e',
      strokeClass: 'stroke-green-500',
      bgClass: 'bg-green-100 dark:bg-green-900/40',
      icon: Wheat,
    },
  ]

  return (
    <Card
      className="animate-slide-up card-hover group cursor-pointer rounded-xl border overflow-hidden"
      onClick={() => setActiveModule('nutrition')}
    >
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/3 to-transparent" />

      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
            <UtensilsCrossed className="h-4 w-4 text-orange-500 dark:text-orange-400" />
          </div>
          <span>Питание сегодня</span>
          <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        {loading ? (
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-3 w-14 rounded" />
                <Skeleton className="h-2 w-10 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-4 gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, staggerChildren: 0.08 }}
          >
            {macros.map((macro) => (
              <MacroRing key={macro.label} {...macro} />
            ))}
          </motion.div>
        )}

        {/* Bottom summary */}
        {!loading && data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 flex items-center justify-between border-t border-border/50 pt-3"
          >
            <span className="text-[11px] text-muted-foreground">
              Всего сегодня
            </span>
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {data.totalKcal} ккал
            </span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Mini Circular Progress Ring ──────────────────────────────────────────────

function MacroRing({ label, value, goal, unit, color, strokeClass, bgClass, icon: Icon }: MacroItem) {
  const pct = Math.min(Math.round((value / goal) * 100), 100)
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const size = 48

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth="3.5"
            className="text-muted-foreground/20"
            stroke="currentColor"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={strokeClass}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>

      {/* Label and value */}
      <div className="flex flex-col items-center text-center">
        <span className="text-[10px] font-semibold tabular-nums text-foreground leading-tight">
          {Math.round(value)}
        </span>
        <span className="text-[9px] text-muted-foreground leading-tight">
          / {goal}{unit}
        </span>
      </div>

      {/* Percentage badge */}
      <span
        className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums"
        style={{
          color,
          backgroundColor: `${color}15`,
        }}
      >
        {pct}%
      </span>
    </motion.div>
  )
}
