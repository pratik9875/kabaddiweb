import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, X, Upload, Search } from 'lucide-react'
import {
  useManagement,
  useCreateManagement,
  useUpdateManagement,
  useDeleteManagement,
  type ManagementInsert,
  type ManagementUpdate,
} from '../../hooks/useManagement'
import type { ManagementMember } from '../../types'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { ImageCropModal } from '../../components/ui/ImageCropModal'
import { cn, normalizeImageFile, uploadImage } from '../../lib/utils'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  joined_year: z.coerce.number().int().min(1900).max(2100).optional().or(z.nan().transform(() => undefined)),
  bio: z.string().optional(),
  sort_order: z.coerce.number().int().default(0),
})

type FormValues = z.infer<typeof formSchema>

interface ManagementFormModalProps {
  open: boolean
  editingMember: ManagementMember | null
  onClose: () => void
}

const defaultValues: FormValues = {
  name: '',
  role: '',
  phone: '',
  email: '',
  joined_year: undefined,
  bio: '',
  sort_order: 0,
}

function ManagementFormModal({ open, editingMember, onClose }: ManagementFormModalProps) {
  const createMutation = useCreateManagement()
  const updateMutation = useUpdateManagement()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  })

  const isEditing = !!editingMember

  if (!open) return null

  const handleOpenChange = () => {
    if (!isSubmitting) {
      reset(defaultValues)
      setPhotoFile(null)
      setPhotoPreview(null)
      onClose()
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const normalized = await normalizeImageFile(file)
      setCropSrc(URL.createObjectURL(normalized))
    }
  }

  const handleCropComplete = (cropped: File) => {
    setPhotoFile(cropped)
    setPhotoPreview(URL.createObjectURL(cropped))
    setCropSrc(null)
  }

  const onSubmit = async (values: FormValues) => {
    try {
      let photo_url: string | null = null
      if (photoFile) {
        photo_url = await uploadImage(photoFile, 'management')
      }

      if (isEditing && editingMember) {
        const patch: ManagementUpdate & { id: string } = {
          id: editingMember.id,
          ...values,
          joined_year: values.joined_year || null,
          phone: values.phone || null,
          email: values.email || null,
          bio: values.bio || null,
          sort_order: values.sort_order,
        }
        if (photo_url) patch.photo_url = photo_url
        await updateMutation.mutateAsync(patch)
      } else {
        const input: ManagementInsert = {
          ...values,
          photo_url: photo_url ?? null,
          joined_year: values.joined_year || null,
          phone: values.phone || null,
          email: values.email || null,
          bio: values.bio || null,
          sort_order: values.sort_order,
          is_active: true,
        }
        await createMutation.mutateAsync(input)
      }
      reset(defaultValues)
      setPhotoFile(null)
      setPhotoPreview(null)
      onClose()
    } catch {
      // error handled by mutation state
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Management Member' : 'Add Management Member'}
          </h2>
          <button
            type="button"
            onClick={handleOpenChange}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6" noValidate>
          <Input
            label="Name"
            placeholder="Full name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Role"
            placeholder="e.g. Head Coach"
            error={errors.role?.message}
            {...register('role')}
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                label="Phone"
                type="tel"
                placeholder="+91 98765 43210"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Email"
                type="email"
                placeholder="coach@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                label="Joined Year"
                type="number"
                placeholder="2024"
                error={errors.joined_year?.message}
                {...register('joined_year')}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Sort Order"
                type="number"
                placeholder="0"
                error={errors.sort_order?.message}
                {...register('sort_order')}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              rows={3}
              placeholder="Brief description..."
              className={cn(
                'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400',
                'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20',
                errors.bio ? 'border-red-400' : 'border-gray-300',
              )}
              {...register('bio')}
            />
            {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Photo</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700">
              <Upload size={16} />
              <span>{photoFile ? photoFile.name : 'Upload photo'}</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoChange}
              />
            </label>
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="mt-2 h-16 w-16 rounded-lg object-cover"
              />
            )}
          </div>

          {(createMutation.isError || updateMutation.isError) && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {createMutation.error?.message ?? updateMutation.error?.message ?? 'Something went wrong'}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleOpenChange} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size={18} className="text-white" /> : isEditing ? 'Update' : 'Add Member'}
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
  )
}

interface DeleteConfirmModalProps {
  open: boolean
  memberName: string
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

function DeleteConfirmModal({ open, memberName, onConfirm, onCancel, isPending }: DeleteConfirmModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Delete Member</h3>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to delete <strong>{memberName}</strong>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" variant="ghost" onClick={onConfirm} disabled={isPending} className="text-red-600 hover:bg-red-50 hover:text-red-700">
            {isPending ? <Spinner size={18} className="text-red-600" /> : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AdminManagementPage() {
  const { data: members, isLoading, isError, error } = useManagement()
  const deleteMutation = useDeleteManagement()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<ManagementMember | null>(null)
  const [deletingMember, setDeletingMember] = useState<ManagementMember | null>(null)

  const handleAdd = () => {
    setEditingMember(null)
    setModalOpen(true)
  }

  const handleEdit = (member: ManagementMember) => {
    setEditingMember(member)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingMember(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingMember) return
    try {
      await deleteMutation.mutateAsync(deletingMember.id)
      setDeletingMember(null)
    } catch {
      // handled by mutation
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Management</h1>
          <p className="text-sm text-gray-500">Coaching staff and management team</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus size={16} />
          Add Member
        </Button>
      </div>

      {isError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error?.message || 'Failed to load management members. Please try again.'}
        </div>
      )}

      {isLoading ? (
        <div className="grid place-items-center rounded-2xl border border-gray-100 bg-white p-16">
          <Spinner size={32} />
        </div>
      ) : !members || members.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
          <Search size={32} className="mb-3 text-gray-400" />
          <p className="font-medium text-gray-600">No management members yet</p>
          <p className="text-sm text-gray-400">Add your first member to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 font-semibold text-gray-700">Photo</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Phone</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Joined</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Order</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/30">
                  <td className="px-4 py-3">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-gray-100 text-xs font-medium text-gray-500">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                  <td className="px-4 py-3 text-gray-600">{member.role}</td>
                  <td className="px-4 py-3 text-gray-500">{member.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{member.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{member.joined_year ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{member.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(member)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[var(--color-primary)]"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingMember(member)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
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
      )}

      <ManagementFormModal
        open={modalOpen}
        editingMember={editingMember}
        onClose={handleCloseModal}
      />

      <DeleteConfirmModal
        open={!!deletingMember}
        memberName={deletingMember?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingMember(null)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
