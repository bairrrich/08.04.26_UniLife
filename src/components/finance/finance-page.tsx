'use client'

import { Wallet, Plus, Filter, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { SummaryCards } from './summary-cards'
import { SavingsGoal } from './savings-goal'
import { ExpenseChart } from './expense-chart'
import { CashFlowTrend } from './cash-flow-trend'
import { CategoryBreakdown } from './category-breakdown'
import { TransactionList } from './transaction-list'
import { AddTransactionDialog, EditTransactionDialog } from './transaction-dialog'
import { AnalyticsSection } from './analytics-section'
import { MonthNav } from './month-nav'
import { BudgetManager } from './budget-manager'
import { useFinance } from './hooks'

export default function FinancePage() {
  const {
    stats, isLoading, activeTab, setActiveTab,
    showNewDialog, setShowNewDialog, monthLabel, month,
    transactions, previousMonthStats,
    newType, newAmount, newCategoryId, newDescription, newDate, newNote, isSubmitting,
    setNewType, setNewAmount, setNewCategoryId, setNewDescription, setNewDate, setNewNote,
    showEditDialog, setShowEditDialog, editType, editAmount, editCategoryId, editDescription, editDate, editNote, isEditSubmitting,
    setEditType, setEditAmount, setEditCategoryId, setEditDescription, setEditDate, setEditNote,
    chartData, groupedTransactions, filteredCategories, editFilteredCategories,
    spendingInsights, getCategoryForTx,
    handleQuickExpense, navigateMonth, openEditDialog, handleSubmit, handleEditSubmit, handleDelete,
    categories,
  } = useFinance()

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-4 right-20 h-24 w-24 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/15 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Финансы</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Filter className="h-3 w-3" />{monthLabel}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Учёт доходов и расходов</p>
            </div>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4" />Добавить
          </Button>
        </div>
      </div>

      <MonthNav monthLabel={monthLabel} onNavigate={navigateMonth} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <Receipt className="h-4 w-4" />Обзор
          </TabsTrigger>
          <TabsTrigger value="budget" className="gap-1.5">
            <Wallet className="h-4 w-4" />Бюджет
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SummaryCards stats={stats} isLoading={isLoading} transactions={transactions} previousMonthStats={previousMonthStats} />

          <SavingsGoal
            totalIncome={stats?.totalIncome ?? 0}
            totalExpense={stats?.totalExpense ?? 0}
            isLoading={isLoading}
          />

          {/* Chart + Category Breakdown */}
          <div className="grid gap-4 lg:grid-cols-3">
            <ExpenseChart chartData={chartData} isLoading={isLoading} />
            <CategoryBreakdown stats={stats} isLoading={isLoading} />
          </div>

          <CashFlowTrend chartData={chartData} stats={stats} monthLabel={monthLabel} isLoading={isLoading} />

          {!isLoading && spendingInsights && (
            <AnalyticsSection spendingInsights={spendingInsights} getCategoryForTx={getCategoryForTx} />
          )}

          <TransactionList
            groupedTransactions={groupedTransactions}
            activeTab={activeTab}
            isLoading={isLoading}
            onTabChange={setActiveTab}
            onEdit={openEditDialog}
            onDelete={handleDelete}
            onAddNew={() => setShowNewDialog(true)}
          />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetManager month={month} categories={categories} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddTransactionDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        newType={newType}
        newAmount={newAmount}
        newCategoryId={newCategoryId}
        newDescription={newDescription}
        newDate={newDate}
        newNote={newNote}
        isSubmitting={isSubmitting}
        categories={filteredCategories}
        onNewTypeChange={setNewType}
        onNewAmountChange={setNewAmount}
        onNewCategoryIdChange={setNewCategoryId}
        onNewDescriptionChange={setNewDescription}
        onNewDateChange={setNewDate}
        onNewNoteChange={setNewNote}
        onQuickExpense={handleQuickExpense}
        onSubmit={handleSubmit}
      />
      <EditTransactionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        editType={editType}
        editAmount={editAmount}
        editCategoryId={editCategoryId}
        editDescription={editDescription}
        editDate={editDate}
        editNote={editNote}
        isSubmitting={isEditSubmitting}
        categories={editFilteredCategories}
        onEditTypeChange={setEditType}
        onEditAmountChange={setEditAmount}
        onEditCategoryIdChange={setEditCategoryId}
        onEditDescriptionChange={setEditDescription}
        onEditDateChange={setEditDate}
        onEditNoteChange={setEditNote}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
