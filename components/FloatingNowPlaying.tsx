"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_SITE_VIDEOS,
  resolveFeaturedVideo,
  type SiteVideosConfig,
} from "@/lib/siteVideos";

const SCROLL_SHOW_AT = 320;

type FloatingNowPlayingProps = {
  initialConfig?: SiteVideosConfig | null;
};

export default function FloatingNowPlaying({ initialConfig = null }: FloatingNowPlayingProps) {
  const pathname = usePathname();
  const config = initialConfig ?? DEFAULT_SITE_VIDEOS;
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const video = resolveFeaturedVideo(config);

  const hiddenRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/signin") ||
    pathname?.startsWith("/ask") ||
    Boolean(pathname?.match(/^\/weekly-news\/[^/]+$/));

  useEffect(() => {
    setDismissed(false);
  }, [pathname]);

  useEffect(() => {
    if (dismissed || hiddenRoute || !config.enabled) {
      setVisible(false);
      return;
    }

    const onScroll = () => {
      setVisible(window.scrollY > SCROLL_SHOW_AT);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed, hiddenRoute, config.enabled]);

  const onClose = useCallback(() => {
    setDismissed(true);
    setVisible(false);
  }, []);

  if (hiddenRoute || dismissed || !visible || !config.enabled) return null;

  return (
    <aside className="enn-pip" aria-label="Now playing top news video">
      <div className="enn-pip-video">
        <iframe
          src={video.embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <button type="button" className="enn-pip-close" onClick={onClose} aria-label="Close video player">
          ✕
        </button>
      </div>

      <div className="enn-pip-meta">
        <p className="enn-pip-now mb-0">Now Playing</p>
        <a className="enn-pip-title" href={video.watchUrl} target="_blank" rel="noopener noreferrer">
          {video.title}
        </a>
        <a className="enn-pip-channel" href={video.channelUrl} target="_blank" rel="noopener noreferrer">
          Watch on {video.channelLabel} →
        </a>
      </div>
    </aside>
  );
}
