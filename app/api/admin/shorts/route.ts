import { NextResponse } from "next/server";
import {
  createShortVideo,
  listShortVideosAdmin,
  type ShortVideoInput,
} from "@/lib/shortsDb";

export async function GET() {
  try {
    const items = await listShortVideosAdmin();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[GET /api/admin/shorts]", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ShortVideoInput;
    if (!body.title?.trim() || !body.youtubeUrl?.trim()) {
      return NextResponse.json({ error: "Title and YouTube URL are required" }, { status: 400 });
    }

    const created = await createShortVideo(body);
    if (!created) {
      return NextResponse.json({ error: "Could not create short video" }, { status: 503 });
    }

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/shorts]", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
