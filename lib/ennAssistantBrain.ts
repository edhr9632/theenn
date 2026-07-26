import { newsArticles, panelDiscussions, type NewsArticle } from "@/lib/data";
import { getTopEducationNews } from "@/lib/educationVoiceBrief";
import { podcastShows } from "@/lib/podcasts";
import { weeklyIssues } from "@/lib/weeklyIssues";

export type AssistantLink = {
  title: string;
  href: string;
  meta?: string;
};

export type AssistantReply = {
  message: string;
  links: AssistantLink[];
  suggestions: string[];
  action?: "play-voice-brief";
};

export type AssistantContext = {
  path?: string;
};

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "what", "how", "when", "where", "who",
  "tell", "me", "about", "show", "find", "latest", "news", "please", "can", "you",
  "i", "my", "in", "on", "for", "to", "of", "and", "or", "with", "from", "at", "this",
  "that", "do", "does", "any", "some", "give", "get", "need", "want", "enn", "education",
  "today", "article", "articles", "story", "stories",
]);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function scoreArticle(query: string, article: NewsArticle) {
  const tokens = tokenize(query);
  const haystack = `${article.title} ${article.excerpt} ${article.category} ${article.author}`.toLowerCase();
  let score = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) score += token.length > 5 ? 3 : 2;
  }

  if (query.includes(article.category.toLowerCase())) score += 4;
  if (query.includes(article.slug.replace(/-/g, " "))) score += 6;

  return score;
}

