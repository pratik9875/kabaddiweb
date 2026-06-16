import { useAchievements } from '../hooks/useAchievements'
import { Spinner } from '../components/ui/Spinner'
import { Trophy, MapPin, Medal } from 'lucide-react'

const POSITION_COLORS: Record<string, string> = {
  'Winner': 'bg-yellow-100 text-yellow-700',
  'Runner-up': 'bg-gray-100 text-gray-700',
  '3rd place': 'bg-orange-100 text-orange-700',
}

export function AchievementsPage() {
  const { data: achievements, isLoading, isError } = useAchievements()

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-20 text-center text-red-600">
        Failed to load achievements.
      </div>
    )
  }

  if (!achievements?.length) {
    return (
      <div className="py-20 text-center text-gray-500">
        <Trophy size={64} className="mx-auto mb-4 text-gray-200" />
        <p className="font-medium">No achievements yet.</p>
      </div>
    )
  }

  return (
    <section className="px-6 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Achievements</h1>
        <p className="mt-1 text-sm text-gray-500">Our proudest moments on the mat</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => (
          <div
            key={a.id}
            className="group relative rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {a.trophy_image_url ? (
              <div className="relative h-48 bg-gradient-to-br from-orange-50 to-rose-50 overflow-hidden">
                <img
                  src={a.trophy_image_url}
                  alt={a.title}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center">
                <Trophy size={64} className="text-orange-200" />
              </div>
            )}

            <div className="p-4">
              <h2 className="text-base font-bold text-gray-900">{a.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{a.tournament_name}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {a.position && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${POSITION_COLORS[a.position] ?? 'bg-blue-100 text-blue-700'}`}>
                    <Medal size={12} /> {a.position}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                  <Trophy size={12} /> {a.year}
                </span>
              </div>

              {a.location && (
                <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={11} /> {a.location}
                </p>
              )}

              {a.description && (
                <p className="mt-2 text-xs text-gray-500 line-clamp-2">{a.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
