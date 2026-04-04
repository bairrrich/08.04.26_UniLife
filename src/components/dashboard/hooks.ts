'use client'

import { useEffect, useState, useRef } from 'react'

// ─── Animated Counter Hook ───────────────────────────────────────────────────

export function useAnimatedCounter(target: number, duration = 600, enabled = true): number {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) {
      rafRef.current = requestAnimationFrame(() => setValue(target))
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }

    if (target === 0) {
      rafRef.current = requestAnimationFrame(() => setValue(0))
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }

    let startTime: number | null = null
    let animationId: number

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animationId = requestAnimationFrame(animate)
    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [target, duration, enabled])

  return value
}
