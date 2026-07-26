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

/** Build a responsive iframe embed block (same markup as the admin editor). */
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
    return `<div class="wp-block-embed is-type-video"><div class="admin-embed-frame"><iframe src="${url.replace(/"/g, "&quot;")}" title="Embedded video" allowfullscreen loading="lazy"></iframe></div></div>`;
  }

  return null;
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
