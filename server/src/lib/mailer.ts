import type { Config } from '../config.js'

export interface Mailer {
  sendPasswordReset(to: string, link: string): Promise<void>
}

/**
 * Real delivery goes through Resend's HTTP API (Render's free tier blocks outbound SMTP).
 * With no RESEND_API_KEY nothing is sent: the server logs that fact, and only prints the reset
 * link itself when MAIL_LOG_LINKS is on (default outside production), so the flow is demoable
 * without an email provider but never pretends an email went out.
 */
export function createMailer(config: Config): Mailer {
  const logLinks = config.MAIL_LOG_LINKS ?? !config.isProduction

  if (config.RESEND_API_KEY && config.MAIL_FROM) {
    const { RESEND_API_KEY: key, MAIL_FROM: from } = config
    return {
      async sendPasswordReset(to, link) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from,
            to: [to],
            subject: 'Reset your SmartNest password',
            text: `Use this link to choose a new SmartNest password (valid for ${config.RESET_TOKEN_TTL_MINUTES} minutes):\n\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
            html: `<p>Use this link to choose a new SmartNest password (valid for ${config.RESET_TOKEN_TTL_MINUTES} minutes):</p><p><a href="${link}">Reset my password</a></p><p>If you did not ask for this, you can ignore this email.</p>`,
          }),
          signal: AbortSignal.timeout(10_000),
        })
        if (!res.ok) throw new Error(`Resend responded ${res.status}`)
      },
    }
  }

  return {
    async sendPasswordReset(to, link) {
      if (logLinks) console.log(`[mail:not-sent] password reset for ${to}: ${link}`)
      else console.warn('[mail:not-sent] password reset requested but email delivery is not configured (set RESEND_API_KEY + MAIL_FROM).')
    },
  }
}
