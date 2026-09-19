import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { createSpeaker, listSpeakersAdmin, type SpeakerInput } from "@/lib/speakersDb";

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ items: [] });
  try {
    return NextResponse.json({ items: await listSpeakersAdmin() });
  } catch (error) {
    console.error("[GET /api/admin/speakers]", error);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Could not create speaker." }, { status: 503 });
  }
  try {
    const body = (await request.json()) as SpeakerInput;
    if (!body.name?.trim() || !body.category?.trim() || !body.year) {
      return NextResponse.json({ error: "Name, year, and category are required" }, { status: 400 });
    }
    if (!body.videoUrl?.trim()) {
      return NextResponse.json({ error: "YouTube/Shorts URL or uploaded video is required" }, { status: 400 });
    }
    const created = await createSpeaker(body);
    if (!created) return NextResponse.json({ error: "Could not create speaker." }, { status: 503 });
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/speakers]", error);
    return NextResponse.json({ error: "Could not create speaker." }, { status: 503 });
  }
}
