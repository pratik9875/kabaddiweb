import { useState, useMemo, useRef, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  usePlayers,
  useCreatePlayer,
  useUpdatePlayer,
  useDeletePlayer,
  useReorderPlayers,
  type PlayerInsert,
  type PlayerUpdate,
} from '../../hooks/usePlayers'
import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { ImageCropModal } from '../../components/ui/ImageCropModal'
import { cn, formatDateIN, normalizeImageFile, uploadImage } from '../../lib/utils'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserCircle2,
  RotateCw,
  AlertCircle,
  X,
  Camera,
  GripVertical,
} from 'lucide-react'
import type { Player, PlayerPosition } from '../../types'

const playerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  jersey_number: z.coerce.number().min(0).nullable().optional(),
  position: z.string().nullable().optional(),
  weight: z.coerce.number().min(0).nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  joined_year: z.coerce.number().int().min(1900).nullable().optional(),
  photo_url: z.string().nullable().optional(),
})

type PlayerFormValues = z.infer<typeof playerSchema>

const POSITIONS: PlayerPosition[] = ['Raider', 'Defender', 'All-rounder']

const TABLE_HEADERS = ['', 'Photo', 'Name', 'Jersey #', 'Position', 'Weight', 'DOB', 'Actions']

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-2 py-3"><div className="h-5 w-5 rounded bg-gray-200" /></td>
      {Array.from({ length: TABLE_HEADERS.length - 1 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-5 rounded bg-gray-200" style={{ width: i === 2 ? 120 : 60 }} />
        </td>
      ))}
    </tr>
  )
}

interface PlayerFormModalProps {
  player?: Player | null
  onClose: () => void
}

