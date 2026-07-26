import { NextResponse } from "next/server";
import {
  deleteNewsArticle,
  getNewsBySlug,
  updateNewsArticle,
  type NewsArticleInput,
  type NewsSection,
} from "@/lib/newsDb";

const SECTIONS: NewsSection[] = ["daily", "trending", "press", "top_education"];

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const item = await getNewsBySlug(slug);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    console.error("[GET /api/admin/news/[slug]]", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = (await request.json()) as Partial<NewsArticleInput>;
    if (body.section && !SECTIONS.includes(body.section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }
    const updated = await updateNewsArticle(slug, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("[PUT /api/admin/news/[slug]]", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const ok = await deleteNewsArticle(slug);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/news/[slug]]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
