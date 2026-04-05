import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EMOJI_OPTIONS, COLOR_OPTIONS, HABIT_PRESETS } from './constants'
import { cn } from '@/lib/utils'

interface HabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  name: string
  setName: (v: string) => void
  emoji: string
  setEmoji: (v: string) => void
  color: string
  setColor: (v: string) => void
  frequency: string
  setFrequency: (v: string) => void
  targetCount: string
  setTargetCount: (v: string) => void
  submitLabel: string
  onSubmit: () => void
  onReset?: () => void
}

function EmojiPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {EMOJI_OPTIONS.map((emoji) => (
        <button
          key={emoji} type="button"
          onClick={() => onChange(emoji)}
          className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center transition-all ${
            value === emoji ? 'bg-primary/10 ring-2 ring-primary scale-110' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_OPTIONS.map((color) => (
        <button
          key={color} type="button"
          onClick={() => onChange(color)}
          className={`h-8 w-8 rounded-full transition-all ${
            value === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}

function FrequencyPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { key: 'daily', label: 'Ежедневно' },
    { key: 'weekdays', label: 'Будни' },
    { key: 'weekends', label: 'Выходные' },
    { key: 'weekly', label: 'Еженедельно' },
  ]
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(({ key, label }) => (
        <button
          key={key} type="button"
          onClick={() => onChange(key)}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium transition-all',
            value === key ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function DifficultySelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const levels = [
    { key: 'easy', label: '🟢 Лёгкая', color: 'text-emerald-600 dark:text-emerald-400' },
    { key: 'medium', label: '🟡 Средняя', color: 'text-amber-600 dark:text-amber-400' },
    { key: 'hard', label: '🔴 Сложная', color: 'text-red-600 dark:text-red-400' },
  ]
  return (
    <div className="flex gap-2">
      {levels.map(({ key, label, color }) => (
        <button
          key={key} type="button"
          onClick={() => onChange(key)}
          className={cn(
            'flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all border',
            value === key
              ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
              : 'border-transparent bg-muted hover:bg-muted/80'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function ReminderTimeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const times = [
    { key: '', label: 'Без напоминания' },
    { key: '07:00', label: '🌅 07:00' },
    { key: '08:00', label: '☀️ 08:00' },
    { key: '09:00', label: '☕ 09:00' },
    { key: '12:00', label: '🌞 12:00' },
    { key: '18:00', label: '🌆 18:00' },
    { key: '20:00', label: '🌙 20:00' },
    { key: '22:00', label: '💤 22:00' },
  ]
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Выберите время" />
      </SelectTrigger>
      <SelectContent>
        {times.map(({ key, label }) => (
          <SelectItem key={key} value={key}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function PresetChips({
  onSelect,
}: {
  onSelect: (name: string, emoji: string, color: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Быстрый выбор
      </label>
      <div className="flex flex-wrap gap-2">
        {HABIT_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onSelect(preset.name, preset.emoji, preset.color)}
            className="active-press flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-all hover:bg-muted/60 hover:border-muted-foreground/30"
          >
            <span>{preset.emoji}</span>
            <span>{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function HabitDialog({
  open, onOpenChange, title, name, setName, emoji, setEmoji,
  color, setColor, frequency, setFrequency, targetCount, setTargetCount,
  submitLabel, onSubmit,
}: HabitDialogProps) {
  const handlePresetSelect = (presetName: string, presetEmoji: string, presetColor: string) => {
    setName(presetName)
    setEmoji(presetEmoji)
    setColor(presetColor)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-1">
          <div className="space-y-4 pt-2 pb-2">
            {/* Presets */}
            <PresetChips onSelect={handlePresetSelect} />

            <div className="space-y-2">
              <label className="text-sm font-medium">Название</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Утренняя зарядка" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Иконка</label>
              <EmojiPicker value={emoji} onChange={setEmoji} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Цвет</label>
              <ColorPicker value={color} onChange={setColor} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Частота</label>
              <FrequencyPicker value={frequency} onChange={setFrequency} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Цель (раз в день)</label>
              <Input type="number" min="1" max="99" value={targetCount} onChange={(e) => setTargetCount(e.target.value)} className="w-24" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Сложность</label>
              <DifficultySelector value="easy" onChange={() => {}} />
              <p className="text-[10px] text-muted-foreground/60">Определяется автоматически по целевому количеству</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">⏰ Напоминание</label>
              <ReminderTimeSelector value="" onChange={() => {}} />
              <p className="text-[10px] text-muted-foreground/60">Уведомления будут доступны после подключения push-уведомлений</p>
            </div>
            <Button className="w-full" onClick={onSubmit} disabled={!name.trim()}>
              {submitLabel}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
