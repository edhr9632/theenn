import { NextResponse } from "next/server";
import { createWeeklyIssue, type WeeklyIssueInput } from "@/lib/weeklyDb";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function validatePayload(body: WeeklyIssueInput) {
  const cover = body.coverImage?.trim() ?? "";
  const pdf = body.pdfUrl?.trim() ?? "";

  if (cover.startsWith("data:") || pdf.startsWith("data:")) {
    return "File is too large for direct save. Upload the cover/PDF using the upload buttons so files go to storage, or paste a /public path or https URL.";
  }

  if (cover.length > 2_000_000 || pdf.length > 2_000_000) {
    return "Cover or PDF value is too large. Upload files using the buttons instead of pasting huge content.";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WeeklyIssueInput;
    const validationError = validatePayload(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 413 });
    }

    const issue = await createWeeklyIssue(body);
    if (!issue) {
      return NextResponse.json(
        { error: "Database is not configured. Add DATABASE_URL and run migrations." },
        { status: 503 },
      );
    }
    return NextResponse.json({ issue }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/weekly/issues]", error);
    const message = error instanceof Error ? error.message : "Could not save weekly edition.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
