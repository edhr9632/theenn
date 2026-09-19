import { createClient } from "@/utils/supabase/client";

const BUCKET = "press-bits";
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export type EventMediaFolder =
  | "videos"
  | "thumbs"
  | "speakers/videos"
  | "speakers/thumbs"
  | "sponsors/videos"
  | "sponsors/thumbs";

function extensionFor(file: File, fallback: string) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) return fromName.replace(/[^a-z0-9]/g, "") || fallback;
  if (file.type === "video/mp4") return "mp4";
  if (file.type === "video/webm") return "webm";
  if (file.type === "video/quicktime") return "mov";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return fallback;
}

function safeSlug(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "event-media"
  );
}

export async function uploadEventMediaAsset(
  file: File,
  folder: EventMediaFolder,
  titleHint: string,
): Promise<string> {
  const isVideo = folder.endsWith("videos");
  if (isVideo) {
    if (!file.type.startsWith("video/")) {
      throw new Error("Please choose a video file (MP4, WebM, or MOV).");
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error("Video must be under 200 MB.");
    }
  } else if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG, or WebP).");
  }

  const supabase = createClient();
  const path = `${folder}/${safeSlug(titleHint)}-${Date.now()}.${extensionFor(
    file,
    isVideo ? "mp4" : "jpg",
  )}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || (isVideo ? "video/mp4" : "image/jpeg"),
  });

  if (error) {
    throw new Error(
      error.message.includes("Bucket not found")
        ? "Media storage bucket is missing. Create a public Supabase bucket named press-bits."
        : `Upload failed: ${error.message}`,
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** @deprecated Prefer uploadEventMediaAsset */
export async function uploadPressBitAsset(
  file: File,
  folder: "videos" | "thumbs",
  titleHint: string,
): Promise<string> {
  return uploadEventMediaAsset(file, folder, titleHint);
}

export { isYoutubeOrShortsUrl, detectVideoSourceType } from "@/lib/eventPeopleTypes";
