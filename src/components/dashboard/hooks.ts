'use client'

import { useEffect, useState, useRef } from 'react'

// ─── Animated Counter Hook ───────────────────────────────────────────────────
// Uses ~20fps animation to avoid excessive re-renders (down from 60fps).

export function useAnimatedCounter(target: number, duration = 600, enabled = true): number {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)
  const prevTargetRef = useRef<number>(0)

  // Immediate jump if not enabled or target is 0
  useEffect(() => {
    if (!enabled || target === 0) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      // Use rAF to batch with current render cycle
      rafRef.current = requestAnimationFrame(() => setValue(target))
      prevTargetRef.current = target
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    }
  }, [target, enabled])

  // Animated transition
  useEffect(() => {
    if (!enabled || target === 0) return

    prevTargetRef.current = value
    const startValue = value
    // Skip animation if target hasn't changed
    if (startValue === target) return

    let startTime: number | null = null
    // Throttle to ~20fps to reduce re-renders from 60/s to 20/s
    const FRAME_INTERVAL = 50

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp

      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      setValue(Math.round(startValue + (target - startValue) * eased))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame((ts) => {
          // Throttle frames
          if (ts - timestamp < FRAME_INTERVAL) {
            rafRef.current = requestAnimationFrame(animate)
          } else {
            animate(ts)
          }
        })
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, enabled])

  return value
}
