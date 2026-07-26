/**
 * Today's top news video shown in the floating “Now Playing” popup
 * and homepage Videos actions. Prefer admin Videos settings via siteVideos.
 */
import { DEFAULT_SITE_VIDEOS, resolveFeaturedVideo } from "@/lib/siteVideos";

export type TopNewsVideo = {
  title: string;
  youtubeUrl: string;
  channelUrl: string;
  channelLabel: string;
};

export function getTopNewsVideo() {
  return resolveFeaturedVideo(DEFAULT_SITE_VIDEOS);
}
