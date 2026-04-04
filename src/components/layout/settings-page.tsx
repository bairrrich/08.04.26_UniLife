'use client'

import { safeJson } from '@/lib/safe-fetch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import {
  User,
  Bell,
  Shield,
  Database,
  Trash2,
  Download,
  Upload,
  Settings,
  BookOpen,
  Wallet,
  Apple,
  Dumbbell,
  Library,
  Newspaper,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { useState, useRef } from 'react'

const EXPORT_MODULES = [
  { key: 'diary', label: 'Дневник', icon: BookOpen, emoji: '📝' },
  { key: 'finance', label: 'Финансы', icon: Wallet, emoji: '💰' },
  { key: 'nutrition', label: 'Питание', icon: Apple, emoji: '🍎' },
  { key: 'workout', label: 'Тренировки', icon: Dumbbell, emoji: '💪' },
  { key: 'collections', label: 'Коллекции', icon: Library, emoji: '📚' },
  { key: 'feed', label: 'Лента', icon: Newspaper, emoji: '📰' },
] as const

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('Алексей')
  const [email, setEmail] = useState('demo@unilife.app')
  const [bio, setBio] = useState('Люблю отслеживать всё в жизни 🚀')
  const [saving, setSaving] = useState(false)
  const [notifications, setNotifications] = useState({
    diaryReminder: true,
    waterReminder: true,
    budgetWarning: true,
    workoutReminder: false,
  })
  const [importing, setImporting] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    toast.success('Настройки сохранены!')
  }

  const handleSeed = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      if (res.ok) {
        toast.success('Данные успешно обновлены!')
      } else {
        toast.error('Ошибка при обновлении данных')
      }
    } catch {
      toast.error('Ошибка сети')
    }
  }

  const exportData = async (module: string) => {
    try {
      toast.loading('Подготовка экспорта...')
      const res = await fetch(`/api/settings/export?module=${module}`)
      const result = await safeJson(res)
      if (!result || !result.data) throw new Error('Export failed')
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `unilife-${module}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Данные экспортированы!')
    } catch {
      toast.error('Ошибка экспорта')
    } finally {
      toast.dismiss()
    }
  }

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: checked }))
    toast.info(checked ? 'Уведомление включено' : 'Уведомление отключено')
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      toast.error('Пожалуйста, выберите JSON-файл')
      return
    }

    setImporting(true)
    toast.dismiss()
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const res = await fetch('/api/settings/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const result = await safeJson(res)
        const counts = Object.entries(result?.imported || {})
          .filter(([, v]: [string, unknown]) => (v as number) > 0)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
        toast.success(`Импорт выполнен! ${counts || 'нет данных'}`)
      } else {
        const err = await safeJson(res)
        toast.error(err?.error || 'Ошибка при импорте')
      }
    } catch (err) {
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteAccount = () => {
    toast.info('Функция будет доступна после подключения аутентификации')
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header with decorative gradient blobs */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-4 right-20 h-24 w-24 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/15 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-bold tracking-tight">Настройки</h2>
          <p className="text-muted-foreground">Управление профилем и параметрами приложения</p>
        </div>
      </div>

      {/* Profile */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Профиль
          </CardTitle>
          <CardDescription>Ваша личная информация</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section — centered */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                <span className="text-3xl font-bold text-primary">
                  {name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              {/* Online indicator */}
              <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-background bg-emerald-500" />
            </div>
            <button
              type="button"
              onClick={() => toast.info('Изменение фото будет доступно после подключения аутентификации')}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Изменить фото
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base">{name}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  В сети
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
              {bio && (
                <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">{bio}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">О себе</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Расскажите о себе..."
              className="min-h-[80px] resize-none"
            />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Уведомления
          </CardTitle>
          <CardDescription>Настройка оповещений и напоминаний</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'diaryReminder', label: 'Ежедневное напоминание о дневнике', description: 'Напоминание написать дневник каждый день' },
            { key: 'waterReminder', label: 'Напоминание о воде', description: 'Не забудьте выпить стакан воды' },
            { key: 'budgetWarning', label: 'Бюджет: предупреждение о превышении', description: 'Уведомление при превышении лимита расходов' },
            { key: 'workoutReminder', label: 'Тренировка: напоминание', description: 'Напоминание о запланированной тренировке' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Theme */}
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

      {/* Data Management */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Управление данными
          </CardTitle>
          <CardDescription>Экспорт, импорт и управление вашими данными</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export All */}
          <Button
            className="w-full gap-2"
            onClick={() => exportData('all')}
          >
            <Download className="h-4 w-4" />
            Экспорт всех данных
          </Button>

          {/* Module-specific export */}
          <div>
            <p className="text-sm font-medium mb-3">Экспорт по модулям</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EXPORT_MODULES.map((mod) => (
                <Button
                  key={mod.key}
                  variant="outline"
                  className="gap-2 justify-start"
                  onClick={() => exportData(mod.key)}
                >
                  <span className="text-base">{mod.emoji}</span>
                  <span className="text-sm">{mod.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Import & Reset */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleImportClick}
              disabled={importing}
            >
              <Upload className="h-4 w-4" />
              {importing ? 'Импорт...' : 'Импорт данных'}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleSeed}>
              <Settings className="h-4 w-4" />
              Сбросить демо-данные
            </Button>
          </div>

          <Separator />

          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <h4 className="font-medium text-destructive mb-1">Опасная зона</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Удаление аккаунта приведёт к безвозвратной потере всех данных.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Удалить аккаунт
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие приведёт к безвозвратному удалению вашего аккаунта и всех связанных данных.
                    Эта операция не может быть отменена.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            О приложении
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Версия</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Стек</span>
              <span className="font-medium">Next.js 16 + Tailwind CSS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">UI Kit</span>
              <span className="font-medium">shadcn/ui</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
