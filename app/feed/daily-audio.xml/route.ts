import {
  DAILY_AUDIO_PUBLIC_PATH,
  getDailyAudioFeedUrl,
  getDailyAudioPublicUrl,
} from "@/lib/dailyAudio";
import {
  getDailyBriefDescription,
  getDailyBriefTitle,
} from "@/lib/educationVoiceBrief";
import { getTopEducationStoriesFromDb } from "@/lib/educationVoiceBriefDb";
import { siteSeo } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RSS 2.0 audio feed with a single rolling enclosure that always points at
 * /audio/daily-latest.mp3 — suitable for podcast apps and scheduled morning play.
 */
export async function GET() {
  const stories = await getTopEducationStoriesFromDb(5);
  const now = new Date();
  const pubDate = now.toUTCString();
  const title = getDailyBriefTitle(stories);
  const description = getDailyBriefDescription(stories);
  const audioUrl = getDailyAudioPublicUrl();
  const feedUrl = getDailyAudioFeedUrl();
  const guid = `enn-daily-education-brief-${now.toISOString().slice(0, 10)}`;

  const storyItems = stories
    .map(
      (story, index) => `
    <item>
      <title>${xmlEscape(`${index + 1}. ${story.title}`)}</title>
      <link>${xmlEscape(`${siteSeo.siteUrl}${story.href}`)}</link>
      <guid isPermaLink="true">${xmlEscape(`${siteSeo.siteUrl}${story.href}`)}</guid>
      <pubDate>${xmlEscape(pubDate)}</pubDate>
      <description>${xmlEscape(story.excerpt)}</description>
      <category>${xmlEscape(story.category)}</category>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(`${siteSeo.siteName} — Daily Education Brief`)}</title>
    <link>${xmlEscape(siteSeo.siteUrl)}</link>
    <description>${xmlEscape(
      "Automated daily education news briefing from Education News Network. The enclosure always points to the latest brief at a fixed MP3 URL.",
    )}</description>
    <language>en-in</language>
    <lastBuildDate>${xmlEscape(pubDate)}</lastBuildDate>
    <atom:link href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml"/>
    <itunes:author>${xmlEscape(siteSeo.siteName)}</itunes:author>
    <itunes:summary>${xmlEscape(description)}</itunes:summary>
    <itunes:category text="News"/>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${xmlEscape(`${siteSeo.siteUrl}${siteSeo.ogImage}`)}"/>
    <item>
      <title>${xmlEscape(title)}</title>
      <link>${xmlEscape(`${siteSeo.siteUrl}${DAILY_AUDIO_PUBLIC_PATH}`)}</link>
      <guid isPermaLink="false">${xmlEscape(guid)}</guid>
      <pubDate>${xmlEscape(pubDate)}</pubDate>
      <description>${xmlEscape(description)}</description>
      <enclosure url="${xmlEscape(audioUrl)}" type="audio/mpeg"/>
      <itunes:author>${xmlEscape(siteSeo.siteName)}</itunes:author>
      <itunes:summary>${xmlEscape(description)}</itunes:summary>
      <itunes:explicit>false</itunes:explicit>
    </item>${storyItems}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=1800",
    },
  });
}
