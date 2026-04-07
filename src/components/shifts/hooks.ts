'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────────────────

export interface Shift {
  id: string
  date: string       // YYYY-MM-DD
  startTime: string  // HH:MM
  endTime: string    // HH:MM
  breakMin: number   // break in minutes
  location: string
  note: string
  payRate: number
  tips: number
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface ShiftStats {
  totalHours: number
  totalEarnings: number
  totalShifts: number
  avgHours: number
}

// ─── Helpers ────────────────────────────────────────────────────────────

export const RU_MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

export function formatMonthKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  return `${RU_MONTHS[m - 1]} ${y}`
}

export function calcDuration(startTime: string, endTime: string, breakMin: number): number {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  let diff = (eh * 60 + em) - (sh * 60 + sm)
  if (diff <= 0) diff += 24 * 60 // overnight shift
  return Math.max(0, (diff - breakMin) / 60)
}

export function calcEarnings(duration: number, payRate: number, tips: number): number {
  return duration * payRate + (tips || 0)
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString('ru-RU') + ' ₽'
}

// ─── Hook ───────────────────────────────────────────────────────────────

export function useShifts() {
  const [month, setMonth] = useState(() => formatMonthKey(new Date()))
  const [shifts, setShifts] = useState<Shift[]>([])
  const [stats, setStats] = useState<ShiftStats>({
    totalHours: 0,
    totalEarnings: 0,
    totalShifts: 0,
    avgHours: 0,
  })
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const [shiftsRes, statsRes] = await Promise.all([
        fetch(`/api/shifts?month=${month}`),
        fetch(`/api/shifts/stats?month=${month}`),
      ])

      if (shiftsRes.ok) {
        const data = await shiftsRes.json()
        setShifts(Array.isArray(data) ? data : [])
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch {
      toast.error('Не удалось загрузить смены')
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    refetch()
  }, [refetch])

  const addShift = useCallback(async (shift: Omit<Shift, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shift),
      })
      if (res.ok) {
        toast.success('Смена добавлена')
        await refetch()
        return true
      }
      toast.error('Ошибка при добавлении смены')
      return false
    } catch {
      toast.error('Ошибка при добавлении смены')
      return false
    }
  }, [refetch])

  const updateShift = useCallback(async (id: string, shift: Partial<Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const res = await fetch(`/api/shifts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shift),
      })
      if (res.ok) {
        toast.success('Смена обновлена')
        await refetch()
        return true
      }
      toast.error('Ошибка при обновлении смены')
      return false
    } catch {
      toast.error('Ошибка при обновлении смены')
      return false
    }
  }, [refetch])

  const deleteShift = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/shifts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Смена удалена')
        await refetch()
        return true
      }
      toast.error('Ошибка при удалении смены')
      return false
    } catch {
      toast.error('Ошибка при удалении смены')
      return false
    }
  }, [refetch])

  const completeShift = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/shifts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      if (res.ok) {
        toast.success('Смена завершена')
        await refetch()
        return true
      }
      toast.error('Ошибка при завершении смены')
      return false
    } catch {
      toast.error('Ошибка при завершении смены')
      return false
    }
  }, [refetch])

  return {
    shifts,
    stats,
    loading,
    month,
    setMonth,
    addShift,
    updateShift,
    deleteShift,
    completeShift,
    refetch,
  }
}
