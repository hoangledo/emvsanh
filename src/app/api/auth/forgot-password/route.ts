import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { createServerClient } from "@/lib/supabase/server";
import { sendPasswordResetEmail } from "@/lib/email";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL ?? "";
const TOKEN_EXPIRY_HOURS = 1;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    if (!ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Reset is not configured. Set ADMIN_EMAIL in .env." },
        { status: 503 }
      );
    }

    if (email !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ ok: true });
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server not configured." },
        { status: 503 }
      );
    }

    const token = randomUUID();
    const tokenHash = hashToken(token);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

    const { error: insertError } = await supabase
      .from("password_reset_tokens")
      .insert({
        token_hash: tokenHash,
        email: ADMIN_EMAIL.toLowerCase(),
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    const baseUrl = APP_URL
      ? (APP_URL.startsWith("http") ? APP_URL : `https://${APP_URL}`)
      : request.nextUrl.origin;
    const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const result = await sendPasswordResetEmail(ADMIN_EMAIL, resetLink);
    if (!result.ok) {
      await supabase
        .from("password_reset_tokens")
        .delete()
        .eq("token_hash", tokenHash);
      return NextResponse.json(
        { error: result.error ?? "Failed to send email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
}
