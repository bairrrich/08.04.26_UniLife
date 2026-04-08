'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MOOD_EMOJI, MOOD_LABELS } from '@/lib/format'
import { DiaryEntry } from './types'
import { parseEntryDate } from './helpers'

interface ExportEntryProps {
  entry: DiaryEntry
  className?: string
}

export function ExportEntry({ entry, className }: ExportEntryProps) {
  const [copied, setCopied] = useState(false)

  const formatEntryText = useCallback(() => {
    const dateStr = format(parseEntryDate(entry.date), 'd MMMM yyyy, HH:mm', { locale: ru })
    const title = entry.title || 'Без заголовка'
    const mood = entry.mood ? ` ${MOOD_EMOJI[entry.mood]} ${MOOD_LABELS[entry.mood]}` : ''
    const tags = entry.tags.length > 0 ? `\n\nТеги: ${entry.tags.join(', ')}` : ''

    return `${title}${mood}\n${dateStr}\n${'—'.repeat(20)}\n\n${entry.content}${tags}`
  }, [entry])

  const handleCopy = useCallback(async () => {
    const text = formatEntryText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Запись скопирована в буфер обмена')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      toast.success('Запись скопирована в буфер обмена')
      setTimeout(() => setCopied(false), 2000)
    }
  }, [formatEntryText])

  const handleShare = useCallback(async () => {
    const text = formatEntryText()
    const title = entry.title || 'Запись из дневника'

    // Check if Web Share API is available
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
        })
      } catch (err) {
        // User cancelled or share failed — fall back to clipboard
        if ((err as Error).name !== 'AbortError') {
          handleCopy()
        }
      }
    } else {
      handleCopy()
    }
  }, [entry, formatEntryText, handleCopy])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation()
        handleShare()
      }}
      className={cn(
        'h-7 w-7 shrink-0 text-muted-foreground/60 hover:text-muted-foreground transition-all',
        copied && 'text-emerald-500',
        className
      )}
      title="Поделиться"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Share2 className="h-3.5 w-3.5" />
      )}
    </Button>
  )
}
