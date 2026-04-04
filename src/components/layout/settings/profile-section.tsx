'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

export function ProfileSection() {
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

  return (
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
  )
}
