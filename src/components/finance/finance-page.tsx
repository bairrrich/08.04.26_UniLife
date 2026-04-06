'use client'

import { Wallet, Plus, Filter, Receipt, PiggyBank, RefreshCw, TrendingUp, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCurrentMonthStr } from '@/lib/format'

import { PageHeader } from '@/components/layout/page-header'

import { SummaryCards } from './summary-cards'
import { SavingsGoal } from './savings-goal'
import { ExpenseChart } from './expense-chart'
import { CashFlowTrend } from './cash-flow-trend'
import { CategoryBreakdown } from './category-breakdown'
import { IncomeBreakdown } from './income-breakdown'
import { TransactionList } from './transaction-list'
import { AddTransactionDialog, EditTransactionDialog } from './transaction-dialog'
import { AnalyticsSection } from './analytics-section'
import { MonthNav } from './month-nav'
import { QuickStatsBar } from './quick-stats-bar'
import { BudgetProgressBar } from './budget-progress-bar'
import { BudgetProgress } from './budget-progress'
import { QuickExpenseBar } from './quick-expense-bar'
import { BudgetManager } from './budget-manager'
import { ExportButton } from './export-button'
import { FinancialHealthScore } from './financial-health-score'
import { SpendingForecast } from './spending-forecast'
import { MonthComparison } from './month-comparison'
import { InvestmentsManager } from './investments-manager'
import { AccountsManager } from './accounts-manager'
import { SavingsGoalsManager } from './savings-goals-manager'
import { RecurringManager } from './recurring-manager'
import { CategoryBars } from './category-bars'
import { SavingsBalanceBar } from './savings-balance-bar'
import { useFinance } from './hooks'

