import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Trophy, CalendarDays, HandCoins } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { countRows } from '../../hooks/crud'
import { Container } from '../ui/Container'

interface Stat {
  icon: LucideIcon
  label: string
  value: number
  suffix?: string
}

/** Count-up animation that fires once the element scrolls into view. */
function useCountUp(target: number, run: boolean, durationMs = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / durationMs, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, durationMs])
  return value
}

function StatCard({ stat, run }: { stat: Stat; run: boolean }) {
  const value = useCountUp(stat.value, run)
  const Icon = stat.icon
  return (
    <div className="flex flex-col items-center rounded-3xl bg-white/70 backdrop-blur-md border border-slate-100 p-6 md:p-8 text-center shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:bg-white relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
      <span
        className="mb-4 grid h-14 w-14 place-items-center rounded-full text-white shadow-lg shadow-[var(--color-primary)]/20 transition-transform group-hover:scale-110 relative z-10"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
      >
        <Icon size={24} />
      </span>
      <span className="text-4xl font-black text-slate-800 tracking-tight relative z-10">
        {value}
        {stat.suffix}
      </span>
      <span className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 relative z-10">{stat.label}</span>
    </div>
  )
}

export function StatsCounter() {
  const settings = useSettingsStore((s) => s.settings)
  const ref = useRef<HTMLDivElement>(null)
  const [run, setRun] = useState(false)

  const { data: counts } = useQuery({
    queryKey: ['homepage_stats'],
    queryFn: async () => {
      const [players, achievements, donors] = await Promise.all([
        countRows('players', { is_retired: false }),
        countRows('achievements'),
        countRows('prize_donors'),
      ])
      return { players, achievements, donors }
    },
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const yearsActive = settings.founded_year
    ? new Date().getFullYear() - settings.founded_year
    : 0

  const stats: Stat[] = [
    { icon: Users, label: 'Players', value: counts?.players ?? 0 },
    { icon: Trophy, label: 'Tournaments Won', value: counts?.achievements ?? 0 },
    { icon: CalendarDays, label: 'Years Active', value: yearsActive },
    { icon: HandCoins, label: 'Prize Donors', value: counts?.donors ?? 0 },
  ]

  return (
    <section className="py-20 relative z-10 -mt-10">
      <Container>
        <div ref={ref} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {stats.map((s) => (
            <StatCard key={s.label} stat={s} run={run} />
          ))}
        </div>
      </Container>
    </section>
  )
}
