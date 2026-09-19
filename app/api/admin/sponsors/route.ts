import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { createSponsor, listSponsorsAdmin, type SponsorInput } from "@/lib/sponsorsDb";

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ items: [] });
  try {
    return NextResponse.json({ items: await listSponsorsAdmin() });
  } catch (error) {
    console.error("[GET /api/admin/sponsors]", error);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Could not create sponsor." }, { status: 503 });
  }
  try {
    const body = (await request.json()) as SponsorInput;
    if (!body.name?.trim() || !body.category?.trim() || !body.year) {
      return NextResponse.json({ error: "Name, year, and category are required" }, { status: 400 });
    }
    if (!body.videoUrl?.trim()) {
      return NextResponse.json({ error: "YouTube/Shorts URL or uploaded video is required" }, { status: 400 });
    }
    const created = await createSponsor(body);
    if (!created) return NextResponse.json({ error: "Could not create sponsor." }, { status: 503 });
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/sponsors]", error);
    return NextResponse.json({ error: "Could not create sponsor." }, { status: 503 });
  }
}
