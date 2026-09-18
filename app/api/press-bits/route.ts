import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { getPressBitFilterOptions, getPressBitsFromDb } from "@/lib/pressBitsDb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ items: [], years: [], categoriesByYear: {} });
  }

  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const categoryParam = searchParams.get("category");
    const year = yearParam && yearParam !== "All" ? Number(yearParam) : undefined;
    const category = categoryParam && categoryParam !== "All" ? categoryParam : undefined;

    const [items, filters] = await Promise.all([
      getPressBitsFromDb({
        year: Number.isFinite(year) ? year : undefined,
        category,
      }),
      getPressBitFilterOptions(),
    ]);

    return NextResponse.json({
      items,
      years: filters.years,
      categoriesByYear: filters.categoriesByYear,
    });
  } catch (error) {
    console.error("[GET /api/press-bits]", error);
    return NextResponse.json({ items: [], years: [], categoriesByYear: {} });
  }
}
