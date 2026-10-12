export function extractYoutubeId(url: string) {
  const match =
    url.match(
      /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
    ) ?? null;
  return match?.[1] ?? null;
}

export function extractVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
}

export function youtubeThumb(url: string) {
  const id = extractYoutubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : "";
}

export function extractFirstVideoUrlFromHtml(html: string): string | null {
  if (!html) return null;

  const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch?.[1] && /youtube|youtu\.be|vimeo/i.test(iframeMatch[1])) {
    return iframeMatch[1];
  }

  const urlMatch = html.match(
    /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=[\w-]+|embed\/[\w-]+|shorts\/[\w-]+)|youtu\.be\/[\w-]+|vimeo\.com\/(?:video\/)?\d+)/i,
  );
  return urlMatch?.[0] ?? null;
}

export function hasVideoInHtml(html: string) {
  return Boolean(extractFirstVideoUrlFromHtml(html));
}

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/** Build a responsive iframe embed block for the public article page. */
export function toVideoEmbedHtml(rawUrl: string): string | null {
  const url = rawUrl.trim();
  if (!url) return null;

  const youtubeId = extractYoutubeId(url);
  if (youtubeId) {
    return `<div class="wp-block-embed is-type-video is-provider-youtube"><div class="admin-embed-frame"><iframe src="https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div></div>`;
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return `<div class="wp-block-embed is-type-video is-provider-vimeo"><div class="admin-embed-frame"><iframe src="https://player.vimeo.com/video/${vimeoId}" title="Vimeo video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div></div>`;
  }

  if (/^https?:\/\//i.test(url)) {
    return `<div class="wp-block-embed is-type-video"><div class="admin-embed-frame"><iframe src="${escapeAttr(url)}" title="Embedded video" allowfullscreen loading="lazy"></iframe></div></div>`;
  }

  return null;
}

/**
 * Editor-safe video card (thumbnail + play icon). Live iframes break inside
 * contentEditable and often render as a giant blue overlay.
 */
export function toVideoEditorPlaceholderHtml(rawUrl: string): string | null {
  const url = rawUrl.trim();
  if (!url || !toVideoEmbedHtml(url)) return null;

  const youtubeId = extractYoutubeId(url);
  const thumb = youtubeId
    ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
    : "";
  const label = youtubeId ? "YouTube video" : extractVimeoId(url) ? "Vimeo video" : "Embedded video";

  return (
    `<figure class="wp-block-video-card" contenteditable="false" data-video-url="${escapeAttr(url)}">` +
    `<div class="admin-video-card">` +
    (thumb
      ? `<img src="${escapeAttr(thumb)}" alt="${escapeAttr(label)}" class="admin-video-card-thumb" />`
      : `<div class="admin-video-card-fallback" aria-hidden="true"></div>`) +
    `<span class="admin-video-card-play" aria-hidden="true">▶</span>` +
    `</div>` +
    `<figcaption class="admin-video-card-caption">${escapeAttr(label)}</figcaption>` +
    `</figure><p></p>`
  );
}

/** Turn editor placeholders into real iframe embeds before saving. */
export function videoPlaceholdersToEmbeds(html: string): string {
  if (!html || !html.includes("wp-block-video-card")) return html;

  return html.replace(
    /<figure[^>]*class="[^"]*wp-block-video-card[^"]*"[^>]*data-video-url="([^"]+)"[^>]*>[\s\S]*?<\/figure>/gi,
    (_full, encodedUrl: string) => {
      const url = encodedUrl.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<");
      return toVideoEmbedHtml(url) ?? "";
    },
  );
}

/** Turn saved iframes into editor placeholders when opening the visual editor. */
export function videoEmbedsToPlaceholders(html: string): string {
  if (!html || !/admin-embed-frame|youtube\.com\/embed|player\.vimeo\.com/i.test(html)) return html;

  return html.replace(
    /<div class="wp-block-embed[^"]*"[^>]*>\s*<div class="admin-embed-frame">\s*<iframe[^>]+src="([^"]+)"[^>]*>\s*<\/iframe>\s*<\/div>\s*<\/div>/gi,
    (_full, src: string) => {
      const decoded = src.replace(/&amp;/g, "&");
      let watchUrl = decoded;
      const yt = decoded.match(/youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]+)/);
      if (yt?.[1]) watchUrl = `https://www.youtube.com/watch?v=${yt[1]}`;
      const vimeo = decoded.match(/player\.vimeo\.com\/video\/(\d+)/);
      if (vimeo?.[1]) watchUrl = `https://vimeo.com/${vimeo[1]}`;
      return toVideoEditorPlaceholderHtml(watchUrl) ?? _full;
    },
  );
}

export function resolveArticleHeroVideo(featuredVideo: string | null | undefined, content: string | null | undefined) {
  const featured = featuredVideo?.trim();
  if (featured) return featured;

  return extractFirstVideoUrlFromHtml(content ?? "") ?? "";
}

export function resolveArticleImageUrl(row: {
  image_url: string | null;
  featured_video: string | null;
  content: string | null;
}) {
  const imageUrl = row.image_url?.trim();
  if (imageUrl) return imageUrl;

  const videoUrl = resolveArticleHeroVideo(row.featured_video, row.content);
  if (videoUrl) {
    const thumb = youtubeThumb(videoUrl);
    if (thumb) return thumb;
  }

  return "";
}
