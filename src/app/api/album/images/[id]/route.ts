import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const BUCKET = "album";

function getPublicUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  return `${url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Missing or empty file for replace" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("album_images")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
      ? ext
      : "jpg";
    const newPath = `${existing.storage_path.split("/")[0]}/${crypto.randomUUID()}.${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(newPath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: row, error: updateError } = await supabase
      .from("album_images")
      .update({ storage_path: newPath })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      await supabase.storage.from(BUCKET).remove([newPath]);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabase.storage.from(BUCKET).remove([existing.storage_path]);
    return NextResponse.json({
      ...row,
      url: getPublicUrl(row.storage_path),
    });
  }

  const body = await request.json();
  const alt = typeof body.alt === "string" ? body.alt : undefined;
  const note = body.note !== undefined ? (body.note as string | null) : undefined;
  const sort_order =
    typeof body.sort_order === "number" ? body.sort_order : undefined;

  const updates: Record<string, unknown> = {};
  if (alt !== undefined) updates.alt = alt;
  if (note !== undefined) updates.note = note;
  if (sort_order !== undefined) updates.sort_order = sort_order;

  if (Object.keys(updates).length === 0) {
    const { data: row } = await supabase
      .from("album_images")
      .select("*")
      .eq("id", id)
      .single();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      ...row,
      url: getPublicUrl(row.storage_path),
    });
  }

  const { data: row, error } = await supabase
    .from("album_images")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...row,
    url: getPublicUrl(row.storage_path),
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
    .from("album_images")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: deleteDbError } = await supabase
    .from("album_images")
    .delete()
    .eq("id", id);

  if (deleteDbError) {
    return NextResponse.json({ error: deleteDbError.message }, { status: 500 });
  }

  await supabase.storage.from(BUCKET).remove([row.storage_path]);

  return NextResponse.json({ ok: true });
}
