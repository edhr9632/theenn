import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { SAFE_STORAGE_UPLOAD_BYTES } from "@/lib/mediaUploadLimits";

export { SAFE_STORAGE_UPLOAD_BYTES };

let ffmpegSingleton: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

async function getFfmpeg(onStatus?: (message: string) => void): Promise<FFmpeg> {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton;
  if (ffmpegLoadPromise) return ffmpegLoadPromise;

  ffmpegLoadPromise = (async () => {
    onStatus?.("Loading fast compressor…");
    const ffmpeg = new FFmpeg();
    // jsDelivr is typically faster than unpkg from India.
    const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpegSingleton = ffmpeg;
    return ffmpeg;
  })();

  try {
    return await ffmpegLoadPromise;
  } catch (error) {
    ffmpegLoadPromise = null;
    throw error;
  }
}

/** Warm the compressor in the background so the first large upload is faster. */
export function preloadVideoCompressor() {
  if (typeof window === "undefined") return;
  void getFfmpeg().catch(() => {
    // Ignore preload failures; upload path will retry.
  });
}

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("Could not read video duration."));
        return;
      }
      resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video metadata."));
    };
    video.src = url;
  });
}

function formatMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildOutputFile(data: Uint8Array, originalName: string) {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return new File([copy], originalName.replace(/\.[^.]+$/, "") + "-compressed.mp4", {
    type: "video/mp4",
  });
}

/**
 * Compresses a large video in-browser so it fits Supabase Free/global storage limits.
 * Single-thread ffmpeg.wasm with a fast first pass (usually enough).
 */
export async function compressVideoForStorage(
  file: File,
  options?: {
    maxBytes?: number;
    onProgress?: (percent: number) => void;
    onStatus?: (message: string) => void;
  },
): Promise<File> {
  const maxBytes = options?.maxBytes ?? SAFE_STORAGE_UPLOAD_BYTES;
  if (file.size <= maxBytes) return file;

  const duration = await readVideoDuration(file);
  const ffmpeg = await getFfmpeg(options?.onStatus);

  const onProgress = options?.onProgress;
  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.(Math.max(1, Math.min(99, Math.round(progress * 100))));
  };
  ffmpeg.on("progress", progressHandler);

  const inputName = "input.bin";
  const outputName = "output.mp4";

  try {
    options?.onStatus?.(
      `Compressing ${formatMb(file.size)} → under ${formatMb(maxBytes)} (fast pass)…`,
    );
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Aim ~80% of max so one ultrafast pass usually fits.
    const targetBitsPerSec = Math.max(
      220_000,
      Math.floor(((maxBytes * 0.8) * 8) / duration) - 80_000,
    );

    // Fast first: 720p + ultrafast. Second pass only if still too large.
    const attempts: Array<{ label: string; args: string[] }> = [
      {
        label: "fast",
        args: [
          "-i",
          inputName,
          "-vf",
          "scale='min(720,iw)':-2",
          "-c:v",
          "libx264",
          "-b:v",
          String(targetBitsPerSec),
          "-maxrate",
          String(Math.floor(targetBitsPerSec * 1.2)),
          "-bufsize",
          String(targetBitsPerSec * 2),
          "-preset",
          "ultrafast",
          "-c:a",
          "aac",
          "-b:a",
          "80k",
          "-ac",
          "1",
          "-movflags",
          "+faststart",
          outputName,
        ],
      },
      {
        label: "smaller",
        args: [
          "-i",
          inputName,
          "-vf",
          "scale='min(540,iw)':-2",
          "-c:v",
          "libx264",
          "-crf",
          "34",
          "-preset",
          "ultrafast",
          "-c:a",
          "aac",
          "-b:a",
          "64k",
          "-ac",
          "1",
          "-movflags",
          "+faststart",
          outputName,
        ],
      },
    ];

    let compressed: File | null = null;

    for (let i = 0; i < attempts.length; i += 1) {
      const attempt = attempts[i];
      options?.onStatus?.(
        i === 0
          ? `Compressing quickly (${formatMb(file.size)})…`
          : "Still too large — running a smaller pass…",
      );
      try {
        await ffmpeg.deleteFile(outputName);
      } catch {
        // output may not exist yet
      }

      await ffmpeg.exec(attempt.args);
      const data = await ffmpeg.readFile(outputName);
      if (!(data instanceof Uint8Array)) {
        throw new Error("Unexpected compressor output.");
      }
      const out = buildOutputFile(data, file.name);
      compressed = out;
      if (out.size <= maxBytes) break;
    }

    if (!compressed) {
      throw new Error("Compression produced no output.");
    }
    if (compressed.size > maxBytes) {
      throw new Error(
        `Compressed file is still ${formatMb(compressed.size)} (limit ${formatMb(maxBytes)}). Use a shorter clip, or paste a YouTube/Shorts URL instead.`,
      );
    }

    options?.onStatus?.(
      `Compressed ${formatMb(file.size)} → ${formatMb(compressed.size)}. Uploading…`,
    );
    onProgress?.(100);
    return compressed;
  } finally {
    ffmpeg.off("progress", progressHandler);
    try {
      await ffmpeg.deleteFile(inputName);
    } catch {
      // ignore
    }
    try {
      await ffmpeg.deleteFile(outputName);
    } catch {
      // ignore
    }
  }
}
