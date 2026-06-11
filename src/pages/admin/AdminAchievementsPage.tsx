import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Trophy, X, ImageUp } from 'lucide-react'
import {
  useAchievements,
  useCreateAchievement,
  useUpdateAchievement,
  useDeleteAchievement,
} from '../../hooks/useAchievements'
import type { AchievementInsert, AchievementUpdate } from '../../hooks/useAchievements'
import type { Achievement } from '../../types'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { cn, uploadImage } from '../../lib/utils'

const POSITIONS = ['Winner', 'Runner-up', '3rd place'] as const

const achievementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  tournament_name: z.string().min(1, 'Tournament name is required'),
  year: z.coerce.number().int().min(1900, 'Invalid year').max(2100, 'Invalid year'),
  position: z.enum(POSITIONS),
  location: z.string().optional(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof achievementSchema>

const positionBadge: Record<string, string> = {
  Winner: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  'Runner-up': 'bg-gray-100 text-gray-600 border border-gray-200',
  '3rd place': 'bg-orange-100 text-orange-700 border border-orange-200',
}

const defaultFormValues: FormData = {
  title: '',
  tournament_name: '',
  year: new Date().getFullYear(),
  position: 'Winner',
  location: '',
  description: '',
}

export function AdminAchievementsPage() {
  const { data: achievements, isLoading, isError, error } = useAchievements()
  const createAchievement = useCreateAchievement()
  const updateAchievement = useUpdateAchievement()
  const deleteAchievement = useDeleteAchievement()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [trophyFile, setTrophyFile] = useState<File | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingAchievement, setDeletingAchievement] = useState<Achievement | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(achievementSchema) as any,
    defaultValues: defaultFormValues,
  })

  function openAddModal() {
    setEditingAchievement(null)
    setTrophyFile(null)
    reset(defaultFormValues)
    setIsFormOpen(true)
  }

  function openEditModal(a: Achievement) {
    setEditingAchievement(a)
    setTrophyFile(null)
    reset({
      title: a.title,
      tournament_name: a.tournament_name,
      year: a.year,
      position: a.position as FormData['position'],
      location: a.location ?? '',
      description: a.description ?? '',
    })
    setIsFormOpen(true)
  }

  function closeFormModal() {
    setIsFormOpen(false)
    setEditingAchievement(null)
    setTrophyFile(null)
  }

  function openDeleteModal(a: Achievement) {
    setDeletingAchievement(a)
    setIsDeleteOpen(true)
  }

  function closeDeleteModal() {
    setIsDeleteOpen(false)
    setDeletingAchievement(null)
  }

  async function onSubmit(data: FormData) {
    let trophy_image_url: string | null | undefined

    if (trophyFile) {
      trophy_image_url = await uploadImage(trophyFile, 'achievements')
    }

    if (editingAchievement) {
      const patch: AchievementUpdate & { id: string } = { ...data, id: editingAchievement.id }
      if (trophy_image_url !== undefined) {
        patch.trophy_image_url = trophy_image_url
      }
      await updateAchievement.mutateAsync(patch)
    } else {
      await createAchievement.mutateAsync({
        ...data,
        trophy_image_url: trophy_image_url ?? null,
      } as AchievementInsert)
    }

    closeFormModal()
  }

  async function handleDelete() {
    if (!deletingAchievement) return
    await deleteAchievement.mutateAsync(deletingAchievement.id)
    closeDeleteModal()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {(error as Error)?.message ?? 'Failed to load achievements.'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
        <Button onClick={openAddModal}>
          <Plus size={18} /> Add Achievement
        </Button>
      </div>

      {!achievements || achievements.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-white py-20 shadow-sm">
          <Trophy size={40} className="text-gray-300" />
          <p className="text-sm text-gray-500">No achievements yet.</p>
          <Button variant="outline" size="sm" onClick={openAddModal}>
            <Plus size={16} /> Add your first achievement
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Tournament</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {achievements.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.title}</td>
                  <td className="px-4 py-3 text-gray-600">{a.tournament_name}</td>
                  <td className="px-4 py-3 text-gray-600">{a.year}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        positionBadge[a.position] ?? 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {a.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.location ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => openEditModal(a)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(a)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeFormModal() }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingAchievement ? 'Edit Achievement' : 'Add Achievement'}
              </h2>
              <button
                onClick={closeFormModal}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
              <Input
                label="Title"
                placeholder="e.g. District Champions"
                error={errors.title?.message}
                {...register('title')}
              />
              <Input
                label="Tournament Name"
                placeholder="e.g. Maharashtra State Kabaddi Championship"
                error={errors.tournament_name?.message}
                {...register('tournament_name')}
              />
              <Input
                label="Year"
                type="number"
                placeholder="2025"
                error={errors.year?.message}
                {...register('year')}
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
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.position && <p className="mt-1 text-xs text-red-500">{errors.position.message}</p>}
              </div>

              <Input
                label="Location"
                placeholder="e.g. Mumbai, Maharashtra"
                error={errors.location?.message}
                {...register('location')}
              />

              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the achievement..."
                  className={cn(
                    'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400',
                    'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20',
                    errors.description ? 'border-red-400' : 'border-gray-300',
                  )}
                  {...register('description')}
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
              </div>

              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Trophy Image</label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setTrophyFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <ImageUp size={16} />
                    {trophyFile ? trophyFile.name : 'Choose file'}
                  </button>
                  {editingAchievement?.trophy_image_url && !trophyFile && (
                    <span className="text-xs text-gray-400">Current image kept</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeFormModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Saving...'
                    : editingAchievement
                      ? 'Update'
                      : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteOpen && deletingAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal() }}
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete Achievement</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete <strong>{deletingAchievement.title}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={deleteAchievement.isPending}
              >
                {deleteAchievement.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
