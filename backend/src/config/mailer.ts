// src/config/mailer.ts
// Nodemailer transporter. Returns null when SMTP is not configured (dev fallback).

import nodemailer, { Transporter } from 'nodemailer';
import { env } from './env';

let _transporter: Transporter | null = null;

export function getMailer(): Transporter | null {
  if (!env.smtp.enabled) return null;

  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
  }

  return _transporter;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const mailer = getMailer();
  if (!mailer) {
    console.log(`[Mailer] SMTP not configured — skipping email to ${options.to}: ${options.subject}`);
    return;
  }
  await mailer.sendMail({ from: env.smtp.from, ...options });
}
