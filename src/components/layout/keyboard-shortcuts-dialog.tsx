'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'
import { useAppStore, type AppModule } from '@/store/use-app-store'

interface ShortcutItem {
  keys: string[]
  description: string
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['⌘', 'K'], description: 'Глобальный поиск' },
  { keys: ['D'], description: 'Перейти к Дашборду' },
  { keys: ['J'], description: 'Перейти к Дневнику' },
  { keys: ['F'], description: 'Перейти к Финансам' },
  { keys: ['N'], description: 'Перейти к Питанию' },
  { keys: ['W'], description: 'Перейти к Тренировкам' },
  { keys: ['H'], description: 'Перейти к Привычкам' },
  { keys: ['G'], description: 'Перейти к Целям' },
  { keys: ['C'], description: 'Перейти к Коллекциям' },
  { keys: ['A'], description: 'Перейти к Аналитике' },
  { keys: ['?'], description: 'Показать справку по клавишам' },
]

const NAVIGATION_SHORTCUTS = SHORTCUTS.filter((_, i) => i >= 1 && i <= 9)
const ACTION_SHORTCUTS = [SHORTCUTS[0], SHORTCUTS[10]]

const KEY_MODULE_MAP: Record<string, AppModule> = {
  d: 'dashboard',
  j: 'diary',
  f: 'finance',
  n: 'nutrition',
  w: 'workout',
  h: 'habits',
  g: 'goals',
  c: 'collections',
  a: 'analytics',
}

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false)
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only activate when not typing in an input/textarea/select
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const key = e.key.toLowerCase()

      // Toggle shortcuts dialog
      if (key === '?') {
        e.preventDefault()
        setOpen((prev) => !prev)
        return
      }

      // Navigation shortcuts
      const targetModule = KEY_MODULE_MAP[key]
      if (targetModule) {
        e.preventDefault()
        setActiveModule(targetModule)
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setActiveModule])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md animate-slide-up">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Клавиатурные сокращения
          </DialogTitle>
          <DialogDescription className="sr-only">Список доступных клавиатурных сокращений для навигации</DialogDescription>
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
