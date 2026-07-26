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

  return new Uint8Array(await response.arrayBuffer());
}

/** Build an MP3 byte array from narration text via Google Translate TTS. */
export async function synthesizeMp3FromText(script: string): Promise<Uint8Array> {
  const parts = getAllAudioUrls(script, {
    lang: "en",
    slow: false,
    host: "https://translate.google.com",
    splitPunct: ".!?",
  });

  const chunks: Uint8Array[] = [];
  let total = 0;
  for (const part of parts) {
    const chunk = await fetchMp3Chunk(part.url);
    chunks.push(chunk);
    total += chunk.byteLength;
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged;
}

export function hashScript(script: string) {
  return createHash("sha1").update(script).digest("hex");
}

type Mp3CacheEntry = {
  key: string;
  bytes: Uint8Array;
};

/** Process-local cache so the stable daily URL regenerates only when content changes. */
const scriptMp3Cache = new Map<string, Mp3CacheEntry>();

export async function synthesizeMp3Cached(cacheNamespace: string, script: string): Promise<Uint8Array> {
  const key = hashScript(script);
  const existing = scriptMp3Cache.get(cacheNamespace);
  if (existing && existing.key === key) {
    return existing.bytes;
  }

  const bytes = await synthesizeMp3FromText(script);
  scriptMp3Cache.set(cacheNamespace, { key, bytes });
  return bytes;
}

export function safeAudioFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Copy bytes into a real ArrayBuffer so Response/Blob typings accept it on Vercel/TS. */
export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}
