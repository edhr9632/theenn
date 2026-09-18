import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import {
  deletePressBit,
  getPressBitById,
  updatePressBit,
  type PressBitInput,
} from "@/lib/pressBitsDb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function dbMissingResponse() {
  return NextResponse.json({ error: "Could not save press bit." }, { status: 503 });
}

export async function GET(_request: Request, context: RouteContext) {
  if (!isDbConfigured()) return dbMissingResponse();
  const { id } = await context.params;
  try {
    const item = await getPressBitById(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    console.error("[GET /api/admin/press-bits/[id]]", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  if (!isDbConfigured()) return dbMissingResponse();
  const { id } = await context.params;
  try {
    const body = (await request.json()) as Partial<PressBitInput>;
    if (body.title !== undefined && !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (body.videoUrl !== undefined && !body.videoUrl.trim()) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
    }

    const updated = await updatePressBit(id, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("[PUT /api/admin/press-bits/[id]]", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isDbConfigured()) return dbMissingResponse();
  const { id } = await context.params;
  try {
    const ok = await deletePressBit(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/press-bits/[id]]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
