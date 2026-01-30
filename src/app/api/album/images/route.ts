import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { AlbumSection } from "@/types/album";

const BUCKET = "album";
const VALID_SECTIONS: AlbumSection[] = [
  "young",
  "mai",
  "hoang",
  "foods",
  "memes",
  "gallery",
];

function getPublicUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  return `${url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get("section") as AlbumSection | null;
  if (!section || !VALID_SECTIONS.includes(section)) {
    return NextResponse.json(
      { error: "Missing or invalid section" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json([]);
  }
  const { data, error } = await supabase
    .from("album_images")
    .select("*")
    .eq("section", section)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json([]);
  }

  const withUrls = (data ?? []).map((row) => ({
    ...row,
    url: getPublicUrl(row.storage_path),
  }));

  return NextResponse.json(withUrls);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const section = formData.get("section") as string | null;
  const alt = (formData.get("alt") as string) ?? "";
  const note = (formData.get("note") as string) || null;
  const file = formData.get("file") as File | null;

  if (
    !section ||
    !VALID_SECTIONS.includes(section as AlbumSection) ||
    !file ||
    file.size === 0
  ) {
    return NextResponse.json(
      { error: "Missing section, file, or invalid section" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
    ? ext
    : "jpg";
  const path = `${section}/${crypto.randomUUID()}.${safeExt}`;

  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: maxOrder } = await supabase
    .from("album_images")
    .select("sort_order")
    .eq("section", section)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder = (maxOrder?.sort_order ?? -1) + 1;

  const { data: row, error: insertError } = await supabase
    .from("album_images")
    .insert({
      section,
      storage_path: path,
      alt,
      note,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    ...row,
    url: getPublicUrl(row.storage_path),
  });
}
