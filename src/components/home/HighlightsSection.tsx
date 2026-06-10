import { Link } from 'react-router-dom'
import { Users, Trophy, Wallet, HandCoins, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Container } from '../ui/Container'

interface Highlight {
  icon: LucideIcon
  title: string
  desc: string
  to: string
}

const HIGHLIGHTS: Highlight[] = [
  { icon: Users, title: 'Our Players', desc: 'Meet the raiders and defenders carrying the village flag.', to: '/players' },
  { icon: Trophy, title: 'Achievements', desc: 'Trophies and titles won across seasons and tournaments.', to: '/achievements' },
  { icon: Wallet, title: 'Transparent Finances', desc: 'Open records of income and expenses, year by year.', to: '/finances' },
  { icon: HandCoins, title: 'Prize Donors', desc: 'The generous supporters who back our team.', to: '/donors' },
]

export function HighlightsSection() {
  return (
    <section className="py-20">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black tracking-tight text-slate-800">Explore the Team</h2>
          <p className="mt-4 text-lg text-slate-500">Everything about our kabaddi family.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((h) => {
            const Icon = h.icon
            return (
              <Link
                key={h.to}
                to={h.to}
                className="group flex flex-col rounded-3xl border border-slate-100 bg-white p-8 shadow-md transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-slate-200"
              >
                <span
                  className="mb-6 grid h-14 w-14 place-items-center rounded-2xl text-white shadow-md transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                >
                  <Icon size={24} />
                </span>
                <h3 className="text-xl font-bold text-slate-800">{h.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed flex-1">{h.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
                  Explore
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
