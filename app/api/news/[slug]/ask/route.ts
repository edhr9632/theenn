import { NextResponse } from "next/server";
import { answerFromArticle, toArticleAskContext } from "@/lib/articleAskAi";
import { getPublishedNewsDetail } from "@/lib/newsDb";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

async function loadArticleContext(slug: string) {
  try {
    const fromDb = await getPublishedNewsDetail(slug);
    if (fromDb) {
      return toArticleAskContext(fromDb.article, fromDb.content);
    }
  } catch {
    /* db unavailable */
  }
  return null;
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!slug?.trim()) {
    return NextResponse.json({ error: "Invalid article" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as { question?: string };
    const question = body.question?.trim() ?? "";
    if (!question) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }
    if (question.length > 400) {
      return NextResponse.json({ error: "Please keep your question under 400 characters." }, { status: 400 });
    }

    const articleCtx = await loadArticleContext(slug);
    if (!articleCtx) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    const reply = answerFromArticle(question, articleCtx);
    return NextResponse.json({
      ...reply,
      articleTitle: articleCtx.title,
      poweredBy: "enn-article-ai",
    });
  } catch (error) {
    console.error("[POST /api/news/[slug]/ask]", error);
    return NextResponse.json({ error: "Could not answer right now." }, { status: 500 });
  }
}
