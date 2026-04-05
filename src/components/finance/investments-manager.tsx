'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  Landmark,
  ChevronDown,
  ChevronUp,
  Target,
  BarChart3,
  PiggyBank,
  DollarSign,
  CircleDot,
  Gem,
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  INVESTMENT_TYPE_LABELS,
  INVESTMENT_TX_TYPE_LABELS,
  INVESTMENT_TX_TYPE_COLORS,
} from './constants'
import { useFinance } from './hooks'
import type { Investment } from './types'

// ─── Investment Type Icons ──────────────────────────────────────────────────

const INV_TYPE_ICONS: Record<string, React.ReactNode> = {
  STOCK: <TrendingUp className="h-5 w-5" />,
  BOND: <Landmark className="h-5 w-5" />,
  FUND: <BarChart3 className="h-5 w-5" />,
  CRYPTO: <CircleDot className="h-5 w-5" />,
  DEPOSIT: <PiggyBank className="h-5 w-5" />,
  METAL: <Gem className="h-5 w-5" />,
  OTHER: <DollarSign className="h-5 w-5" />,
}

const TX_TYPE_ICONS: Record<string, React.ReactNode> = {
  BUY: <ArrowDownRight className="h-3.5 w-3.5" />,
  SELL: <ArrowUpRight className="h-3.5 w-3.5" />,
  DEPOSIT: <Plus className="h-3.5 w-3.5" />,
  WITHDRAWAL: <Wallet className="h-3.5 w-3.5" />,
  DIVIDEND: <Gift className="h-3.5 w-3.5" />,
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateRu(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

// ─── Create Investment Dialog ───────────────────────────────────────────────

function CreateInvestmentDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; type: string; targetAmount?: number; description?: string }) => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState('STOCK')
  const [targetAmount, setTargetAmount] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (!name) return
    onSubmit({
      name,
      type,
      targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
      description: description || undefined,
    })
    setName('')
    setType('STOCK')
    setTargetAmount('')
    setDescription('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая инвестиция</DialogTitle>
          <DialogDescription>Добавьте актив для отслеживания</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input placeholder="Например: Сбер Индекс" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label>Тип</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INVESTMENT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Целевая сумма (₽)</Label>
            <Input type="number" placeholder="Необязательно" min="0" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea placeholder="Необязательно..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={!name}>
            Создать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Add Transaction Dialog ─────────────────────────────────────────────────

function AddTxDialog({
  open,
  onOpenChange,
  onSubmit,
  investmentName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { type: string; amount: number; units?: number; pricePerUnit?: number; date: string; note?: string }) => void
  investmentName: string
}) {
  const [type, setType] = useState('BUY')
  const [amount, setAmount] = useState('')
  const [units, setUnits] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')

  const handleSubmit = () => {
    if (!amount || !date) return
    onSubmit({
      type,
      amount: parseFloat(amount),
      units: units ? parseFloat(units) : undefined,
      pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
      date,
      note: note || undefined,
    })
    setAmount(''); setUnits(''); setPricePerUnit(''); setNote('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Операция: {investmentName}</DialogTitle>
          <DialogDescription>Добавьте транзакцию по инвестиции</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Тип операции</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(INVESTMENT_TX_TYPE_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  type="button"
                  variant={type === key ? 'default' : 'outline'}
                  size="sm"
                  className={type === key ? 'bg-violet-500 hover:bg-violet-600 text-white' : ''}
                  onClick={() => setType(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Сумма (₽)</Label>
            <Input type="number" placeholder="0" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Количество</Label>
              <Input type="number" placeholder="Необязательно" min="0" step="0.0001" value={units} onChange={(e) => setUnits(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Цена за ед.</Label>
              <Input type="number" placeholder="Необязательно" min="0" step="0.01" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Дата</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Заметка</Label>
            <Input placeholder="Необязательно" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={!amount || !date}>
            Добавить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Single Investment Card ─────────────────────────────────────────────────

function InvestmentCard({
  investment,
  onAddTx,
  onDelete,
  onDeleteTx,
}: {
  investment: Investment
  onAddTx: (inv: Investment) => void
  onDelete: (id: string) => void
  onDeleteTx: (investmentId: string, txId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const totalInvested = investment.totalInvested ?? 0
  const profit = investment.profit ?? 0
  const profitPct = totalInvested > 0 ? (profit / totalInvested) * 100 : 0
  const isPositive = profit >= 0
  const progressPct = investment.targetAmount && investment.targetAmount > 0
    ? Math.min(100, (totalInvested / investment.targetAmount) * 100)
    : null

  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${investment.color}15`, color: investment.color }}
            >
              {INV_TYPE_ICONS[investment.type] || <DollarSign className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{investment.name}</h3>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {INVESTMENT_TYPE_LABELS[investment.type] || investment.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Вложено: {formatCurrency(totalInvested)}
                {investment.totalReturned != null && investment.totalReturned > 0 && (
                  <> · Возвращено: {formatCurrency(investment.totalReturned)}</>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
              isPositive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? '+' : ''}{formatCurrency(profit)}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-red-500"
              onClick={(e) => { e.stopPropagation(); onDelete(investment.id) }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Progress towards target */}
        {progressPct !== null && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
              <span>Прогресс к цели {formatCurrency(investment.targetAmount!)}</span>
              <span className="font-medium tabular-nums">{Math.round(progressPct)}%</span>
            </div>
            <Progress value={progressPct} className="h-1.5" />
          </div>
        )}

        {/* Transactions toggle */}
        {investment.transactions && investment.transactions.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <span>{investment.transactions.length} {investment.transactions.length === 1 ? 'операция' : 'операций'}</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Expanded transactions */}
        {expanded && investment.transactions && (
          <div className="mt-2 space-y-1">
            {investment.transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs group/tx">
                <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0 shrink-0', INVESTMENT_TX_TYPE_COLORS[tx.type])}>
                  {TX_TYPE_ICONS[tx.type]}
                  <span className="ml-1">{INVESTMENT_TX_TYPE_LABELS[tx.type]}</span>
                </Badge>
                <span className="font-medium tabular-nums flex-1">
                  {formatCurrency(tx.amount)}
                  {tx.units ? <span className="text-muted-foreground ml-1">({tx.units} ед.)</span> : null}
                </span>
                <span className="text-muted-foreground text-[10px] shrink-0">
                  {formatDateRu(tx.date)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground sm:opacity-0 sm:group-hover/tx:opacity-100 hover:text-red-500 transition-opacity shrink-0"
                  onClick={(e) => { e.stopPropagation(); onDeleteTx(investment.id, tx.id) }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {investment.transactions.length > 5 && (
              <p className="text-center text-[10px] text-muted-foreground pt-1">
                ...и ещё {investment.transactions.length - 5}
              </p>
            )}
          </div>
        )}

        {/* Add transaction button */}
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full gap-1.5 text-xs"
          onClick={() => onAddTx(investment)}
        >
          <Plus className="h-3.5 w-3.5" />
          Добавить операцию
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Main Investments Manager ───────────────────────────────────────────────

export function InvestmentsManager({ isLoading }: { isLoading: boolean }) {
  const {
    investmentsData,
    createInvestment,
    deleteInvestment,
    addInvestmentTx,
    deleteInvestmentTx,
  } = useFinance()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTxDialog, setShowTxDialog] = useState(false)
  const [activeInvestment, setActiveInvestment] = useState<Investment | null>(null)

  const investments = investmentsData?.investments || []
  const totalInvested = investmentsData?.totalInvested ?? 0
  const totalReturned = investmentsData?.totalReturned ?? 0
  const totalProfit = investmentsData?.totalProfit ?? 0

  const handleCreate = async (data: { name: string; type: string; targetAmount?: number; description?: string }) => {
    await createInvestment(data)
    setShowCreateDialog(false)
  }

  const handleAddTx = (inv: Investment) => {
    setActiveInvestment(inv)
    setShowTxDialog(true)
  }

  const handleTxSubmit = async (data: { type: string; amount: number; units?: number; pricePerUnit?: number; date: string; note?: string }) => {
    if (!activeInvestment) return
    await addInvestmentTx(activeInvestment.id, data)
    setShowTxDialog(false)
    setActiveInvestment(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-[100px] rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 stagger-children">
          <Card className="card-hover border-l-4 border-l-blue-500 py-4">
            <CardContent className="px-4 py-0">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium">Всего вложено</span>
              </div>
              <p className="mt-1 text-lg font-bold text-blue-600 tabular-nums dark:text-blue-400">
                {formatCurrency(totalInvested)}
              </p>
            </CardContent>
          </Card>
          <Card className="card-hover border-l-4 border-l-emerald-500 py-4">
            <CardContent className="px-4 py-0">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium">Возвращено</span>
              </div>
              <p className="mt-1 text-lg font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                {formatCurrency(totalReturned)}
              </p>
            </CardContent>
          </Card>
          <Card className={cn(
            'card-hover border-l-4 py-4',
            totalProfit >= 0 ? 'border-l-emerald-500' : 'border-l-red-500'
          )}>
            <CardContent className="px-4 py-0">
              <div className="flex items-center gap-2 text-muted-foreground">
                {totalProfit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs font-medium">Прибыль/Убыток</span>
              </div>
              <p className={cn(
                'mt-1 text-lg font-bold tabular-nums',
                totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
              )}>
                {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Header with create button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Портфель инвестиций</h2>
            <p className="text-xs text-muted-foreground">
              {investments.length} {investments.length === 1 ? 'актив' : investments.length < 5 ? 'актива' : 'активов'}
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />Добавить
          </Button>
        </div>

        {/* Investment List */}
        {investments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-base font-semibold mb-1">Нет инвестиций</h3>
              <p className="text-sm text-muted-foreground max-w-xs text-center">
                Начните отслеживать свои инвестиции и сбережения
              </p>
              <Button
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                className="mt-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Добавить актив
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
            {investments.map((inv) => (
              <InvestmentCard
                key={inv.id}
                investment={inv}
                onAddTx={handleAddTx}
                onDelete={deleteInvestment}
                onDeleteTx={deleteInvestmentTx}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateInvestmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreate}
      />
      <AddTxDialog
        open={showTxDialog}
        onOpenChange={(open) => { setShowTxDialog(open); if (!open) setActiveInvestment(null) }}
        onSubmit={handleTxSubmit}
        investmentName={activeInvestment?.name || ''}
      />
    </>
  )
}
