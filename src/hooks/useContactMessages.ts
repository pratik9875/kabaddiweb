import { createCrud } from './crud'
import type { ContactMessage } from '../types'

// Public contact form inserts these fields; is_read defaults in DB.
export type ContactMessageInsert = Omit<
  ContactMessage,
  'id' | 'created_at' | 'org_slug' | 'is_read'
> & { is_read?: boolean }
export type ContactMessageUpdate = Partial<Pick<ContactMessage, 'is_read'>>

const crud = createCrud<ContactMessage, ContactMessageInsert, ContactMessageUpdate>(
  'contact_messages',
  { column: 'created_at', ascending: false },
)

/** Admin: list messages, optionally only unread. */
export function useContactMessages(unreadOnly = false) {
  return crud.useList(unreadOnly ? { is_read: false } : undefined)
}

/** Public: submit a contact message (RLS allows anonymous insert). */
export const useCreateContactMessage = crud.useCreate
export const useUpdateContactMessage = crud.useUpdate
export const useDeleteContactMessage = crud.useRemove
