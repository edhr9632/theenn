import "server-only";

import type { VoiceBriefStory } from "@/lib/educationVoiceBrief";
import { isDbConfigured } from "@/lib/db";
import { getNewsBySection, listPublishedNewsKnowledge } from "@/lib/newsDb";

function toVoiceStory(article: { title: string; excerpt: string; category: string; slug: string; date: string }): VoiceBriefStory {
  return {
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    href: `/news/${article.slug}`,
    date: article.date,
  };
}

/** Homepage Listen News: uploaded Top Education News, then other published blogs. */
export async function getTopEducationStoriesFromDb(limit = 5): Promise<VoiceBriefStory[]> {
  if (!isDbConfigured()) return [];

  try {
    const top = await getNewsBySection("top_education", limit);
    if (top.length) return top.map(toVoiceStory);

    const all = await listPublishedNewsKnowledge(limit);
    return all.map(toVoiceStory);
  } catch (error) {
    console.error("[getTopEducationStoriesFromDb]", error);
    return [];
  }
}
