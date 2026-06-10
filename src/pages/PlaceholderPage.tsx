import { Link } from 'react-router-dom'
import { Construction, ArrowLeft } from 'lucide-react'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'

interface PlaceholderPageProps {
  title: string
}

/** Temporary page for routes built in later phases. */
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span
        className="mb-5 grid h-16 w-16 place-items-center rounded-2xl text-white"
        style={{ background: 'var(--color-primary)' }}
      >
        <Construction size={28} />
      </span>
      <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-500">This section is coming in a later phase.</p>
      <Link to="/" className="mt-6">
        <Button variant="outline">
          <ArrowLeft size={16} /> Back home
        </Button>
      </Link>
    </Container>
  )
}
