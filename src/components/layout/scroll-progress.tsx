'use client'

import { useState, useEffect, useCallback } from 'react'

export function ScrollProgress() {
  const [scrollState, setScrollState] = useState({ progress: 0, visible: false })

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const fivePercent = Math.max(docHeight * 0.05, 50)
    const isVisible = scrollTop > fivePercent
    const scrollPercent = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0

    setScrollState((prev) => {
      if (prev.progress === scrollPercent && prev.visible === isVisible) return prev
      return { progress: scrollPercent, visible: isVisible }
    })
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-0.5 transition-opacity duration-300"
      style={{ opacity: scrollState.visible ? 1 : 0 }}
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 transition-[width] duration-200 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]"
        style={{ width: `${scrollState.progress}%` }}
      />
    </div>
  )
}

export default ScrollProgress
