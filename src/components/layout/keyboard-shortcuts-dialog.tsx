'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'

interface ShortcutItem {
  keys: string[]
  description: string
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['⌘', 'K'], description: 'Глобальный поиск' },
  { keys: ['D'], description: 'Перейти к Дашборду' },
  { keys: ['F'], description: 'Перейти к Финансам' },
  { keys: ['N'], description: 'Перейти к Питанию' },
  { keys: ['W'], description: 'Перейти к Тренировкам' },
  { keys: ['H'], description: 'Перейти к Привычкам' },
  { keys: ['G'], description: 'Перейти к Целям' },
  { keys: ['?'], description: 'Показать справку по клавишам' },
]

const NAVIGATION_SHORTCUTS = SHORTCUTS.filter((_, i) => i >= 1 && i <= 6)
const ACTION_SHORTCUTS = [SHORTCUTS[0], SHORTCUTS[7]]

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only activate when not typing in an input/textarea/select
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === '?') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md animate-slide-up">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Клавиатурные сокращения
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Navigation shortcuts */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Навигация
            </h3>
            <div className="space-y-2">
              {NAVIGATION_SHORTCUTS.map((shortcut) => (
                <div
                  key={shortcut.description}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd
                        key={`${key}-${i}`}
                        className="bg-muted px-2 py-1 rounded text-xs font-mono border"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action shortcuts */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Действия
            </h3>
            <div className="space-y-2">
              {ACTION_SHORTCUTS.map((shortcut) => (
                <div
                  key={shortcut.description}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd
                        key={`${key}-${i}`}
                        className="bg-muted px-2 py-1 rounded text-xs font-mono border"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          Нажмите Esc или ? чтобы закрыть
        </p>
      </DialogContent>
    </Dialog>
  )
}
