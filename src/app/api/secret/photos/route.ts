import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { maxFileSizeBytes } from "@/lib/upload-config";

const BUCKET = "secret";
const SIGNED_URL_EXPIRY_SEC = 3600;

export async function GET() {
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  const { data: rows, error } = await supabase
    .from("secret_photos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const withUrls = await Promise.all(
    (rows ?? []).map(async (row) => {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(row.storage_path, SIGNED_URL_EXPIRY_SEC);
      return {
        ...row,
        url: signed?.signedUrl ?? null,
      };
    })
  );

  return NextResponse.json(withUrls);
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string)?.trim() || null;

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

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
    ? ext
    : "jpg";
  const storagePath = `${crypto.randomUUID()}.${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: row, error: insertError } = await supabase
    .from("secret_photos")
    .insert({ storage_path: storagePath, caption })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    );
  }

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(row.storage_path, SIGNED_URL_EXPIRY_SEC);

  return NextResponse.json({
    ...row,
    url: signed?.signedUrl ?? null,
  });
}
