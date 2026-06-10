const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY

export interface SendContactEmailParams {
  senderName: string
  senderEmail: string
  message: string
  recipientEmail: string
}

/**
 * Send a contact email via Brevo REST API (no backend).
 * Returns true on success. Never throws on network error — returns false.
 */
export async function sendContactEmail(
  params: SendContactEmailParams,
): Promise<boolean> {
  if (!BREVO_API_KEY) {
    if (import.meta.env.DEV) console.warn('[brevo] Missing VITE_BREVO_API_KEY')
    return false
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: params.senderName, email: 'noreply@brevo.com' },
        to: [{ email: params.recipientEmail }],
        replyTo: { email: params.senderEmail },
        subject: `New message from ${params.senderName}`,
        htmlContent: `
          <h2>New Contact Message</h2>
          <p><strong>From:</strong> ${escapeHtml(params.senderName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(params.senderEmail)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(params.message)}</p>
        `,
      }),
    })
    return response.ok
  } catch {
    return false
  }
}

/** Minimal HTML escaping to prevent injection into the email body. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
