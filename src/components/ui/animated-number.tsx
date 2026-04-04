'use client'

import { useEffect, useRef, useState, memo } from 'react'

// ─── Animated Number ───────────────────────────────────────────────────────────
// Renders a number that animates from its previous value to a new value.
// IMPORTANT: State is LOCAL to this component, so it does NOT cause
// re-renders of parent components during animation.

interface AnimatedNumberProps {
  value: number
  duration?: number
  className?: string
  formatter?: (value: number) => string
}

export const AnimatedNumber = memo(function AnimatedNumber({
  value,
  duration = 600,
  className,
  formatter,
}: AnimatedNumberProps) {
  // Initialize with the target value to avoid flashing 0 on first render
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)
  const rafRef = useRef(0)

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = value

    if (prev === value) return

    const startValue = prev
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (value - startValue) * eased)

      setDisplay(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration])

  const formatted = formatter ? formatter(display) : display.toLocaleString('ru-RU')

  return <span className={className}>{formatted}</span>
})
