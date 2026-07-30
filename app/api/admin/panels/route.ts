import { NextResponse } from "next/server";
import {
  createPanelDiscussion,
  listPanelDiscussionsAdmin,
  type AdminPanelInput,
} from "@/lib/panelsDb";

export async function GET() {
  try {
    const items = await listPanelDiscussionsAdmin();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[GET /api/admin/panels]", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AdminPanelInput;
    if (!body.title?.trim() || !body.youtubeUrl?.trim()) {
      return NextResponse.json({ error: "Title and YouTube URL are required" }, { status: 400 });
    }
    const created = await createPanelDiscussion(body);
    if (!created) {
      return NextResponse.json({ error: "Could not create panel discussion" }, { status: 503 });
    }
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/panels]", error);
    return NextResponse.json({ error: "Could not create panel discussion" }, { status: 503 });
  }
}
