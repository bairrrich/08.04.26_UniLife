'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings2, Target, Check, Flame, Beef, Milk, Wheat, Droplets } from 'lucide-react'
import { toast } from 'sonner'

export interface NutritionGoals {
  dailyKcal: number
  dailyProtein: number
  dailyFat: number
  dailyCarbs: number
  dailyWater: number
}

const DEFAULT_GOALS: NutritionGoals = {
  dailyKcal: 2200,
  dailyProtein: 150,
  dailyFat: 80,
  dailyCarbs: 250,
  dailyWater: 2000,
}

const PRESETS = [
  {
    label: 'Похудение',
    kcal: 1800,
    protein: 140,
    fat: 60,
    carbs: 180,
    water: 2500,
  },
  {
    label: 'Поддержание',
    kcal: 2200,
    protein: 150,
    fat: 80,
    carbs: 250,
    water: 2000,
  },
  {
    label: 'Набор массы',
    kcal: 2800,
    protein: 180,
    fat: 100,
    carbs: 350,
    water: 2000,
  },
]

interface NutritionGoalsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goals: NutritionGoals | null
  onGoalsSaved: (goals: NutritionGoals) => void
}

export function NutritionGoalsDialog({
  open,
  onOpenChange,
  goals,
  onGoalsSaved,
}: NutritionGoalsDialogProps) {
  const [form, setForm] = useState<NutritionGoals>(DEFAULT_GOALS)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && goals) {
      setForm(goals)
    }
  }, [open, goals])

  const updateField = (key: keyof NutritionGoals, value: string) => {
    const num = parseInt(value) || 0
    setForm((prev) => ({ ...prev, [key]: num }))
  }

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setForm({
      dailyKcal: preset.kcal,
      dailyProtein: preset.protein,
      dailyFat: preset.fat,
      dailyCarbs: preset.carbs,
      dailyWater: preset.water,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    toast.dismiss()
    try {
      const res = await fetch('/api/nutrition/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          toast.success('Цели обновлены')
          onGoalsSaved(data.data)
          onOpenChange(false)
        }
      } else {
        toast.error('Ошибка при сохранении целей')
      }
    } catch (err) {
      toast.error('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    } finally {
      setSaving(false)
    }
  }

  const fields: {
    key: keyof NutritionGoals
    label: string
    unit: string
    icon: React.ReactNode
    color: string
  }[] = [
    { key: 'dailyKcal', label: 'Калории', unit: 'ккал', icon: <Flame className="size-4" />, color: 'text-orange-500' },
    { key: 'dailyProtein', label: 'Белки', unit: 'г', icon: <Beef className="size-4" />, color: 'text-blue-500' },
    { key: 'dailyFat', label: 'Жиры', unit: 'г', icon: <Milk className="size-4" />, color: 'text-amber-500' },
    { key: 'dailyCarbs', label: 'Углеводы', unit: 'г', icon: <Wheat className="size-4" />, color: 'text-green-500' },
    { key: 'dailyWater', label: 'Вода', unit: 'мл', icon: <Droplets className="size-4" />, color: 'text-sky-500' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="size-5 text-orange-500" />
            Ежедневные цели
          </DialogTitle>
          <DialogDescription>
            Настрой свои целевые показатели по питанию и воде
          </DialogDescription>
        </DialogHeader>

        {/* Preset buttons */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Пресеты
          </Label>
          <div className="flex gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => applyPreset(preset)}
              >
                <Target className="mr-1.5 size-3" />
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Goal fields */}
        <div className="space-y-4 pt-2">
          {fields.map(({ key, label, unit, icon, color }) => (
            <div key={key} className="space-y-1.5">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <span className={color}>{icon}</span>
                {label}
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={form[key]}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="pr-12 tabular-nums"
                  min={0}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full gap-2 bg-orange-500 text-white hover:bg-orange-600"
        >
          {saving ? (
            <>
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Сохранение...
            </>
          ) : (
            <>
              <Check className="size-4" />
              Сохранить цели
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