export default function FinancePage() {
  const {
    stats, isLoading, activeTab, setActiveTab,
    showNewDialog, setShowNewDialog, monthLabel, month,
    transactions, previousMonthStats, accounts,
    newType, newAmount, newCategoryId, newDescription, newDate, newNote, isSubmitting,
    setNewType, setNewAmount, setNewCategoryId, setNewDescription, setNewDate, setNewNote,
    showEditDialog, setShowEditDialog, editType, editAmount, editCategoryId, editDescription, editDate, editNote, isEditSubmitting,
    setEditType, setEditAmount, setEditCategoryId, setEditDescription, setEditDate, setEditNote,
    chartData, groupedTransactions, filteredCategories, editFilteredCategories,
    spendingInsights, getCategoryForTx,
    handleQuickExpense, navigateMonth, goToToday, openEditDialog, handleSubmit, handleEditSubmit, handleDelete, handleDuplicate,
    categories,
    newFromAccountId, newToAccountId, setNewFromAccountId, setNewToAccountId,
    editFromAccountId, editToAccountId, setEditFromAccountId, setEditToAccountId,
    recurringTransactions,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    executeRecurring,
  } = useFinance()

  const currentMonthStr = getCurrentMonthStr()
  const isNotCurrentMonth = month !== currentMonthStr

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <PageHeader
        icon={Wallet}
        title="Финансы"
        description="Учёт доходов, расходов и инвестиций"
        accent="emerald"
        badge={
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <Filter className="h-3 w-3" />{monthLabel}
          </span>
        }
        actions={
          <div className="flex items-center gap-2 shrink-0">
            <ExportButton transactions={transactions} monthLabel={monthLabel} />
            <Button size="sm" className="gap-1.5" onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">Добавить</span>
            </Button>
          </div>
        }
      />

      <MonthNav
        monthLabel={monthLabel}
        onNavigate={navigateMonth}
        onToday={goToToday}
        showToday={isNotCurrentMonth}
      />

      <QuickStatsBar
        transactions={transactions}
        totalIncome={stats?.totalIncome ?? 0}
        totalExpense={stats?.totalExpense ?? 0}
        isLoading={isLoading}
      />

      <BudgetProgressBar
        totalIncome={stats?.totalIncome ?? 0}
        totalExpense={stats?.totalExpense ?? 0}
        isLoading={isLoading}
      />

      <BudgetProgress
        month={month}
        isLoading={isLoading}
      />

      <QuickExpenseBar
        onQuickExpense={(label, amount) => {
          handleQuickExpense(label, amount)
          setShowNewDialog(true)
        }}
        transactions={transactions}
        totalIncome={stats?.totalIncome ?? 0}
        isLoading={isLoading}
      />

      <Tabs defaultValue="overview">
        <TabsList className="w-full overflow-x-auto flex-nowrap no-scrollbar">
          <TabsTrigger value="overview" className="gap-1.5 shrink-0">
            <Receipt className="h-4 w-4" /><span className="hidden sm:inline">Обзор</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-1.5 shrink-0">
            <Wallet className="h-4 w-4" /><span className="hidden sm:inline">Счёта</span>
          </TabsTrigger>
          <TabsTrigger value="investments" className="gap-1.5 shrink-0">
            <TrendingUp className="h-4 w-4" /><span className="hidden sm:inline">Инвестиции</span>
          </TabsTrigger>
          <TabsTrigger value="savings" className="gap-1.5 shrink-0">
            <PiggyBank className="h-4 w-4" /><span className="hidden sm:inline">Сбережения</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="gap-1.5 shrink-0">
            <Target className="h-4 w-4" /><span className="hidden sm:inline">Бюджет</span>
          </TabsTrigger>
          <TabsTrigger value="recurring" className="gap-1.5 shrink-0">
            <RefreshCw className="h-4 w-4" /><span className="hidden sm:inline">Повторяющиеся</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SummaryCards stats={stats} isLoading={isLoading} transactions={transactions} previousMonthStats={previousMonthStats} month={month} />

          <SavingsBalanceBar
            totalIncome={stats?.totalIncome ?? 0}
            totalExpense={stats?.totalExpense ?? 0}
            isLoading={isLoading}
          />

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

          <IncomeBreakdown transactions={transactions} isLoading={isLoading} />

          <CashFlowTrend chartData={chartData} stats={stats} monthLabel={monthLabel} isLoading={isLoading} />

          <CategoryBars transactions={transactions} isLoading={isLoading} />

          {/* Health Score + Forecast + Month Comparison */}
          <div className="grid gap-4 lg:grid-cols-3">
            <FinancialHealthScore
              savingsRate={stats?.savingsRate ?? 0}
              chartData={chartData}
              isLoading={isLoading}
            />
            <SpendingForecast
              totalExpense={stats?.totalExpense ?? 0}
              totalIncome={stats?.totalIncome ?? 0}
              chartData={chartData}
              monthLabel={monthLabel}
              isLoading={isLoading}
            />
            <MonthComparison
              currentStats={stats}
              previousStats={previousMonthStats}
              monthLabel={monthLabel}
              isLoading={isLoading}
            />
          </div>

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
            onDuplicate={handleDuplicate}
            onAddNew={() => setShowNewDialog(true)}
          />
        </TabsContent>

        <TabsContent value="accounts">
          <AccountsManager />
        </TabsContent>

        <TabsContent value="investments">
          <InvestmentsManager isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="savings">
          <SavingsGoalsManager />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetManager month={month} categories={categories} />
        </TabsContent>

        <TabsContent value="recurring">
          <RecurringManager
            recurringTransactions={recurringTransactions}
            categories={categories}
            isLoading={isLoading}
            onCreateRecurring={createRecurring}
            onUpdateRecurring={updateRecurring}
            onDeleteRecurring={deleteRecurring}
            onExecuteRecurring={executeRecurring}
          />
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
        accounts={accounts}
        onNewTypeChange={setNewType}
        onNewAmountChange={setNewAmount}
        onNewCategoryIdChange={setNewCategoryId}
        onNewDescriptionChange={setNewDescription}
        onNewDateChange={setNewDate}
        onNewNoteChange={setNewNote}
        onQuickExpense={handleQuickExpense}
        onSubmit={handleSubmit}
        newFromAccountId={newFromAccountId}
        newToAccountId={newToAccountId}
        onNewFromAccountIdChange={setNewFromAccountId}
        onNewToAccountIdChange={setNewToAccountId}
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
        accounts={accounts}
        onEditTypeChange={setEditType}
        onEditAmountChange={setEditAmount}
        onEditCategoryIdChange={setEditCategoryId}
        onEditDescriptionChange={setEditDescription}
        onEditDateChange={setEditDate}
        onEditNoteChange={setEditNote}
        onSubmit={handleEditSubmit}
        editFromAccountId={editFromAccountId}
        editToAccountId={editToAccountId}
        onEditFromAccountIdChange={setEditFromAccountId}
        onEditToAccountIdChange={setEditToAccountId}
      />
    </div>
  )
}
