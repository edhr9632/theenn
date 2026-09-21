import { Upload } from "tus-js-client";
import { createClient } from "@/utils/supabase/client";

const BUCKET = "press-bits";
/** App-side cap. Supabase Free plan global limit is 50 MB; Pro can go higher in Storage settings. */
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const MAX_VIDEO_MB = Math.round(MAX_VIDEO_BYTES / (1024 * 1024));
const RESUMABLE_THRESHOLD_BYTES = 6 * 1024 * 1024;
const TUS_CHUNK_SIZE = 6 * 1024 * 1024;

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

function contentTypeFor(file: File, isVideo: boolean) {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const ext = extensionFor(file, isVideo ? "mp4" : "jpg");
  if (ext === "mp4" || ext === "m4v") return "video/mp4";
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return isVideo ? "video/mp4" : "image/jpeg";
}

function isVideoLike(file: File) {
  if (file.type.startsWith("video/")) return true;
  return /\.(mp4|m4v|webm|mov)$/i.test(file.name);
}

function formatMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sizeLimitError(file: File, detail?: string) {
  const projectRef = getSupabaseProjectRef();
  const settingsUrl = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/storage/settings`
    : "Supabase Dashboard → Storage → Settings";

  return new Error(
    [
      `Upload failed for ${file.name} (${formatMb(file.size)}).`,
      detail || "The file is larger than Supabase Storage allows.",
      `Open ${settingsUrl} and set “Global file size limit” to at least ${MAX_VIDEO_MB} MB.`,
      "Free plans are capped at 50 MB — upgrade to Pro for ~96 MB videos, or use a YouTube/Shorts URL instead.",
    ].join(" "),
  );
}

function mapUploadError(error: unknown, file: File): Error {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Upload failed.";

  if (/exceeded the maximum allowed size|Payload too large|EntityTooLarge|413|file size/i.test(message)) {
    return sizeLimitError(file, message.replace(/^Upload failed:\s*/i, ""));
  }
  if (/Bucket not found/i.test(message)) {
    return new Error("Media storage bucket is missing. Create a public Supabase bucket named press-bits.");
  }
  if (/mime|not allowed|invalid|content.?type/i.test(message)) {
    return new Error(
      `Upload rejected for ${file.name}. Use MP4, WebM, or MOV. (${message})`,
    );
  }
  return new Error(message.startsWith("Upload failed:") ? message : `Upload failed: ${message}`);
}

function getSupabaseProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  try {
    const host = new URL(url).hostname;
    return host.split(".")[0] || "";
  } catch {
    return "";
  }
}

function getPublishableKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || "";
}

async function uploadWithStandard(
  path: string,
  file: File,
  contentType: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType,
  });
  if (error) throw new Error(error.message);
}

async function uploadWithResumable(
  path: string,
  file: File,
  contentType: string,
  onProgress?: (percent: number) => void,
): Promise<void> {
  const projectRef = getSupabaseProjectRef();
  const apiKey = getPublishableKey();
  if (!projectRef || !apiKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token || apiKey;

  await new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${accessToken}`,
        apikey: apiKey,
        "x-upsert": "true",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: TUS_CHUNK_SIZE,
      metadata: {
        bucketName: BUCKET,
        objectName: path,
        contentType,
        cacheControl: "3600",
      },
      onError(error) {
        reject(error);
      },
      onProgress(bytesUploaded, bytesTotal) {
        if (!onProgress || !bytesTotal) return;
        onProgress(Math.min(100, Math.round((bytesUploaded / bytesTotal) * 100)));
      },
      onSuccess() {
        resolve();
      },
    });

    void upload.findPreviousUploads().then((previous) => {
      if (previous.length) upload.resumeFromPreviousUpload(previous[0]);
      upload.start();
    });
  });
}

export async function uploadEventMediaAsset(
  file: File,
  folder: EventMediaFolder,
  titleHint: string,
  options?: { onProgress?: (percent: number) => void },
): Promise<string> {
  const isVideo = folder.endsWith("videos");

  if (isVideo) {
    if (!isVideoLike(file)) {
      throw new Error("Please choose a video file (MP4, WebM, or MOV).");
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error(`Video must be under ${MAX_VIDEO_MB} MB (file is ${formatMb(file.size)}).`);
    }
  } else if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
    throw new Error("Please choose an image file (JPG, PNG, or WebP).");
  }

  const contentType = contentTypeFor(file, isVideo);
  const path = `${folder}/${safeSlug(titleHint)}-${Date.now()}.${extensionFor(
    file,
    isVideo ? "mp4" : "jpg",
  )}`;

  try {
    if (isVideo && file.size >= RESUMABLE_THRESHOLD_BYTES) {
      await uploadWithResumable(path, file, contentType, options?.onProgress);
    } else {
      options?.onProgress?.(5);
      await uploadWithStandard(path, file, contentType);
      options?.onProgress?.(100);
    }
  } catch (error) {
    throw mapUploadError(error, file);
  }

  const supabase = createClient();
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
