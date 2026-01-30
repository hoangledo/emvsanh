import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createServerClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/auth";

const MIN_LENGTH = 8;
const AUTH_CONFIG_ID = "single";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token : "";
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < MIN_LENGTH) {
      return NextResponse.json(
        { error: `New password must be at least ${MIN_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server not configured." },
        { status: 503 }
      );
    }

    const tokenHash = hashToken(token);
    const { data: row, error: fetchError } = await supabase
      .from("password_reset_tokens")
      .select("email")
      .eq("token_hash", tokenHash)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (fetchError || !row) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from("auth_config")
      .upsert(
        {
          id: AUTH_CONFIG_ID,
          password_hash: passwordHash,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    await supabase
      .from("password_reset_tokens")
      .delete()
      .eq("token_hash", tokenHash);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
}
