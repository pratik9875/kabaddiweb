import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, X, Star, Upload, Image as ImageIcon } from 'lucide-react'
import {
  useGallery,
  useCreateGalleryItem,
  useUpdateGalleryItem,
  useDeleteGalleryItem,
} from '../../hooks/useGallery'
import type { GalleryInsert, GalleryUpdate } from '../../hooks/useGallery'
import type { Gallery } from '../../types'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ImageCropModal } from '../../components/ui/ImageCropModal'
import { cn, uploadImage } from '../../lib/utils'

const CATEGORIES = ['Match', 'Practice', 'Event', 'Award'] as const

const gallerySchema = z.object({
  caption: z.string().optional(),
  category: z.enum(CATEGORIES).optional(),
  year: z.coerce.number().int().min(1900, 'Invalid year').max(2100, 'Invalid year').optional(),
  is_featured: z.boolean().default(false),
})

type FormData = z.infer<typeof gallerySchema>

const defaultFormValues: FormData = {
  caption: '',
  category: undefined,
  year: new Date().getFullYear(),
  is_featured: false,
}

export function AdminGalleryPage() {
  const { data: images, isLoading, isError, error } = useGallery()
  const createGalleryItem = useCreateGalleryItem()
  const updateGalleryItem = useUpdateGalleryItem()
  const deleteGalleryItem = useDeleteGalleryItem()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Gallery | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<Gallery | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropIndex, setCropIndex] = useState(0)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(gallerySchema) as any,
    defaultValues: defaultFormValues,
  })

  function openAddModal() {
    setEditingItem(null)
    setSelectedFiles([])
    setPendingFiles([])
    setCropIndex(0)
    reset(defaultFormValues)
    setIsFormOpen(true)
  }

  function openEditModal(item: Gallery) {
    setEditingItem(item)
    setSelectedFiles([])
    setPendingFiles([])
    reset({
      caption: item.caption ?? '',
      category: (item.category as FormData['category']) ?? undefined,
      year: item.year ?? new Date().getFullYear(),
      is_featured: item.is_featured,
    })
    setIsFormOpen(true)
  }

  function closeFormModal() {
    setIsFormOpen(false)
    setEditingItem(null)
    setSelectedFiles([])
    setPendingFiles([])
  }

  function openDeleteModal(item: Gallery) {
    setDeletingItem(item)
    setIsDeleteOpen(true)
  }

  function closeDeleteModal() {
    setIsDeleteOpen(false)
    setDeletingItem(null)
  }

  async function onSubmit(data: FormData) {
    if (editingItem) {
      const patch: GalleryUpdate & { id: string } = {
        caption: data.caption || null,
        category: data.category || null,
        year: data.year ?? null,
        is_featured: data.is_featured,
        id: editingItem.id,
      }
      await updateGalleryItem.mutateAsync(patch)
      closeFormModal()
      return
    }

    const filesToUpload = pendingFiles.length > 0 ? pendingFiles : []
    if (filesToUpload.length === 0 && !editingItem) return

    for (const file of filesToUpload) {
      const imageUrl = await uploadImage(file, 'gallery')
      await createGalleryItem.mutateAsync({
        image_url: imageUrl,
        caption: data.caption || null,
        category: data.category || null,
        year: data.year ?? null,
        is_featured: data.is_featured,
      } as GalleryInsert)
    }

    closeFormModal()
  }

  async function handleDelete() {
    if (!deletingItem) return
    await deleteGalleryItem.mutateAsync(deletingItem.id)
    closeDeleteModal()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {(error as Error)?.message ?? 'Failed to load gallery.'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        <Button onClick={openAddModal}>
          <Plus size={18} /> Upload Images
        </Button>
      </div>

      {!images || images.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-white py-20 shadow-sm">
          <ImageIcon size={40} className="text-gray-300" />
          <p className="text-sm text-gray-500">No images yet.</p>
          <Button variant="outline" size="sm" onClick={openAddModal}>
            <Upload size={16} /> Upload your first image
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl bg-white shadow-sm"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.caption ?? 'Gallery image'}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {item.caption && (
                  <p className="text-sm font-medium text-white">{item.caption}</p>
                )}
              </div>

              <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                {item.category && (
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-gray-700 backdrop-blur-sm">
                    {item.category}
                  </span>
                )}
                {item.year && (
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-gray-700 backdrop-blur-sm">
                    {item.year}
                  </span>
                )}
              </div>

              {item.is_featured && (
                <div className="absolute right-2 top-2">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                </div>
              )}

              <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button
                  onClick={() => openEditModal(item)}
                  className="rounded-lg bg-white/90 p-1.5 text-gray-600 backdrop-blur-sm transition-colors hover:bg-white hover:text-gray-900"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => openDeleteModal(item)}
                  className="rounded-lg bg-white/90 p-1.5 text-gray-600 backdrop-blur-sm transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
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
                {editingItem ? 'Edit Image' : 'Upload Image'}
              </h2>
              <button
                onClick={closeFormModal}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
              {!editingItem && (
                <div className="w-full">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Images</label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? [])
                        setSelectedFiles(files)
                        setPendingFiles([])
                        setCropIndex(0)
                        if (files.length > 0) {
                          setCropSrc(URL.createObjectURL(files[0]))
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      <Upload size={16} />
                      {selectedFiles.length > 0
                        ? `${selectedFiles.length} file(s) selected`
                        : 'Choose files'}
                    </button>
                  </div>
                </div>
              )}

              <Input
                label="Caption"
                placeholder="Image caption..."
                error={errors.caption?.message}
                {...register('caption')}
              />

              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
                <select
                  className={cn(
                    'h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-gray-900 outline-none transition-colors',
                    'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20',
                    errors.category ? 'border-red-400' : 'border-gray-300',
                  )}
                  {...register('category')}
                >
                  <option value="">None</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
              </div>

              <Input
                label="Year"
                type="number"
                placeholder={String(new Date().getFullYear())}
                error={errors.year?.message}
                {...register('year')}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  {...register('is_featured')}
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                  Featured image
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeFormModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || (!editingItem && pendingFiles.length === 0)}>
                  {isSubmitting
                    ? 'Saving...'
                    : editingItem
                      ? 'Update'
                      : 'Upload'}
                </Button>
              </div>
            </form>
          </div>

          <ImageCropModal
            open={!!cropSrc}
            imageSrc={cropSrc ?? ''}
            aspect={4 / 3}
            onComplete={(cropped) => {
              const next = cropIndex + 1
              setPendingFiles((prev) => [...prev, cropped])
              if (next < selectedFiles.length) {
                setCropIndex(next)
                setCropSrc(URL.createObjectURL(selectedFiles[next]))
              } else {
                setCropSrc(null)
              }
            }}
            onClose={() => {
              setCropSrc(null)
              setPendingFiles(selectedFiles)
            }}
          />
        </div>
      )}

      {isDeleteOpen && deletingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal() }}
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete Image</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={deleteGalleryItem.isPending}
              >
                {deleteGalleryItem.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
