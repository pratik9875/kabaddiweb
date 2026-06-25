import { Link } from 'react-router-dom'
import { ArrowRight, Trophy } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { Container } from '../ui/Container'
import { Button } from '../ui/Button'
import heroAction from '../../assets/hero-action.png'

export function HeroBanner() {
  const settings = useSettingsStore((s) => s.settings)
  const heroImage = settings.hero_image_url || heroAction

  return (
    <section className="relative isolate overflow-hidden w-full min-h-[640px] flex items-center py-24">
      <img
        src={heroImage}
        alt={settings.team_name ?? 'Kabaddi team in action'}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />

      {/* Warm light scrim + blur over the left two-thirds for text contrast; right side stays crisp. */}
      <div className="absolute inset-y-0 left-0 -z-10 w-full backdrop-blur-md [mask-image:linear-gradient(to_right,black,black_55%,transparent_85%)] lg:w-3/4" />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to right, color-mix(in srgb, var(--color-primary) 8%, white) 0%, color-mix(in srgb, var(--color-primary) 18%, white) 40%, transparent 85%)',
        }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to top, color-mix(in srgb, var(--color-secondary) 10%, white) 0%, transparent 45%, color-mix(in srgb, var(--color-primary) 10%, white) 100%)',
        }}
      />

      <Container className="relative px-6 animate-fadeIn">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:max-w-2xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-white/60 px-5 py-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] shadow-sm backdrop-blur-md">
            <Trophy size={14} className="text-[var(--color-secondary)]" /> {settings.tagline ?? 'Pride of the Village'}
          </span>

          <h1 className="max-w-xl text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              <span className="font-marathi">{settings.hero_title ?? settings.team_name}</span>
            </span>
          </h1>

          {settings.hero_subtitle && (
            <p className="mt-6 max-w-xl text-lg text-slate-600 leading-relaxed sm:text-xl">
              {settings.hero_subtitle}
            </p>
          )}

          <p className="mt-3 max-w-xl text-base text-slate-600 leading-relaxed font-marathi">
            कबड्डी हे केवळ खेळ नाही, ती आमची ओळख आहे. एक गाव, एक संघ, एक स्वप्न!
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
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
        </div>
      </Container>
    </section>
  )
}
