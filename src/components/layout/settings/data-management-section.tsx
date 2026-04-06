'use client'

import { useState, useRef } from 'react'
import { safeJson } from '@/lib/safe-fetch'
import { toast } from 'sonner'
import { Database, Trash2, Download, Upload, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { EXPORT_MODULES } from './types'

export function DataManagementSection() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

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
      const result = await safeJson<{ success?: boolean; data?: unknown }>(res)
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
        const result = await safeJson<{ success?: boolean; imported?: Record<string, number> }>(res)
        const counts = Object.entries(result?.imported || {})
          .filter(([, v]: [string, unknown]) => (v as number) > 0)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
        toast.success(`Импорт выполнен! ${counts || 'нет данных'}`)
      } else {
        const err = await safeJson<{ success?: boolean; error?: string }>(res)
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
  )
}
