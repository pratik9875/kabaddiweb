import { createCrud } from './crud'
import type { Expense } from '../types'

export type ExpenseInsert = Omit<Expense, 'id' | 'created_at' | 'org_slug'>
export type ExpenseUpdate = Partial<ExpenseInsert>

const crud = createCrud<Expense, ExpenseInsert, ExpenseUpdate>('expenses', {
  column: 'expense_date',
  ascending: false,
})

/** List expenses, optionally filtered by year. */
export function useExpenses(year?: number) {
  return crud.useList(year ? { year } : undefined)
}

export const useCreateExpense = crud.useCreate
export const useUpdateExpense = crud.useUpdate
export const useDeleteExpense = crud.useRemove
