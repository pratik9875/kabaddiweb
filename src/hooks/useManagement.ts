import { createCrud } from './crud'
import type { ManagementMember } from '../types'

export type ManagementInsert = Omit<ManagementMember, 'id' | 'created_at' | 'org_slug'>
export type ManagementUpdate = Partial<ManagementInsert>

const crud = createCrud<ManagementMember, ManagementInsert, ManagementUpdate>(
  'management_members',
  { column: 'sort_order' },
)

export function useManagement() {
  return crud.useList()
}

export const useCreateManagement = crud.useCreate
export const useUpdateManagement = crud.useUpdate
export const useDeleteManagement = crud.useRemove
