'use client'

// ─── Animated Counter Hook ─────────────────────────────────────────────────────
// Simplified: returns the target value directly (no animation state updates).
// Animation is now handled by <AnimatedNumber> leaf components which keep
// their state LOCAL and don't trigger parent re-renders during animation.

export function useAnimatedCounter(target: number, _duration?: number, enabled = true): number {
  return enabled ? target : 0
}
