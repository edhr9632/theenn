import type { VoiceBriefStory } from "@/lib/educationVoiceBrief";

export type AskEnnTrendingPrompt = {
  label: string;
  query: string;
};

export function promptsFromStories(stories: VoiceBriefStory[], limit = 5): AskEnnTrendingPrompt[] {
  return stories.slice(0, limit).map((story) => {
    const title = story.title.replace(/\?$/, "").trim();
    const query = `What should I know about: ${title}`;
    let label = title;

    if (!story.title.endsWith("?")) {
      if (/^(how|what|why|when|where|who)\b/i.test(title)) {
        label = `${title}?`;
      } else if (title.length <= 64) {
        label = `What should I know about ${title}?`;
      } else {
        label = `${title.slice(0, 61).trim()}…?`;
      }
    }

    return { label, query };
  });
}

export function faqItemsFromStories(stories: VoiceBriefStory[], limit = 6) {
  return stories.slice(0, limit).map((story) => ({
    question: `What should I know about: ${story.title}`,
    answer: story.excerpt,
    href: story.href,
    title: story.title,
  }));
}

/** Client fallback when the prompts API has not loaded yet. */
export function getAskEnnTrendingPrompts(_limit = 5): AskEnnTrendingPrompt[] {
  return [];
}

export function getAskEnnSuggestions(limit = 3): string[] {
  return getAskEnnTrendingPrompts(limit).map((item) => item.query);
}

export function getAskEnnFaqItems(limit = 6) {
  return faqItemsFromStories([], limit);
}
