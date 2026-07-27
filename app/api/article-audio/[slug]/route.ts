import { buildArticleNewsScript } from "@/lib/articleAudio";
import { getPublishedNewsDetail } from "@/lib/newsDb";
import { safeAudioFileName, synthesizeMp3FromText, toArrayBuffer } from "@/lib/ttsMp3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

async function resolveArticleForAudio(slug: string) {
  try {
    const fromDb = await getPublishedNewsDetail(slug);
    if (fromDb) return fromDb.article;
  } catch {
    /* database unavailable */
  }
  return null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const article = await resolveArticleForAudio(slug);

  if (!article) {
    return Response.json({ error: "Article not found" }, { status: 404 });
  }

  try {
    const script = buildArticleNewsScript(article);
    const mp3 = await synthesizeMp3FromText(script);
    const filename = `enn-${safeAudioFileName(article.slug)}-news-briefing.mp3`;

    return new Response(toArrayBuffer(mp3), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(mp3.byteLength),
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Article MP3 download failed:", error);
    return Response.json(
      { error: "Could not generate the news MP3 right now. Please try again." },
      { status: 502 },
    );
  }
}
