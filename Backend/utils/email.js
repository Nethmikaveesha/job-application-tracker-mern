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
