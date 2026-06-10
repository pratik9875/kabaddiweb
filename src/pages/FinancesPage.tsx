import { useState, useMemo } from 'react'
import { IndianRupee, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useExpenses } from '../hooks/useExpenses'
import { useIncome } from '../hooks/useIncome'
import { Container } from '../components/ui/Container'
import { Card } from '../components/ui/Card'
import { formatINR, formatDateIN } from '../lib/utils'

const PIE_COLORS = ['#f97316', '#f43f5e', '#3b82f6', '#22c55e', '#a855f7', '#eab308']

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: currentYear - 2020 + 2 }, (_, i) => 2020 + i)

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
      <div className="h-8 w-32 rounded bg-gray-200" />
    </div>
  )
}

export function FinancesPage() {
  const [year, setYear] = useState<number>(currentYear)

  const { data: expenses, isLoading: expLoading, isError: expError } = useExpenses(year)
  const { data: income, isLoading: incLoading, isError: incError } = useIncome(year)

  const totalIncome = useMemo(
    () => (income ?? []).reduce((sum, i) => sum + i.amount, 0),
    [income],
  )

  const totalExpenses = useMemo(
    () => (expenses ?? []).reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  )

  const netBalance = totalIncome - totalExpenses

  const expenseByCategory = useMemo(() => {
    if (!expenses) return []
    const map = new Map<string, number>()
    for (const e of expenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [expenses])

  const loading = expLoading || incLoading
  const error = expError || incError
  const hasData = (expenses && expenses.length > 0) || (income && income.length > 0)

  if (error) {
    return (
      <Container className="py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">Failed to load financial data.</p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Finances</h1>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Wallet size={64} className="mb-4 text-gray-200" />
          <p className="font-medium text-gray-500">No financial data for this year</p>
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-6 sm:grid-cols-3">
            <Card>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-green-100 text-green-600">
                  <TrendingUp size={20} />
                </span>
                <div>
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="text-2xl font-bold text-gray-900">{formatINR(totalIncome)}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-red-100 text-red-600">
                  <TrendingDown size={20} />
                </span>
                <div>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">{formatINR(totalExpenses)}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600">
                  <IndianRupee size={20} />
                </span>
                <div>
                  <p className="text-sm text-gray-500">Net Balance</p>
                  <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatINR(netBalance)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {expenseByCategory.length > 0 && (
            <Card className="mb-8">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Expense Breakdown</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {expenseByCategory.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatINR(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {income && income.length > 0 && (
            <Card className="mb-8">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Income</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Source</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Description</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {income.map((i) => (
                      <tr key={i.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-gray-700">{formatDateIN(i.income_date)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            {i.source}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{i.description}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatINR(i.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {expenses && expenses.length > 0 && (
            <Card>
              <h2 className="mb-4 text-lg font-bold text-gray-900">Expenses</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Description</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e) => (
                      <tr key={e.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-gray-700">{formatDateIN(e.expense_date)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                            {e.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{e.description}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatINR(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </Container>
  )
}
