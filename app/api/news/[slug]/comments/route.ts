import { NextResponse } from "next/server";
import { createArticleComment, listApprovedComments } from "@/lib/commentsDb";
import type { ArticleCommentInput } from "@/lib/commentTypes";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateInput(body: Partial<ArticleCommentInput>): string | null {
  const authorName = body.authorName?.trim() ?? "";
  const authorEmail = body.authorEmail?.trim() ?? "";
  const text = body.body?.trim() ?? "";

  if (authorName.length < 2 || authorName.length > 80) {
    return "Please enter your name (2–80 characters).";
  }
  if (authorEmail && !EMAIL_RE.test(authorEmail)) {
    return "Please enter a valid email address.";
  }
  if (text.length < 10 || text.length > 2000) {
    return "Comment must be between 10 and 2000 characters.";
  }
  return null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!slug?.trim()) {
    return NextResponse.json({ error: "Invalid article" }, { status: 400 });
  }

  try {
    const comments = await listApprovedComments(slug);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("[GET /api/news/[slug]/comments]", error);
    return NextResponse.json({ error: "Could not load comments" }, { status: 503 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!slug?.trim()) {
    return NextResponse.json({ error: "Invalid article" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as Partial<ArticleCommentInput>;
    const error = validateInput(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const created = await createArticleComment(slug, {
      authorName: body.authorName!.trim(),
      authorEmail: body.authorEmail?.trim(),
      body: body.body!.trim(),
    });

    if (!created) {
      return NextResponse.json({ error: "Could not save comment" }, { status: 503 });
    }

    return NextResponse.json(
      {
        comment: created,
        message: "Comment submitted for admin approval.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/news/[slug]/comments]", error);
    return NextResponse.json({ error: "Could not save comment" }, { status: 500 });
  }
}
