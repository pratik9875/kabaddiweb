import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HandCoins, Plus, Pencil, Trash2, X, Upload } from 'lucide-react'
import { useDonors, useCreateDonor, useUpdateDonor, useDeleteDonor } from '../../hooks/useDonors'
import type { PrizeDonor } from '../../types'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { ImageCropModal } from '../../components/ui/ImageCropModal'
import { cn, formatINR, normalizeImageFile, uploadImage } from '../../lib/utils'

const donorSchema = z.object({
  donor_name: z.string().min(1, 'Donor name is required'),
  donor_type: z.enum(['Individual', 'Business', 'Organization']),
  prize_description: z.string().min(1, 'Prize description is required'),
  prize_value: z.coerce.number().min(0, 'Must be 0 or more').nullable(),
  tournament_name: z.string().min(1, 'Tournament name is required'),
  year: z.coerce.number().int().min(1900, 'Enter a valid year').max(2100),
  contact_phone: z.string().nullable(),
  contact_email: z.string().email('Invalid email').nullable().or(z.literal('')),
})

type DonorForm = z.infer<typeof donorSchema>

const DONOR_TYPES = ['Individual', 'Business', 'Organization'] as const

export function AdminDonorsPage() {
  const { data: donors, isLoading, isError, error } = useDonors()
  const createDonor = useCreateDonor()
  const updateDonor = useUpdateDonor()
  const deleteDonor = useDeleteDonor()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingDonor, setEditingDonor] = useState<PrizeDonor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PrizeDonor | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<DonorForm>({ resolver: zodResolver(donorSchema) as any })

  function openCreateModal() {
    setEditingDonor(null)
    setPhotoFile(null)
    setPhotoPreview(null)
    reset({
      donor_name: '',
      donor_type: undefined as unknown as 'Individual' | 'Business' | 'Organization',
      prize_description: '',
      prize_value: null,
      tournament_name: '',
      year: new Date().getFullYear(),
      contact_phone: '',
      contact_email: '',
    })
    setModalOpen(true)
  }

  function openEditModal(donor: PrizeDonor) {
    setEditingDonor(donor)
    setPhotoFile(null)
    setPhotoPreview(donor.photo_url)
    reset({
      donor_name: donor.donor_name,
      donor_type: donor.donor_type as 'Individual' | 'Business' | 'Organization',
      prize_description: donor.prize_description,
      prize_value: donor.prize_value,
      tournament_name: donor.tournament_name,
      year: donor.year,
      contact_phone: donor.contact_phone ?? '',
      contact_email: donor.contact_email ?? '',
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingDonor(null)
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const normalized = await normalizeImageFile(file)
    setCropSrc(URL.createObjectURL(normalized))
  }

  function handleCropComplete(cropped: File) {
    setPhotoFile(cropped)
    setPhotoPreview(URL.createObjectURL(cropped))
    setCropSrc(null)
  }

  const onSubmit = async (values: DonorForm) => {
    try {
      setUploading(true)
      let photoUrl = editingDonor?.photo_url ?? null
      if (photoFile) {
        photoUrl = await uploadImage(photoFile, 'prize_donors')
      }
      const payload = {
        ...values,
        prize_value: values.prize_value ?? null,
        contact_phone: values.contact_phone || null,
        contact_email: values.contact_email || null,
        photo_url: photoUrl,
      }
      if (editingDonor) {
        await updateDonor.mutateAsync({ id: editingDonor.id, ...payload })
      } else {
        await createDonor.mutateAsync(payload)
      }
      closeModal()
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteDonor.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Prize Donors</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">
            {error?.message ?? 'Failed to load donors. Please try again.'}
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prize Donors</h1>
          <p className="text-sm text-gray-500">Manage prize donors and their contributions</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={16} /> Add Donor
        </Button>
      </div>

      {!donors || donors.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gray-100">
            <HandCoins size={24} className="text-gray-400" />
          </span>
          <p className="font-medium text-gray-600">No prize donors yet</p>
          <p className="text-sm text-gray-400">Add your first prize donor to get started.</p>
          <Button variant="outline" size="sm" onClick={openCreateModal}>
            <Plus size={15} /> Add Donor
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Donor Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Prize Description</th>
                  <th className="px-4 py-3">Prize Value</th>
                  <th className="px-4 py-3">Tournament</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donors.map((donor) => (
                  <tr key={donor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {donor.photo_url ? (
                        <img
                          src={donor.photo_url}
                          alt={donor.donor_name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-gray-100 text-gray-400">
                          <HandCoins size={16} />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{donor.donor_name}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                        donor.donor_type === 'Individual' && 'bg-blue-100 text-blue-700',
                        donor.donor_type === 'Business' && 'bg-purple-100 text-purple-700',
                        donor.donor_type === 'Organization' && 'bg-green-100 text-green-700',
                      )}>
                        {donor.donor_type}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-gray-600">
                      {donor.prize_description}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {donor.prize_value != null ? formatINR(donor.prize_value) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{donor.tournament_name}</td>
                    <td className="px-4 py-3 text-gray-600">{donor.year}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(donor)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(donor)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
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
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingDonor ? 'Edit Donor' : 'Add Donor'}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6" noValidate>
              <Input
                label="Donor Name"
                placeholder="e.g. Acme Corp"
                error={errors.donor_name?.message}
                {...register('donor_name')}
              />

              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Donor Type</label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  {...register('donor_type')}
                >
                  <option value="">Select type…</option>
                  {DONOR_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.donor_type?.message && (
                  <p className="mt-1 text-xs text-red-500">{errors.donor_type.message}</p>
                )}
              </div>

              <Input
                label="Prize Description"
                placeholder="e.g. Best Raider award"
                error={errors.prize_description?.message}
                {...register('prize_description')}
              />

              <Input
                label="Prize Value (₹)"
                type="number"
                placeholder="e.g. 5000"
                error={errors.prize_value?.message}
                {...register('prize_value')}
              />

              <Input
                label="Tournament Name"
                placeholder="e.g. District Kabaddi Cup"
                error={errors.tournament_name?.message}
                {...register('tournament_name')}
              />

              <Input
                label="Year"
                type="number"
                placeholder="e.g. 2025"
                error={errors.year?.message}
                {...register('year')}
              />

              <Input
                label="Contact Phone"
                placeholder="e.g. +91 98765 43210"
                {...register('contact_phone')}
              />

              <Input
                label="Contact Email"
                type="email"
                placeholder="e.g. contact@example.com"
                error={errors.contact_email?.message}
                {...register('contact_email')}
              />

              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Photo</label>
                <div className="flex items-center gap-4">
                  {photoPreview && (
                    <img src={photoPreview} alt="Preview" className="h-14 w-14 rounded-lg object-cover" />
                  )}
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                    <Upload size={16} />
                    {photoFile ? photoFile.name : 'Upload photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || uploading}>
                  {(isSubmitting || uploading) ? (
                    <Spinner size={16} className="text-white" />
                  ) : editingDonor ? (
                    'Save Changes'
                  ) : (
                    'Add Donor'
                  )}
                </Button>
              </div>
            </form>
          </div>

          <ImageCropModal
            open={!!cropSrc}
            imageSrc={cropSrc ?? ''}
            aspect={1}
            onComplete={handleCropComplete}
            onClose={() => setCropSrc(null)}
          />
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Delete Donor</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <strong>{deleteTarget.donor_name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={deleteDonor.isPending}
              >
                {deleteDonor.isPending ? <Spinner size={16} className="text-white" /> : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
