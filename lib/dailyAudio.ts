import { siteSeo } from "@/lib/seo";
import {
  buildEducationVoiceScript,
  getTopEducationNews,
  type VoiceBriefStory,
} from "@/lib/educationVoiceBrief";

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

export function getDailyBriefStories(limit = 5): VoiceBriefStory[] {
  return getTopEducationNews(limit);
}

export function getDailyBriefScript(stories = getDailyBriefStories()) {
  return buildEducationVoiceScript(stories);
}

export function getDailyBriefTitle(stories = getDailyBriefStories()) {
  const stamp = new Date().toISOString().slice(0, 10);
  if (!stories.length) return `ENN Daily Education Brief — ${stamp}`;
  return `ENN Daily Education Brief — ${stamp}`;
}

export function getDailyBriefDescription(stories = getDailyBriefStories()) {
  if (!stories.length) {
    return "Daily education headlines from Education News Network.";
  }
  return stories.map((story, index) => `${index + 1}. ${story.title}`).join(" ");
}
