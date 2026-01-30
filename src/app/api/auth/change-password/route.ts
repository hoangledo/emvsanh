import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { hashPassword, comparePassword } from "@/lib/auth";

const MIN_LENGTH = 8;
const AUTH_CONFIG_ID = "single";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentPassword =
      typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : "";
    const recoveryPhrase =
      typeof body?.recoveryPhrase === "string" ? body.recoveryPhrase : "";

    if (!currentPassword || !newPassword || !recoveryPhrase) {
      return NextResponse.json(
        { error: "Current password, new password, and recovery phrase are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < MIN_LENGTH) {
      return NextResponse.json(
        { error: `New password must be at least ${MIN_LENGTH} characters.` },
        { status: 400 }
      );
    }

    if (recoveryPhrase.length < MIN_LENGTH) {
      return NextResponse.json(
        { error: `Recovery phrase must be at least ${MIN_LENGTH} characters.` },
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

    const { data: row } = await supabase
      .from("auth_config")
      .select("password_hash")
      .eq("id", AUTH_CONFIG_ID)
      .single();

    let currentMatch = false;
    if (row?.password_hash) {
      currentMatch = await comparePassword(currentPassword, row.password_hash);
    } else {
      const envPassword = process.env.VIEW_PASSWORD;
      if (envPassword && currentPassword === envPassword) {
        currentMatch = true;
      }
    }

    if (!currentMatch) {
      return NextResponse.json({ error: "Current password is wrong." }, { status: 401 });
    }

    const [passwordHash, recoveryPhraseHash] = await Promise.all([
      hashPassword(newPassword),
      hashPassword(recoveryPhrase),
    ]);

    const { error: upsertError } = await supabase
      .from("auth_config")
      .upsert(
        {
          id: AUTH_CONFIG_ID,
          password_hash: passwordHash,
          recovery_phrase_hash: recoveryPhraseHash,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (upsertError) {
      return NextResponse.json(
        { error: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
}