function PlayerFormModal({ player, onClose }: PlayerFormModalProps) {
  const createPlayer = useCreatePlayer()
  const updatePlayer = useUpdatePlayer()
  const isEdit = !!player
  const fileRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(player?.photo_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<PlayerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(playerSchema) as any,
    defaultValues: {
      name: player?.name ?? '',
      jersey_number: player?.jersey_number ?? null,
      position: player?.position ?? null,
      weight: player?.weight ?? null,
      date_of_birth: player?.date_of_birth ? player.date_of_birth.slice(0, 10) : '',
      phone: player?.phone ?? '',
      joined_year: player?.joined_year ?? null,
      photo_url: player?.photo_url ?? null,
    },
  })

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const normalized = await normalizeImageFile(file)
    setCropSrc(URL.createObjectURL(normalized))
  }

  const handleCropComplete = async (cropped: File) => {
    setPhotoPreview(URL.createObjectURL(cropped))
    setUploading(true)
    setUploadError(null)
    try {
      const url = await uploadImage(cropped, 'players')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue('photo_url' as any, url)
    } catch (e) {
      setPhotoPreview(player?.photo_url ?? null)
      setUploadError(e instanceof Error ? e.message : 'Photo upload failed')
    } finally {
      setUploading(false)
      setCropSrc(null)
    }
  }

  const onSubmit = async (data: PlayerFormValues) => {
    const payload = {
      ...data,
      position: data.position || null,
      date_of_birth: data.date_of_birth || null,
      phone: data.phone || null,
    }
    if (isEdit && player) {
      updatePlayer.mutate({ id: player.id, ...payload } as PlayerUpdate & { id: string })
    } else {
      createPlayer.mutate(payload as unknown as PlayerInsert)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-lg font-bold text-gray-900">
          {isEdit ? 'Edit Player' : 'Add Player'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-center">
            <label className="relative cursor-pointer">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Camera size={24} className="text-gray-400" />
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <span className="mt-1 block text-center text-xs text-gray-500">
                {uploading ? 'Uploading...' : 'Photo'}
              </span>
            </label>
            {uploadError && (
              <p className="mt-2 text-center text-xs text-red-600">{uploadError}</p>
            )}
          </div>

          <Input label="Name" error={errors.name?.message} {...register('name')} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Jersey #"
              type="number"
              error={errors.jersey_number?.message}
              {...register('jersey_number')}
            />
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Position</label>
              <select
                className={cn(
                  'h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-gray-900 outline-none transition-colors',
                  'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20',
                  errors.position ? 'border-red-400' : 'border-gray-300',
                )}
                {...register('position')}
              >
                <option value="">Select position</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.position && <p className="mt-1 text-xs text-red-500">{errors.position.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              error={errors.weight?.message}
              {...register('weight')}
            />
            <Input
              label="Date of Birth"
              type="date"
              error={errors.date_of_birth?.message}
              {...register('date_of_birth')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Joined Year"
              type="number"
              error={errors.joined_year?.message}
              {...register('joined_year')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || uploading}>
              {isSubmitting || uploading ? <Spinner size={16} /> : null}
              {isEdit ? 'Update' : 'Add'} Player
            </Button>
          </div>
        </form>
      </div>

      <ImageCropModal
        open={!!cropSrc}
        imageSrc={cropSrc ?? ''}
        aspect={1}
        onComplete={handleCropComplete}
        onClose={() => { setCropSrc(null) }}
      />
    </div>
  )
}

export function AdminPlayersPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const [tab, setTab] = useState<'current' | 'retired'>('current')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Player | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const reorderPlayers = useReorderPlayers()

  const includeRetired = tab === 'retired'
  const { data: players, isLoading, isError, error, refetch } = usePlayers(includeRetired)
  const { mutate: deletePlayer, isPending: isDeleting } = useDeletePlayer()

  const filtered = useMemo(() => {
    if (!players) return []
    if (!search.trim()) return players
    const q = search.toLowerCase()
    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.jersey_number ?? '').includes(q),
    )
  }, [players, search])

  const handleDelete = () => {
    if (!confirmDelete) return
    deletePlayer(confirmDelete.id)
    setConfirmDelete(null)
  }

  const openAdd = () => {
    setEditingPlayer(null)
    setModalOpen(true)
  }

  const openEdit = (player: Player) => {
    setEditingPlayer(player)
    setModalOpen(true)
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const items = [...filtered]
    const [moved] = items.splice(dragIndex, 1)
    items.splice(index, 0, moved)
    setDragIndex(index)
    const reordered = items.map((item, i) => ({ id: item.id, sort_order: i }))
    reorderPlayers.mutate(reordered)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Players</h1>
        {isAdmin && (
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Player
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(['current', 'retired'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch('') }}
              className={cn(
                'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
                tab === t
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              {t === 'current' ? 'Current Players' : 'Retired Players'}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>

        {isError && (
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RotateCw size={14} /> Retry
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {TABLE_HEADERS.map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <AlertCircle size={40} className="mb-3 text-red-400" />
          <p className="font-medium text-gray-700">Failed to load players</p>
          <p className="mt-1 text-sm text-gray-500">{error?.message ?? 'Something went wrong'}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            <RotateCw size={14} /> Try Again
          </Button>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <UserCircle2 size={48} className="mb-3 text-gray-200" />
          <p className="font-medium text-gray-700">
            {search ? 'No players match your search' : `No ${tab === 'retired' ? 'retired ' : ''}players yet`}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {search ? 'Try a different name' : isAdmin ? 'Add your first player to get started' : ''}
          </p>
          {isAdmin && !search && (
            <Button className="mt-4" onClick={openAdd}>
              <Plus size={16} /> Add Player
            </Button>
          )}
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((player, index) => (
                  <tr
                    key={player.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'border-b border-gray-50 transition-colors hover:bg-gray-50/50',
                      dragIndex === index && 'opacity-50',
                    )}
                  >
                    <td className="px-2 py-3">
                      <span className="inline-flex cursor-grab text-gray-400 active:cursor-grabbing">
                        <GripVertical size={16} />
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                        {player.photo_url ? (
                          <img
                            src={player.photo_url}
                            alt={player.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center">
                            <UserCircle2 size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{player.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">#{player.jersey_number ?? '—'}</td>
                    <td className="px-4 py-3">
                      {player.position ? (
                        <span className="inline-block rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                          {player.position}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {player.weight ? `${player.weight} kg` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDateIN(player.date_of_birth)}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(player)}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(player)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <PlayerFormModal player={editingPlayer} onClose={() => { setModalOpen(false); setEditingPlayer(null) }} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Player?</h3>
            <p className="mt-1 text-sm text-gray-500">
              Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Spinner size={16} /> : null}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
