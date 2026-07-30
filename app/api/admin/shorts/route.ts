import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import {
  createShortVideo,
  listShortVideosAdmin,
  type ShortVideoInput,
} from "@/lib/shortsDb";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await listShortVideosAdmin();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[GET /api/admin/shorts]", error);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Could not create short video." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as ShortVideoInput;
    if (!body.title?.trim() || !body.youtubeUrl?.trim()) {
      return NextResponse.json({ error: "Title and YouTube URL are required" }, { status: 400 });
    }

    const created = await createShortVideo(body);
    if (!created) {
      return NextResponse.json({ error: "Could not create short video." }, { status: 503 });
    }

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/shorts]", error);
    return NextResponse.json({ error: "Could not create short video." }, { status: 503 });
  }
}
