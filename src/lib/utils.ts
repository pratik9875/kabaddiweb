import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { supabase, MEDIA_BUCKET } from './supabase'

/** Merge Tailwind classes, resolving conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Format a number as Indian Rupees, e.g. 12500 -> "₹12,500". */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format an ISO date string to DD/MM/YYYY (Indian convention). */
export function formatDateIN(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB

export interface ImageValidationResult {
  ok: boolean
  error?: string
}

/** Validate an image file: type (jpg/png/webp) and size (<=5MB). */
export function validateImage(file: File): ImageValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: 'Only JPG, PNG, or WEBP images are allowed.' }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'Image must be 5MB or smaller.' }
  }
  return { ok: true }
}

/**
 * Upload a validated image to Supabase Storage and return its public URL.
 * Throws on validation failure or upload error.
 * @param folder subfolder within the bucket, e.g. "players"
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const check = validateImage(file)
  if (!check.ok) throw new Error(check.error)

  const path = `${folder}/${crypto.randomUUID()}-${file.name}`
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
