/** Shared HTML → plain text helpers for TTS, Ask ENN, and keyword highlighting. */

export function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, " ")
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

export function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 24);
}

export function htmlToSpeechText(html: string, maxChars = 12_000) {
  const text = stripHtml(html);
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return `${cut.slice(0, lastStop > 400 ? lastStop + 1 : maxChars).trim()} That concludes this article reading from Education News Network.`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Highlight whole-word keywords in HTML text nodes only (does not touch tags). */
export function highlightKeywordsInHtml(html: string, keywords: string[]) {
  const unique = [...new Set(keywords.map((k) => k.trim()).filter((k) => k.length > 2))].slice(0, 8);
  if (!html || !unique.length) return html;

  return html.replace(/(<[^>]+>)|([^<]+)/g, (match, tag: string | undefined, text: string | undefined) => {
    if (tag || !text) return match;
    let out = text;
    for (const keyword of unique) {
      const re = new RegExp(`\\b(${escapeRegExp(keyword)})\\b`, "gi");
      out = out.replace(re, '<mark class="article-keyword">$1</mark>');
    }
    return out;
  });
}
