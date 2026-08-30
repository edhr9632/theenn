import { NextResponse } from "next/server";
import { createFestivalPost, type FestivalPostInput } from "@/lib/festivalDb";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FestivalPostInput;
    const post = await createFestivalPost(body);
    if (!post) {
      return NextResponse.json(
        { error: "Database is not configured. Add DATABASE_URL and run migrations." },
        { status: 503 },
      );
    }
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/festival/posts]", error);
    const message = error instanceof Error ? error.message : "Could not create festival post.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
