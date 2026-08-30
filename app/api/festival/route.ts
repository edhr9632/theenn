import { NextResponse } from "next/server";
import { getPublicFestivalPopupConfig, getActiveFestivalListenIntro } from "@/lib/festivalDb";

export const dynamic = "force-dynamic";

/** Public festival popup payload for the site. */
export async function GET() {
  try {
    const [config, listenIntro] = await Promise.all([
      getPublicFestivalPopupConfig(),
      getActiveFestivalListenIntro(),
    ]);
    return NextResponse.json({ config, listenIntro });
  } catch (error) {
    console.error("[GET /api/festival]", error);
    return NextResponse.json({ config: null, listenIntro: "" });
  }
}
