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
    const title = formData.get("title") as string | null;
    const date = formData.get("date") as string | null;
    const description = formData.get("description") as string | null;
    const file = formData.get("file") as File | null;

    const updates: Record<string, unknown> = {};
    if (title != null) updates.title = title;
    if (date != null) updates.date = date;
    if (description != null) updates.description = description;

    if (file && file.size > 0) {
      const { data: existing } = await supabase
        .from("moments")
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
      const newPath = `moments/${crypto.randomUUID()}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(newPath, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      updates.storage_path = newPath;

      const { data: row, error: updateError } = await supabase
        .from("moments")
        .update(updates)
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

    if (Object.keys(updates).length === 0) {
      const { data: row } = await supabase
        .from("moments")
        .select("*")
        .eq("id", id)
        .single();
      if (!row)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({
        ...row,
        url: getPublicUrl(row.storage_path),
      });
    }

    const { data: row, error } = await supabase
      .from("moments")
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

  const body = await request.json();
  const title = typeof body.title === "string" ? body.title : undefined;
  const date = typeof body.date === "string" ? body.date : undefined;
  const description =
    typeof body.description === "string" ? body.description : undefined;

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (date !== undefined) updates.date = date;
  if (description !== undefined) updates.description = description;

  if (Object.keys(updates).length === 0) {
    const { data: row } = await supabase
      .from("moments")
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
    .from("moments")
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
    .from("moments")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: deleteDbError } = await supabase
    .from("moments")
    .delete()
    .eq("id", id);

  if (deleteDbError) {
    return NextResponse.json({ error: deleteDbError.message }, { status: 500 });
  }

  await supabase.storage.from(BUCKET).remove([row.storage_path]);

  return NextResponse.json({ ok: true });
}
