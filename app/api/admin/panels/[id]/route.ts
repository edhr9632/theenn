import { NextResponse } from "next/server";
import { deletePanelDiscussion, updatePanelDiscussion, type AdminPanelInput } from "@/lib/panelsDb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = (await request.json()) as Partial<AdminPanelInput>;
    if (body.title !== undefined && !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (body.youtubeUrl !== undefined && !body.youtubeUrl.trim()) {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }
    const updated = await updatePanelDiscussion(id, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("[PUT /api/admin/panels/[id]]", error);
    return NextResponse.json({ error: "Could not update panel discussion" }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const ok = await deletePanelDiscussion(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/panels/[id]]", error);
    return NextResponse.json({ error: "Could not delete panel discussion" }, { status: 503 });
  }
}
