import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EMOJI_OPTIONS, COLOR_OPTIONS } from './constants'

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
  return (
    <div className="flex gap-2">
      {[
        { key: 'daily', label: 'Ежедневно' },
        { key: 'weekly', label: 'Еженедельно' },
      ].map(({ key, label }) => (
        <button
          key={key} type="button"
          onClick={() => onChange(key)}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            value === key ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function HabitDialog({
  open, onOpenChange, title, name, setName, emoji, setEmoji,
  color, setColor, frequency, setFrequency, targetCount, setTargetCount,
  submitLabel, onSubmit,
}: HabitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
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
          <Button className="w-full" onClick={onSubmit} disabled={!name.trim()}>
            {submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
