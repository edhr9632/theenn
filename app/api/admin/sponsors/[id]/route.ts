import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { deleteSponsor, getSponsorById, updateSponsor, type SponsorInput } from "@/lib/sponsorsDb";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const { id } = await context.params;
  try {
    const item = await getSponsorById(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    console.error("[GET /api/admin/sponsors/[id]]", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Could not save sponsor." }, { status: 503 });
  const { id } = await context.params;
  try {
    const body = (await request.json()) as Partial<SponsorInput>;
    const updated = await updateSponsor(id, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("[PUT /api/admin/sponsors/[id]]", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Could not delete sponsor." }, { status: 503 });
  const { id } = await context.params;
  try {
    const ok = await deleteSponsor(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/sponsors/[id]]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
