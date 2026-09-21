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
    onStatus?.("Loading video compressor (first time may take a minute)…");
    const ffmpeg = new FFmpeg();
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
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

/**
 * Compresses a large video in-browser so it fits Supabase Free/global storage limits.
 * Uses single-thread ffmpeg.wasm (no COOP/COEP headers required).
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
      `Compressing ${formatMb(file.size)} video to under ${formatMb(maxBytes)}…`,
    );
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Target ~85% of max so encode overhead still fits.
    const targetBitsPerSec = Math.max(
      250_000,
      Math.floor(((maxBytes * 0.85) * 8) / duration) - 96_000,
    );

    const attempts: string[][] = [
      [
        "-i",
        inputName,
        "-vf",
        "scale='min(1280,iw)':-2",
        "-c:v",
        "libx264",
        "-b:v",
        String(targetBitsPerSec),
        "-maxrate",
        String(Math.floor(targetBitsPerSec * 1.15)),
        "-bufsize",
        String(targetBitsPerSec * 2),
        "-preset",
        "veryfast",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-movflags",
        "+faststart",
        outputName,
      ],
      [
        "-i",
        inputName,
        "-vf",
        "scale='min(960,iw)':-2",
        "-c:v",
        "libx264",
        "-crf",
        "32",
        "-preset",
        "veryfast",
        "-c:a",
        "aac",
        "-b:a",
        "64k",
        "-movflags",
        "+faststart",
        outputName,
      ],
      [
        "-i",
        inputName,
        "-vf",
        "scale='min(720,iw)':-2",
        "-c:v",
        "libx264",
        "-crf",
        "36",
        "-preset",
        "ultrafast",
        "-c:a",
        "aac",
        "-b:a",
        "64k",
        "-movflags",
        "+faststart",
        outputName,
      ],
    ];

    let compressed: File | null = null;

    for (let i = 0; i < attempts.length; i += 1) {
      options?.onStatus?.(
        `Compressing video (pass ${i + 1}/${attempts.length})… this can take a few minutes`,
      );
      try {
        await ffmpeg.deleteFile(outputName);
      } catch {
        // output may not exist yet
      }

      await ffmpeg.exec(attempts[i]);
      const data = await ffmpeg.readFile(outputName);
      if (!(data instanceof Uint8Array)) {
        throw new Error("Unexpected compressor output.");
      }
      const copy = new Uint8Array(data.byteLength);
      copy.set(data);
      const out = new File([copy], file.name.replace(/\.[^.]+$/, "") + "-compressed.mp4", {
        type: "video/mp4",
      });

      if (out.size <= maxBytes) {
        compressed = out;
        break;
      }
      compressed = out;
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
