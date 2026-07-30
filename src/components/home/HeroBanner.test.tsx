import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HeroBanner } from './HeroBanner'
import { useSettingsStore, DEFAULT_SETTINGS } from '../../store/settingsStore'

function renderHero() {
  return render(
    <MemoryRouter>
      <HeroBanner />
    </MemoryRouter>,
  )
}

describe('HeroBanner', () => {
  it('renders the team name/hero title from settings', () => {
    renderHero()
    expect(screen.getByText(DEFAULT_SETTINGS.hero_title!)).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    renderHero()
    expect(screen.getByText(DEFAULT_SETTINGS.tagline!)).toBeInTheDocument()
  })

  it('renders both the "Meet the Team" and "Our Achievements" buttons', () => {
    renderHero()
    expect(screen.getByRole('link', { name: /meet the team/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /our achievements/i })).toBeInTheDocument()
  })

  it('links buttons to the correct routes', () => {
    renderHero()
    expect(screen.getByRole('link', { name: /meet the team/i })).toHaveAttribute('href', '/players')
    expect(screen.getByRole('link', { name: /our achievements/i })).toHaveAttribute('href', '/achievements')
  })

  it('falls back to the bundled hero image when hero_image_url is not set', () => {
    renderHero()
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).not.toBe('')
  })

  it('uses a custom hero_image_url from settings when provided', () => {
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, hero_image_url: 'https://example.com/custom-hero.jpg' },
    })
    renderHero()
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toBe('https://example.com/custom-hero.jpg')
    useSettingsStore.setState({ settings: DEFAULT_SETTINGS })
  })
})
