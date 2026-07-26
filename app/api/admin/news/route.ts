import { NextResponse } from "next/server";
import {
  createNewsArticle,
  listNewsAdmin,
  type NewsArticleInput,
  type NewsSection,
} from "@/lib/newsDb";

const SECTIONS: NewsSection[] = ["daily", "trending", "press", "top_education"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") as NewsSection | null;
    if (section && !SECTIONS.includes(section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }
    const items = await listNewsAdmin(section ?? undefined);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[GET /api/admin/news]", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NewsArticleInput;
    if (!body.slug?.trim() || !body.title?.trim() || !body.section) {
      return NextResponse.json({ error: "slug, title, and section are required" }, { status: 400 });
    }
    if (!SECTIONS.includes(body.section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }
    const created = await createNewsArticle(body);
    if (!created) {
      return NextResponse.json({ error: "Could not create article" }, { status: 503 });
    }
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/news]", error);
    const message = error instanceof Error && error.message.includes("duplicate") ? "Slug already exists" : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
