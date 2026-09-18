import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import {
  createPressBit,
  listPressBitsAdmin,
  type PressBitInput,
} from "@/lib/pressBitsDb";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await listPressBitsAdmin();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[GET /api/admin/press-bits]", error);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Could not create press bit." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as PressBitInput;
    if (!body.title?.trim() || !body.videoUrl?.trim()) {
      return NextResponse.json({ error: "Title and video (YouTube URL or uploaded file) are required" }, { status: 400 });
    }
    if (!body.year || !body.category?.trim()) {
      return NextResponse.json({ error: "Year and category are required" }, { status: 400 });
    }

    const created = await createPressBit(body);
    if (!created) {
      return NextResponse.json({ error: "Could not create press bit." }, { status: 503 });
    }

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/press-bits]", error);
    return NextResponse.json({ error: "Could not create press bit." }, { status: 503 });
  }
}
