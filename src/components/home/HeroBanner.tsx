import { Link } from 'react-router-dom'
import { ArrowRight, Trophy } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { Container } from '../ui/Container'
import { Button } from '../ui/Button'

export function HeroBanner() {
  const settings = useSettingsStore((s) => s.settings)

  return (
    <section className="relative overflow-hidden w-full pt-16 pb-20 md:py-32 px-6">
      {/* Background glow and decorative blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] opacity-10 blur-3xl -z-10 pointer-events-none" />

      {settings.hero_image_url && (
        <div className="absolute inset-0 -z-20 opacity-10 blur-sm">
          <img
            src={settings.hero_image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <Container className="relative flex flex-col items-center justify-center text-center animate-fadeIn">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-white/50 px-5 py-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] shadow-sm backdrop-blur-md">
          <Trophy size={14} className="text-[var(--color-secondary)]" /> {settings.tagline ?? 'Pride of the Village'}
        </span>

        <h1 className="max-w-4xl text-5xl font-black leading-[1.1] tracking-tight text-slate-800 sm:text-7xl">
          <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            <span className="font-marathi">{settings.hero_title ?? settings.team_name}</span>
          </span>
        </h1>

        {settings.hero_subtitle && (
          <p className="mt-6 max-w-2xl text-lg text-slate-500 leading-relaxed sm:text-xl">
            {settings.hero_subtitle}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/players">
            <Button size="lg" className="rounded-full bg-slate-900 px-8 py-6 text-sm font-bold text-white hover:bg-slate-800 hover:-translate-y-0.5 shadow-xl shadow-slate-900/20 transition-all flex items-center gap-2">
              Meet the Team <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/achievements">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border border-slate-200 bg-white px-8 py-6 text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 shadow-sm transition-all"
            >
              Our Achievements
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  )
}
