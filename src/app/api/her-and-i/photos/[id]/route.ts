import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const BUCKET = "album";

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
    .from("her_and_i_photos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: deleteDbError } = await supabase
    .from("her_and_i_photos")
    .delete()
    .eq("id", id);

  if (deleteDbError) {
    return NextResponse.json({ error: deleteDbError.message }, { status: 500 });
  }

  await supabase.storage.from(BUCKET).remove([row.storage_path]);

  return NextResponse.json({ ok: true });
}
