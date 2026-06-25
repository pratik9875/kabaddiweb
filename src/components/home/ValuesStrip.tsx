import { Users, Star, Trophy, Heart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Container } from '../ui/Container'

interface Value {
  icon: LucideIcon
  title: string
  desc: string
}

const VALUES: Value[] = [
  { icon: Users, title: 'एक संघ, एक कुटुंब', desc: 'शिस्त, मेहनत आणि एकोप्याची अखंड परंपरा.' },
  { icon: Star, title: 'परंपरा आणि अभिमान', desc: 'गावाच्या नावाचा डंका वाजवणारी आमची कबड्डीची परंपरा.' },
  { icon: Trophy, title: 'यशाची परंपरा', desc: 'अनेक विजेतेपद आणि असंख्य आठवणी.' },
  { icon: Heart, title: 'गावाचा अभिमान', desc: 'खेळातून घडवतो व्यक्तिमत्व, घडवतो भविष्य!' },
]

export function ValuesStrip() {
  return (
    <div className="relative z-10 -mt-16 px-6 sm:-mt-12">
      <Container>
        <div className="grid gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
          {VALUES.map((v) => {
            const Icon = v.icon
            return (
              <div key={v.title} className="flex items-start gap-4">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[var(--color-primary)]"
                  style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, white)' }}
                >
                  <Icon size={22} />
                </span>
                <div>
                  <h3 className="font-marathi font-bold text-slate-800">{v.title}</h3>
                  <p className="font-marathi mt-1 text-sm leading-relaxed text-slate-500">{v.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </div>
  )
}
