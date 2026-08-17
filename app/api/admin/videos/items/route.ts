import { NextResponse } from "next/server";
import { createSiteVideoItem, type SiteVideoItemInput } from "@/lib/videosDb";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SiteVideoItemInput;
    if (!body.title?.trim() || !body.youtubeUrl?.trim()) {
      return NextResponse.json({ error: "Title and YouTube URL are required" }, { status: 400 });
    }
    if (!body.tab) {
      return NextResponse.json({ error: "Tab is required" }, { status: 400 });
    }

    const created = await createSiteVideoItem(body);
    if (!created) {
      return NextResponse.json({ error: "Could not add video." }, { status: 503 });
    }
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/videos/items]", error);
    const message = error instanceof Error ? error.message : "Could not add video.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
