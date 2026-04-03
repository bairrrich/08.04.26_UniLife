'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  PiggyBank,
  Filter,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

// ============ Types ============

interface Category {
  id: string
  name: string
  type: string
  icon: string
  color: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  currency: string
  categoryId: string
  subCategoryId?: string | null
  date: string
  description?: string | null
  note?: string | null
  category?: Category
  subCategory?: { id: string; name: string; icon: string } | null
}

interface StatsResponse {
  totalIncome: number
  totalExpense: number
  balance: number
  savingsRate: number
  byCategory: CategoryStat[]
}

interface CategoryStat {
  categoryId: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  total: number
}

interface ChartDataPoint {
  day: string
  expense: number
  income: number
}

// ============ Utilities ============

const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDateRu = (dateStr: string): string => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const formatDayShort = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.getDate().toString()
}

const getCurrentMonth = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

// ============ Component ============

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [month, setMonth] = useState(getCurrentMonth())
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // New transaction form
  const [newType, setNewType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [newAmount, setNewAmount] = useState('')
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ============ Data Fetching ============

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [txRes, catRes, statsRes] = await Promise.all([
        fetch(`/api/finance?month=${month}`),
        fetch('/api/finance/categories'),
        fetch(`/api/finance/stats?month=${month}`),
      ])

      if (txRes.ok) {
        const txData = await txRes.json()
        setTransactions(txData.data || [])
      }
      if (catRes.ok) {
        const catData = await catRes.json()
        setCategories(catData.data || [])
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data || null)
      }
    } catch (err) {
      console.error('Failed to fetch finance data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [month])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ============ Computed ============

  const filteredTransactions = useMemo(() => {
    let filtered = transactions
    if (activeTab === 'income') {
      filtered = filtered.filter((t) => t.type === 'INCOME')
    } else if (activeTab === 'expense') {
      filtered = filtered.filter((t) => t.type === 'EXPENSE')
    }
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [transactions, activeTab])

  const groupedTransactions = useMemo(() => {
    const groups: { date: string; label: string; items: Transaction[] }[] = []
    const map = new Map<string, Transaction[]>()

    filteredTransactions.forEach((tx) => {
      const dateKey = tx.date.split('T')[0]
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(tx)
    })

    map.forEach((items, dateKey) => {
      groups.push({
        date: dateKey,
        label: formatDateRu(dateKey),
        items: items.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      })
    })

    return groups
  }, [filteredTransactions])

  const chartData = useMemo((): ChartDataPoint[] => {
    const data: ChartDataPoint[] = []
    const daysInMonth = new Date(
      parseInt(month.split('-')[0]),
      parseInt(month.split('-')[1]),
      0
    ).getDate()

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${month}-${d.toString().padStart(2, '0')}`
      const dayTx = transactions.filter((t) => t.date.startsWith(dateStr))
      data.push({
        day: d.toString(),
        expense: dayTx
          .filter((t) => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + t.amount, 0),
        income: dayTx
          .filter((t) => t.type === 'INCOME')
          .reduce((sum, t) => sum + t.amount, 0),
      })
    }
    return data
  }, [transactions, month])

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === newType)
  }, [categories, newType])

  // ============ Actions ============

  const resetForm = () => {
    setNewType('EXPENSE')
    setNewAmount('')
    setNewCategoryId('')
    setNewDescription('')
    setNewDate(new Date().toISOString().split('T')[0])
    setNewNote('')
  }

  const handleSubmit = async () => {
    if (!newAmount || !newCategoryId || !newDate) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newType,
          amount: parseFloat(newAmount),
          categoryId: newCategoryId,
          description: newDescription || undefined,
          date: newDate,
          note: newNote || undefined,
        }),
      })

      if (res.ok) {
        setShowNewDialog(false)
        resetForm()
        fetchData()
      }
    } catch (err) {
      console.error('Failed to create transaction:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const navigateMonth = (direction: number) => {
    const [year, mon] = month.split('-').map(Number)
    const d = new Date(year, mon - 1 + direction, 1)
    const y = d.getFullYear()
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    setMonth(`${y}-${m}`)
  }

  const monthLabel = useMemo(() => {
    const [year, mon] = month.split('-').map(Number)
    return new Intl.DateTimeFormat('ru-RU', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, mon - 1, 1))
  }, [month])

  const getCategoryForTx = (tx: Transaction): Category => {
    return (
      tx.category ||
      categories.find((c) => c.id === tx.categoryId) || {
        id: '',
        name: 'Другое',
        type: 'EXPENSE',
        icon: 'circle',
        color: '#6b7280',
      }
    )
  }

  // ============ Chart Config ============

  const chartConfig = {
    expense: { label: 'Расходы', color: '#ef4444' },
    income: { label: 'Доходы', color: '#10b981' },
  }

  // ============ Render ============

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Финансы</h1>
            <p className="text-sm text-muted-foreground">Учёт доходов и расходов</p>
          </div>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Новая транзакция</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Type Toggle */}
              <div className="space-y-2">
                <Label>Тип</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={newType === 'EXPENSE' ? 'default' : 'outline'}
                    className={
                      newType === 'EXPENSE'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : ''
                    }
                    onClick={() => {
                      setNewType('EXPENSE')
                      setNewCategoryId('')
                    }}
                  >
                    <ArrowDownRight className="mr-1 h-4 w-4" />
                    Расход
                  </Button>
                  <Button
                    type="button"
                    variant={newType === 'INCOME' ? 'default' : 'outline'}
                    className={
                      newType === 'INCOME'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : ''
                    }
                    onClick={() => {
                      setNewType('INCOME')
                      setNewCategoryId('')
                    }}
                  >
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    Доход
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label>Сумма</Label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Категория</Label>
                <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Описание</Label>
                <Input
                  placeholder="Например: обед в кафе"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Дата</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label>Заметка</Label>
                <Textarea
                  placeholder="Необязательная заметка..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Submit */}
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={
                  isSubmitting || !newAmount || !newCategoryId || !newDate
                }
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth(-1)}
          className="h-8 w-8 p-0"
        >
          &larr;
        </Button>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium capitalize">{monthLabel}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth(1)}
          className="h-8 w-8 p-0"
        >
          &rarr;
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Income */}
        <Card className="border-l-4 border-l-emerald-500 py-4">
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium">Доходы</span>
            </div>
            <p className="mt-1 text-lg font-bold text-emerald-600">
              {formatMoney(stats?.totalIncome ?? 0)}
            </p>
          </CardContent>
        </Card>

        {/* Expense */}
        <Card className="border-l-4 border-l-red-500 py-4">
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium">Расходы</span>
            </div>
            <p className="mt-1 text-lg font-bold text-red-500">
              {formatMoney(stats?.totalExpense ?? 0)}
            </p>
          </CardContent>
        </Card>

        {/* Balance */}
        <Card className="border-l-4 border-l-blue-500 py-4">
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium">Баланс</span>
            </div>
            <p
              className={`mt-1 text-lg font-bold ${
                (stats?.balance ?? 0) >= 0 ? 'text-blue-600' : 'text-red-500'
              }`}
            >
              {formatMoney(stats?.balance ?? 0)}
            </p>
          </CardContent>
        </Card>

        {/* Savings Rate */}
        <Card className="border-l-4 border-l-amber-500 py-4">
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PiggyBank className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium">Сбережения</span>
            </div>
            <p className="mt-1 text-lg font-bold text-amber-600">
              {stats?.savingsRate != null
                ? `${Math.round(stats.savingsRate)}%`
                : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Category Breakdown */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Monthly Expense Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Расходы по дням
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  interval={Math.floor(chartData.length / 10)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="expense"
                  fill="var(--color-expense)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
                <Bar
                  dataKey="income"
                  fill="var(--color-income)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">По категориям</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[220px]">
              <div className="flex flex-col gap-3">
                {stats?.byCategory && stats.byCategory.length > 0 ? (
                  stats.byCategory.map((cat) => {
                    const totalExpense = stats.totalExpense || 1
                    const pct = Math.round((cat.total / totalExpense) * 100)
                    return (
                      <div key={cat.categoryId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-3 w-3 rounded-full"
                              style={{ backgroundColor: cat.categoryColor }}
                            />
                            <span className="font-medium truncate max-w-[120px]">
                              {cat.categoryName}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold">{formatMoney(cat.total)}</span>
                            <span className="ml-1.5 text-xs text-muted-foreground">
                              {pct}%
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: cat.categoryColor,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    Нет данных
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Транзакции
            </CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs px-2.5 h-7">
                  Все
                </TabsTrigger>
                <TabsTrigger value="income" className="text-xs px-2.5 h-7">
                  Доходы
                </TabsTrigger>
                <TabsTrigger value="expense" className="text-xs px-2.5 h-7">
                  Расходы
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Загрузка...
            </div>
          ) : groupedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <Wallet className="h-8 w-8" />
              <p className="text-sm">Нет транзакций за этот период</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewDialog(true)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Добавить транзакцию
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-1">
                {groupedTransactions.map((group) => (
                  <div key={group.date}>
                    {/* Date Header */}
                    <div className="sticky top-0 z-10 bg-background py-1.5">
                      <span className="text-xs font-medium text-muted-foreground capitalize">
                        {group.label}
                      </span>
                      <Separator className="mt-1" />
                    </div>

                    {/* Transaction Items */}
                    {group.items.map((tx) => {
                      const cat = getCategoryForTx(tx)
                      const isIncome = tx.type === 'INCOME'
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center gap-3 py-3 border-b last:border-0"
                        >
                          {/* Category Color Dot */}
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: `${cat.color}18`,
                            }}
                          >
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                          </div>

                          {/* Description & Category */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {tx.description || cat.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {tx.subCategory?.name || cat.name}
                            </p>
                          </div>

                          {/* Amount */}
                          <div className="shrink-0 text-right">
                            <p
                              className={`text-sm font-semibold ${
                                isIncome ? 'text-emerald-600' : 'text-red-500'
                              }`}
                            >
                              {isIncome ? '+' : '-'}
                              {formatMoney(tx.amount)}
                            </p>
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-4"
                              style={{
                                backgroundColor: `${cat.color}15`,
                                color: cat.color,
                                borderColor: `${cat.color}30`,
                              }}
                            >
                              {cat.name}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
