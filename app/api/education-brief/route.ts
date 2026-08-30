import { NextResponse } from "next/server";
import { buildEducationVoiceScript } from "@/lib/educationVoiceBrief";
import { getTopEducationStoriesFromDb } from "@/lib/educationVoiceBriefDb";
import { getActiveFestivalListenIntro } from "@/lib/festivalDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [stories, listenIntro] = await Promise.all([
      getTopEducationStoriesFromDb(5),
      getActiveFestivalListenIntro(),
    ]);
    return NextResponse.json({
      stories,
      listenIntro,
      script: buildEducationVoiceScript(stories, { listenIntro }),
    });
  } catch (error) {
    console.error("[GET /api/education-brief]", error);
    return NextResponse.json({
      stories: [],
      listenIntro: "",
      script: buildEducationVoiceScript([]),
    });
  }
}
