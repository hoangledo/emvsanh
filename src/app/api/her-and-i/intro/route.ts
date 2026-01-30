import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const VALID_PERSONS = ["hoang", "mai"] as const;

export async function PATCH(request: NextRequest) {
  const person = request.nextUrl.searchParams.get("person") as string | null;
  if (!person || !VALID_PERSONS.includes(person as "hoang" | "mai")) {
    return NextResponse.json(
      { error: "Missing or invalid person (hoang | mai)" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const intro = typeof body.intro === "string" ? body.intro : "";

  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("her_and_i_profiles")
    .update({ intro })
    .eq("person_slug", person)
    .select("person_slug, intro")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
