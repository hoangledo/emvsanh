import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const BUCKET = "album";

function getPublicUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  return `${url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export type HerAndIPersonSlug = "hoang" | "mai";

export async function GET() {
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({
      hoang: { intro: "", photos: [] },
      mai: { intro: "", photos: [] },
    });
  }

  const [profilesRes, photosRes] = await Promise.all([
    supabase.from("her_and_i_profiles").select("person_slug, intro"),
    supabase
      .from("her_and_i_photos")
      .select("id, person_slug, storage_path, sort_order")
      .order("sort_order", { ascending: true }),
  ]);

  const profiles =
    (profilesRes.data ?? []) as { person_slug: HerAndIPersonSlug; intro: string }[];
  const photos = (photosRes.data ?? []) as {
    id: string;
    person_slug: HerAndIPersonSlug;
    storage_path: string;
    sort_order: number;
  }[];

  const introByPerson: Record<HerAndIPersonSlug, string> = {
    hoang: "",
    mai: "",
  };
  for (const p of profiles) {
    introByPerson[p.person_slug] = p.intro ?? "";
  }

  const photosByPerson: Record<
    HerAndIPersonSlug,
    { id: string; url: string; sort_order: number }[]
  > = {
    hoang: [],
    mai: [],
  };
  for (const p of photos) {
    photosByPerson[p.person_slug].push({
      id: p.id,
      url: getPublicUrl(p.storage_path),
      sort_order: p.sort_order,
    });
  }

  return NextResponse.json({
    hoang: { intro: introByPerson.hoang, photos: photosByPerson.hoang },
    mai: { intro: introByPerson.mai, photos: photosByPerson.mai },
  });
}
