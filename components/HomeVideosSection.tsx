"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SITE_VIDEOS,
  HOME_VIDEOS_DISPLAY_MAX,
  resolveFeaturedVideo,
  youtubeThumb,
  type SiteVideoTab,
  type SiteVideosConfig,
} from "@/lib/siteVideos";
import SectionBroadcastHeader from "./SectionBroadcastHeader";
import ComingSoonBlock from "./ComingSoonBlock";
import type { PanelDiscussionItem } from "@/lib/homeTypes";

type VideoTabId = SiteVideoTab;

type VideoItem = {
  id: string;
  title: string;
  duration: string;
  image: string;
  href: string;
  external?: boolean;
  meta?: string;
};

const ALL_TABS: { id: VideoTabId; label: string; flag: keyof SiteVideosConfig }[] = [
  { id: "education", label: "Top Education News", flag: "showEducation" },
  { id: "panels", label: "Panel Discussions", flag: "showPanels" },
  { id: "podcasts", label: "Podcasts", flag: "showPodcasts" },
];

function PlayIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z" />
    </svg>
  );
}

function LikeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m7-2V4a2 2 0 0 0-2-2l-5 10v10h9.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="18" cy="19" r="2.4" stroke="currentColor" strokeWidth="1.9" />
      <path d="M8.2 10.9l7.5-4.2M8.2 13.1l7.5 4.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 1 1 18 0z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SubscribeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M10 15l6.2-3.5L10 8v7z" />
      <path d="M22 8.2v7.6c0 1.4-1.1 2.5-2.5 2.5H4.5C3.1 18.3 2 17.2 2 15.8V8.2C2 6.8 3.1 5.7 4.5 5.7h15c1.4 0 2.5 1.1 2.5 2.5zM4.5 7.5c-.4 0-.7.3-.7.7v7.6c0 .4.3.7.7.7h15c.4 0 .7-.3.7-.7V8.2c0-.4-.3-.7-.7-.7h-15z" />
    </svg>
  );
}

function customItemsForTab(config: SiteVideosConfig, tab: VideoTabId): VideoItem[] {
  return config.items
    .filter((item) => item.tab === tab)
    .map((item) => ({
      id: item.id,
      title: item.title,
      duration: item.duration,
      image: item.image || youtubeThumb(item.youtubeUrl),
      href: item.youtubeUrl,
      external: true,
      meta: item.meta,
    }));
}

function buildEducationVideos(config: SiteVideosConfig): VideoItem[] {
  return customItemsForTab(config, "education");
}

function buildPanelVideos(config: SiteVideosConfig, dbPanels: PanelDiscussionItem[]): VideoItem[] {
  const custom = customItemsForTab(config, "panels");
  if (custom.length) return custom;

  return dbPanels.map((panel, index) => ({
    id: `panel-${panel.episode}-${index}`,
    title: panel.title,
    duration: panel.duration,
    image: panel.image,
    href: panel.youtube,
    external: true,
    meta: panel.topic,
  }));
}

function buildPodcastVideos(config: SiteVideosConfig): VideoItem[] {
  return customItemsForTab(config, "podcasts");
}

type HomeVideosSectionProps = {
  dbVideosConfig?: SiteVideosConfig | null;
  dbPanels?: PanelDiscussionItem[];
};

