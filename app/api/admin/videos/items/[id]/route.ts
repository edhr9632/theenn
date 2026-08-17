import { NextResponse } from "next/server";
import { deleteSiteVideoItem, updateSiteVideoItem, type SiteVideoItemInput } from "@/lib/videosDb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = (await request.json()) as Partial<SiteVideoItemInput>;
    if (body.title !== undefined && !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (body.youtubeUrl !== undefined && !body.youtubeUrl.trim()) {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }

    const updated = await updateSiteVideoItem(id, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("[PUT /api/admin/videos/items/[id]]", error);
    const message = error instanceof Error ? error.message : "Could not update video.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const ok = await deleteSiteVideoItem(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/videos/items/[id]]", error);
    const message = error instanceof Error ? error.message : "Could not delete video.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
