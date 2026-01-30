import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY ?? "";
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export function getResendClient(): Resend | null {
  if (!resendApiKey) return null;
  return new Resend(resendApiKey);
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    return { ok: false, error: "Email not configured." };
  }
  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: "Reset your password – Em & Anh",
      html: `
        <p>You asked to reset your password.</p>
        <p><a href="${resetLink}">Click here to set a new password</a>. This link expires in 1 hour.</p>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send email.";
    return { ok: false, error: message };
  }
}
