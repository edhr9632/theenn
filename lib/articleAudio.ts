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
