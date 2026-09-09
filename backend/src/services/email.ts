import nodemailer from "nodemailer";
import { config } from "../config/env";

interface EmailParams {
  to: string;
  subject: string;
  text: string;
}

function getTransport() {
  if (!config.email.smtpHost || !config.email.from) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.email.smtpHost,
    port: config.email.smtpPort,
    secure: config.email.smtpPort === 465,
    auth:
      config.email.smtpUser && config.email.smtpPass
        ? { user: config.email.smtpUser, pass: config.email.smtpPass }
        : undefined,
  });
}

export async function sendEmail({ to, subject, text }: EmailParams) {
  const transport = getTransport();

  if (!transport) {
    if (config.nodeEnv === "production") {
      throw new Error("Email transport is not configured");
    }

    console.info(
      JSON.stringify({
        level: "info",
        message: "Email skipped in development",
        to,
        subject,
        text,
      })
    );
    return;
  }

  await transport.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${config.frontendUrl}/account?resetToken=${encodeURIComponent(token)}`;
  await sendEmail({
    to,
    subject: "Reset your AskLoom password",
    text: `Use this link to reset your AskLoom password: ${resetUrl}\n\nThis link expires in 1 hour.`,
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${config.frontendUrl}/account?verificationToken=${encodeURIComponent(token)}`;
  await sendEmail({
    to,
    subject: "Verify your AskLoom email",
    text: `Use this link to verify your AskLoom email address: ${verifyUrl}\n\nThis link expires in 2 days.`,
  });
}
