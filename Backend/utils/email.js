import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendApplicationStatusEmail({
  to,
  applicantName,
  jobTitle,
  company,
  status,
}) {
  const tx = getTransporter();
  if (!tx) return { sent: false, reason: 'SMTP not configured' };
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = `Application update: ${jobTitle} at ${company}`;
  const text = `Hi ${applicantName},\n\nYour application for "${jobTitle}" at ${company} is now: ${status}.\n\n— Job Application Tracker`;
  await tx.sendMail({ from, to, subject, text });
  return { sent: true };
}

export async function sendContactFormEmail({ fromName, fromEmail, subject, message }) {
  const tx = getTransporter();
  const to = process.env.CONTACT_INBOX_EMAIL || process.env.SMTP_USER;
  if (!tx || !to) return { sent: false, reason: 'SMTP or CONTACT_INBOX_EMAIL not configured' };
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subj = `[JobTracker contact] ${subject}`;
  const text = `From: ${fromName} <${fromEmail}>\n\n${message}`;
  await tx.sendMail({ from, to, replyTo: fromEmail, subject: subj, text });
  return { sent: true };
}

export async function sendPasswordResetEmail({ to, applicantName, token }) {
  const tx = getTransporter();
  if (!tx) return { sent: false, reason: 'SMTP not configured' };

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const subject = 'Reset your password';
  const text = `Hi ${applicantName},\n\nYou requested a password reset for Job Application Tracker.\n\nReset link:\n${resetLink}\n\nThis link expires soon.\n\nIf you did not request this, you can ignore this email.\n\n— Job Application Tracker`;

  await tx.sendMail({ from, to, subject, text });
  return { sent: true };
}
