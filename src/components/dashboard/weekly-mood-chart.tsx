'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Smile } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MoodDataPoint {
  day: string       // e.g., "Пн", "Вт"
  mood: number | null  // 1-5 or null
  date: string      // full date string for tooltip
}

interface WeeklyMoodChartProps {
  loading: boolean
  moodData: MoodDataPoint[]  // 7 data points for the week
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MOOD_COLORS: Record<number, string> = {
  1: '#ef4444', // red
  2: '#f97316', // orange
  3: '#eab308', // yellow
  4: '#22c55e', // green
  5: '#059669', // emerald
}

const MOOD_EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

// SVG layout constants
const SVG_WIDTH = 280
const SVG_HEIGHT = 120
const LEFT_MARGIN = 30
const BOTTOM_MARGIN = 20
const CHART_WIDTH = 250
const CHART_HEIGHT = 100

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getX(index: number): number {
  return LEFT_MARGIN + (index * CHART_WIDTH) / 6
}

function getY(mood: number): number {
  return ((5 - mood) * CHART_HEIGHT) / 4
}

function getLineColor(mood: number): string {
  return MOOD_COLORS[mood] ?? '#059669'
}

// Break the data into segments separated by null values
function buildSegments(data: MoodDataPoint[]): { x: number; y: number; mood: number }[][] {
  const segments: { x: number; y: number; mood: number }[][] = []
  let current: { x: number; y: number; mood: number }[] = []

  for (let i = 0; i < data.length; i++) {
    const point = data[i]
    if (point.mood !== null && point.mood > 0) {
      current.push({
        x: getX(i),
        y: getY(point.mood),
        mood: point.mood,
      })
    } else {
      if (current.length > 0) {
        segments.push(current)
        current = []
      }
    }
  }
  if (current.length > 0) {
    segments.push(current)
  }
  return segments
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WeeklyMoodChart({ loading, moodData }: WeeklyMoodChartProps) {
  // ── Loading state ──
  if (loading) {
    return (
      <Card className="rounded-xl border card-hover animate-slide-up">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Smile className="h-4 w-4 text-emerald-500" />
          <CardTitle className="text-base">Настроение за неделю</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  // ── Empty state ──
  const hasAnyData = moodData.some((d) => d.mood !== null && d.mood > 0)
  if (!hasAnyData) {
    return (
      <Card className="rounded-xl border card-hover animate-slide-up">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Smile className="h-4 w-4 text-emerald-500" />
          <CardTitle className="text-base">Настроение за неделю</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center">
            <Smile className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Нет данных о настроении</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── Chart rendering ──
  const segments = buildSegments(moodData)

  // Build polygon points for area fill under each segment
  const buildAreaPath = (seg: { x: number; y: number; mood: number }[]): string => {
    if (seg.length < 2) return ''
    const baseline = CHART_HEIGHT // y=0 mood level → bottom of chart
    let d = `M ${seg[0].x},${baseline} L ${seg[0].x},${seg[0].y}`
    for (let i = 1; i < seg.length; i++) {
      d += ` L ${seg[i].x},${seg[i].y}`
    }
    d += ` L ${seg[seg.length - 1].x},${baseline} Z`
    return d
  }

  // Average mood for the gradient color
  const validMoods = moodData.filter((d) => d.mood !== null && d.mood > 0).map((d) => d.mood!)
  const avgMood = validMoods.length > 0
    ? validMoods.reduce((a, b) => a + b, 0) / validMoods.length
    : 3
  const avgColor = getLineColor(Math.round(avgMood))

  return (
    <Card className="rounded-xl border card-hover animate-slide-up">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Smile className="h-4 w-4 text-emerald-500" />
        <CardTitle className="text-base">Настроение за неделю</CardTitle>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT + BOTTOM_MARGIN + 10}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradient for area fill */}
            <linearGradient id="moodAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={avgColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={avgColor} stopOpacity={0.02} />
            </linearGradient>
            {/* Line gradient */}
            <linearGradient id="moodLineGradient" x1="0" y1="0" x2="1" y2="0">
              {validMoods.length > 0 && (() => {
                const firstColor = getLineColor(validMoods[0])
                const lastColor = getLineColor(validMoods[validMoods.length - 1])
                return (
                  <>
                    <stop offset="0%" stopColor={firstColor} />
                    <stop offset="100%" stopColor={lastColor} />
                  </>
                )
              })()}
            </linearGradient>
          </defs>

          {/* Horizontal grid lines (mood 1-5) */}
          {[1, 2, 3, 4, 5].map((level) => {
            const y = getY(level)
            return (
              <line
                key={`grid-${level}`}
                x1={LEFT_MARGIN}
                y1={y}
                x2={LEFT_MARGIN + CHART_WIDTH}
                y2={y}
                stroke="currentColor"
                className="stroke-muted/50"
                strokeWidth={0.5}
                strokeDasharray={level === 3 ? 'none' : '3 3'}
              />
            )
          })}

          {/* Y-axis emoji labels */}
          {[1, 2, 3, 4, 5].map((level) => {
            const y = getY(level)
            return (
              <text
                key={`label-${level}`}
                x={LEFT_MARGIN - 4}
                y={y + 3.5}
                textAnchor="end"
                fontSize={9}
              >
                {MOOD_EMOJIS[level]}
              </text>
            )
          })}

          {/* X-axis day labels */}
          {moodData.map((point, i) => {
            const x = getX(i)
            return (
              <text
                key={`day-${i}`}
                x={x}
                y={CHART_HEIGHT + 14}
                textAnchor="middle"
                fontSize={10}
                className="fill-muted-foreground"
              >
                {point.day}
              </text>
            )
          })}

          {/* Area fills under each segment */}
          {segments.map((seg, si) => {
            const areaPath = buildAreaPath(seg)
            if (!areaPath) return null
            // Use the average mood of the segment for its fill color
            const segAvg = seg.reduce((a, p) => a + p.mood, 0) / seg.length
            const segColor = getLineColor(Math.round(segAvg))
            return (
              <linearGradient
                key={`areaGrad-${si}`}
                id={`areaGrad-${si}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={segColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={segColor} stopOpacity={0.02} />
              </linearGradient>
            )
          })}
          {segments.map((seg, si) => {
            const areaPath = buildAreaPath(seg)
            if (!areaPath) return null
            return (
              <path
                key={`area-${si}`}
                d={areaPath}
                fill={`url(#areaGrad-${si})`}
              />
            )
          })}

          {/* Line segments */}
          {segments.map((seg, si) => {
            if (seg.length < 2) return null
            const points = seg.map((p) => `${p.x},${p.y}`).join(' ')
            // Color based on segment average mood
            const segAvg = seg.reduce((a, p) => a + p.mood, 0) / seg.length
            const segColor = getLineColor(Math.round(segAvg))
            return (
              <polyline
                key={`line-${si}`}
                points={points}
                fill="none"
                stroke={segColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )
          })}

          {/* Data point circles */}
          {moodData.map((point, i) => {
            if (point.mood === null || point.mood <= 0) return null
            const cx = getX(i)
            const cy = getY(point.mood)
            const color = getLineColor(point.mood)
            return (
              <g key={`dot-${i}`}>
                {/* Outer ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  opacity={0.3}
                />
                {/* Inner dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill={color}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="stroke-background"
                />
              </g>
            )
          })}

          {/* Tooltip title elements (hidden, used for accessibility) */}
          {moodData.map((point, i) => {
            if (point.mood === null || point.mood <= 0) return null
            const cx = getX(i)
            const cy = getY(point.mood)
            return (
              <title key={`title-${i}`}>
                {point.date} — {point.day}: {MOOD_EMOJIS[point.mood]} ({point.mood}/5)
              </title>
            )
          })}
        </svg>
      </CardContent>
    </Card>
  )
}
