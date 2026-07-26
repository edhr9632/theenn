"use client";

import { useState } from "react";
import EnnMediaPlayer from "@/components/EnnMediaPlayer";

type PodcastEpisodePlayerProps = {
  showTitle: string;
  host: string;
  episode: {
    title: string;
    date: string;
    duration: string;
    summary: string;
  };
};

function buildPodcastEpisodeScript(showTitle: string, host: string, episode: PodcastEpisodePlayerProps["episode"]) {
  return [
    `Welcome to ${showTitle} from Education News Network.`,
    `Hosted by ${host}.`,
    `Today's episode: ${episode.title}.`,
    episode.summary,
    `That was ${episode.title}, published ${episode.date}.`,
    "Keep watching Education News Network for more education stories, podcasts, and insights. Thank you for listening.",
  ].join(" ");
}

export default function PodcastEpisodePlayer({ showTitle, host, episode }: PodcastEpisodePlayerProps) {
  const [open, setOpen] = useState(false);
  const script = buildPodcastEpisodeScript(showTitle, host, episode);

  if (!open) {
    return (
      <article className="podcast-episode-teaser">
        <div className="podcast-episode-teaser-main">
          <button
            type="button"
            className="podcast-episode-teaser-play"
            onClick={() => setOpen(true)}
            aria-label={`Open audio player for ${episode.title}`}
          >
            ▶
          </button>
          <div className="podcast-episode-teaser-copy">
            <p className="podcast-episode-teaser-show mb-1">
              {showTitle} by Education News Network
            </p>
            <h3 className="podcast-episode-teaser-title mb-1">{episode.title}</h3>
            <p className="podcast-episode-teaser-summary mb-0">{episode.summary}</p>
          </div>
          <span className="podcast-episode-teaser-duration">{episode.duration}</span>
        </div>
        <button type="button" className="podcast-episode-teaser-open" onClick={() => setOpen(true)}>
          Open audio player
        </button>
      </article>
    );
  }

  return (
    <div className="podcast-episode-player-wrap">
      <div className="podcast-episode-player-bar">
        <button type="button" className="podcast-episode-player-close" onClick={() => setOpen(false)}>
          Close player
        </button>
      </div>
      <EnnMediaPlayer
        title={episode.title}
        showLabel={`${showTitle} by Education News Network`}
        description={episode.summary}
        durationLabel={episode.duration}
        script={script}
        brandTitle="ENN"
        brandSubtitle="PODCAST"
      />
    </div>
  );
}
