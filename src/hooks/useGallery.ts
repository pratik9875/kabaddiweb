import { createCrud } from './crud'
import type { Gallery } from '../types'

export type GalleryInsert = Omit<Gallery, 'id' | 'created_at' | 'org_slug'>
export type GalleryUpdate = Partial<GalleryInsert>

const crud = createCrud<Gallery, GalleryInsert, GalleryUpdate>('gallery', {
  column: 'created_at',
  ascending: false,
})

/** List gallery images, optionally only featured. */
export function useGallery(featuredOnly = false) {
  return crud.useList(featuredOnly ? { is_featured: true } : undefined)
}

export const useCreateGalleryItem = crud.useCreate
export const useUpdateGalleryItem = crud.useUpdate
export const useDeleteGalleryItem = crud.useRemove
