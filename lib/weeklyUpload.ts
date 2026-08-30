import { createClient } from "@/utils/supabase/client";
import { slugifyWeekly } from "@/lib/weeklyTypes";

const BUCKET = "weekly-editions";

function extensionFor(file: File, fallback: string) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) return fromName;
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return fallback;
}

export async function compressWeeklyCover(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare cover image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Could not compress cover image."))),
      "image/jpeg",
      0.88,
    );
  });
  const base = file.name.replace(/\.[^.]+$/, "") || "weekly-cover";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

export async function uploadWeeklyAsset(
  file: File,
  folder: "covers" | "pdfs",
  slug: string,
): Promise<string> {
  const supabase = createClient();
  const safeSlug = slugifyWeekly(slug) || "weekly-edition";
  const path = `${folder}/${safeSlug}-${Date.now()}.${extensionFor(file, folder === "pdfs" ? "pdf" : "jpg")}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || (folder === "pdfs" ? "application/pdf" : "image/jpeg"),
  });

  if (error) {
    throw new Error(
      error.message.includes("Bucket not found")
        ? "Weekly storage bucket is missing. Create a public Supabase bucket named weekly-editions, or paste a /public file path instead."
        : `Upload failed: ${error.message}`,
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function isDataUrl(value: string) {
  return value.trim().startsWith("data:");
}

export function isRemoteOrPublicPath(value: string) {
  const trimmed = value.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  );
}
