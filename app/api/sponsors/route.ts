import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { getSponsorFilterOptions, getSponsorsFromDb } from "@/lib/sponsorsDb";

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
      getSponsorsFromDb({ year: Number.isFinite(year) ? year : undefined, category }),
      getSponsorFilterOptions(),
    ]);
    return NextResponse.json({ items, years: filters.years, categoriesByYear: filters.categoriesByYear });
  } catch (error) {
    console.error("[GET /api/sponsors]", error);
    return NextResponse.json({ items: [], years: [], categoriesByYear: {} });
  }
}
