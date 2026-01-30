import { NextResponse } from "next/server";

const VIEW_PASSWORD = process.env.VIEW_PASSWORD ?? "123456789";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";

    if (password === VIEW_PASSWORD) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
