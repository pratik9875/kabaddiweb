import { createCrud } from './crud'
import type { Achievement } from '../types'

export type AchievementInsert = Omit<Achievement, 'id' | 'created_at' | 'org_slug'>
export type AchievementUpdate = Partial<AchievementInsert>

const crud = createCrud<Achievement, AchievementInsert, AchievementUpdate>(
  'achievements',
  { column: 'year', ascending: false },
)

export function useAchievements() {
  return crud.useList()
}

export const useCreateAchievement = crud.useCreate
export const useUpdateAchievement = crud.useUpdate
export const useDeleteAchievement = crud.useRemove
