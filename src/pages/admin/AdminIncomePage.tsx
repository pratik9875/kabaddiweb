import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, AlertCircle, IndianRupee, X } from 'lucide-react'
import { useIncome, useCreateIncome, useUpdateIncome, useDeleteIncome } from '../../hooks/useIncome'
import type { Income } from '../../types'
import { cn, formatDateIN, formatINR } from '../../lib/utils'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'

const INCOME_SOURCES = ['Membership', 'Donation', 'Sponsorship', 'Grant', 'Other'] as const

const incomeSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  source: z.enum(INCOME_SOURCES),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  income_date: z.string().min(1, 'Date is required'),
})

type IncomeForm = z.infer<typeof incomeSchema>

const emptyForm: IncomeForm = {
  year: new Date().getFullYear(),
  source: 'Membership',
  description: '',
  amount: 0,
  income_date: new Date().toISOString().slice(0, 10),
}

export function AdminIncomePage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Income | null>(null)
  const [deleting, setDeleting] = useState<Income | null>(null)

  const { data: incomes, isLoading, isError } = useIncome(year)
  const createIncome = useCreateIncome()
  const updateIncome = useUpdateIncome()
  const deleteIncome = useDeleteIncome()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncomeForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(incomeSchema) as any,
    defaultValues: emptyForm,
  })

  function openCreate() {
    setEditing(null)
    reset(emptyForm)
    setModalOpen(true)
  }

  function openEdit(income: Income) {
    setEditing(income)
    reset({
      year: income.year,
      source: income.source as IncomeForm['source'],
      description: income.description,
      amount: income.amount,
      income_date: income.income_date.slice(0, 10),
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  async function onSubmit(values: IncomeForm) {
    if (editing) {
      await updateIncome.mutateAsync({ id: editing.id, ...values })
    } else {
      await createIncome.mutateAsync(values)
    }
    closeModal()
  }

  async function confirmDelete() {
    if (!deleting) return
    await deleteIncome.mutateAsync(deleting.id)
    setDeleting(null)
  }

  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Income</h1>
          <p className="text-sm text-gray-500">Manage membership fees, donations and other income</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Add Income
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="h-11 rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {incomes && incomes.length > 0 && (
          <div className="ml-auto flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-5 py-3 shadow-sm">
            <IndianRupee size={18} className="text-[var(--color-primary)]" />
            <span className="text-sm text-gray-500">Total:</span>
            <span className="text-lg font-bold text-gray-900">
              {formatINR(incomes.reduce((s, i) => s + i.amount, 0))}
            </span>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>Could not load income entries. Check your connection and try again.</span>
        </div>
      )}

      {!isLoading && !isError && incomes && incomes.length === 0 && (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <IndianRupee size={40} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">No income entries for {year}.</p>
          <Button onClick={openCreate} className="mt-4">
            <Plus size={16} />
            Add your first entry
          </Button>
        </div>
      )}

      {!isLoading && !isError && incomes && incomes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3.5 font-medium text-gray-500">Date</th>
                  <th className="px-5 py-3.5 font-medium text-gray-500">Source</th>
                  <th className="px-5 py-3.5 font-medium text-gray-500">Description</th>
                  <th className="px-5 py-3.5 font-medium text-gray-500">Amount</th>
                  <th className="px-5 py-3.5 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income, idx) => (
                  <tr
                    key={income.id}
                    className={cn(
                      'border-b border-gray-100 transition-colors hover:bg-gray-50/50',
                      idx === incomes.length - 1 && 'border-b-0',
                    )}
                  >
                    <td className="px-5 py-3.5 text-gray-700">{formatDateIN(income.income_date)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                        {income.source}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-5 py-3.5 text-gray-700">
                      {income.description}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {formatINR(income.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(income)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleting(income)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? 'Edit Income' : 'Add Income'}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <Input
                label="Year"
                type="number"
                error={errors.year?.message}
                {...register('year')}
              />
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Source</label>
                <select
                  className={cn(
                    'h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-gray-900 outline-none transition-colors',
                    'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20',
                    errors.source ? 'border-red-400' : 'border-gray-300',
                  )}
                  {...register('source')}
                >
                  {INCOME_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.source && (
                  <p className="mt-1 text-xs text-red-500">{errors.source.message}</p>
                )}
              </div>
              <Input
                label="Description"
                error={errors.description?.message}
                {...register('description')}
              />
              <Input
                label="Amount (₹)"
                type="number"
                step="any"
                error={errors.amount?.message}
                {...register('amount')}
              />
              <Input
                label="Date"
                type="date"
                error={errors.income_date?.message}
                {...register('income_date')}
              />
              <div className="mt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || createIncome.isPending || updateIncome.isPending}
                >
                  {isSubmitting || createIncome.isPending || updateIncome.isPending ? (
                    <Spinner size={18} className="text-white" />
                  ) : editing ? (
                    'Update'
                  ) : (
                    'Create'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Delete Income</h2>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this income entry? This action cannot be undone.
            </p>
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
              <p className="font-medium text-gray-900">{formatINR(deleting.amount)}</p>
              <p className="text-gray-500">{deleting.description}</p>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                disabled={deleteIncome.isPending}
                className="!border-red-600 !bg-red-600 !text-white hover:!bg-red-700"
              >
                {deleteIncome.isPending ? (
                  <Spinner size={18} className="text-white" />
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
