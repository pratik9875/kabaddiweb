import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatePlayer } from '../../hooks/usePlayers'
import { Card } from '../ui/Card'
import { ImageCropModal } from '../ui/ImageCropModal'
import { Loader2, Upload, X, User } from 'lucide-react'
import { supabase, MEDIA_BUCKET, ORG_SLUG } from '../../lib/supabase'

/**
 * Form to add a new player.
 * Supports photo upload to Supabase storage (kabaddi-media bucket).
 * Only accessible to admins.
 */
export function AddPlayerForm() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [jersey, setJersey] = useState('')
  const [position, setPosition] = useState('')
  const [weight, setWeight] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { mutate: createPlayer, isPending, isError, error, isSuccess } = useCreatePlayer()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCropSrc(URL.createObjectURL(file))
  }

  const handleCropComplete = (cropped: File) => {
    setPhotoFile(cropped)
    setPhotoPreview(URL.createObjectURL(cropped))
    setCropSrc(null)
    setUploadError(null)
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null
    const ext = photoFile.name.split('.').pop()
    const path = `${ORG_SLUG}/players/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, photoFile, { upsert: true })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !jersey) return
    setUploading(true)
    setUploadError(null)
    try {
      const photoUrl = await uploadPhoto()
      createPlayer(
        {
          name,
          jersey_number: Number(jersey),
          position,
          weight: weight ? Number(weight) : null,
          photo_url: photoUrl ?? null,
          date_of_birth: null,
          phone: null,
          joined_year: null,
          is_retired: false,
          retired_year: null,
          is_active: true,
        },
        {
          onSuccess: () => navigate('/players'),
        }
      )
    } catch {
      setUploadError('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const busy = isPending || uploading

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg p-8 bg-white shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Player</h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Player Photo</label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors overflow-hidden bg-gray-50"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <User size={28} />
                    <span className="text-xs mt-1">Photo</span>
                  </div>
                )}
              </div>
              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <Upload size={15} /> Choose Photo
                </button>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <X size={15} /> Remove
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. Ravi Sharma"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Jersey Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jersey # <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={jersey}
              onChange={e => setJersey(e.target.value)}
              required
              placeholder="e.g. 7"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 75"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <select
              value={position}
              onChange={e => setPosition(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
            >
              <option value="">-- Select Position --</option>
              <option value="Raider">Raider</option>
              <option value="Defender">Defender</option>
              <option value="All-rounder">All-rounder</option>
              <option value="Cover">Cover</option>
              <option value="Corner">Corner</option>
              <option value="In-charge">In-charge</option>
              <option value="Left Cover">Left Cover</option>
              <option value="Right Cover">Right Cover</option>
              <option value="Left Corner">Left Corner</option>
              <option value="Right Corner">Right Corner</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/players')}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-md hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50"
            >
              {busy ? <><Loader2 className="animate-spin" size={16} /> Saving…</> : 'Add Player'}
            </button>
          </div>

          {isError && (
            <p className="text-sm text-red-600">{(error as Error).message}</p>
          )}
          {isSuccess && (
            <p className="text-sm text-green-600">Player added! Redirecting…</p>
          )}
        </form>
      </Card>

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
