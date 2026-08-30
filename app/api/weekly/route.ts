import { NextResponse } from "next/server";
import { getWeeklyAdminState, getWeeklyIssueBySlug } from "@/lib/weeklyDb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim();

    if (slug) {
      const issue = await getWeeklyIssueBySlug(slug);
      if (!issue) {
        return NextResponse.json({ issue: null });
      }
      return NextResponse.json({ issue });
    }

    const weekly = await getWeeklyAdminState();
    return NextResponse.json(weekly);
  } catch (error) {
    console.error("[GET /api/weekly]", error);
    return NextResponse.json({ cities: [], issues: [] });
  }
}
