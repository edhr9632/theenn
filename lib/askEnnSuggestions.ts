import { getTopEducationNews } from "@/lib/educationVoiceBrief";
import { newsArticles } from "@/lib/data";

export type AskEnnTrendingPrompt = {
  label: string;
  query: string;
};

/** Short trending chips for the Ask ENN full-page overlay. */
export function getAskEnnTrendingPrompts(limit = 5): AskEnnTrendingPrompt[] {
  const education = getTopEducationNews(limit);
  const source = education.length
    ? education
    : newsArticles.slice(0, limit).map((article) => ({
        title: article.title,
        href: `/news/${article.slug}`,
      }));

  return source.map((story) => {
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

/** Suggested prompts derived from live site news for the askENN bar. */
export function getAskEnnSuggestions(limit = 3): string[] {
  return getAskEnnTrendingPrompts(limit).map((item) => item.query);
}

/** Crawlable FAQ pairs for Google (askENN landing SEO). */
export function getAskEnnFaqItems(limit = 6) {
  const stories = getTopEducationNews(limit);
  if (stories.length) {
    return stories.map((story) => ({
      question: `What should I know about: ${story.title}`,
      answer: story.excerpt,
      href: story.href,
      title: story.title,
    }));
  }

  return newsArticles.slice(0, limit).map((article) => ({
    question: `What should I know about: ${article.title}`,
    answer: article.excerpt,
    href: `/news/${article.slug}`,
    title: article.title,
  }));
}
