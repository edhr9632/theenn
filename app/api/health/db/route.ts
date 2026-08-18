import { NextResponse } from "next/server";
import { isDbConfigured, query, readDatabaseUrl } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Quick check that the live server can reach Postgres (Supabase). */
export async function GET() {
  if (!isDbConfigured() || !readDatabaseUrl()) {
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
    const rows = await query<{ n: number }>("SELECT 1::int AS n");
    const shorts = await query<{ n: string }>("SELECT count(*)::text AS n FROM short_videos");
    return NextResponse.json({
      ok: true,
      configured: true,
      connected: rows[0]?.n === 1,
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
