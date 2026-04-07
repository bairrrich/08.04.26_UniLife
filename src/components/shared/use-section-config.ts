'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SectionDef {
  id: string
  title: string
  icon: string
  defaultVisible: boolean
  defaultCollapsed?: boolean
  defaultOrder: number
}

export interface SectionConfig {
  visible: Record<string, boolean>
  order: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function storageKey(moduleId: string) {
  return `unilife-section-config-${moduleId}`
}

function loadConfig(moduleId: string, sections: SectionDef[]): SectionConfig {
  if (typeof window === 'undefined') {
    return defaultConfig(sections)
  }
  try {
    const raw = localStorage.getItem(storageKey(moduleId))
    if (!raw) return defaultConfig(sections)
    const parsed = JSON.parse(raw) as SectionConfig
    const merged = defaultConfig(sections)
    for (const [id, vis] of Object.entries(parsed.visible)) {
      if (id in merged.visible) merged.visible[id] = vis
    }
    return merged
  } catch {
    return defaultConfig(sections)
  }
}

function defaultConfig(sections: SectionDef[]): SectionConfig {
  return {
    visible: Object.fromEntries(sections.map(s => [s.id, s.defaultVisible])),
    order: sections
      .filter(s => s.defaultVisible)
      .sort((a, b) => a.defaultOrder - b.defaultOrder)
      .map(s => s.id),
  }
}

function saveConfig(moduleId: string, config: SectionConfig) {
  try {
    localStorage.setItem(storageKey(moduleId), JSON.stringify(config))
  } catch {
    // ignore
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSectionConfig(moduleId: string, sections: SectionDef[]) {
  const [config, setConfig] = useState<SectionConfig>(() => defaultConfig(sections))
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setConfig(loadConfig(moduleId, sections))
    setLoaded(true)
  }, [moduleId])

  const updateConfig = useCallback(
    (newConfig: SectionConfig) => {
      setConfig(newConfig)
      saveConfig(moduleId, newConfig)
    },
    [moduleId],
  )

  const toggleVisible = useCallback(
    (sectionId: string) => {
      const newConfig: SectionConfig = {
        ...config,
        visible: { ...config.visible, [sectionId]: !config.visible[sectionId] },
      }
      updateConfig(newConfig)
    },
    [config, updateConfig],
  )

  const moveSection = useCallback(
    (sectionId: string, direction: 'up' | 'down') => {
      const newOrder = [...config.order]
      const idx = newOrder.indexOf(sectionId)
      if (idx === -1) return
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= newOrder.length) return
      ;[newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]]
      updateConfig({ ...config, order: newOrder })
    },
    [config, updateConfig],
  )

  const resetConfig = useCallback(() => {
    const def = defaultConfig(sections)
    updateConfig(def)
  }, [sections, updateConfig])

  const visibleOrder = useMemo(() => {
    return config.order.filter(id => config.visible[id] !== false)
  }, [config])

  return {
    config,
    loaded,
    visibleOrder,
    toggleVisible,
    moveSection,
    resetConfig,
    setConfig: updateConfig,
  }
}
