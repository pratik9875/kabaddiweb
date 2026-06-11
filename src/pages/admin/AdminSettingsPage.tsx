import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSiteSettings, useUpdateSiteSettings } from '../../hooks/useSiteSettings'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { ImageCropModal } from '../../components/ui/ImageCropModal'
import { cn, normalizeImageFile, uploadImage } from '../../lib/utils'
import { AlertCircle, CheckCircle2, Camera, Save } from 'lucide-react'

const settingsSchema = z.object({
  team_name: z.string().min(1, 'Team name is required'),
  tagline: z.string().nullable().optional(),
  founded_year: z.coerce.number().int().nullable().optional(),
  about_text: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  hero_title: z.string().nullable().optional(),
  hero_subtitle: z.string().nullable().optional(),
  hero_image_url: z.string().nullable().optional(),
  primary_color: z.string().nullable().optional(),
  secondary_color: z.string().nullable().optional(),
  contact_email: z.string().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  facebook_url: z.string().nullable().optional(),
  instagram_url: z.string().nullable().optional(),
  youtube_url: z.string().nullable().optional(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

interface ImageUploadProps {
  label: string
  currentUrl: string | null | undefined
  uploading: boolean
  aspect?: number
  onFileChange: (file: File) => void
}

function ImageUpload({ label, currentUrl, uploading, aspect = 1, onFileChange }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const handleSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const normalized = await normalizeImageFile(file)
    setCropSrc(URL.createObjectURL(normalized))
  }

  const handleCropComplete = (cropped: File) => {
    onFileChange(cropped)
    setCropSrc(null)
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
          {currentUrl ? (
            <img src={currentUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Camera size={28} className="text-gray-400" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSelect}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            {uploading ? <Spinner size={14} /> : <Camera size={14} />}
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
          {currentUrl && (
            <span className="text-xs text-gray-400 truncate max-w-40">{currentUrl.split('/').pop()}</span>
          )}
        </div>
      </div>
      <ImageCropModal
        open={!!cropSrc}
        imageSrc={cropSrc ?? ''}
        aspect={aspect}
        onComplete={handleCropComplete}
        onClose={() => setCropSrc(null)}
      />
    </div>
  )
}

export function AdminSettingsPage() {
  const { data: settings, isLoading, isError, error } = useSiteSettings()
  const updateSettings = useUpdateSiteSettings()
  const [logoUploading, setLogoUploading] = useState(false)
  const [heroUploading, setHeroUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<SettingsFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      team_name: '',
      tagline: '',
      founded_year: null,
      about_text: '',
      logo_url: '',
      hero_title: '',
      hero_subtitle: '',
      hero_image_url: '',
      primary_color: '#f97316',
      secondary_color: '#f43f5e',
      contact_email: '',
      contact_phone: '',
      address: '',
      facebook_url: '',
      instagram_url: '',
      youtube_url: '',
    },
  })

  useEffect(() => {
    if (settings) {
      reset({
        team_name: settings.team_name ?? '',
        tagline: settings.tagline ?? '',
        founded_year: settings.founded_year ?? null,
        about_text: settings.about_text ?? '',
        logo_url: settings.logo_url ?? '',
        hero_title: settings.hero_title ?? '',
        hero_subtitle: settings.hero_subtitle ?? '',
        hero_image_url: settings.hero_image_url ?? '',
        primary_color: settings.primary_color ?? '#f97316',
        secondary_color: settings.secondary_color ?? '#f43f5e',
        contact_email: settings.contact_email ?? '',
        contact_phone: settings.contact_phone ?? '',
        address: settings.address ?? '',
        facebook_url: settings.facebook_url ?? '',
        instagram_url: settings.instagram_url ?? '',
        youtube_url: settings.youtube_url ?? '',
      })
    }
  }, [settings, reset])

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(t)
    }
  }, [successMessage])

  const handleLogoChange = async (file: File) => {
    setLogoUploading(true)
    try {
      const url = await uploadImage(file, 'logo')
      setValue('logo_url', url)
    } catch {
      /* keep current */
    } finally {
      setLogoUploading(false)
    }
  }

  const handleHeroImageChange = async (file: File) => {
    setHeroUploading(true)
    try {
      const url = await uploadImage(file, 'hero')
      setValue('hero_image_url', url)
    } catch {
      /* keep current */
    } finally {
      setHeroUploading(false)
    }
  }

  const onSubmit = async (data: SettingsFormValues) => {
    const cleaned: Record<string, string | number | null> = {}
    for (const [key, val] of Object.entries(data)) {
      cleaned[key] = val === '' ? null : (val ?? null)
    }
    updateSettings.mutate(cleaned, {
      onSuccess: () => {
        setSuccessMessage('Settings saved successfully!')
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={32} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <AlertCircle size={40} className="mb-3 text-red-400" />
        <p className="font-medium text-gray-700">Failed to load settings</p>
        <p className="mt-1 text-sm text-gray-500">{error?.message ?? 'Something went wrong'}</p>
      </div>
    )
  }

  const logoUrl = watch('logo_url')
  const heroImageUrl = watch('hero_image_url')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-sm text-gray-500">Manage your team's public information</p>
        </div>
        {successMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            <CheckCircle2 size={16} />
            {successMessage}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <SectionCard title="Team Info">
          <Input label="Team Name" error={errors.team_name?.message} {...register('team_name')} />
          <Input label="Tagline" error={errors.tagline?.message} {...register('tagline')} />
          <Input label="Founded Year" type="number" error={errors.founded_year?.message} {...register('founded_year')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">About</label>
            <textarea
              className={cn(
                'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400',
                'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20',
                errors.about_text ? 'border-red-400' : 'border-gray-300',
              )}
              rows={4}
              {...register('about_text')}
            />
            {errors.about_text && <p className="mt-1 text-xs text-red-500">{errors.about_text.message}</p>}
          </div>
        </SectionCard>

        <SectionCard title="Logo">
          <ImageUpload
            label="Team Logo"
            currentUrl={logoUrl}
            uploading={logoUploading}
            aspect={1}
            onFileChange={handleLogoChange}
          />
        </SectionCard>

        <SectionCard title="Hero Section">
          <Input label="Hero Title" error={errors.hero_title?.message} {...register('hero_title')} />
          <Input label="Hero Subtitle" error={errors.hero_subtitle?.message} {...register('hero_subtitle')} />
          <ImageUpload
            label="Hero Image"
            currentUrl={heroImageUrl}
            uploading={heroUploading}
            aspect={16 / 9}
            onFileChange={handleHeroImageChange}
          />
        </SectionCard>

        <SectionCard title="Theme Colors">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 bg-white p-1"
                  {...register('primary_color')}
                />
                <span className="text-xs text-gray-500 font-mono">{watch('primary_color')}</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 bg-white p-1"
                  {...register('secondary_color')}
                />
                <span className="text-xs text-gray-500 font-mono">{watch('secondary_color')}</span>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Contact">
          <Input label="Email" type="email" error={errors.contact_email?.message} {...register('contact_email')} />
          <Input label="Phone" error={errors.contact_phone?.message} {...register('contact_phone')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Address</label>
            <textarea
              className={cn(
                'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400',
                'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20',
                errors.address ? 'border-red-400' : 'border-gray-300',
              )}
              rows={3}
              {...register('address')}
            />
            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
          </div>
        </SectionCard>

        <SectionCard title="Social Links">
          <Input label="Facebook URL" type="url" error={errors.facebook_url?.message} {...register('facebook_url')} />
          <Input label="Instagram URL" type="url" error={errors.instagram_url?.message} {...register('instagram_url')} />
          <Input label="YouTube URL" type="url" error={errors.youtube_url?.message} {...register('youtube_url')} />
        </SectionCard>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting || updateSettings.isPending}>
            {isSubmitting || updateSettings.isPending ? <Spinner size={16} /> : <Save size={16} />}
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  )
}
