import nodemailer from "nodemailer";

/**
 * Minimal SMTP sender for transactional emails (trial report, magic links, etc).
 * Configured via EMAIL_SERVER (SMTP URL) and EMAIL_FROM. When unset, sends are
 * skipped and logged — so local dev doesn't hard-fail.
 */

let _transporter: nodemailer.Transporter | null = null;
let _cachedConfig = { server: "", from: "" };

function getTransporter(): nodemailer.Transporter | null {
  const server = process.env.EMAIL_SERVER ?? "";
  const from = process.env.EMAIL_FROM ?? "YoDataSet <no-reply@yodataset.com>";

  if (!server) return null;

  // Reuse the transporter when config is unchanged.
  if (_transporter && _cachedConfig.server === server && _cachedConfig.from === from) {
    return _transporter;
  }

  try {
    _transporter = nodemailer.createTransport(server);
    _cachedConfig = { server, from };
    return _transporter;
  } catch (err) {
    console.error("[email] failed to create transporter:", err);
    return null;
  }
}

export function emailFrom(): string {
  return process.env.EMAIL_FROM ?? "YoDataSet <no-reply@yodataset.com>";
}

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      `[email] EMAIL_SERVER not configured — skipping send to ${params.to}`
    );
    return false;
  }

  try {
    await transporter.sendMail({
      from: emailFrom(),
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}
