import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePlayers, useDeletePlayer } from '../hooks/usePlayers'
import { Spinner } from '../components/ui/Spinner'
import { useAuthStore } from '../store/authStore'
import { UserCircle2, Pencil, Trash2, X, Phone, Calendar, Weight, Hash, Medal } from 'lucide-react'
import { formatDateIN } from '../lib/utils'
import type { Player } from '../types'

export function PlayersPage() {
  const { data: players, isLoading, isError, error } = usePlayers()
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const { mutate: deletePlayer } = useDeletePlayer()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const handleDelete = (id: string) => {
    deletePlayer(id)
    setConfirmDelete(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Failed to load players.</p>
        {error instanceof Error && <pre className="mt-2 text-xs">{error.message}</pre>}
      </div>
    )
  }

  return (
    <section className="px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Our Players</h1>
          <p className="mt-1 text-sm text-gray-500">Meet the squad of Shree Krishna Krida Mandal</p>
        </div>
        {isAdmin && (
          <Link
            to="/players/add"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white font-semibold rounded-xl shadow-md hover:bg-[var(--color-primary)]/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            + Add Player
          </Link>
        )}
      </div>

      {/* Empty state */}
      {(!players || players.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <UserCircle2 size={64} className="text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">No players yet.</p>
          {isAdmin && (
            <Link
              to="/players/add"
              className="mt-4 inline-block px-5 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary)]/90 transition-colors"
            >
              + Add First Player
            </Link>
          )}
        </div>
      )}

      {/* Player Grid */}
      {players && players.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {players.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlayer(p)}
              className="group relative rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              {/* Admin action buttons */}
              {isAdmin && (
                <div className="absolute top-3 left-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Link
                    to={`/players/edit/${p.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white shadow transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(p.id) }}
                    className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white shadow transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {/* Photo */}
              <div className="relative h-56 bg-gradient-to-br from-orange-50 to-rose-50 overflow-hidden">
                {p.photo_url ? (
                  <img
                    src={p.photo_url}
                    alt={p.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserCircle2 size={80} className="text-orange-200" />
                  </div>
                )}
                {/* Jersey badge */}
                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-black shadow-lg">
                  #{p.jersey_number}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h2 className="text-base font-bold text-gray-900 truncate">{p.name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {p.position && (
                    <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                      {p.position}
                    </span>
                  )}
                  {p.weight && (
                    <span className="text-xs text-gray-500">{p.weight} kg</span>
                  )}
                </div>
              </div>

              {/* Bottom accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Player?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player detail modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedPlayer(null)}>
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-gray-500 backdrop-blur hover:bg-white hover:text-gray-800"
            >
              <X size={18} />
            </button>

            {/* Photo */}
            <div className="bg-gradient-to-br from-orange-50 to-rose-50">
              {selectedPlayer.photo_url ? (
                <img src={selectedPlayer.photo_url} alt={selectedPlayer.name} className="aspect-[3/4] max-h-80 w-full object-cover object-top" />
              ) : (
                <div className="flex h-48 items-center justify-center">
                  <UserCircle2 size={96} className="text-orange-200" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedPlayer.name}</h2>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedPlayer.position && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-0.5 text-xs font-semibold text-orange-700">
                      <Medal size={12} /> {selectedPlayer.position}
                    </span>
                  )}
                  {selectedPlayer.jersey_number && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">
                      <Hash size={12} /> #{selectedPlayer.jersey_number}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedPlayer.date_of_birth && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    <span>DOB: {formatDateIN(selectedPlayer.date_of_birth)}</span>
                  </div>
                )}
                {selectedPlayer.joined_year && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    <span>Joined: {selectedPlayer.joined_year}</span>
                  </div>
                )}
                {selectedPlayer.weight && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Weight size={14} className="text-gray-400" />
                    <span>{selectedPlayer.weight} kg</span>
                  </div>
                )}
                {selectedPlayer.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <span>{selectedPlayer.phone}</span>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Link
                    to={`/players/edit/${selectedPlayer.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil size={14} /> Edit
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
