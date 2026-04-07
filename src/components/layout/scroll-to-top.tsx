'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Throttled scroll listener via requestAnimationFrame
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          const progress = docHeight > 0 ? Math.min((scrollY / docHeight) * 100, 100) : 0

          setScrollProgress(progress)
          setVisible(progress >= 5)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Check initial scroll position (e.g. page restored with scroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // SVG progress ring constants
  const size = 40
  const strokeWidth = 2.5
  const radius = (size - strokeWidth) / 2 // 18.75
  const circumference = 2 * Math.PI * radius // ~117.81
  const dashOffset = circumference * (1 - scrollProgress / 100)

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-background border shadow-md transition-shadow duration-200 hover:scale-110 hover:shadow-lg active:scale-95 md:bottom-24 md:right-6"
          aria-label="Наверх"
        >
          <svg
            width={size}
            height={size}
            className="absolute inset-0 -rotate-90"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="scroll-progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              className="stroke-muted"
              strokeWidth={strokeWidth}
            />
            {/* Progress ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#scroll-progress-gradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
            />
          </svg>
          <ArrowUp className="h-4 w-4 text-foreground relative z-10" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
