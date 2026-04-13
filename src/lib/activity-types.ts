export const ACTIVITY_VISIBILITY_VALUES = ['private', 'friends', 'public'] as const
export type ActivityVisibility = typeof ACTIVITY_VISIBILITY_VALUES[number]

export const ACTIVITY_EVENT_TYPES = {
  WORKOUT_COMPLETED: 'workout.completed',
  DIARY_ENTRY_CREATED: 'diary.entry_created',
  FINANCE_TRANSACTION_INCOME: 'finance.transaction_income',
  FINANCE_TRANSACTION_EXPENSE: 'finance.transaction_expense',
  FINANCE_TRANSACTION_TRANSFER: 'finance.transaction_transfer',
} as const

export type ActivityEventType = typeof ACTIVITY_EVENT_TYPES[keyof typeof ACTIVITY_EVENT_TYPES]

export function getFinanceTransactionEventType(type: 'INCOME' | 'EXPENSE' | 'TRANSFER'): ActivityEventType {
  if (type === 'INCOME') return ACTIVITY_EVENT_TYPES.FINANCE_TRANSACTION_INCOME
  if (type === 'EXPENSE') return ACTIVITY_EVENT_TYPES.FINANCE_TRANSACTION_EXPENSE
  return ACTIVITY_EVENT_TYPES.FINANCE_TRANSACTION_TRANSFER
}
