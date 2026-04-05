'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import type { Transaction } from './types'

interface ExportButtonProps {
  transactions: Transaction[]
  monthLabel: string
}

function formatDateRu(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'INCOME': return 'Доход'
    case 'EXPENSE': return 'Расход'
    case 'TRANSFER': return 'Перевод'
    default: return type
  }
}

function escapeCsv(value: string | null | undefined): string {
  if (!value) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function ExportButton({ transactions, monthLabel }: ExportButtonProps) {
  const handleExport = useCallback(() => {
    if (transactions.length === 0) {
      toast.info('Нет транзакций для экспорта')
      return
    }

    const header = 'Дата,Тип,Категория,Описание,Сумма,Заметка'
    const rows = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((tx) => {
        const date = formatDateRu(tx.date)
        const type = getTypeLabel(tx.type)
        const category = tx.category?.name || ''
        const description = tx.description || ''
        const amount = tx.amount.toString()
        const note = tx.note || ''
        return [date, type, category, description, amount, note].map(escapeCsv).join(',')
      })

    const csvContent = '\uFEFF' + [header, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `finances-${monthLabel.replace(/\s+/g, '-')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Данные экспортированы')
  }, [transactions, monthLabel])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-1.5"
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Экспорт CSV</span>
    </Button>
  )
}
