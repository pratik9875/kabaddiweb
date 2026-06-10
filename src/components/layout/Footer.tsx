import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { Container } from '../ui/Container'

export function Footer() {
  const settings = useSettingsStore((s) => s.settings)
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-slate-50/50 border-t border-slate-100 text-slate-600 rounded-b-[2.5rem] relative z-10 backdrop-blur-sm">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight font-marathi">{settings.team_name}</h3>
          {settings.tagline && <p className="mt-2 text-sm leading-relaxed">{settings.tagline}</p>}
          {settings.founded_year && (
            <p className="mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Est. {settings.founded_year}</p>
          )}
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-slate-800">Explore</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link to="/players" className="hover:text-[var(--color-primary)] transition-colors">Players</Link></li>
            <li><Link to="/achievements" className="hover:text-[var(--color-primary)] transition-colors">Achievements</Link></li>
            <li><Link to="/donors" className="hover:text-[var(--color-primary)] transition-colors">Donors</Link></li>
            <li><Link to="/contact" className="hover:text-[var(--color-primary)] transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-slate-800">Get in touch</h4>
          <ul className="space-y-2 text-sm font-medium">
            {settings.contact_email && (
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-slate-400" /> {settings.contact_email}
              </li>
            )}
            {settings.contact_phone && (
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-slate-400" /> {settings.contact_phone}
              </li>
            )}
            {settings.address && (
              <li className="flex items-center gap-2">
                <MapPin size={15} className="text-slate-400" /> {settings.address}
              </li>
            )}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="rounded-xl bg-white border border-slate-200 px-4 py-2 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] shadow-sm hover:shadow transition-all">Facebook</a>
            )}
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="rounded-xl bg-white border border-slate-200 px-4 py-2 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] shadow-sm hover:shadow transition-all">Instagram</a>
            )}
            {settings.youtube_url && (
              <a href={settings.youtube_url} target="_blank" rel="noreferrer" className="rounded-xl bg-white border border-slate-200 px-4 py-2 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] shadow-sm hover:shadow transition-all">YouTube</a>
            )}
          </div>
        </div>
      </Container>

      <div className="border-t border-slate-200/50 py-6 text-center text-xs font-semibold text-slate-400">
        © {year} <span className="font-marathi">{settings.team_name}</span>. All rights reserved.
      </div>
    </footer>
  )
}
