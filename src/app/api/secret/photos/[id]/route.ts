import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const BUCKET = "secret";
const SIGNED_URL_EXPIRY_SEC = 3600;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  let body: { caption?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const caption =
    body?.caption === null || body?.caption === undefined
      ? undefined
      : typeof body.caption === "string"
        ? body.caption.trim() || null
        : undefined;

  if (caption === undefined) {
    return NextResponse.json(
      { error: "caption is required" },
      { status: 400 }
    );
  }

  const { data: row, error } = await supabase
    .from("secret_photos")
    .update({ caption })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(row.storage_path, SIGNED_URL_EXPIRY_SEC);

  return NextResponse.json({
    ...row,
    url: signed?.signedUrl ?? null,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  const { data: row, error: fetchError } = await supabase
    .from("secret_photos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: deleteDbError } = await supabase
    .from("secret_photos")
    .delete()
    .eq("id", id);

  if (deleteDbError) {
    return NextResponse.json({ error: deleteDbError.message }, { status: 500 });
  }

  await supabase.storage.from(BUCKET).remove([row.storage_path]);

  return NextResponse.json({ ok: true });
}
