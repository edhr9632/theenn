"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { extractYoutubeId, upgradeYoutubeThumbUrl, youtubeThumbFallbacks } from "@/lib/siteVideos";

type YoutubeThumbImageProps = {
  src: string;
  youtubeUrl?: string;
  alt?: string;
  className?: string;
  sizes?: string;
};

/**
 * Renders the sharpest available YouTube still (maxres → sd → hq).
 * Skips Next.js recompression so the CDN original stays crisp.
 */
export default function YoutubeThumbImage({
  src,
  youtubeUrl,
  alt = "",
  className = "object-fit-cover",
  sizes = "(max-width:575px) 50vw, (max-width:991px) 33vw, (max-width:1199px) 25vw, 220px",
}: YoutubeThumbImageProps) {
  const candidates = useMemo(() => {
    const upgraded = upgradeYoutubeThumbUrl(src, youtubeUrl);
    const fromUrl = youtubeUrl ? youtubeThumbFallbacks(youtubeUrl) : [];
    const id = extractYoutubeId(youtubeUrl || src);
    const fromId = id
      ? [
          `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
          `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
          `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        ]
      : [];
    return Array.from(new Set([upgraded, ...fromUrl, ...fromId, src].filter(Boolean)));
  }, [src, youtubeUrl]);

  const [index, setIndex] = useState(0);
  const current = candidates[Math.min(index, candidates.length - 1)] || src;

  return (
    <Image
      src={current}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      quality={100}
      unoptimized
      priority={false}
      onError={() => {
        if (index < candidates.length - 1) setIndex((i) => i + 1);
      }}
    />
  );
}
