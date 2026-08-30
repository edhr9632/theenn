import { NextResponse } from "next/server";
import {
  deleteWeeklyIssue,
  getWeeklyIssueBySlug,
  updateWeeklyIssue,
  type WeeklyIssueInput,
} from "@/lib/weeklyDb";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const issue = await getWeeklyIssueBySlug(slug);
    if (!issue) {
      return NextResponse.json({ error: "Weekly edition not found." }, { status: 404 });
    }
    return NextResponse.json({ issue });
  } catch (error) {
    console.error("[GET /api/admin/weekly/issues/:slug]", error);
    return NextResponse.json({ error: "Could not load weekly edition." }, { status: 503 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = (await request.json()) as WeeklyIssueInput;

    const cover = body.coverImage?.trim() ?? "";
    const pdf = body.pdfUrl?.trim() ?? "";
    if (cover.startsWith("data:") || pdf.startsWith("data:")) {
      return NextResponse.json(
        {
          error:
            "File is too large for direct save. Upload the cover/PDF using the upload buttons so files go to storage, or paste a /public path or https URL.",
        },
        { status: 413 },
      );
    }

    const issue = await updateWeeklyIssue(slug, body);
    if (!issue) {
      return NextResponse.json({ error: "Weekly edition not found." }, { status: 404 });
    }
    return NextResponse.json({ issue });
  } catch (error) {
    console.error("[PUT /api/admin/weekly/issues/:slug]", error);
    const message = error instanceof Error ? error.message : "Could not update weekly edition.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const ok = await deleteWeeklyIssue(slug);
    if (!ok) {
      return NextResponse.json({ error: "Weekly edition not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/weekly/issues/:slug]", error);
    return NextResponse.json({ error: "Could not delete weekly edition." }, { status: 503 });
  }
}
