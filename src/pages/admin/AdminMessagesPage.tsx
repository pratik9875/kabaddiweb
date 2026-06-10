import { useState } from 'react'
import { Mail, Trash2, CheckCheck, X } from 'lucide-react'
import {
  useContactMessages,
  useUpdateContactMessage,
  useDeleteContactMessage,
} from '../../hooks/useContactMessages'
import type { ContactMessage } from '../../types'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { cn, formatDateIN } from '../../lib/utils'

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 rounded bg-gray-200" />
          <div className="h-3 w-1/2 rounded bg-gray-100" />
          <div className="h-3 w-1/4 rounded bg-gray-100" />
          <div className="mt-3 h-3 w-3/4 rounded bg-gray-100" />
        </div>
        <div className="ml-4 h-8 w-16 rounded-lg bg-gray-100" />
      </div>
    </div>
  )
}

interface DetailModalProps {
  message: ContactMessage
  onClose: () => void
  onMarkRead: () => void
}

function DetailModal({ message, onClose, onMarkRead }: DetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Message Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Sender</p>
            <p className="mt-0.5 font-medium text-gray-900">{message.sender_name}</p>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Email</p>
              <p className="mt-0.5 text-sm text-gray-700">{message.sender_email}</p>
            </div>
            {message.sender_phone && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Phone</p>
                <p className="mt-0.5 text-sm text-gray-700">{message.sender_phone}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Date</p>
            <p className="mt-0.5 text-sm text-gray-700">{formatDateIN(message.created_at)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Message</p>
            <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {message.message}
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            {!message.is_read && (
              <Button type="button" variant="outline" onClick={onMarkRead}>
                <CheckCheck size={16} />
                Mark as Read
              </Button>
            )}
            <Button type="button" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DeleteConfirmModalProps {
  open: boolean
  senderName: string
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

function DeleteConfirmModal({ open, senderName, onConfirm, onCancel, isPending }: DeleteConfirmModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Delete Message</h3>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to delete the message from <strong>{senderName}</strong>? This action cannot be undone.
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

export function AdminMessagesPage() {
  const [unreadOnly, setUnreadOnly] = useState(false)
  const { data: messages, isLoading, isError, error } = useContactMessages(unreadOnly)
  const updateMutation = useUpdateContactMessage()
  const deleteMutation = useDeleteContactMessage()

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [deletingMessage, setDeletingMessage] = useState<ContactMessage | null>(null)

  const handleMarkRead = async (msg: ContactMessage) => {
    if (msg.is_read) return
    try {
      await updateMutation.mutateAsync({ id: msg.id, is_read: true })
    } catch {
      // handled by mutation
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingMessage) return
    try {
      await deleteMutation.mutateAsync(deletingMessage.id)
      setDeletingMessage(null)
    } catch {
      // handled by mutation
    }
  }

  const unreadCount = messages?.filter((m) => !m.is_read).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">
            {unreadOnly
              ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`
              : `${messages?.length ?? 0} total message${messages?.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setUnreadOnly(false)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            !unreadOnly
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100',
          )}
        >
          All Messages
        </button>
        <button
          type="button"
          onClick={() => setUnreadOnly(true)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            unreadOnly
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100',
          )}
        >
          Unread Only
          {unreadCount > 0 && !unreadOnly && (
            <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {isError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error?.message || 'Failed to load messages. Please try again.'}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !messages || messages.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
          <Mail size={40} className="mb-3 text-gray-300" />
          <p className="font-medium text-gray-600">No messages</p>
          <p className="text-sm text-gray-400">
            {unreadOnly ? 'No unread messages at the moment.' : 'No messages have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'group cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md',
                !msg.is_read ? 'border-l-4 border-l-blue-500 border-gray-200' : 'border-gray-100',
              )}
              onClick={() => setSelectedMessage(msg)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!msg.is_read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" title="Unread" />
                    )}
                    <p
                      className={cn(
                        'truncate text-sm',
                        !msg.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-800',
                      )}
                    >
                      {msg.sender_name}
                    </p>
                    <span className="hidden text-xs text-gray-400 sm:inline">
                      &lt;{msg.sender_email}&gt;
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                    <span className="sm:hidden">{msg.sender_email}</span>
                    {msg.sender_phone && <span>{msg.sender_phone}</span>}
                    <span>{formatDateIN(msg.created_at)}</span>
                  </div>
                  <p className="mt-2 truncate text-sm text-gray-600">
                    {msg.message.length > 100
                      ? `${msg.message.slice(0, 100)}...`
                      : msg.message}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {!msg.is_read && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkRead(msg)
                      }}
                      className="rounded-lg p-1.5 text-gray-400 opacity-0 transition-all hover:bg-blue-50 hover:text-blue-600 group-hover:opacity-100"
                      title="Mark as Read"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletingMessage(msg)
                    }}
                    className="rounded-lg p-1.5 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMessage && (
        <DetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onMarkRead={() => {
            handleMarkRead(selectedMessage)
            setSelectedMessage(null)
          }}
        />
      )}

      <DeleteConfirmModal
        open={!!deletingMessage}
        senderName={deletingMessage?.sender_name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingMessage(null)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
