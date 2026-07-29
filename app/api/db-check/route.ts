import { NextResponse } from "next/server";
import { isDbConfigured, query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Quick check that the live server can reach Postgres (Supabase). */
export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message:
          "DATABASE_URL is missing. Add it in Vercel → Settings → Environment Variables (Production), then Redeploy.",
      },
      { status: 503 },
    );
  }

  try {
    await query("SELECT 1");
    const shorts = await query<{ n: string }>("SELECT count(*)::text AS n FROM short_videos");
    return NextResponse.json({
      ok: true,
      configured: true,
      connected: true,
      shortVideosCount: Number(shorts[0]?.n ?? 0),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        connected: false,
        message,
      },
      { status: 503 },
    );
  }
}
