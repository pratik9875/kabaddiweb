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
    <section className="relative isolate overflow-hidden w-full min-h-[480px] flex items-stretch pt-8 pb-10 sm:min-h-[560px] sm:items-center sm:py-16 lg:min-h-[640px] lg:py-24">
      <img
        src={heroImage}
        alt={settings.team_name ?? 'Kabaddi team in action'}
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[30%_30%]"
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

      <Container className="relative flex h-full flex-col justify-between px-6 animate-fadeIn">
        <div className="flex max-w-[75%] flex-col items-start text-left sm:max-w-md lg:max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] shadow-sm backdrop-blur-md sm:mb-6">
            <Trophy size={14} className="text-[var(--color-secondary)]" /> {settings.tagline ?? 'Pride of the Village'}
          </span>

          <h1
            className="max-w-xl text-3xl font-black leading-[1.3] tracking-tight text-[var(--color-primary)] sm:text-5xl lg:text-6xl"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.75), 0 1px 2px rgba(0,0,0,0.9)' }}
          >
            <span className="font-marathi">{settings.hero_title ?? settings.team_name}</span>
          </h1>
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
          <Link to="/players">
            <Button className="rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-4 py-2.5 text-xs font-bold text-white hover:opacity-90 hover:-translate-y-0.5 shadow-xl shadow-black/30 transition-all flex items-center gap-2 sm:px-5 sm:py-3 sm:text-sm">
              Meet the Team <ArrowRight size={14} />
            </Button>
          </Link>
          <Link to="/achievements">
            <Button
              variant="outline"
              className="rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 hover:-translate-y-0.5 shadow-sm transition-all sm:px-5 sm:py-3 sm:text-sm"
            >
              Our Achievements
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  )
}
