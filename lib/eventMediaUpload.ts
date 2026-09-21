import { Upload } from "tus-js-client";
import { createClient } from "@/utils/supabase/client";
import { MAX_VIDEO_BYTES, SAFE_STORAGE_UPLOAD_BYTES } from "@/lib/mediaUploadLimits";

const BUCKET = "press-bits";
export { MAX_VIDEO_BYTES, SAFE_STORAGE_UPLOAD_BYTES };
const MAX_VIDEO_MB = Math.round(MAX_VIDEO_BYTES / (1024 * 1024));
const RESUMABLE_THRESHOLD_BYTES = 40 * 1024 * 1024;
const TUS_CHUNK_SIZE = 6 * 1024 * 1024;

export type EventMediaFolder =
  | "videos"
  | "thumbs"
  | "speakers/videos"
  | "speakers/thumbs"
  | "sponsors/videos"
  | "sponsors/thumbs";

export type UploadMediaOptions = {
  onProgress?: (percent: number) => void;
  onStatus?: (message: string) => void;
};

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

function sizeLimitError(file: File, detail?: string) {
  const projectRef = getSupabaseProjectRef();
  const settingsUrl = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/storage/settings`
    : "Supabase Dashboard → Storage → Settings";

  return new Error(
    [
      `Upload failed for ${file.name} (${formatMb(file.size)}).`,
      detail || "The file is larger than Supabase Storage allows.",
      `Open ${settingsUrl} and set “Global file size limit” to at least ${MAX_VIDEO_MB} MB (Pro plan required above 50 MB),`,
      "or paste a YouTube/Shorts URL instead.",
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

  if (
    /exceeded the maximum allowed size|Payload too large|EntityTooLarge|413|Maximum size exceeded|file size/i.test(
      message,
    )
  ) {
    return sizeLimitError(file, message.replace(/^Upload failed:\s*/i, ""));
  }
  if (/Bucket not found/i.test(message)) {
    return new Error("Media storage bucket is missing. Create a public Supabase bucket named press-bits.");
  }
  if (/mime|not allowed|invalid|content.?type/i.test(message)) {
    return new Error(`Upload rejected for ${file.name}. Use MP4, WebM, or MOV. (${message})`);
  }
  return new Error(message.startsWith("Upload failed:") ? message : `Upload failed: ${message}`);
}

async function uploadWithStandard(path: string, file: File, contentType: string): Promise<void> {
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

async function prepareVideoFile(file: File, options?: UploadMediaOptions): Promise<File> {
  if (file.size <= SAFE_STORAGE_UPLOAD_BYTES) return file;

  options?.onStatus?.(
    `${formatMb(file.size)} is over the 50 MB storage cap — compressing automatically…`,
  );

  try {
    const { compressVideoForStorage } = await import("@/lib/compressVideoForStorage");
    return await compressVideoForStorage(file, {
      maxBytes: SAFE_STORAGE_UPLOAD_BYTES,
      onProgress: (percent) => options?.onProgress?.(Math.round(percent * 0.7)),
      onStatus: options?.onStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Compression failed.";
    throw new Error(
      `${message} Tip: paste a YouTube/Shorts URL, or upgrade Supabase and raise Global file size limit to 200 MB.`,
    );
  }
}

export async function uploadEventMediaAsset(
  file: File,
  folder: EventMediaFolder,
  titleHint: string,
  options?: UploadMediaOptions,
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

  let uploadFile = file;
  if (isVideo) {
    uploadFile = await prepareVideoFile(file, options);
  }

  const contentType = contentTypeFor(uploadFile, isVideo);
  const path = `${folder}/${safeSlug(titleHint)}-${Date.now()}.${extensionFor(
    uploadFile,
    isVideo ? "mp4" : "jpg",
  )}`;

  options?.onStatus?.(`Uploading ${formatMb(uploadFile.size)}…`);

  try {
    if (isVideo && uploadFile.size >= RESUMABLE_THRESHOLD_BYTES) {
      await uploadWithResumable(path, uploadFile, contentType, (percent) => {
        options?.onProgress?.(70 + Math.round(percent * 0.3));
      });
    } else {
      options?.onProgress?.(75);
      await uploadWithStandard(path, uploadFile, contentType);
      options?.onProgress?.(100);
    }
  } catch (error) {
    throw mapUploadError(error, uploadFile);
  }

  options?.onProgress?.(100);
  options?.onStatus?.("Upload complete");

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
