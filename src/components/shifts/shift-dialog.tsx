'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Shift } from './hooks'

// ─── Form shape ─────────────────────────────────────────────────────────

export interface ShiftForm {
  date: string
  startTime: string
  endTime: string
  breakMin: number
  location: string
  note: string
  payRate: number
  tips: number
}

const EMPTY_FORM: ShiftForm = {
  date: '',
  startTime: '',
  endTime: '',
  breakMin: 30,
  location: '',
  note: '',
  payRate: 0,
  tips: 0,
}

function getTodayStr(): string {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function buildInitialForm(shift: Shift | null | undefined): ShiftForm {
  if (shift) {
    return {
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakMin: shift.breakMin,
      location: shift.location,
      note: shift.note,
      payRate: shift.payRate,
      tips: shift.tips,
    }
  }
  return { ...EMPTY_FORM, date: getTodayStr() }
}

// ─── Inner form (remounts via key) ──────────────────────────────────────

interface ShiftFormInnerProps {
  initialForm: ShiftForm
  onSubmit: (data: ShiftForm) => Promise<boolean>
  onOpenChange: (open: boolean) => void
  title: string
  submitLabel: string
}

function ShiftFormInner({
  initialForm,
  onSubmit,
  onOpenChange,
  title,
  submitLabel,
}: ShiftFormInnerProps) {
  const [form, setForm] = useState<ShiftForm>(initialForm)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field: keyof ShiftForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!form.date || !form.startTime || !form.endTime) return
    setSubmitting(true)
    const ok = await onSubmit(form)
    setSubmitting(false)
    if (ok) onOpenChange(false)
  }

  const isValid = form.date && form.startTime && form.endTime

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>Заполните детали смены</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-2">
        {/* Date */}
        <div className="grid gap-1.5">
          <Label htmlFor="shift-date">Дата</Label>
          <Input
            id="shift-date"
            type="date"
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
        </div>

        {/* Start & End Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="shift-start">Начало</Label>
            <Input
              id="shift-start"
              type="time"
              value={form.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="shift-end">Конец</Label>
            <Input
              id="shift-end"
              type="time"
              value={form.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
            />
          </div>
        </div>

        {/* Break */}
        <div className="grid gap-1.5">
          <Label htmlFor="shift-break">Перерыв (мин)</Label>
          <Input
            id="shift-break"
            type="number"
            min={0}
            max={480}
            placeholder="30"
            value={form.breakMin || ''}
            onChange={(e) => handleChange('breakMin', Number(e.target.value))}
          />
        </div>

        {/* Location */}
        <div className="grid gap-1.5">
          <Label htmlFor="shift-location">Место</Label>
          <Input
            id="shift-location"
            type="text"
            placeholder="Офис"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
        </div>

        {/* Note */}
        <div className="grid gap-1.5">
          <Label htmlFor="shift-note">Заметка</Label>
          <Textarea
            id="shift-note"
            placeholder="Дополнительная информация..."
            value={form.note}
            onChange={(e) => handleChange('note', e.target.value)}
            rows={2}
          />
        </div>

        {/* Pay Rate & Tips */}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="shift-rate">Ставка (₽/ч)</Label>
            <Input
              id="shift-rate"
              type="number"
              min={0}
              placeholder="800"
              value={form.payRate || ''}
              onChange={(e) => handleChange('payRate', Number(e.target.value))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="shift-tips">Чаевые (₽)</Label>
            <Input
              id="shift-tips"
              type="number"
              min={0}
              placeholder="0"
              value={form.tips || ''}
              onChange={(e) => handleChange('tips', Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={submitting}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all active-press"
        >
          {submitting ? 'Сохранение...' : submitLabel}
        </Button>
      </DialogFooter>
    </>
  )
}

// ─── Props ──────────────────────────────────────────────────────────────

interface ShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shift?: Shift | null
  onSubmit: (data: ShiftForm) => Promise<boolean>
  title: string
  submitLabel: string
}

// ─── Component ──────────────────────────────────────────────────────────

export function ShiftDialog({
  open,
  onOpenChange,
  shift,
  onSubmit,
  title,
  submitLabel,
}: ShiftDialogProps) {
  // Compute a stable initial form; inner component remounts via key
  const initialForm = useMemo(() => buildInitialForm(shift), [shift])
  // Key forces remount each time dialog opens (shift?.id or 'add')
  const formKey = shift ? `edit-${shift.id}` : 'add'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        {open && (
          <ShiftFormInner
            key={formKey}
            initialForm={initialForm}
            onSubmit={onSubmit}
            onOpenChange={onOpenChange}
            title={title}
            submitLabel={submitLabel}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
