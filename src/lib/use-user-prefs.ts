'use client'

import { useState, useEffect } from 'react'

export interface UserProfile {
  name: string
  avatar: string
  goals: string[]
  theme: 'light' | 'dark' | 'system'
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Пользователь',
  avatar: '😀',
  goals: [],
  theme: 'system',
}

function readProfile(): UserProfile {
  try {
    // Try new unified profile key first
    const raw = localStorage.getItem('unilife-user-profile')
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserProfile>
      return {
        name: parsed.name?.trim() || DEFAULT_PROFILE.name,
        avatar: parsed.avatar || DEFAULT_PROFILE.avatar,
        goals: Array.isArray(parsed.goals) ? parsed.goals : DEFAULT_PROFILE.goals,
        theme: parsed.theme || DEFAULT_PROFILE.theme,
      }
    }

    // Fallback: legacy keys
    const savedName = localStorage.getItem('unilife-user-name')
    const savedGoals = localStorage.getItem('unilife-user-goals')
    const savedInterests = localStorage.getItem('unilife-user-interests')
    const savedColor = localStorage.getItem('unilife-user-color')

    return {
      name: savedName?.trim() || DEFAULT_PROFILE.name,
      avatar: DEFAULT_PROFILE.avatar,
      goals: (() => {
        if (savedGoals) {
          try { return JSON.parse(savedGoals) } catch { /* ignore */ }
        }
        if (savedInterests) {
          try { return JSON.parse(savedInterests) } catch { /* ignore */ }
        }
        return DEFAULT_PROFILE.goals
      })(),
      theme: DEFAULT_PROFILE.theme,
    }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function useUserPrefs() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading from localStorage on mount
    setProfile(readProfile())
  }, [])

  // Expose individual fields for convenience + full profile object
  return {
    userName: profile.name,
    userAvatar: profile.avatar,
    userGoals: profile.goals,
    userTheme: profile.theme,
    profile,
  }
}
