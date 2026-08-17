import {
  getDailyBriefScript,
} from "@/lib/educationVoiceBrief";
import { getTopEducationStoriesFromDb } from "@/lib/educationVoiceBriefDb";
import { synthesizeMp3Cached, toArrayBuffer } from "@/lib/ttsMp3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stable daily news MP3 endpoint.
 * Always regenerates from the current top education headlines, but caches
 * in-memory while that script is unchanged — so alarms / smart speakers can
 * point at one unchanging URL (e.g. /audio/daily-latest.mp3).
 */
export async function GET() {
  try {
    const stories = await getTopEducationStoriesFromDb(5);
    const script = getDailyBriefScript(stories);
    const mp3 = await synthesizeMp3Cached("daily-education-brief", script);
    const body = toArrayBuffer(mp3);

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(body.byteLength),
        "Content-Disposition": 'inline; filename="enn-daily-education-brief.mp3"',
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        "X-ENN-Audio": "daily-education-brief",
        "X-ENN-Stories": String(stories.length),
      },
    });
  } catch (error) {
    console.error("Daily latest MP3 failed:", error);
    return Response.json(
      { error: "Could not generate today's education brief MP3 right now. Please try again." },
      { status: 502 },
    );
  }
}
