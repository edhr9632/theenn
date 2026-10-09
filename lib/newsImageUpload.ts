import { createClient } from "@/utils/supabase/client";
import {
  compressDataUrl,
  compressImageToJpegFile,
  dataUrlToFile,
  fileToCompressedDataUrl,
  isDataImageUrl,
} from "@/lib/compressImageClient";

/** Reuse existing public upload bucket (already live for Press Bits). */
const BUCKET = "press-bits";
const FOLDER = "article-images";

function safeSlug(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "article"
  );
}

async function uploadJpeg(file: File, titleHint: string): Promise<string> {
  const supabase = createClient();
  const path = `${FOLDER}/${safeSlug(titleHint)}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "86400",
    upsert: false,
    contentType: "image/jpeg",
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Compress a DSLR / phone photo and prefer a public storage URL.
 * Falls back to a compressed data URL if storage is unavailable.
 */
export async function prepareNewsImage(file: File, titleHint = "article"): Promise<string> {
  const jpeg = await compressImageToJpegFile(file);
  try {
    return await uploadJpeg(jpeg, titleHint);
  } catch {
    return fileToCompressedDataUrl(file);
  }
}

export async function prepareNewsImageFromDataUrl(
  dataUrl: string,
  titleHint = "article",
): Promise<string> {
  if (!isDataImageUrl(dataUrl)) return dataUrl;
  const file = await dataUrlToFile(dataUrl, `${safeSlug(titleHint)}.jpg`);
  return prepareNewsImage(file, titleHint);
}

/** Replace large inline `data:image…` sources in article HTML with storage URLs. */
export async function rewriteDataImagesInHtml(html: string, titleHint = "article"): Promise<string> {
  const matches = html.match(/src="(data:image\/[^"]+)"/g);
  if (!matches?.length) return html;

  const dataUrls = [...new Set(matches.map((m) => m.slice(5, -1)))];
  let out = html;

  for (const dataUrl of dataUrls) {
    try {
      const next = await prepareNewsImageFromDataUrl(dataUrl, titleHint);
      out = out.split(dataUrl).join(next);
    } catch {
      const compressed = await compressDataUrl(dataUrl);
      out = out.split(dataUrl).join(compressed);
    }
  }

  return out;
}
