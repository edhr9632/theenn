import { createClient } from "@/utils/supabase/client";

const BUCKET = "press-bits";
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

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
      .slice(0, 48) || "press-bit"
  );
}

export async function uploadPressBitAsset(
  file: File,
  folder: "videos" | "thumbs",
  titleHint: string,
): Promise<string> {
  if (folder === "videos") {
    if (!file.type.startsWith("video/")) {
      throw new Error("Please choose a video file (MP4, WebM, or MOV).");
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error("Video must be under 200 MB.");
    }
  }

  const supabase = createClient();
  const path = `${folder}/${safeSlug(titleHint)}-${Date.now()}.${extensionFor(
    file,
    folder === "videos" ? "mp4" : "jpg",
  )}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || (folder === "videos" ? "video/mp4" : "image/jpeg"),
  });

  if (error) {
    throw new Error(
      error.message.includes("Bucket not found")
        ? "Press Bits storage bucket is missing. Create a public Supabase bucket named press-bits."
        : `Upload failed: ${error.message}`,
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function isYoutubeOrShortsUrl(url: string) {
  return /youtube\.com|youtu\.be/i.test(url.trim());
}
