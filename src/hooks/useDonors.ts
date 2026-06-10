import { createCrud } from './crud'
import type { PrizeDonor } from '../types'

export type DonorInsert = Omit<PrizeDonor, 'id' | 'created_at' | 'org_slug'>
export type DonorUpdate = Partial<DonorInsert>

const crud = createCrud<PrizeDonor, DonorInsert, DonorUpdate>('prize_donors', {
  column: 'year',
  ascending: false,
})

/** List prize donors, optionally filtered by year. */
export function useDonors(year?: number) {
  return crud.useList(year ? { year } : undefined)
}

export const useCreateDonor = crud.useCreate
export const useUpdateDonor = crud.useUpdate
export const useDeleteDonor = crud.useRemove
