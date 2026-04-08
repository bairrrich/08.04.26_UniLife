'use client'

import { useSyncExternalStore } from 'react'
import { toast } from 'sonner'
import { Palette, Minimize2, Maximize2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

function getCompactModeSnapshot(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('unilife-compact-mode') === 'true'
}

function subscribeToCompactMode(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export function AppearanceSection() {
  const compactMode = useSyncExternalStore(
    subscribeToCompactMode,
    getCompactModeSnapshot,
    () => false
  )

  const handleCompactToggle = (checked: boolean) => {
    try {
      localStorage.setItem('unilife-compact-mode', String(checked))
      if (checked) {
        document.documentElement.setAttribute('data-compact', 'true')
      } else {
        document.documentElement.removeAttribute('data-compact')
      }
      // Dispatch storage event for same-tab reactivity
      window.dispatchEvent(new StorageEvent('storage', { key: 'unilife-compact-mode' }))
      toast.info(checked ? 'Компактный режим включён' : 'Стандартный режим включён')
    } catch { /* ignore */ }
  }

  return (
    <Card className="rounded-xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-violet-400 to-purple-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Внешний вид
        </CardTitle>
        <CardDescription>Настройте визуальное оформление приложения</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Compact mode toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <p className="text-sm font-medium flex items-center gap-2">
              <Minimize2 className="h-4 w-4 text-muted-foreground" />
              Компактный режим
            </p>
            <p className="text-xs text-muted-foreground">
              Уменьшает отступы и размеры карточек
            </p>
          </div>
          <Switch
            checked={compactMode}
            onCheckedChange={handleCompactToggle}
          />
        </div>

        {/* Preview of compact vs normal mode */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Предпросмотр
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Normal mode preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Maximize2 className="h-3 w-3" />
                Стандартный
              </div>
              <div className="rounded-xl border bg-card p-4 space-y-2">
                <div className="h-3.5 w-3/4 rounded bg-muted" />
                <div className="h-2.5 w-full rounded bg-muted/60" />
                <div className="h-2.5 w-5/6 rounded bg-muted/60" />
                <div className="h-2.5 w-2/3 rounded bg-muted/60" />
                <div className="flex gap-1.5 mt-2">
                  <div className="h-5 w-12 rounded-full bg-primary/10" />
                  <div className="h-5 w-12 rounded-full bg-primary/10" />
                </div>
              </div>
            </div>

            {/* Compact mode preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Minimize2 className="h-3 w-3" />
                Компактный
              </div>
              <div className="rounded-xl border bg-card p-2.5 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-muted" />
                <div className="h-2 w-full rounded bg-muted/60" />
                <div className="h-2 w-5/6 rounded bg-muted/60" />
                <div className="h-2 w-2/3 rounded bg-muted/60" />
                <div className="flex gap-1 mt-1">
                  <div className="h-4 w-10 rounded-full bg-primary/10" />
                  <div className="h-4 w-10 rounded-full bg-primary/10" />
                </div>
              </div>
            </div>
          </div>

          {/* Active mode indicator */}
          <div
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg p-2 text-xs font-medium transition-all',
              compactMode
                ? 'bg-primary/10 text-primary'
                : 'bg-muted/50 text-muted-foreground'
            )}
          >
            {compactMode ? (
              <>
                <Minimize2 className="h-3 w-3" />
                Компактный режим активен
              </>
            ) : (
              <>
                <Maximize2 className="h-3 w-3" />
                Стандартный режим активен
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
