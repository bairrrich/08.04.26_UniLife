'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wind, ChevronDown, ChevronUp, Bookmark, Trash2, Plus } from 'lucide-react'
import type { ExerciseData } from './types'
import { WORKOUT_PRESETS } from './constants'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface WorkoutTemplate {
  id: string
  name: string
  duration: number
  exercises: ExerciseData[]
  createdAt: string
}

const TEMPLATES_KEY = 'unilife-workout-templates'

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadTemplates(): WorkoutTemplate[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTemplates(templates: WorkoutTemplate[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
  } catch {
    // ignore
  }
}

function generateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

// ─── Component ──────────────────────────────────────────────────────────────

interface WorkoutTemplatesProps {
  onLoadTemplate: (name: string, duration: number, exercises: ExerciseData[]) => void
}

export function WorkoutTemplates({ onLoadTemplate }: WorkoutTemplatesProps) {
  // Initialize templates from localStorage on client
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => {
    if (typeof window === 'undefined') return []
    return loadTemplates()
  })
  const [expanded, setExpanded] = useState(false)

  const isClient = typeof window !== 'undefined'

  const saveCurrentAsTemplate = useCallback(() => {
    // Store the preset as a template
    const preset = WORKOUT_PRESETS[1] // Default: Силовая тренировка
    const newTemplate: WorkoutTemplate = {
      id: generateId(),
      name: preset.name,
      duration: preset.duration,
      exercises: preset.exercises,
      createdAt: new Date().toISOString(),
    }
    const updated = [newTemplate, ...templates]
    setTemplates(updated)
    saveTemplates(updated)
  }, [templates])

  const deleteTemplate = useCallback((id: string) => {
    const updated = templates.filter((t) => t.id !== id)
    setTemplates(updated)
    saveTemplates(updated)
  }, [templates])

  if (!isClient) return null

  const builtInPresets = WORKOUT_PRESETS.map((p) => ({
    id: `builtin_${p.label}`,
    name: p.label,
    duration: p.duration,
    exercises: p.exercises,
    createdAt: '',
  }))

  const allItems = [...templates, ...builtInPresets]

  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
              <Bookmark className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Шаблоны тренировок</p>
              <p className="text-[10px] text-muted-foreground">
                {templates.length > 0 ? `${templates.length} своих, ${builtInPresets.length} стандартных` : `${builtInPresets.length} стандартных шаблонов`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>{expanded ? 'Свернуть' : 'Показать'}</span>
          </button>
        </div>

        {expanded && (
          <div className="space-y-2 mt-2">
            {allItems.map((template) => {
              const isBuiltIn = template.id.startsWith('builtin_')
              return (
                <div
                  key={template.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 p-2.5 hover:bg-muted/60 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{template.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {template.exercises.length} упр. · {template.duration} мин
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => onLoadTemplate(template.name, template.duration, template.exercises)}
                    >
                      <Plus className="h-3 w-3" />
                      Исп.
                    </Button>
                    {!isBuiltIn && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
