import { newsArticles, type NewsArticle } from "@/lib/data";

const EDUCATION_CATEGORIES = new Set([
  "EdTech",
  "K-12",
  "Higher Ed",
  "Wellbeing",
  "International",
  "Education",
]);

const EDUCATION_KEYWORDS =
  /\b(school|student|teacher|classroom|university|college|education|literacy|curriculum|edtech|campus|district|admission|visa|wellbeing|counselor)\b/i;

export type VoiceBriefStory = {
  title: string;
  excerpt: string;
  category: string;
  href: string;
  date: string;
};

export function isEducationNews(article: NewsArticle) {
  if (EDUCATION_CATEGORIES.has(article.category)) return true;
  if (article.category === "Policy" && EDUCATION_KEYWORDS.test(`${article.title} ${article.excerpt}`)) {
    return true;
  }
  return EDUCATION_KEYWORDS.test(`${article.title} ${article.excerpt} ${article.category}`);
}

/** Top education-only headlines for the daily voice brief (not general news). */
export function getTopEducationNews(limit = 5): VoiceBriefStory[] {
  return newsArticles
    .filter(isEducationNews)
    .slice(0, limit)
    .map((article) => ({
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      href: `/news/${article.slug}`,
      date: article.date,
    }));
}

export function buildEducationVoiceScript(stories: VoiceBriefStory[] = getTopEducationNews()) {
  if (!stories.length) {
    return "There are no top education headlines available right now. Please check back later on Education News Network.";
  }

  const intro =
    "Good day. This is your Education News Network daily education brief. Here are today's top education headlines.";

  const body = stories
    .map((story, index) => {
      const number = index + 1;
      return `Story ${number}. In ${story.category}. ${story.title}. ${story.excerpt}`;
    })
    .join(" ");

  const outro =
    "That concludes today's top education news from Education News Network. Keep watching Education News Network for more updates. For enquiries, please visit our Contact Us page, or write to us through the enquiry form on Education News Network. Thank you for listening.";

  return `${intro} ${body} ${outro}`;
}

export const VOICE_BRIEF_EVENT = "enn-voice-brief-play";

export function requestEducationVoiceBrief() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(VOICE_BRIEF_EVENT));
}
