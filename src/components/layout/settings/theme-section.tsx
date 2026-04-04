'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ThemeSection() {
  const { theme, setTheme } = useTheme()

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Тема
        </CardTitle>
        <CardDescription>Выберите оформление приложения</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            className="gap-2"
            onClick={() => setTheme('light')}
          >
            <Sun className="h-4 w-4" />
            Светлая
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            className="gap-2"
            onClick={() => setTheme('dark')}
          >
            <Moon className="h-4 w-4" />
            Тёмная
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            className="gap-2"
            onClick={() => setTheme('system')}
          >
            <Monitor className="h-4 w-4" />
            Системная
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
