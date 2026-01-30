import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const BUCKET = "album";

function getPublicUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  return `${url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export async function GET() {
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json([]);
  }
  const { data, error } = await supabase
    .from("moments")
    .select("*")
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
  const title = (formData.get("title") as string) ?? "";
  const date = (formData.get("date") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";
  const file = formData.get("file") as File | null;

  if (!title || !date || !description || !file || file.size === 0) {
    return NextResponse.json(
      { error: "Missing title, date, description, or file" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
    ? ext
    : "jpg";
  const path = `moments/${crypto.randomUUID()}.${safeExt}`;

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
    .from("moments")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder = (maxOrder?.sort_order ?? -1) + 1;

  const { data: row, error: insertError } = await supabase
    .from("moments")
    .insert({
      title,
      date,
      description,
      storage_path: path,
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
