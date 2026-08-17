import { siteSeo } from "@/lib/seo";

/** Public stable path for morning alarms / smart speakers (rewritten to the API). */
export const DAILY_AUDIO_PUBLIC_PATH = "/audio/daily-latest.mp3";

/** Internal API that generates the daily education brief MP3. */
export const DAILY_AUDIO_API_PATH = "/api/audio/daily-latest";

/** Podcast-style RSS enclosure feed for the daily brief. */
export const DAILY_AUDIO_FEED_PATH = "/feed/daily-audio.xml";

export function getDailyAudioPublicUrl(origin = siteSeo.siteUrl) {
  return `${origin.replace(/\/$/, "")}${DAILY_AUDIO_PUBLIC_PATH}`;
}

export function getDailyAudioFeedUrl(origin = siteSeo.siteUrl) {
  return `${origin.replace(/\/$/, "")}${DAILY_AUDIO_FEED_PATH}`;
}
