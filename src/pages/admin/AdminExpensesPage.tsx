import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IndianRupee, FileText, Plus, Pencil, Trash2, Upload, AlertCircle } from 'lucide-react'
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '../../hooks/useExpenses'
import type { Expense } from '../../types'
import { formatDateIN, formatINR, uploadImage } from '../../lib/utils'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'

const EXPENSE_CATEGORIES = [
  'Equipment',
  'Travel',
  'Tournament Fee',
  'Uniform',
  'Food',
  'Other',
] as const

const expenseSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  expense_date: z.string().min(1, 'Date is required'),
})

type ExpenseForm = z.infer<typeof expenseSchema>

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: currentYear - 2020 + 2 }, (_, i) => 2020 + i)

export function AdminExpensesPage() {
  const [year, setYear] = useState<number>(currentYear)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [removeReceipt, setRemoveReceipt] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: expenses, isLoading, isError, error } = useExpenses(year)
  const { mutateAsync: createExpense } = useCreateExpense()
  const { mutateAsync: updateExpense } = useUpdateExpense()
  const { mutateAsync: deleteExpense } = useDeleteExpense()

  const total = useMemo(
    () => (expenses ?? []).reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: { year: currentYear, category: 'Other', description: '', expense_date: '' },
  })

  const openCreate = () => {
    setEditing(null)
    setReceiptFile(null)
    setRemoveReceipt(false)
    setSubmitError(null)
    reset({ year: currentYear, category: 'Other', description: '', amount: undefined, expense_date: '' })
    setModalOpen(true)
  }

  const openEdit = (expense: Expense) => {
    setEditing(expense)
    setReceiptFile(null)
    setRemoveReceipt(false)
    setSubmitError(null)
    reset({
      year: expense.year,
      category: expense.category as ExpenseForm['category'],
      description: expense.description,
      amount: expense.amount,
      expense_date: expense.expense_date.slice(0, 10),
    })
    setModalOpen(true)
  }

  const onSubmit = async (values: ExpenseForm) => {
    setSubmitError(null)
    try {
      setUploading(true)
      let receipt_url: string | null = null
      if (receiptFile) {
        try {
          receipt_url = await uploadImage(receiptFile, 'receipts')
        } catch (uploadErr) {
          // Receipt upload failed — proceed without receipt, don't block save
          console.warn('Receipt upload failed:', uploadErr)
          receipt_url = null
        }
      } else if (editing?.receipt_url && !removeReceipt) {
        receipt_url = editing.receipt_url
      }

      if (editing) {
        await updateExpense({ id: editing.id, ...values, receipt_url })
      } else {
        await createExpense({ ...values, receipt_url })
      }
      setModalOpen(false)
      reset()
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ??
        (err as { error?: string })?.error ??
        String(err)
      setSubmitError(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id: string) => {
    deleteExpense(id)
    setConfirmDelete(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">Failed to load expenses.</p>
          {error instanceof Error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Button onClick={openCreate}>
            <Plus size={16} /> Add Expense
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded-lg text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            <IndianRupee size={18} />
          </span>
          <div>
            <p className="text-sm text-gray-500">Total Expenses {year}</p>
            <p className="text-2xl font-bold text-gray-900">{formatINR(total)}</p>
          </div>
        </div>
      </div>

      {(!expenses || expenses.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <IndianRupee size={64} className="mb-4 text-gray-200" />
          <p className="font-medium text-gray-500">No expenses recorded for {year}.</p>
          <Button onClick={openCreate} className="mt-4">
            <Plus size={16} /> Add First Expense
          </Button>
        </div>
      )}

      {expenses && expenses.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Description</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Receipt</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-700">{formatDateIN(expense.expense_date)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{expense.description}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatINR(expense.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      {expense.receipt_url ? (
                        <a
                          href={expense.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
                        >
                          <FileText size={14} /> View
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(expense)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[var(--color-primary)]"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(expense.id)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {editing ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              {submitError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Year</label>
                  <select
                    {...register('year')}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
                  <select
                    {...register('category')}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
                </div>
              </div>

              <Input
                label="Description"
                placeholder="e.g. Bus rental for tournament"
                error={errors.description?.message}
                {...register('description')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Amount (₹)"
                  type="number"
                  placeholder="e.g. 500"
                  min="0.01"
                  step="0.01"
                  error={errors.amount?.message}
                  {...register('amount')}
                />
                <Input
                  label="Date"
                  type="date"
                  error={errors.expense_date?.message}
                  {...register('expense_date')}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Receipt (optional)</label>
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3.5 py-2.5 text-sm text-gray-500 transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                  <Upload size={16} />
                  <label className="cursor-pointer flex-1">
                    {receiptFile ? receiptFile.name : (editing?.receipt_url ? 'Replace receipt' : 'Upload receipt')}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        setReceiptFile(e.target.files?.[0] ?? null)
                        setRemoveReceipt(false)
                      }}
                    />
                  </label>
                </div>
                {editing?.receipt_url && !receiptFile && !removeReceipt && (
                  <button
                    type="button"
                    onClick={() => setRemoveReceipt(true)}
                    className="mt-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove existing receipt
                  </button>
                )}
                {removeReceipt && (
                  <p className="mt-1 text-xs text-amber-600">Existing receipt will be removed on save.</p>
                )}
              </div>

              <div className="mt-2 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting || uploading}>
                  {uploading ? <Spinner size={18} className="text-white" /> : (editing ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-bold text-gray-900">Delete Expense?</h3>
            <p className="mb-6 text-sm text-gray-500">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
