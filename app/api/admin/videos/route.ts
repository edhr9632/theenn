import { NextResponse } from "next/server";
import {
  getVideosConfigFromDb,
  updateVideosConfig,
  type SiteVideosConfigInput,
} from "@/lib/videosDb";
import { DEFAULT_SITE_VIDEOS } from "@/lib/siteVideos";

export async function GET() {
  try {
    const config = (await getVideosConfigFromDb()) ?? DEFAULT_SITE_VIDEOS;
    return NextResponse.json({ config });
  } catch (error) {
    console.error("[GET /api/admin/videos]", error);
    return NextResponse.json({ config: DEFAULT_SITE_VIDEOS });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as SiteVideosConfigInput;
    const updated = await updateVideosConfig(body);
    if (!updated) {
      return NextResponse.json({ error: "Could not save videos settings." }, { status: 503 });
    }
    return NextResponse.json({ config: updated });
  } catch (error) {
    console.error("[PUT /api/admin/videos]", error);
    const message = error instanceof Error ? error.message : "Could not save videos settings.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
