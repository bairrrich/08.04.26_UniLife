'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { User, Bell, Shield, Database, Trash2, Download, Upload, Settings } from 'lucide-react'
import { useState } from 'react'

export function SettingsPage() {
  const [name, setName] = useState('Алексей')
  const [email, setEmail] = useState('demo@unilife.app')
  const [bio, setBio] = useState('Люблю отслеживать всё в жизни 🚀')
  const [saving, setSaving] = useState(false)

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Настройки</h2>
        <p className="text-muted-foreground">Управление профилем и параметрами приложения</p>
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
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/unilife-logo.png" alt="Avatar" />
              <AvatarFallback className="text-xl">А</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{name}</h3>
              <p className="text-sm text-muted-foreground">{email}</p>
              <Button variant="outline" size="sm" className="mt-2">
                Изменить фото
              </Button>
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
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Расскажите о себе..."
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
            { label: 'Ежедневное напоминание о дневнике', enabled: true },
            { label: 'Напоминание о воде', enabled: true },
            { label: 'Бюджет: предупреждение о превышении', enabled: true },
            { label: 'Тренировка: напоминание', enabled: false },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2">
              <span className="text-sm">{item.label}</span>
              <Badge variant={item.enabled ? 'default' : 'secondary'}>
                {item.enabled ? 'Вкл' : 'Выкл'}
              </Badge>
            </div>
          ))}
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
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Экспорт данных
            </Button>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Импорт данных
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
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Удалить аккаунт
            </Button>
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
