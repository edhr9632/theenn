import { getAllAudioUrls } from "google-tts-api";
import { createHash } from "crypto";

async function fetchMp3Chunk(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Referer: "https://translate.google.com/",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`TTS chunk failed (${response.status})`);
  }

  return Buffer.from(await response.arrayBuffer());
}

/** Build an MP3 buffer from narration text via Google Translate TTS. */
export async function synthesizeMp3FromText(script: string): Promise<Buffer> {
  const parts = getAllAudioUrls(script, {
    lang: "en",
    slow: false,
    host: "https://translate.google.com",
    splitPunct: ".!?",
  });

  const buffers: Buffer[] = [];
  for (const part of parts) {
    buffers.push(await fetchMp3Chunk(part.url));
  }

  return Buffer.concat(buffers);
}

export function hashScript(script: string) {
  return createHash("sha1").update(script).digest("hex");
}

type Mp3CacheEntry = {
  key: string;
  buffer: Buffer;
};

/** Process-local cache so the stable daily URL regenerates only when content changes. */
const scriptMp3Cache = new Map<string, Mp3CacheEntry>();

export async function synthesizeMp3Cached(cacheNamespace: string, script: string): Promise<Buffer> {
  const key = hashScript(script);
  const existing = scriptMp3Cache.get(cacheNamespace);
  if (existing && existing.key === key) {
    return existing.buffer;
  }

  const buffer = await synthesizeMp3FromText(script);
  scriptMp3Cache.set(cacheNamespace, { key, buffer });
  return buffer;
}

export function safeAudioFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
