import { isDbConfigured } from "@/lib/db";
import { getVideosConfigFromDb } from "@/lib/videosDb";
import { DEFAULT_SITE_VIDEOS } from "@/lib/siteVideos";
import FloatingNowPlaying from "./FloatingNowPlaying";

export default async function FloatingNowPlayingLoader() {
  if (!isDbConfigured()) {
    return <FloatingNowPlaying initialConfig={DEFAULT_SITE_VIDEOS} />;
  }

  try {
    const config = (await getVideosConfigFromDb()) ?? DEFAULT_SITE_VIDEOS;
    return <FloatingNowPlaying initialConfig={config} />;
  } catch (error) {
    console.error("[FloatingNowPlayingLoader]", error);
    return <FloatingNowPlaying initialConfig={DEFAULT_SITE_VIDEOS} />;
  }
}
