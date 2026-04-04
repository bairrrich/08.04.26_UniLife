'use client'

import { Clock } from 'lucide-react'
import { countWords, readingTimeMinutes } from './helpers'

interface WordCountProps {
  content: string
  className?: string
}

export function WordCount({ content, className }: WordCountProps) {
  const words = countWords(content)
  const readTime = readingTimeMinutes(words)

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-muted-foreground/50 tabular-nums ${className || ''}`}
    >
      <Clock className="h-3 w-3" />
      {words} слов · {readTime} чтения
    </span>
  )
}
