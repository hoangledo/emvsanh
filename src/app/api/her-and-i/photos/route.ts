import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { maxFileSizeBytes } from "@/lib/upload-config";

const BUCKET = "album";
const MAX_PHOTOS_PER_PERSON = 3;
const VALID_PERSONS = ["hoang", "mai"] as const;

function getPublicUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  return `${url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export async function GET(request: NextRequest) {
  const person = request.nextUrl.searchParams.get("person") as string | null;
  if (!person || !VALID_PERSONS.includes(person as "hoang" | "mai")) {
    return NextResponse.json(
      { error: "Missing or invalid person (hoang | mai)" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from("her_and_i_photos")
    .select("id, storage_path, sort_order")
    .eq("person_slug", person)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json([]);
  }

  const withUrls = (data ?? []).map((row: { id: string; storage_path: string; sort_order: number }) => ({
    id: row.id,
    url: getPublicUrl(row.storage_path),
    sort_order: row.sort_order,
  }));

  return NextResponse.json(withUrls);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const person = formData.get("person") as string | null;
  const file = formData.get("file") as File | null;

  if (!person || !VALID_PERSONS.includes(person as "hoang" | "mai")) {
    return NextResponse.json(
      { error: "Missing or invalid person (hoang | mai)" },
      { status: 400 }
    );
  }

  if (!file || file.size === 0) {
    return NextResponse.json(
      { error: "Missing or empty file" },
      { status: 400 }
    );
  }

  if (file.size > maxFileSizeBytes) {
    return NextResponse.json(
      {
        error: `File exceeds max size of ${Math.round(maxFileSizeBytes / 1024 / 1024)} MB`,
      },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  const { count } = await supabase
    .from("her_and_i_photos")
    .select("id", { count: "exact", head: true })
    .eq("person_slug", person);

  if ((count ?? 0) >= MAX_PHOTOS_PER_PERSON) {
    return NextResponse.json(
      { error: `Maximum ${MAX_PHOTOS_PER_PERSON} photos per person` },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
    ? ext
    : "jpg";
  const path = `her_and_i/${person}/${crypto.randomUUID()}.${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: maxOrder } = await supabase
    .from("her_and_i_photos")
    .select("sort_order")
    .eq("person_slug", person)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder = (maxOrder?.sort_order ?? -1) + 1;

  const { data: row, error: insertError } = await supabase
    .from("her_and_i_photos")
    .insert({
      person_slug: person,
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
