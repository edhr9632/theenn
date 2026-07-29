import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import {
  createShortVideo,
  listShortVideosAdmin,
  type ShortVideoInput,
} from "@/lib/shortsDb";

function dbMissingResponse() {
  return NextResponse.json(
    {
      error:
        "DATABASE_URL is not set on the live server. Add your Supabase Postgres connection string in Vercel → Settings → Environment Variables, then Redeploy.",
    },
    { status: 503 },
  );
}

export async function GET() {
  if (!isDbConfigured()) return dbMissingResponse();

  try {
    const items = await listShortVideosAdmin();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[GET /api/admin/shorts]", error);
    const message = error instanceof Error ? error.message : "Database unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isDbConfigured()) return dbMissingResponse();

  try {
    const body = (await request.json()) as ShortVideoInput;
    if (!body.title?.trim() || !body.youtubeUrl?.trim()) {
      return NextResponse.json({ error: "Title and YouTube URL are required" }, { status: 400 });
    }

    const created = await createShortVideo(body);
    if (!created) {
      return NextResponse.json(
        {
          error:
            "Could not create short video (empty insert). Confirm short_videos table exists in Supabase.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/shorts]", error);
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
