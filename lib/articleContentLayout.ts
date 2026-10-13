const VIDEO_BLOCK_RE =
  /<div class="wp-block-embed[^"]*is-type-video[^"]*"[\s\S]*?<\/div>\s*<\/div>|<figure class="wp-block-video-card"[\s\S]*?<\/figure>/i;

const BLOCK_RE =
  /<h[2-6][\s\S]*?<\/h[2-6]>|<p\b[\s\S]*?<\/p>|<blockquote[\s\S]*?<\/blockquote>|<ul[\s\S]*?<\/ul>|<ol[\s\S]*?<\/ol>|<figure[\s\S]*?<\/figure>|<hr\s*\/?>|<div\b[\s\S]*?<\/div>/gi;

function plainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isEmptyBlock(html: string) {
  return plainText(html).length === 0;
}

/**
 * If a video embed is at (or near) the start of the article, move it to the
 * middle of the body so the story leads with text instead of the player.
 */
export function placeLeadingVideoMidContent(html: string): string {
  const source = html?.trim();
  if (!source || !VIDEO_BLOCK_RE.test(source)) return html;

  const match = source.match(VIDEO_BLOCK_RE);
  if (!match || match.index === undefined) return html;

  const videoHtml = match[0];
  const beforeVideo = source.slice(0, match.index);
  const textBefore = plainText(beforeVideo);

  // Already placed after real copy — leave alone
  if (textBefore.length > 120) return html;

  const withoutVideo = `${source.slice(0, match.index)}${source.slice(match.index + videoHtml.length)}`.trim();
  const blocks = withoutVideo.match(BLOCK_RE) ?? (withoutVideo ? [withoutVideo] : []);
  const meaningful = blocks.filter((block) => !isEmptyBlock(block));

  if (meaningful.length === 0) {
    return `${videoHtml}${withoutVideo}`;
  }

  if (meaningful.length === 1) {
    return `${meaningful[0]}${videoHtml}`;
  }

  const insertAt = Math.max(1, Math.floor(meaningful.length / 2));
  return `${meaningful.slice(0, insertAt).join("")}${videoHtml}${meaningful.slice(insertAt).join("")}`;
}
