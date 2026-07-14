import { Link } from 'react-router-dom'
import { ArrowRight, Trophy } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { Container } from '../ui/Container'
import { Button } from '../ui/Button'
import heroGround from '../../assets/hero-ground.png'

export function HeroBanner() {
  const settings = useSettingsStore((s) => s.settings)
  const heroImage = settings.hero_image_url || heroGround

  return (
    <section className="relative isolate overflow-hidden w-full min-h-[460px] flex items-center py-16 sm:min-h-[560px] lg:min-h-[640px] lg:py-24">
      <img
        src={heroImage}
        alt={settings.team_name ?? 'Kabaddi team in action'}
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_center]"
      />

      {/* Dark scrim: heavy on the left where the text sits, fading out so the photo stays crisp on the right. */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to right, rgba(10,14,20,0.92) 0%, rgba(10,14,20,0.78) 35%, rgba(10,14,20,0.45) 60%, rgba(10,14,20,0.15) 100%)',
        }}
      />
      {/* Bottom fade for depth */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to top, rgba(10,14,20,0.55) 0%, transparent 35%)',
        }}
      />

      <Container className="relative px-6 animate-fadeIn">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] shadow-sm backdrop-blur-md sm:mb-6">
            <Trophy size={14} className="text-[var(--color-secondary)]" /> {settings.tagline ?? 'Pride of the Village'}
          </span>

          <h1 className="max-w-xl text-3xl font-black leading-[1.3] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text pb-1 text-transparent">
              <span className="font-marathi">{settings.hero_title ?? settings.team_name}</span>
            </span>
          </h1>

          {settings.hero_subtitle && (
            <p className="mt-4 max-w-xl text-base text-slate-100 leading-relaxed sm:mt-6 sm:text-xl">
              {settings.hero_subtitle}
            </p>
          )}

          <p className="mt-2 max-w-xl text-sm text-slate-200 leading-relaxed font-marathi sm:mt-3 sm:text-base">
            कबड्डी हे केवळ खेळ नाही, ती आमची ओळख आहे. एक गाव, एक संघ, एक स्वप्न!
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4 lg:justify-start">
            <Link to="/players">
              <Button size="lg" className="rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-6 py-5 text-sm font-bold text-white hover:opacity-90 hover:-translate-y-0.5 shadow-xl shadow-black/30 transition-all flex items-center gap-2 sm:px-8 sm:py-6">
                Meet the Team <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/achievements">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border border-white/40 bg-white/10 px-6 py-5 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20 hover:-translate-y-0.5 shadow-sm transition-all sm:px-8 sm:py-6"
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
