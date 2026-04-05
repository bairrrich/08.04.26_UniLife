'use client'

import { useState, useEffect } from 'react'

export function useUserPrefs() {
  const [userName, setUserName] = useState('Пользователь')
  const [userGoals, setUserGoals] = useState<string[]>([])

  useEffect(() => {
    try {
      const savedName = localStorage.getItem('unilife-user-name')
      const savedGoals = localStorage.getItem('unilife-user-goals')
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading from localStorage on mount
      if (savedName?.trim()) setUserName(savedName.trim())
      if (savedGoals) setUserGoals(JSON.parse(savedGoals))
    } catch { /* ignore */ }
  }, [])

  return { userName, userGoals }
}
