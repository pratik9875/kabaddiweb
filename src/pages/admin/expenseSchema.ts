import { z } from 'zod'

export const EXPENSE_CATEGORIES = [
  'Equipment',
  'Travel',
  'Tournament Fee',
  'Uniform',
  'Food',
  'Other',
] as const

export const expenseSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce
    .number({ error: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  expense_date: z.string().min(1, 'Date is required'),
})

export type ExpenseForm = z.infer<typeof expenseSchema>
