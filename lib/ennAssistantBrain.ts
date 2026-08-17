import { newsArticles, panelDiscussions, type NewsArticle } from "@/lib/data";
import { extractArticleKeywords, toArticleAskContext } from "@/lib/articleAskAi";
import { splitSentences, stripHtml } from "@/lib/htmlText";
import { podcastShows } from "@/lib/podcasts";
import { weeklyIssues } from "@/lib/weeklyIssues";

export type KnowledgeArticle = NewsArticle & {
  content?: string;
  section?: string;
};

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

function scoreArticle(query: string, article: KnowledgeArticle) {
  const tokens = tokenize(query);
  const haystack =
    `${article.title} ${article.excerpt} ${article.category} ${article.author} ${stripHtml(article.content || "")}`.toLowerCase();
  let score = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) score += token.length > 5 ? 3 : 2;
  }

  if (query.includes(article.category.toLowerCase())) score += 4;
  if (query.includes(article.slug.replace(/-/g, " "))) score += 6;

  return score;
}

function searchArticles(query: string, articles: KnowledgeArticle[], limit = 4) {
  return articles
    .map((article) => ({ article, score: scoreArticle(query, article) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.article);
}

function articleLinks(articles: KnowledgeArticle[]): AssistantLink[] {
  return articles.map((article) => ({
    title: article.title,
    href: `/news/${article.slug}`,
    meta: `${article.category} · ${article.date}`,
  }));
}

function defaultFollowUps(articles: KnowledgeArticle[]): string[] {
  const fromBlogs = articles.slice(0, 3).map((article) => `What should I know about: ${article.title}`);
  return fromBlogs.length
    ? [...fromBlogs, "Daily news", "Trending news"]
    : ["Daily news", "Weekly news", "Podcast"];
}

function greetingReply(articles: KnowledgeArticle[]): AssistantReply {
  return {
    message:
      "Hi! I'm Ask ENN — your education news assistant. Ask about any uploaded blog, or choose Daily news to see summaries of what we have published.",
    links: articleLinks(articles.slice(0, 4)),
    suggestions: defaultFollowUps(articles),
  };
}

function voiceBriefReply(articles: KnowledgeArticle[]): AssistantReply {
  const stories = articles.filter((article) => article.section === "top_education").slice(0, 5);
  const list = stories.length ? stories : articles.slice(0, 5);
  const lines = list.map(
    (story, index) => `${index + 1}. ${story.title} (${story.category}) — ${story.excerpt}`,
  );

  return {
    message: list.length
      ? `Playing today's top education news brief now. You can also use the Listen news button on the home page.\n\n${lines.join("\n\n")}`
      : "I couldn't find top education headlines right now. Publish blogs in Admin → News.",
    links: articleLinks(list),
    suggestions: defaultFollowUps(articles),
    action: list.length ? "play-voice-brief" : undefined,
  };
}

function sectionLabel(section?: string) {
  if (section === "top_education") return "Top Education News";
  if (section === "trending") return "Trending";
  if (section === "press") return "Press Release";
  return "Daily News";
}

function dailyBriefReply(articles: KnowledgeArticle[]): AssistantReply {
  if (!articles.length) {
    return {
      message:
        "No blogs have been published yet. Add stories in Admin → News (Top Education, Daily, or Trending) and they will appear here automatically.",
      links: [{ title: "Daily News", href: "/news", meta: "Latest stories" }],
      suggestions: ["Weekly news", "Podcast"],
    };
  }

  const grouped = new Map<string, KnowledgeArticle[]>();
  for (const article of articles) {
    const key = sectionLabel(article.section);
    const list = grouped.get(key) ?? [];
    list.push(article);
    grouped.set(key, list);
  }

  const blocks: string[] = ["Here are the blogs published on Education News Network right now:"];
  for (const [label, list] of grouped) {
    blocks.push(`\n${label}`);
    for (const [index, article] of list.entries()) {
      blocks.push(
        `${index + 1}. ${article.title}\n${article.category} · ${article.date} · ${article.readTime}\n${article.excerpt || "Open this story for the full summary."}`,
      );
    }
  }

  return {
    message: blocks.join("\n\n"),
    links: articleLinks(articles.slice(0, 12)),
    suggestions: defaultFollowUps(articles),
  };
}

function weeklyReply(): AssistantReply {
  const featured = weeklyIssues.find((issue) => issue.featured) ?? weeklyIssues[0];
  const lines = weeklyIssues.map(
    (issue, index) => `${index + 1}. ${issue.title} (${issue.dateLabel})\n${issue.tagline}`,
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
    suggestions: ["Daily news", "Podcast"],
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
    message: lines.length
      ? `Here are all ENN Podcast shows and episodes:\n\n${lines.join("\n\n")}`
      : "Podcast episodes will appear here when they are published.",
    links,
    suggestions: ["Daily news", "Weekly news"],
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
    suggestions: ["Daily news", "Weekly news"],
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
    suggestions: ["Daily news", "Weekly news"],
  };
}

function writeArticleBrief(article: KnowledgeArticle): AssistantReply {
  const body = stripHtml(article.content || "");
  const sentences = splitSentences(body);
  const lead = article.excerpt.trim() || sentences[0] || `${article.title} — coverage from Education News Network.`;
  const extra = sentences.filter((sentence) => sentence !== lead).slice(0, 3);
  const ctx = toArticleAskContext(article, article.content || "");
  const keywords = extractArticleKeywords(ctx, 6);
  const highlights = [...new Set([lead, ...extra])].slice(0, 4);

  const message = [
    article.title,
    "",
    `${article.category} · ${article.date} · ${article.author} · ${article.readTime}`,
    "",
    "What's happening",
    lead,
    extra[0] || "",
    "",
    "Why it matters for education",
    extra[1] ||
      `This ${article.category.toLowerCase()} story from Education News Network highlights a shift schools, educators, and parents are watching closely.`,
    "",
    "What you can learn (quick take)",
    ...highlights.slice(0, 3).map((item) => `- ${item}`),
    "",
    "Highlights",
    ...highlights.map((item) => `- ${item}`),
    "",
    "Keywords",
    keywords.length ? keywords.join(", ") : article.category,
    "",
    "Key takeaways",
    `Focus area: ${article.category}`,
    `Published: ${article.date}`,
    `Read time: ${article.readTime}`,
    `Bottom line: ${lead}`,
    "",
    "Read the full ENN report",
    "Ask me another question about this blog, or open the complete article on Education News Network.",
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  return {
    message,
    links: [
      {
        title: `Read full story: ${article.title}`,
        href: `/news/${article.slug}`,
        meta: `${article.category} · ${article.readTime}`,
      },
    ],
    suggestions: [
      `What is this article about?`,
      ...keywords.slice(0, 2).map((keyword) => `What is ${keyword}?`),
      "Daily news",
    ],
  };
}

function summarizeArticle(article: KnowledgeArticle): AssistantReply {
  return writeArticleBrief(article);
}

function categoryReply(category: string, articles: KnowledgeArticle[]): AssistantReply {
  const matches = articles.filter((article) => article.category.toLowerCase() === category.toLowerCase());
  if (!matches.length) {
    return {
      message: `I couldn't find stories in **${category}** right now. Try asking about a published headline, or choose Daily news.`,
      links: articleLinks(articles.slice(0, 4)),
      suggestions: defaultFollowUps(articles),
    };
  }

  return {
    message: `Here are ENN stories in **${category}**:`,
    links: articleLinks(matches.slice(0, 6)),
    suggestions: defaultFollowUps(articles),
  };
}

function findBestArticle(query: string, articles: KnowledgeArticle[]) {
  const cleaned = query
    .replace(/^what should i know about\s*:?\s*/i, "")
    .replace(/^tell me about\s+/i, "")
    .replace(/^explain\s+/i, "")
    .replace(/^summarize\s+/i, "")
    .trim();

  const byTitle = articles.find(
    (article) =>
      article.title.toLowerCase() === cleaned.toLowerCase() ||
      cleaned.toLowerCase().includes(article.title.toLowerCase()) ||
      article.title.toLowerCase().includes(cleaned.toLowerCase().slice(0, 48)),
  );
  if (byTitle) return byTitle;

  const bySlug = articles.find((article) => cleaned.includes(article.slug.replace(/-/g, " ")));
  if (bySlug) return bySlug;

  const scored = articles
    .map((article) => ({ article, score: scoreArticle(cleaned || query, article) }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].article : null;
}

function fallbackReply(query: string, articles: KnowledgeArticle[]): AssistantReply {
  const best = findBestArticle(query, articles);
  if (best && scoreArticle(query, best) >= 4) {
    return writeArticleBrief(best);
  }

  const matches = searchArticles(query, articles, 4);
  if (matches.length === 1) {
    return writeArticleBrief(matches[0]);
  }
  if (matches.length) {
    return {
      message: `I found these ENN blogs related to your question. Tap one for a summary of that story:`,
      links: articleLinks(matches),
      suggestions: defaultFollowUps(articles),
    };
  }

  return {
    message:
      "I couldn't find an exact match in the blogs published on ENN. Try Daily news to see every uploaded story, or ask about a headline.",
    links: articleLinks(articles.slice(0, 4)),
    suggestions: defaultFollowUps(articles),
  };
}

function articleFromPath(path: string | undefined, articles: KnowledgeArticle[]) {
  if (!path) return null;
  const match = path.match(/^\/news\/([^/]+)$/);
  if (!match) return null;
  return articles.find((article) => article.slug === match[1]) ?? null;
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
    /(what'?s trending|trending news|daily news|daily brief|today'?s news|headlines|what'?s new|latest news|all blogs|uploaded blogs)/.test(
      q,
    )
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

export function buildAssistantReply(
  message: string,
  context?: AssistantContext,
  knowledge: KnowledgeArticle[] = newsArticles,
): AssistantReply {
  const query = message.trim();
  const articles = knowledge;
  if (!query) return greetingReply(articles);

  const pageArticle = articleFromPath(context?.path, articles);
  const intent = detectIntent(query);

  if (intent === "greeting") return greetingReply(articles);
  if (intent === "voice") return voiceBriefReply(articles);
  if (intent === "brief") return dailyBriefReply(articles);
  if (intent === "weekly") return weeklyReply();
  if (intent === "podcast") return podcastReply();
  if (intent === "panel") return panelReply();
  if (intent === "events") return eventsReply();

  if (intent === "summarize" && pageArticle) return summarizeArticle(pageArticle);

  if (intent === "article") {
    const article = findBestArticle(query, articles);
    if (article) return writeArticleBrief(article);
  }

  if (intent.startsWith("category:")) {
    return categoryReply(intent.replace("category:", ""), articles);
  }

  if (pageArticle && /this|current|here|page/.test(query.toLowerCase())) {
    return summarizeArticle(pageArticle);
  }

  return fallbackReply(query, articles);
}

export function getAssistantKnowledgeSummary(knowledge: KnowledgeArticle[] = newsArticles) {
  return {
    articles: knowledge.length,
    weeklyEditions: weeklyIssues.length,
    podcasts: podcastShows.length,
    panels: panelDiscussions.length,
  };
}
