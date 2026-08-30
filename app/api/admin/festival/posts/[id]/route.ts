import { NextResponse } from "next/server";
import {
  deleteFestivalPost,
  updateFestivalPost,
  type FestivalPostInput,
} from "@/lib/festivalDb";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as FestivalPostInput;
    const post = await updateFestivalPost(id, body);
    if (!post) {
      return NextResponse.json({ error: "Festival post not found or database unavailable." }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (error) {
    console.error("[PUT /api/admin/festival/posts/:id]", error);
    const message = error instanceof Error ? error.message : "Could not update festival post.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ok = await deleteFestivalPost(id);
    if (!ok) {
      return NextResponse.json({ error: "Festival post not found or database unavailable." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/festival/posts/:id]", error);
    const message = error instanceof Error ? error.message : "Could not delete festival post.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