function searchArticles(query: string, limit = 4) {
  return newsArticles
    .map((article) => ({ article, score: scoreArticle(query, article) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.article);
}

function articleLinks(articles: NewsArticle[]): AssistantLink[] {
  return articles.map((article) => ({
    title: article.title,
    href: `/news/${article.slug}`,
    meta: `${article.category} · ${article.date}`,
  }));
}

function defaultFollowUps(): string[] {
  return ["Daily news", "Weekly news", "Podcast", "AI in classrooms", "Teacher shortage", "Literacy reform"];
}

function greetingReply(): AssistantReply {
  return {
    message:
      "Hi! I'm Ask ENN — your education news assistant. Choose Daily news, Weekly news, or Podcast below to browse everything on ENN, or ask about any education story.",
    links: [
      { title: "Daily News", href: "/news", meta: "Latest stories" },
      { title: "Weekly Magazines", href: "/weekly-news", meta: "City PDF editions" },
      { title: "Podcasts", href: "/podcasts", meta: "Shows & episodes" },
    ],
    suggestions: defaultFollowUps(),
  };
}

function voiceBriefReply(): AssistantReply {
  const stories = getTopEducationNews(5);
  const lines = stories.map(
    (story, index) => `${index + 1}. ${story.title} (${story.category}) — ${story.excerpt}`,
  );

  return {
    message: stories.length
      ? `Playing today's top education news brief now. You can also use the Listen news button on the home page.\n\n${lines.join("\n\n")}`
      : "I couldn't find top education headlines right now.",
    links: stories.map((story) => ({
      title: story.title,
      href: story.href,
      meta: `${story.category} · ${story.date}`,
    })),
    suggestions: defaultFollowUps(),
    action: "play-voice-brief",
  };
}

function dailyBriefReply(): AssistantReply {
  const articles = newsArticles;
  const lines = articles.map(
    (article, index) =>
      `${index + 1}. ${article.title}\n${article.category} · ${article.date} · ${article.readTime}\n${article.excerpt}`,
  );

  return {
    message: `Here is all Daily News on Education News Network right now:\n\n${lines.join("\n\n")}`,
    links: articles.map((article) => ({
      title: article.title,
      href: `/news/${article.slug}`,
      meta: `${article.category} · ${article.date}`,
    })),
    suggestions: defaultFollowUps(),
  };
}

function weeklyReply(): AssistantReply {
  const featured = weeklyIssues.find((issue) => issue.featured) ?? weeklyIssues[0];
  const lines = weeklyIssues.map(
    (issue, index) =>
      `${index + 1}. ${issue.title} (${issue.dateLabel})\n${issue.tagline}`,
  );
  const links = weeklyIssues.map((issue) => ({
    title: `${issue.title} (${issue.dateLabel})`,
    href: `/weekly-news/${issue.slug}`,
    meta: issue.tagline,
  }));

  return {
    message: featured
      ? `Here is all Weekly News on Education News Network. Featured edition: ${featured.title} (${featured.dateLabel}) — ${featured.tagline}\n\n${lines.join("\n\n")}`
      : `Here is all Weekly News on Education News Network:\n\n${lines.join("\n\n")}`,
    links,
    suggestions: defaultFollowUps(),
  };
}

function podcastReply(): AssistantReply {
  const links: AssistantLink[] = [];
  const lines: string[] = [];

  for (const show of podcastShows) {
    lines.push(`${show.title}\nHosted by ${show.host} · ${show.schedule}\n${show.description}`);
    links.push({
      title: show.title,
      href: `/podcasts/${show.slug}`,
      meta: `${show.host} · ${show.schedule}`,
    });

    for (const episode of show.episodes) {
      lines.push(`  • ${episode.title} (${episode.date} · ${episode.duration})\n    ${episode.summary}`);
      links.push({
        title: episode.title,
        href: `/podcasts/${show.slug}`,
        meta: `${show.title} · ${episode.duration}`,
      });
    }
  }

  return {
    message: `Here are all ENN Podcast shows and episodes:\n\n${lines.join("\n\n")}`,
    links,
    suggestions: defaultFollowUps(),
  };
}

function panelReply(): AssistantReply {
  const links = panelDiscussions.slice(0, 4).map((panel) => ({
    title: panel.title,
    href: "/panel-discussions",
    meta: `${panel.episode} · ${panel.topic} · ${panel.duration}`,
  }));

  return {
    message:
      "Explore **Panel Discussions** — expert conversations on literacy, funding equity, higher ed access, and student wellbeing:",
    links,
    suggestions: defaultFollowUps(),
  };
}

function eventsReply(): AssistantReply {
  return {
    message:
      "ENN covers major **education summits and awards** across India — North Educators' Summit, Maharashtra Educators' Summit, South India Educators' Summit, and national K-12 leadership conferences. Browse speakers and sponsors on our Events hub.",
    links: [
      { title: "Featured Events", href: "/events", meta: "Summits & awards" },
      { title: "Speakers", href: "/events/speakers", meta: "Expert profiles" },
      { title: "Sponsors", href: "/events/sponsors", meta: "Partners" },
    ],
    suggestions: defaultFollowUps(),
  };
}

/** AI-style article briefing written from ENN story fields for askENN answers. */
function writeArticleBrief(article: NewsArticle): AssistantReply {
  const message = [
    article.title,
    "",
    `${article.category} · ${article.date} · ${article.author} · ${article.readTime}`,
    "",
    "What's happening",
    article.excerpt,
    "",
    "Why it matters for education",
    `This ${article.category.toLowerCase()} story from Education News Network highlights a shift schools, educators, and parents are watching closely. ${article.author} reports on how the issue is unfolding and what leaders should track next.`,
    "",
    "What you can learn (quick take)",
    `- How this affects schools, educators, and parents right now`,
    `- What to watch next in the policy / classroom story`,
    `- A simple way to explain the change to others`,
    "",
    "Key takeaways",
    `Focus area: ${article.category}`,
    `Published: ${article.date}`,
    `Read time: ${article.readTime}`,
    `Bottom line: ${article.excerpt}`,
    "",
    "Read the full ENN report",
    "Open the complete article on Education News Network for more context, quotes, and analysis.",
  ].join("\n");

  return {
    message,
    links: [
      {
        title: `Read full story: ${article.title}`,
        href: `/news/${article.slug}`,
        meta: `${article.category} · ${article.readTime}`,
      },
    ],
    suggestions: defaultFollowUps(),
  };
}

function summarizeArticle(article: NewsArticle): AssistantReply {
  return writeArticleBrief(article);
}

function categoryReply(category: string): AssistantReply {
  const matches = newsArticles.filter((article) => article.category.toLowerCase() === category.toLowerCase());
  if (!matches.length) {
    return {
      message: `I couldn't find stories in **${category}** right now. Try asking about K-12, EdTech, Higher Ed, Policy, or Wellbeing.`,
      links: [{ title: "Browse all news", href: "/news" }],
      suggestions: defaultFollowUps(),
    };
  }

  return {
    message: `Here are ENN stories in **${category}**:`,
    links: articleLinks(matches.slice(0, 4)),
    suggestions: defaultFollowUps(),
  };
}

function findBestArticle(query: string) {
  const cleaned = query
    .replace(/^what should i know about\s*:?\s*/i, "")
    .replace(/^tell me about\s+/i, "")
    .replace(/^explain\s+/i, "")
    .trim();

  const byTitle = newsArticles.find(
    (article) =>
      article.title.toLowerCase() === cleaned.toLowerCase() ||
      cleaned.toLowerCase().includes(article.title.toLowerCase()) ||
      article.title.toLowerCase().includes(cleaned.toLowerCase().slice(0, 48)),
  );
  if (byTitle) return byTitle;

  const scored = newsArticles
    .map((article) => ({ article, score: scoreArticle(cleaned || query, article) }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].article : null;
}

function fallbackReply(query: string): AssistantReply {
  const best = findBestArticle(query);
  if (best && scoreArticle(query, best) >= 4) {
    return writeArticleBrief(best);
  }

  const matches = searchArticles(query, 4);
  if (matches.length === 1) {
    return writeArticleBrief(matches[0]);
  }
  if (matches.length) {
    return {
      message: `I found these ENN stories related to your question. Tap one to open the full report, or ask me about a specific headline:`,
      links: articleLinks(matches),
      suggestions: defaultFollowUps(),
    };
  }

  return {
    message:
      "I couldn't find an exact match on ENN for that. Try asking about a topic like **AI in classrooms**, **teacher shortage**, **literacy reform**, **weekly magazines**, or **podcasts**.",
    links: [
      { title: "Daily News", href: "/news" },
      { title: "Weekly News", href: "/weekly-news" },
      { title: "Podcasts", href: "/podcasts" },
    ],
    suggestions: defaultFollowUps(),
  };
}

function articleFromPath(path?: string) {
  if (!path) return null;
  const match = path.match(/^\/news\/([^/]+)$/);
  if (!match) return null;
  return newsArticles.find((article) => article.slug === match[1]) ?? null;
}

function detectIntent(query: string) {
  const q = query.toLowerCase().trim();

  if (/^(hi|hello|hey|help|start|menu)\b/.test(q)) return "greeting";
  if (
    /(listen|hear|voice|speak|read (aloud|out)|play).*(news|brief|headline|today|education)/.test(q) ||
    /(news|brief|headline|today|education).*(listen|hear|voice|speak|read aloud)/.test(q) ||
    /listen to today'?s education news/.test(q)
  ) {
    return "voice";
  }
  if (
    /(what'?s trending|trending news|daily news|daily brief|today'?s news|headlines|what'?s new|latest news)/.test(q)
  ) {
    return "brief";
  }
  if (/(show weekly|weekly news|weekly magazine|magazine|pdf|bengaluru|city edition)/.test(q)) return "weekly";
  if (/(^podcast$|latest podcast|podcasts?\b|episode)\b/.test(q)) return "podcast";
  if (/(panel|discussion|debate|roundtable)/.test(q)) return "panel";
  if (/(event|summit|award|speaker|sponsor)/.test(q)) return "events";
  if (/(summarize|summary|explain this|this article|this page)/.test(q)) return "summarize";
  if (/what should i know about|tell me about|explain\b/.test(q)) return "article";
  if (/(k-12|k12|higher ed|edtech|policy|wellbeing|international|literacy)/.test(q)) {
    if (q.includes("k-12") || q.includes("k12")) return "category:k-12";
    if (q.includes("higher ed")) return "category:Higher Ed";
    if (q.includes("edtech") || q.includes("ai")) return "category:EdTech";
    if (q.includes("policy") || q.includes("literacy")) return "category:Policy";
    if (q.includes("wellbeing") || q.includes("mental health")) return "category:Wellbeing";
    if (q.includes("international")) return "category:International";
  }

  return "search";
}

export function buildAssistantReply(message: string, context?: AssistantContext): AssistantReply {
  const query = message.trim();
  if (!query) return greetingReply();

  const pageArticle = articleFromPath(context?.path);
  const intent = detectIntent(query);

  if (intent === "greeting") return greetingReply();
  if (intent === "voice") return voiceBriefReply();
  if (intent === "brief") return dailyBriefReply();
  if (intent === "weekly") return weeklyReply();
  if (intent === "podcast") return podcastReply();
  if (intent === "panel") return panelReply();
  if (intent === "events") return eventsReply();

  if (intent === "summarize" && pageArticle) return summarizeArticle(pageArticle);

  if (intent === "article") {
    const article = findBestArticle(query);
    if (article) return writeArticleBrief(article);
  }

  if (intent.startsWith("category:")) {
    return categoryReply(intent.replace("category:", ""));
  }

  if (pageArticle && /this|current|here|page/.test(query.toLowerCase())) {
    return summarizeArticle(pageArticle);
  }

  return fallbackReply(query);
}

export function getAssistantKnowledgeSummary() {
  return {
    articles: newsArticles.length,
    weeklyEditions: weeklyIssues.length,
    podcasts: podcastShows.length,
    panels: panelDiscussions.length,
  };
}
