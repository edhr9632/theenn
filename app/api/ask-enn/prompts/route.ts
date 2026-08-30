import { NextResponse } from "next/server";
import { promptsFromStories } from "@/lib/askEnnSuggestions";
import { getTopEducationStoriesFromDb } from "@/lib/educationVoiceBriefDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stories = await getTopEducationStoriesFromDb(8);
    return NextResponse.json({
      prompts: promptsFromStories(stories, 6),
      latest: stories.map((story) => ({
        title: story.title,
        href: story.href,
      })),
    });
  } catch (error) {
    console.error("[GET /api/ask-enn/prompts]", error);
    return NextResponse.json({ prompts: [] });
  }
}
