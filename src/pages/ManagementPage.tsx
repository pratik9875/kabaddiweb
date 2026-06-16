import { useManagement } from '../hooks/useManagement'
import { Spinner } from '../components/ui/Spinner'
import { Container } from '../components/ui/Container'
import { Phone, Mail, UserCircle2 } from 'lucide-react'

export function ManagementPage() {
  const { data: members, isLoading, isError } = useManagement()

  if (isLoading) {
    return (
      <Container className="py-20 flex justify-center">
        <Spinner />
      </Container>
    )
  }

  if (isError) {
    return (
      <Container className="py-20 text-center text-red-600">
        Failed to load management details.
      </Container>
    )
  }

  if (!members?.length) {
    return (
      <Container className="py-20 text-center text-gray-500">
        <UserCircle2 size={64} className="mx-auto mb-4 text-gray-200" />
        <p className="font-medium">Management details coming soon.</p>
      </Container>
    )
  }

  return (
    <section className="px-6 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Management</h1>
        <p className="mt-1 text-sm text-gray-500">Meet our coaching staff and management team</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {members.map((m) => (
          <div
            key={m.id}
            className="group relative rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative h-56 bg-gradient-to-br from-orange-50 to-rose-50 overflow-hidden">
              {m.photo_url ? (
                <img
                  src={m.photo_url}
                  alt={m.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserCircle2 size={80} className="text-orange-200" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-base font-bold text-gray-900">{m.name}</h2>
              <span className="mt-1 inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                {m.role}
              </span>
              {(m.phone || m.email) && (
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  {m.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} />
                      {m.phone}
                    </div>
                  )}
                  {m.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail size={12} />
                      {m.email}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />
          </div>
        ))}
      </div>
    </section>
  )
}
