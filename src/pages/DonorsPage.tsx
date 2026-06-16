import { useState } from 'react'
import { useDonors } from '../hooks/useDonors'
import { Spinner } from '../components/ui/Spinner'
import { Container } from '../components/ui/Container'
import { HandCoins, Gift, Building2, User } from 'lucide-react'
import { formatINR } from '../lib/utils'

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: currentYear - 2020 + 2 }, (_, i) => 2020 + i)

const DONOR_TYPE_ICONS: Record<string, typeof User> = {
  Individual: User,
  Business: Building2,
  Organization: Building2,
}

export function DonorsPage() {
  const [year, setYear] = useState<number | undefined>(undefined)
  const { data: donors, isLoading, isError } = useDonors(year)

  if (isLoading) {
    return (
      <Container className="py-20 flex justify-center">
        <Spinner />
      </Container>
    )
  }

  if (isError) {
    return (
      <Container className="py-20 text-center text-red-600">
        Failed to load donors.
      </Container>
    )
  }

  return (
    <section className="px-6 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Prize Donors</h1>
          <p className="mt-1 text-sm text-gray-500">Supporters who make our tournaments possible</p>
        </div>
        <select
          value={year ?? ''}
          onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
        >
          <option value="">All Years</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {!donors?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <HandCoins size={64} className="mb-4 text-gray-200" />
          <p className="font-medium text-gray-500">No donors yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {donors.map((d) => {
            const TypeIcon = DONOR_TYPE_ICONS[d.donor_type] ?? User
            return (
              <div
                key={d.id}
                className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600">
                    <TypeIcon size={22} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-gray-900 truncate">{d.donor_name}</h2>
                    <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                      {d.donor_type}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Gift size={14} className="text-gray-400 shrink-0" />
                    <span className="line-clamp-2">{d.prize_description}</span>
                  </div>
                  {d.prize_value != null && (
                    <p className="font-semibold text-gray-900">{formatINR(d.prize_value)}</p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-blue-600 font-medium">
                    {d.tournament_name}
                  </span>
                  <span className="rounded-full bg-gray-50 px-2.5 py-0.5 font-medium">
                    {d.year}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
