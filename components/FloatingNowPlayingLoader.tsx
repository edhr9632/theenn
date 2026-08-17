import { getVideosConfigFromDb } from "@/lib/videosDb";
import { DEFAULT_SITE_VIDEOS } from "@/lib/siteVideos";
import FloatingNowPlaying from "./FloatingNowPlaying";

export default async function FloatingNowPlayingLoader() {
  const config = (await getVideosConfigFromDb()) ?? DEFAULT_SITE_VIDEOS;
  return <FloatingNowPlaying initialConfig={config} />;
}
