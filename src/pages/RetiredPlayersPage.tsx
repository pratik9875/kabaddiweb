import { usePlayers } from '../hooks/usePlayers'
import { Card } from '../components/ui/Card'

/**
 * Page that lists retired players (includeRetired = true).
 */
export function RetiredPlayersPage() {
  const { data: players, isLoading, isError } = usePlayers(true)

  if (isLoading) return <div className="flex justify-center py-20">Loading...</div>
  if (isError) return <div className="p-8 text-center text-red-600">Error loading retired players.</div>
  if (!players?.length) return <div className="p-8 text-center text-gray-600">No retired players.</div>

  return (
    <section className="p-4">
      <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">Retired Players</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {players.map(p => (
          <Card key={p.id} className="flex flex-col h-full">
            {p.photo_url && (
              <img src={p.photo_url} alt={p.name} className="mb-4 h-48 w-full object-cover rounded" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">{p.name}</h2>
            <p className="text-sm text-gray-600">#{p.jersey_number} – {p.position}{p.weight ? ` • ${p.weight} kg` : ''}</p>
            <p className="mt-auto text-sm text-gray-700">Matches: {p.total_matches ?? 0}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
