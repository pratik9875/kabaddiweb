import { describe, it, expect } from 'vitest'
import { expenseSchema } from './expenseSchema'

const validExpense = {
  year: 2026,
  category: 'Equipment',
  description: 'New kabaddi mats',
  amount: 500,
  expense_date: '2026-07-30',
}

describe('expenseSchema', () => {
  it('accepts a fully valid expense', () => {
    const result = expenseSchema.safeParse(validExpense)
    expect(result.success).toBe(true)
  })

  it('rejects a missing/undefined amount', () => {
    const result = expenseSchema.safeParse({ ...validExpense, amount: undefined })
    expect(result.success).toBe(false)
  })

  it('rejects an amount of 0', () => {
    const result = expenseSchema.safeParse({ ...validExpense, amount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects a negative amount', () => {
    const result = expenseSchema.safeParse({ ...validExpense, amount: -50 })
    expect(result.success).toBe(false)
  })

  it('coerces a numeric string amount', () => {
    const result = expenseSchema.safeParse({ ...validExpense, amount: '250' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.amount).toBe(250)
  })

  it('rejects an empty description', () => {
    const result = expenseSchema.safeParse({ ...validExpense, description: '' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty expense_date', () => {
    const result = expenseSchema.safeParse({ ...validExpense, expense_date: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a category outside the allowed list', () => {
    const result = expenseSchema.safeParse({ ...validExpense, category: 'Bribes' })
    expect(result.success).toBe(false)
  })

  it('rejects a year before 2000', () => {
    const result = expenseSchema.safeParse({ ...validExpense, year: 1999 })
    expect(result.success).toBe(false)
  })

  it('rejects a non-integer year', () => {
    const result = expenseSchema.safeParse({ ...validExpense, year: 2026.5 })
    expect(result.success).toBe(false)
  })
})
