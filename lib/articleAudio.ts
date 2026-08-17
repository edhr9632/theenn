import type { NewsArticle } from "@/lib/data";
import { htmlToSpeechText } from "@/lib/htmlText";

/** Builds a spoken script that reads the full uploaded blog. */
export function buildArticleNewsScript(article: NewsArticle, contentHtml = "") {
  const body = htmlToSpeechText(contentHtml);
  const lede = article.excerpt.trim();
  const bodyWithoutLede =
    lede && body.toLowerCase().startsWith(lede.toLowerCase().slice(0, 40))
      ? body.slice(lede.length).trim()
      : body;

  const parts = [
    "You're listening to Education News Network.",
    `${article.category} coverage for ${article.date}.`,
    `Our story: ${article.title}.`,
    `Reporting by ${article.author}.`,
  ];

  if (lede) {
    parts.push(lede.endsWith(".") ? lede : `${lede}.`);
  }

  if (bodyWithoutLede) {
    parts.push("Here is the full article.");
    parts.push(bodyWithoutLede);
  } else if (!lede) {
    parts.push("The full article text is not available yet.");
  }

  parts.push(`That was ${article.title}, from Education News Network.`);
  parts.push("Keep watching Education News Network for more updates.");
  parts.push(
    "For enquiries, please visit our Contact Us page, or write to us through the enquiry form on Education News Network.",
  );
  parts.push("Thank you for listening.");

  return parts.filter(Boolean).join(" ");
}

export function estimateListenMinutes(script: string) {
  const words = script.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 150));
  return `${minutes} min listen`;
}

/** Chrome/Safari fail on long SpeechSynthesis utterances — keep chunks short. */
export function splitSpeechChunks(text: string, maxLen = 160): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const pieces = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [cleaned];
  const chunks: string[] = [];
  let buffer = "";

  const pushWords = (value: string) => {
    const words = value.split(" ");
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length <= maxLen) {
        current = next;
      } else {
        if (current) chunks.push(current);
        current = word;
      }
    }
    if (current) chunks.push(current);
  };

  for (const piece of pieces) {
    const sentence = piece.trim();
    if (!sentence) continue;
    const combined = buffer ? `${buffer} ${sentence}` : sentence;
    if (combined.length <= maxLen) {
      buffer = combined;
      continue;
    }
    if (buffer) chunks.push(buffer);
    buffer = "";
    if (sentence.length <= maxLen) buffer = sentence;
    else pushWords(sentence);
  }

  if (buffer) chunks.push(buffer);
  return chunks;
}
