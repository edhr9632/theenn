import { NextResponse } from "next/server";
import {
  getFestivalAdminState,
  updateFestivalConfig,
  type FestivalConfigInput,
} from "@/lib/festivalDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await getFestivalAdminState();
    return NextResponse.json({ festival: state });
  } catch (error) {
    console.error("[GET /api/admin/festival]", error);
    const message = error instanceof Error ? error.message : "Could not load festival settings.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as FestivalConfigInput;
    const updated = await updateFestivalConfig(body);
    if (!updated) {
      return NextResponse.json(
        { error: "Database is not configured. Add DATABASE_URL and run migrations." },
        { status: 503 },
      );
    }
    return NextResponse.json({ festival: updated });
  } catch (error) {
    console.error("[PUT /api/admin/festival]", error);
    const message = error instanceof Error ? error.message : "Could not save festival settings.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
