import { NextResponse } from "next/server";
import { deleteComment, updateCommentStatus } from "@/lib/commentsDb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = (await request.json()) as { status?: string };
    if (body.status !== "approved" && body.status !== "rejected" && body.status !== "pending") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await updateCommentStatus(id, body.status);
    if (!updated) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("[PUT /api/admin/comments/[id]]", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const ok = await deleteComment(id);
    if (!ok) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/comments/[id]]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
