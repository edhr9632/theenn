import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { deleteShortVideo, getShortVideoById, updateShortVideo, type ShortVideoInput } from "@/lib/shortsDb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function dbMissingResponse() {
  return NextResponse.json(
    {
      error:
        "DATABASE_URL is not set on the live server. Add your Supabase Postgres connection string in Vercel → Settings → Environment Variables, then Redeploy.",
    },
    { status: 503 },
  );
}

export async function GET(_request: Request, context: RouteContext) {
  if (!isDbConfigured()) return dbMissingResponse();
  const { id } = await context.params;
  try {
    const item = await getShortVideoById(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    console.error("[GET /api/admin/shorts/[id]]", error);
    const message = error instanceof Error ? error.message : "Database unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  if (!isDbConfigured()) return dbMissingResponse();
  const { id } = await context.params;
  try {
    const body = (await request.json()) as Partial<ShortVideoInput>;
    if (body.title !== undefined && !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (body.youtubeUrl !== undefined && !body.youtubeUrl.trim()) {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }

    const updated = await updateShortVideo(id, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("[PUT /api/admin/shorts/[id]]", error);
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isDbConfigured()) return dbMissingResponse();
  const { id } = await context.params;
  try {
    const ok = await deleteShortVideo(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/shorts/[id]]", error);
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
