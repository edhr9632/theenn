import type { NewsArticle } from "@/lib/data";

export type ArticleAskContext = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  contentHtml: string;
};

export type ArticleAskFaqItem = {
  question: string;
  answer: string;
};

export type ArticleAskReply = {
  answer: string;
  citations: string[];
  suggestions: string[];
  grounded: boolean;
};

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 35);
}

const STOP = new Set([
  "a", "an", "the", "is", "are", "was", "were", "what", "how", "when", "where", "who", "why",
  "tell", "me", "about", "show", "find", "please", "can", "you", "i", "my", "in", "on", "for",
  "to", "of", "and", "or", "with", "from", "at", "this", "that", "do", "does", "any", "some",
  "give", "get", "need", "want", "enn", "article", "story", "news", "explain", "define",
]);

function tokens(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function scorePassage(queryTokens: string[], passage: string) {
  const hay = passage.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (hay.includes(token)) score += token.length > 5 ? 3 : 2;
  }
  return score;
}

function buildCorpus(ctx: ArticleAskContext) {
  const body = stripHtml(ctx.contentHtml);
  const parts = [ctx.title, ctx.excerpt, body].filter(Boolean);
  return parts.join(". ").replace(/\s+/g, " ").trim();
}

/** Top keywords from title + body for auto FAQ generation on every blog. */
export function extractArticleKeywords(ctx: ArticleAskContext, limit = 5): string[] {
  const corpus = `${ctx.title} ${ctx.excerpt} ${stripHtml(ctx.contentHtml)}`.toLowerCase();
  const words = corpus
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));

  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  // Prefer title tokens first
  const titleKeys = tokens(ctx.title);
  const ranked = [...counts.entries()]
    .map(([word, count]) => ({
      word,
      score: count + (titleKeys.includes(word) ? 8 : 0) + (word.length > 6 ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.word);

  const unique: string[] = [];
  for (const word of [...titleKeys, ...ranked]) {
    if (!unique.includes(word)) unique.push(word);
    if (unique.length >= limit) break;
  }
  return unique;
}

function bestSentenceForKeyword(keyword: string, sentences: string[], fallback: string) {
  const scored = sentences
    .map((s) => ({ s, score: scorePassage([keyword], s) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.s || fallback;
}

/** Suggested questions for the Ask AI box. */
export function buildArticleSuggestedQuestions(ctx: ArticleAskContext, limit = 5): string[] {
  const keywords = extractArticleKeywords(ctx, 3);
  const questions = [
    `What is this article about?`,
    ...keywords.map((kw) => {
      const label = kw.charAt(0).toUpperCase() + kw.slice(1);
      return `What is ${label}?`;
    }),
    `Why does this ${ctx.category.toLowerCase()} story matter?`,
    `Who is affected by this news?`,
  ];

  return [...new Set(questions)].slice(0, limit);
}

/**
 * Auto FAQ for every blog — generated from article keywords + content.
 * Also emits FAQPage schema via ArticleFaqSection.
 */
export function buildArticleFaqs(ctx: ArticleAskContext, limit = 6): ArticleAskFaqItem[] {
  const corpus = buildCorpus(ctx);
  const sentences = splitSentences(corpus);
  const lead = ctx.excerpt?.trim() || sentences[0] || `${ctx.title} — coverage from Education News Network.`;
  const keywords = extractArticleKeywords(ctx, 4);

  const faqs: ArticleAskFaqItem[] = [
    {
      question: `What is this article about?`,
      answer: lead,
    },
  ];

  for (const keyword of keywords) {
    const label = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    faqs.push({
      question: `What should I know about ${label}?`,
      answer: bestSentenceForKeyword(keyword, sentences, lead),
    });
  }

  faqs.push({
    question: `Why does this ${ctx.category.toLowerCase()} news matter?`,
    answer:
      sentences[1] ||
      `This ${ctx.category.toLowerCase()} report from Education News Network explains developments that schools, educators, parents, and policymakers should track.`,
  });

  faqs.push({
    question: `Who reported this story and when?`,
    answer: `Reported by ${ctx.author || "ENN Desk"} on ${ctx.date || "ENN"}. Category: ${ctx.category}.`,
  });

  // Deduplicate by question
  const seen = new Set<string>();
  const unique: ArticleAskFaqItem[] = [];
  for (const item of faqs) {
    if (seen.has(item.question)) continue;
    seen.add(item.question);
    unique.push(item);
  }
  return unique.slice(0, limit);
}

/** @deprecated Use buildArticleFaqs */
export function buildArticleGeoFaqs(ctx: ArticleAskContext, limit = 6) {
  return buildArticleFaqs(ctx, limit);
}

export function answerFromArticle(question: string, ctx: ArticleAskContext): ArticleAskReply {
  const q = question.trim();
  const suggestions = buildArticleSuggestedQuestions(ctx);
  const corpus = buildCorpus(ctx);
  const sentences = splitSentences(corpus);
  const qLower = q.toLowerCase();

  if (!q) {
    return {
      answer: "Ask a question about this article — for example, “What is this story about?”",
      citations: [],
      suggestions,
      grounded: false,
    };
  }

  // Summary / overview intents — always answer from title + excerpt + lead sentences
  if (
    /(what (is|does) this (article|story|report)|what (is|are) this about|summar(y|ize)|overview|main point|key (takeaway|points?))/.test(
      qLower,
    ) ||
    /^what is this\b/.test(qLower)
  ) {
    const lead = [ctx.excerpt, ...sentences.slice(0, 2)].filter(Boolean);
    const unique = [...new Set(lead)].slice(0, 3);
    return {
      answer: [
        `“${ctx.title}” covers this:`,
        "",
        unique.map((s) => `• ${s}`).join("\n"),
        "",
        `Category: ${ctx.category} · Reported by ${ctx.author} · ${ctx.date}`,
        "",
        "— Answered from this ENN article.",
      ].join("\n"),
      citations: unique,
      suggestions,
      grounded: unique.length > 0,
    };
  }

  const qTokens = tokens(q);
  if (!sentences.length && !ctx.excerpt) {
    return {
      answer: `This ENN article covers “${ctx.title}”. Open the full story for more detail.`,
      citations: [],
      suggestions,
      grounded: false,
    };
  }

  const ranked = sentences
    .map((sentence) => ({ sentence, score: scorePassage(qTokens, sentence) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // Also score excerpt as a passage
  if (ctx.excerpt) {
    const excerptScore = scorePassage(qTokens, ctx.excerpt);
    if (excerptScore > 0) {
      ranked.unshift({ sentence: ctx.excerpt, score: excerptScore + 2 });
      ranked.sort((a, b) => b.score - a.score);
    }
  }

  const top = [...new Set(ranked.slice(0, 3).map((item) => item.sentence))];
  const grounded = top.length > 0;

  let answer: string;
  if (grounded) {
    const primary = top[0];
    const extra = top.slice(1);
    answer = [
      primary,
      extra.length ? `\n\nAlso from this article:\n${extra.map((s) => `• ${s}`).join("\n")}` : "",
      `\n\n— Answered from this ENN article: “${ctx.title}”.`,
    ].join("");
  } else {
    answer = [
      `I could not find a direct answer to that in this article.`,
      `Here is the core of the story: ${ctx.excerpt || ctx.title}`,
      `Try asking about the main topic, who is affected, or what happens next.`,
    ].join("\n\n");
  }

  return {
    answer,
    citations: top,
    suggestions,
    grounded,
  };
}

export function toArticleAskContext(
  article: Pick<NewsArticle, "slug" | "title" | "excerpt" | "category" | "author" | "date">,
  contentHtml: string,
): ArticleAskContext {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    author: article.author,
    date: article.date,
    contentHtml,
  };
}
