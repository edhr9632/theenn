"use client";

import Link from "next/link";
import { useMemo } from "react";
import { upgradeYoutubeThumbUrl, youtubeThumb } from "@/lib/siteVideos";
import SectionBroadcastHeader from "./SectionBroadcastHeader";
import ComingSoonBlock from "./ComingSoonBlock";
import YoutubeThumbImage from "./YoutubeThumbImage";

type DbShortVideo = {
  id: string;
  title: string;
  duration: string;
  image: string;
  youtubeUrl: string;
  meta: string;
};

type ShortVideoItem = {
  id: string;
  title: string;
  image: string;
  href: string;
  external: boolean;
  meta?: string;
  duration?: string;
};

function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z" />
    </svg>
  );
}

type HomeShortVideosSectionProps = {
  dbShortVideos?: DbShortVideo[];
};

export default function HomeShortVideosSection({ dbShortVideos = [] }: HomeShortVideosSectionProps) {
  const shorts = useMemo<ShortVideoItem[]>(() => {
    return dbShortVideos.map((item) => ({
      id: item.id,
      title: item.title,
      image: upgradeYoutubeThumbUrl(item.image || youtubeThumb(item.youtubeUrl), item.youtubeUrl),
      href: item.youtubeUrl,
      external: true,
      meta: item.meta,
      duration: item.duration,
    }));
  }, [dbShortVideos]);

  return (
    <section className="home-shorts-section" aria-labelledby="home-shorts-heading">
      <div className="container py-4 py-lg-5">
        <SectionBroadcastHeader
          id="home-shorts-heading"
          title="Short Videos"
          href="/panel-discussions"
          action={
            <Link href="/panel-discussions" className="section-broadcast-action-link">
              View all shorts <span aria-hidden="true">→</span>
            </Link>
          }
          className="mb-4"
        />

        {!shorts.length ? (
          <ComingSoonBlock
            title="Short videos coming soon"
            message="Add short clips in Admin → Shorts when your database is configured."
          />
        ) : (
          <div className="home-shorts-grid" aria-label="Short video thumbnails">
            {shorts.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="home-shorts-card"
              >
                <span className="home-shorts-thumb">
                  {item.image ? (
                    item.image.startsWith("data:") || item.image.startsWith("/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="object-fit-cover" />
                    ) : (
                      <YoutubeThumbImage
                        src={item.image}
                        youtubeUrl={item.href}
                        sizes="(max-width:575px) 50vw, (max-width:991px) 33vw, (max-width:1199px) 25vw, 220px"
                      />
                    )
                  ) : null}
                  <span className="home-shorts-play" aria-hidden="true">
                    <PlayIcon size={18} />
                  </span>
                </span>
                <span className="home-shorts-copy">
                  <span className="home-shorts-item-title">{item.title}</span>
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
