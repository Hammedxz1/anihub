import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

// ─── Transport ────────────────────────────────────────────────────────────────

function createTransporter(): Transporter {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  // In development, log emails to console instead of sending
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  })
}

const transporter = createTransporter()

const FROM = process.env.EMAIL_FROM ?? '"MangaVerse" <no-reply@mangaverse.app>'
const APP_URL = process.env.APP_URL ?? 'http://localhost:5173'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const info = await transporter.sendMail({ from: FROM, to, subject, html })

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[email] ${subject} → ${to}`)
    console.log(`[email] Preview: ${nodemailer.getTestMessageUrl(info)}`)
  }
}

// ─── Templates ───────────────────────────────────────────────────────────────

function baseLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>MangaVerse</title>
      <style>
        body { font-family: sans-serif; background: #0f0f0f; color: #e5e5e5; margin: 0; padding: 0; }
        .container { max-width: 520px; margin: 40px auto; background: #1a1a1a; border-radius: 12px; overflow: hidden; }
        .header { background: #c026d3; padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 32px; }
        .body p { line-height: 1.6; margin: 0 0 16px; }
        .btn { display: inline-block; background: #c026d3; color: #fff; padding: 12px 28px;
               border-radius: 8px; text-decoration: none; font-weight: 600; margin: 8px 0; }
        .footer { padding: 24px 32px; font-size: 12px; color: #888; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>MangaVerse</h1></div>
        <div class="body">${content}</div>
        <div class="footer">You received this email because you have a MangaVerse account.<br/>
          <a href="${APP_URL}" style="color:#c026d3;">mangaverse.app</a>
        </div>
      </div>
    </body>
    </html>
  `
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(resetToken)}`

  const html = baseLayout(`
    <p>Hi there,</p>
    <p>We received a request to reset your MangaVerse password.
       Click the button below to choose a new one. This link expires in <strong>1 hour</strong>.</p>
    <a class="btn" href="${resetUrl}">Reset Password</a>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `)

  await sendMail(email, 'Reset your MangaVerse password', html)
}

export async function sendPaymentFailedEmail(
  email: string,
  updatePaymentUrl: string,
): Promise<void> {
  const html = baseLayout(`
    <p>Hi there,</p>
    <p>We were unable to process your MangaVerse Premium payment.
       Your subscription has been paused — please update your payment method to continue
       enjoying unlimited manga access.</p>
    <a class="btn" href="${updatePaymentUrl}">Update Payment Method</a>
    <p>If you believe this is a mistake, please contact us at
       <a href="mailto:support@mangaverse.app" style="color:#c026d3;">support@mangaverse.app</a>.</p>
  `)

  await sendMail(email, 'Action required: MangaVerse payment failed', html)
}

export async function sendWelcomeEmail(email: string, username: string): Promise<void> {
  const html = baseLayout(`
    <p>Hey <strong>${username}</strong> 👋</p>
    <p>Welcome to MangaVerse! You can now search thousands of manga,
       track your reading progress, and build your personal library.</p>
    <a class="btn" href="${APP_URL}/browse">Start Reading</a>
  `)

  await sendMail(email, 'Welcome to MangaVerse!', html)
}
