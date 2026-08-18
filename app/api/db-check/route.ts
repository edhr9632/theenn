import { NextResponse } from "next/server";
import { isDbConfigured, query, readDatabaseUrl } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function countOrZero(sql: string) {
  try {
    const rows = await query<{ n: string }>(sql);
    return Number(rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}

/** Quick check that the live server can reach Postgres (Supabase). */
export async function GET() {
  const resolved = readDatabaseUrl();
  if (!resolved || !isDbConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        connected: false,
        envKey: null,
        message:
          "No database URL on this Vercel project. In the project that owns theenn.com, add DATABASE_URL (Production), then Redeploy. Settings → Environment Variables.",
      },
      { status: 503 },
    );
  }

  try {
    await query("SELECT 1");
    const [shortVideos, siteVideos, panels, news] = await Promise.all([
      countOrZero("SELECT count(*)::text AS n FROM short_videos"),
      countOrZero("SELECT count(*)::text AS n FROM site_video_items"),
      countOrZero("SELECT count(*)::text AS n FROM panel_discussions"),
      countOrZero("SELECT count(*)::text AS n FROM news_articles WHERE status = 'published'"),
    ]);

    return NextResponse.json({
      ok: true,
      configured: true,
      connected: true,
      envKey: resolved.envKey,
      shortVideosCount: shortVideos,
      siteVideosCount: siteVideos,
      panelDiscussionsCount: panels,
      publishedNewsCount: news,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        connected: false,
        envKey: resolved.envKey,
        message,
      },
      { status: 503 },
    );
  }
}
