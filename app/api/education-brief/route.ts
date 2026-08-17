import { NextResponse } from "next/server";
import { buildEducationVoiceScript } from "@/lib/educationVoiceBrief";
import { getTopEducationStoriesFromDb } from "@/lib/educationVoiceBriefDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stories = await getTopEducationStoriesFromDb(5);
    return NextResponse.json({
      stories,
      script: buildEducationVoiceScript(stories),
    });
  } catch (error) {
    console.error("[GET /api/education-brief]", error);
    return NextResponse.json({ stories: [], script: buildEducationVoiceScript([]) });
  }
}
