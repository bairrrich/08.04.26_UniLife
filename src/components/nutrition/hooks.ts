'use client'

import { useMemo, useCallback, useEffect } from 'react'
import { getTodayStr } from '@/lib/format'
import { WATER_HISTORY_KEY } from './constants'

export function useWaterHistory(waterTotalMl: number) {
  const getWaterHistory = useCallback((): { date: string; ml: number }[] => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(WATER_HISTORY_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }, [])

  const saveWaterHistory = useCallback((history: { date: string; ml: number }[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(WATER_HISTORY_KEY, JSON.stringify(history))
    } catch {
      // ignore quota errors
    }
  }, [])

  const waterHistory = useMemo(() => {
    const history = getWaterHistory()
    const todayStr = getTodayStr()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const sevenDaysAgoStr = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`
    return history.filter((h) => h.date >= sevenDaysAgoStr && h.date <= todayStr)
  }, [getWaterHistory])

  useEffect(() => {
    const history = getWaterHistory()
    const todayStr = getTodayStr()
    const existingIdx = history.findIndex((h) => h.date === todayStr)
    if (existingIdx >= 0) {
      history[existingIdx].ml = waterTotalMl
    } else {
      history.push({ date: todayStr, ml: waterTotalMl })
    }
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoff = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`
    const filtered = history.filter((h) => h.date >= cutoff)
    saveWaterHistory(filtered)
  }, [waterTotalMl, getWaterHistory, saveWaterHistory])

  const waterChartDays = useMemo(() => {
    const days: { date: string; dayLabel: string; ml: number; isToday: boolean }[] = []
    const todayStr = getTodayStr()
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const dayOfWeek = d.getDay()
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const entry = waterHistory.find((h) => h.date === dateStr)
      days.push({
        date: dateStr,
        dayLabel: dayNames[dayOfWeek],
        ml: entry?.ml || 0,
        isToday: dateStr === todayStr,
      })
    }
    return days
  }, [waterHistory])

  return { waterHistory, waterChartDays }
}
