import { NextResponse } from "next/server";
import {
  createWeeklyCity,
  deleteWeeklyCity,
  getWeeklyAdminState,
  resetWeeklyCitiesToDefaults,
  type WeeklyCityInput,
} from "@/lib/weeklyDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const weekly = await getWeeklyAdminState();
    return NextResponse.json({ weekly });
  } catch (error) {
    console.error("[GET /api/admin/weekly]", error);
    return NextResponse.json({ error: "Could not load weekly news." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { action?: string; name?: string };
    if (body.action === "reset-cities") {
      const cities = await resetWeeklyCitiesToDefaults();
      const weekly = await getWeeklyAdminState();
      return NextResponse.json({ cities, weekly });
    }

    const input: WeeklyCityInput = { name: body.name ?? "" };
    const city = await createWeeklyCity(input);
    if (!city) {
      return NextResponse.json(
        { error: "Database is not configured. Add DATABASE_URL and run migrations." },
        { status: 503 },
      );
    }
    const weekly = await getWeeklyAdminState();
    return NextResponse.json({ city, weekly }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/weekly]", error);
    const message = error instanceof Error ? error.message : "Could not save city.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { cityId?: string };
    const cityId = body.cityId?.trim();
    if (!cityId) {
      return NextResponse.json({ error: "cityId is required." }, { status: 400 });
    }
    const ok = await deleteWeeklyCity(cityId);
    if (!ok) {
      return NextResponse.json({ error: "City not found or database unavailable." }, { status: 404 });
    }
    const weekly = await getWeeklyAdminState();
    return NextResponse.json({ weekly });
  } catch (error) {
    console.error("[DELETE /api/admin/weekly]", error);
    return NextResponse.json({ error: "Could not delete city." }, { status: 503 });
  }
}
