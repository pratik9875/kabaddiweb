import { createCrud } from './crud'
import type { Income } from '../types'

export type IncomeInsert = Omit<Income, 'id' | 'created_at' | 'org_slug'>
export type IncomeUpdate = Partial<IncomeInsert>

const crud = createCrud<Income, IncomeInsert, IncomeUpdate>('income', {
  column: 'income_date',
  ascending: false,
})

/** List income entries, optionally filtered by year. */
export function useIncome(year?: number) {
  return crud.useList(year ? { year } : undefined)
}

export const useCreateIncome = crud.useCreate
export const useUpdateIncome = crud.useUpdate
export const useDeleteIncome = crud.useRemove
