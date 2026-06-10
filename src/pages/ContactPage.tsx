import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { useCreateContactMessage } from '../hooks/useContactMessages'
import { sendContactEmail } from '../lib/brevo'
import { Container } from '../components/ui/Container'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'

const contactSchema = z.object({
  sender_name: z.string().min(1, 'Name is required'),
  sender_email: z.string().email('Enter a valid email'),
  sender_phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormValues = z.infer<typeof contactSchema>

const STORAGE_KEY = 'kabaddi_contact_attempts'
const MAX_ATTEMPTS = 3
const WINDOW_MS = 60 * 60 * 1000

function canSubmit(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return true
    const timestamps: number[] = JSON.parse(raw)
    const now = Date.now()
    const recent = timestamps.filter((t) => now - t < WINDOW_MS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent))
    return recent.length < MAX_ATTEMPTS
  } catch {
    return true
  }
}

function recordAttempt() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const timestamps: number[] = raw ? JSON.parse(raw) : []
    timestamps.push(Date.now())
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps))
  } catch {
    // ignore
  }
}

function getRemainingAttempts(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return MAX_ATTEMPTS
    const timestamps: number[] = JSON.parse(raw)
    const now = Date.now()
    const recent = timestamps.filter((t) => now - t < WINDOW_MS)
    return Math.max(0, MAX_ATTEMPTS - recent.length)
  } catch {
    return MAX_ATTEMPTS
  }
}

function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function YoutubeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  )
}

export function ContactPage() {
  const settings = useSettingsStore((s) => s.settings)
  const createMessage = useCreateContactMessage()
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitError(null)

    if (!canSubmit()) {
      setSubmitError('Too many submissions. Please try again later.')
      return
    }

    try {
      await createMessage.mutateAsync({
        sender_name: values.sender_name,
        sender_email: values.sender_email,
        sender_phone: values.sender_phone || null,
        message: values.message,
      })

      if (settings.contact_email) {
        await sendContactEmail({
          senderName: values.sender_name,
          senderEmail: values.sender_email,
          message: values.message,
          recipientEmail: settings.contact_email,
        })
      }

      recordAttempt()
      setSuccess(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
    }
  }

  if (success) {
    return (
      <section className="py-24">
        <Container className="max-w-2xl text-center">
          <CheckCircle size={64} className="mx-auto text-green-500" />
          <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-800">Message Sent!</h1>
          <p className="mt-4 text-lg text-slate-600">
            Thank you for reaching out. We'll get back to you soon.
          </p>
          <Button className="mt-8" onClick={() => setSuccess(false)}>
            Send Another Message
          </Button>
        </Container>
      </section>
    )
  }

  const remaining = getRemainingAttempts()

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h1 className="text-4xl font-black tracking-tight text-slate-800">Get in Touch</h1>
            <p className="mt-2 text-slate-500">
              Have a question, suggestion, or just want to say hello? Drop us a message.
            </p>

            {remaining <= 1 && (
              <p className="mt-3 text-sm text-amber-600">
                {remaining} submission{remaining !== 1 ? 's' : ''} remaining this hour.
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              <Input
                label="Name"
                placeholder="Your name"
                error={errors.sender_name?.message}
                {...register('sender_name')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                error={errors.sender_email?.message}
                {...register('sender_email')}
              />
              <Input
                label="Phone (optional)"
                type="tel"
                placeholder="+91 98765 43210"
                error={errors.sender_phone?.message}
                {...register('sender_phone')}
              />
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Write your message here..."
                  className="h-auto w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 resize-y"
                  {...register('message')}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
                )}
              </div>

              {submitError && (
                <p className="text-sm text-red-500">{submitError}</p>
              )}

              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Spinner size={20} /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Send Message
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800">Contact Information</h2>

              {settings.address && (
                <div className="flex gap-3">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Address</p>
                    <p className="text-sm text-slate-600">{settings.address}</p>
                  </div>
                </div>
              )}

              {settings.contact_phone && (
                <div className="flex gap-3">
                  <Phone size={20} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Phone</p>
                    <p className="text-sm text-slate-600">{settings.contact_phone}</p>
                  </div>
                </div>
              )}

              {settings.contact_email && (
                <div className="flex gap-3">
                  <Mail size={20} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Email</p>
                    <p className="text-sm text-slate-600">{settings.contact_email}</p>
                  </div>
                </div>
              )}
            </Card>

            {(settings.facebook_url || settings.instagram_url || settings.youtube_url) && (
              <Card className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800">Follow Us</h2>
                <div className="flex flex-wrap gap-3">
                  {settings.facebook_url && (
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow transition-all"
                    >
                      <FacebookIcon size={18} /> Facebook
                    </a>
                  )}
                  {settings.instagram_url && (
                    <a
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow transition-all"
                    >
                      <InstagramIcon size={18} /> Instagram
                    </a>
                  )}
                  {settings.youtube_url && (
                    <a
                      href={settings.youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow transition-all"
                    >
                      <YoutubeIcon size={18} /> YouTube
                    </a>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
