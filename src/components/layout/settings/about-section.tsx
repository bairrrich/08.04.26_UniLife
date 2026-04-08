'use client'

import { Shield, Heart, Calendar, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  BookOpen,
  Wallet,
  Apple,
  Dumbbell,
  Library,
  Newspaper,
  Repeat,
  Target,
  BarChart3,
  Settings,
} from 'lucide-react'

const APP_MODULES = [
  { name: 'Дашборд', icon: LayoutDashboard, emoji: '🏠' },
  { name: 'Дневник', icon: BookOpen, emoji: '📝' },
  { name: 'Финансы', icon: Wallet, emoji: '💰' },
  { name: 'Питание', icon: Apple, emoji: '🍎' },
  { name: 'Тренировки', icon: Dumbbell, emoji: '💪' },
  { name: 'Коллекции', icon: Library, emoji: '📚' },
  { name: 'Лента', icon: Newspaper, emoji: '📰' },
  { name: 'Привычки', icon: Repeat, emoji: '🔄' },
  { name: 'Цели', icon: Target, emoji: '🎯' },
  { name: 'Аналитика', icon: BarChart3, emoji: '📊' },
  { name: 'Настройки', icon: Settings, emoji: '⚙️' },
]

export function AboutSection() {
  const buildDate = '2025'
  const appVersion = 'v1.0'

  return (
    <Card className="rounded-xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          О приложении
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* App identity with animated logo */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-primary to-teal-500 flex items-center justify-center text-3xl shadow-lg shadow-primary/20 animate-float">
              🎓
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">UniLife</h3>
              <Badge variant="secondary" className="text-[10px] font-semibold tabular-nums bg-primary/10 text-primary border-primary/20">
                {appVersion}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Персональный трекер жизни</p>
          </div>
        </div>

        <Separator />

        {/* Info grid */}
        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <Tag className="h-3.5 w-3.5" />
              Версия
            </span>
            <span className="font-medium tabular-nums">{appVersion}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Дата сборки
            </span>
            <span className="font-medium">{buildDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Стек</span>
            <span className="font-medium">Next.js 16 + Tailwind CSS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">UI Kit</span>
            <span className="font-medium">shadcn/ui</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">База данных</span>
            <span className="font-medium">SQLite + Prisma ORM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Модулей</span>
            <span className="font-medium">{APP_MODULES.length}</span>
          </div>
        </div>

        <Separator />

        {/* Module grid */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Все модули
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {APP_MODULES.map((mod) => (
              <div
                key={mod.name}
                className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2"
              >
                <mod.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">{mod.name}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Credit */}
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            Разработано с <Heart className="h-4 w-4 text-red-500 fill-red-500" /> командой UniLife
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