export default function HomeVideosSection({
  dbVideosConfig = null,
  dbPanels = [],
}: HomeVideosSectionProps) {
  const config = dbVideosConfig ?? DEFAULT_SITE_VIDEOS;

  const tabs = useMemo(
    () => ALL_TABS.filter((tab) => Boolean(config[tab.flag])),
    [config],
  );

  const catalogs = useMemo(
    () => ({
      education: buildEducationVideos(config),
      panels: buildPanelVideos(config, dbPanels),
      podcasts: buildPodcastVideos(config),
    }),
    [config, dbPanels],
  );

  const firstTabWithContent = useMemo(
    () => tabs.find((tab) => (catalogs[tab.id]?.length ?? 0) > 0)?.id ?? tabs[0]?.id ?? "education",
    [tabs, catalogs],
  );

  const [activeTab, setActiveTab] = useState<VideoTabId>(firstTabWithContent);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(firstTabWithContent);
    }
  }, [tabs, activeTab, firstTabWithContent]);

  const list = catalogs[activeTab] ?? [];

  useEffect(() => {
    if (!list.some((item) => item.id === activeId)) {
      setActiveId(list[0]?.id ?? "");
    }
  }, [activeTab, list, activeId]);

  const featured = list.find((item) => item.id === activeId) ?? list[0];
  const mustWatch = list.filter((item) => item.id !== featured?.id).slice(0, HOME_VIDEOS_DISPLAY_MAX - 1);
  const channel = resolveFeaturedVideo(config);
  const hasAnyContent = tabs.some((tab) => (catalogs[tab.id]?.length ?? 0) > 0);

  if (!config.enabled || !tabs.length || !hasAnyContent || !featured) {
    return (
      <section className="home-videos-section" aria-labelledby="home-videos-heading">
        <div className="container py-4 py-lg-5">
          <SectionBroadcastHeader id="home-videos-heading" title="Videos" className="mb-4" />
          <ComingSoonBlock
            title="Videos coming soon"
            message="Add videos in Admin → Videos or seed the site_videos tables in your database."
          />
        </div>
      </section>
    );
  }

  const featureLinkProps = featured.external
    ? { href: featured.href, target: "_blank" as const, rel: "noopener noreferrer" }
    : { href: featured.href };

  return (
    <section className="home-videos-section" aria-labelledby="home-videos-heading">
      <div className="container py-4 py-lg-5">
        <SectionBroadcastHeader
          id="home-videos-heading"
          title="Videos"
          href="/panel-discussions"
          action={
            <Link href="/panel-discussions" className="section-broadcast-action-link">
              View all videos <span aria-hidden="true">→</span>
            </Link>
          }
          className="mb-4"
        />

        <div className="home-videos-board">
          <div className="home-videos-tabs" role="tablist" aria-label="Video categories">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`home-videos-tab${activeTab === tab.id ? " is-active" : ""}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setActiveId(catalogs[tab.id][0]?.id ?? "");
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="home-videos-grid">
            <article className="home-videos-feature">
              <a {...featureLinkProps} className="home-videos-feature-media" aria-label={`Open ${featured.title}`}>
                <Image
                  src={featured.image}
                  alt=""
                  fill
                  className="object-fit-cover"
                  sizes="(max-width:992px) 100vw, 66vw"
                />
                <span className="home-videos-feature-overlay" aria-hidden="true" />
                <p className="home-videos-feature-kicker mb-0">{featured.title.toUpperCase()}</p>
                <span className="home-videos-play home-videos-play--lg" aria-hidden="true">
                  <PlayIcon size={22} />
                </span>
              </a>
              <h3 className="home-videos-feature-title">
                <a {...featureLinkProps}>{featured.title}</a>
              </h3>
            </article>

            <aside className="home-videos-must" aria-label="Must watch videos">
              <div className="home-videos-must-head">
                <h3 className="home-videos-must-title mb-0">Must Watch</h3>
              </div>
              <ul className="home-videos-must-list list-unstyled mb-0">
                {mustWatch.map((video) => (
                  <li key={video.id}>
                    <button
                      type="button"
                      className={`home-videos-must-item${video.id === featured.id ? " is-active" : ""}`}
                      onClick={() => setActiveId(video.id)}
                    >
                      <span className="home-videos-must-thumb">
                        <Image src={video.image} alt="" fill className="object-fit-cover" sizes="120px" />
                        <span className="home-videos-play home-videos-play--sm" aria-hidden="true">
                          <PlayIcon size={12} />
                        </span>
                      </span>
                      <span className="home-videos-must-copy">
                        <span className="home-videos-must-item-title">{video.title}</span>
                        <span className="home-videos-must-meta">
                          {video.meta ? `${video.meta} · ` : ""}
                          {video.duration}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="home-videos-yt-actions" role="group" aria-label="YouTube actions">
                <a href={channel.watchUrl} target="_blank" rel="noopener noreferrer" className="home-videos-yt-btn">
                  <LikeIcon />
                  <span>Like</span>
                </a>
                <a
                  href={`https://youtu.be/${channel.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-videos-yt-btn"
                >
                  <ShareIcon />
                  <span>Share</span>
                </a>
                <a href={channel.watchUrl} target="_blank" rel="noopener noreferrer" className="home-videos-yt-btn">
                  <CommentIcon />
                  <span>Comment</span>
                </a>
                <a
                  href={`${channel.channelUrl}${channel.channelUrl.includes("?") ? "&" : "?"}sub_confirmation=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-videos-yt-btn home-videos-yt-btn--subscribe"
                >
                  <SubscribeIcon />
                  <span>Subscribe</span>
                </a>
              </div>
              <div className="home-videos-must-rail" aria-hidden="true" />
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
