'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { User, Loader2, Check, Camera } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useUserPrefs } from '@/lib/use-user-prefs'
import { cn } from '@/lib/utils'

const MAX_BIO_LENGTH = 200

// Gradient avatar options
const AVATAR_GRADIENTS = [
  'from-emerald-400 to-teal-500',
  'from-violet-400 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-blue-400 to-indigo-500',
  'from-cyan-400 to-sky-500',
  'from-fuchsia-400 to-pink-500',
  'from-lime-400 to-green-500',
  'from-red-400 to-rose-500',
  'from-teal-400 to-emerald-500',
  'from-indigo-400 to-blue-500',
  'from-orange-400 to-amber-500',
]

export function ProfileSection() {
  const { userName: prefsUserName } = useUserPrefs()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('demo@unilife.app')
  const [bio, setBio] = useState('Люблю отслеживать всё в жизни 🚀')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [selectedGradient, setSelectedGradient] = useState(0)

  useEffect(() => {
    if (prefsUserName && prefsUserName !== 'Пользователь') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from external prefs on mount
      setName(prefsUserName)
    }
    // Load saved avatar from localStorage
    try {
      const savedGradient = localStorage.getItem('unilife-avatar-gradient')
      if (savedGradient) setSelectedGradient(Number(savedGradient))
      const savedBio = localStorage.getItem('unilife-user-bio')
      if (savedBio) setBio(savedBio)
    } catch { /* ignore */ }
  }, [prefsUserName])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    setSaved(true)
    // Persist to localStorage
    try {
      if (name.trim()) localStorage.setItem('unilife-user-name', name.trim())
      localStorage.setItem('unilife-avatar-gradient', String(selectedGradient))
      if (bio.trim()) localStorage.setItem('unilife-user-bio', bio.trim())
    } catch { /* ignore */ }
    toast.success('Настройки сохранены!')
    setTimeout(() => setSaved(false), 2500)
  }

  // Profile completion calculation
  const completionPercent = useMemo(() => {
    let filled = 0
    let total = 4
    if (name.trim()) filled++
    if (email.trim() && email.includes('@')) filled++
    if (bio.trim()) filled++
    if (selectedGradient >= 0) filled++
    return Math.round((filled / total) * 100)
  }, [name, email, bio, selectedGradient])

  const completionColor = completionPercent >= 75
    ? '[&>div]:bg-emerald-500'
    : completionPercent >= 50
      ? '[&>div]:bg-amber-500'
      : '[&>div]:bg-red-500'

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

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
        {/* Profile completion bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Профиль заполнен</span>
            <span className="text-xs font-bold tabular-nums">
              {completionPercent}%
            </span>
          </div>
          <Progress value={completionPercent} className={cn('h-2', completionColor)} />
        </div>

        {/* Avatar Section — centered with picker */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className={cn(
              'h-20 w-20 rounded-full flex items-center justify-center ring-2 ring-primary/30 ring-offset-2 ring-offset-background bg-gradient-to-br transition-all duration-300',
              AVATAR_GRADIENTS[selectedGradient],
            )}>
              <span className="text-3xl font-bold text-white drop-shadow-sm">
                {initials}
              </span>
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-background bg-emerald-500" />
          </div>
          <button
            type="button"
            onClick={() => toast.info('Изменение фото будет доступно после подключения аутентификации')}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
          >
            <Camera className="h-3 w-3" />
            Изменить фото
          </button>

          {/* Avatar gradient picker */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {AVATAR_GRADIENTS.map((gradient, i) => (
              <button
                key={gradient}
                type="button"
                onClick={() => setSelectedGradient(i)}
                className={cn(
                  'h-8 w-8 rounded-full bg-gradient-to-br flex items-center justify-center transition-all duration-200',
                  gradient,
                  selectedGradient === i
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                    : 'opacity-60 hover:opacity-90 hover:scale-105',
                )}
                title={`Аватар ${i + 1}`}
              >
                <span className="text-[10px] font-bold text-white/90">{initials}</span>
              </button>
            ))}
          </div>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="bio">О себе</Label>
            <span className={cn(
              'text-[11px] tabular-nums transition-colors',
              bio.length > MAX_BIO_LENGTH * 0.9 ? 'text-amber-500 font-medium' : 'text-muted-foreground',
            )}>
              {bio.length}/{MAX_BIO_LENGTH}
            </span>
          </div>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => {
              if (e.target.value.length <= MAX_BIO_LENGTH) setBio(e.target.value)
            }}
            placeholder="Расскажите о себе..."
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Animated save button */}
        <Button onClick={handleSave} disabled={saving} className="relative min-w-[180px]">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4 mr-2 animate-[checkPop_0.3s_ease-out]" />
              Сохранено!
            </>
          ) : (
            'Сохранить изменения'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
