import { Construction } from 'lucide-react'

interface AdminPlaceholderPageProps {
  title: string
}

/** Temporary admin page for CRUD sections built in a later phase. */
export function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="grid place-items-center rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
        <Construction size={32} className="mb-3 text-gray-400" />
        <p className="font-medium text-gray-600">{title} management coming soon</p>
        <p className="text-sm text-gray-400">Built in the CRUD phase.</p>
      </div>
    </div>
  )
}
