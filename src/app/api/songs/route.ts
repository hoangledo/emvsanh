import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json([]);
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  let body: { name?: string; artist?: string; soundcloud_url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const artist = typeof body?.artist === "string" ? body.artist.trim() : "";
  const soundcloud_url =
    typeof body?.soundcloud_url === "string" ? body.soundcloud_url.trim() : "";

  if (!name || !artist || !soundcloud_url) {
    return NextResponse.json(
      { error: "name, artist, and soundcloud_url are required" },
      { status: 400 }
    );
  }

  if (!soundcloud_url.startsWith("https://soundcloud.com")) {
    return NextResponse.json(
      { error: "soundcloud_url must be a valid SoundCloud URL" },
      { status: 400 }
    );
  }

  const { data: row, error: insertError } = await supabase
    .from("songs")
    .insert({ name, artist, soundcloud_url })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(row, { status: 201 });
}
