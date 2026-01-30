import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { comparePassword } from "@/lib/auth";

const AUTH_CONFIG_ID = "single";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const supabase = createServerClient();
    if (supabase) {
      const { data: row } = await supabase
        .from("auth_config")
        .select("password_hash")
        .eq("id", AUTH_CONFIG_ID)
        .single();

      if (row?.password_hash) {
        const match = await comparePassword(password, row.password_hash);
        if (match) {
          return NextResponse.json({ ok: true });
        }
        return NextResponse.json({ ok: false }, { status: 401 });
      }
    }

    const envPassword = process.env.VIEW_PASSWORD;
    if (envPassword && password === envPassword) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
