import { useSettingsStore } from '../store/settingsStore'
import { Container } from '../components/ui/Container'
import { HeroBanner } from '../components/home/HeroBanner'
import { ValuesStrip } from '../components/home/ValuesStrip'
import { StatsCounter } from '../components/home/StatsCounter'
import { HighlightsSection } from '../components/home/HighlightsSection'

export function HomePage() {
  const settings = useSettingsStore((s) => s.settings)

  return (
    <>
      <HeroBanner />
      <ValuesStrip />
      <StatsCounter />
      <HighlightsSection />

      {settings.about_text && (
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 pointer-events-none" />
          <Container className="max-w-4xl text-center relative z-10">
            <h2 className="text-4xl font-black tracking-tight text-slate-800">About Us</h2>
            <p className="mt-8 text-xl leading-relaxed text-slate-600">
              {settings.about_text}
            </p>
          </Container>
        </section>
      )}
    </>
  )
}
