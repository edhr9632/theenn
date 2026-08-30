import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const WEEKLY_STORAGE_BUCKET = "weekly";

function readSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
}

function readServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    ""
  );
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = readSupabaseUrl();
  const key = readServiceRoleKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isSupabaseStorageConfigured() {
  return Boolean(readSupabaseUrl() && (readServiceRoleKey() || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY));
}

export async function ensureWeeklyBucket(admin: SupabaseClient) {
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.name === WEEKLY_STORAGE_BUCKET);
  if (exists) return;

  const { error } = await admin.storage.createBucket(WEEKLY_STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: 52_428_800, // 50 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"],
  });

  // Ignore race / already-exists errors
  if (error && !/already exists|duplicate/i.test(error.message)) {
    throw new Error(error.message);
  }
}

export function publicWeeklyUrl(path: string) {
  const url = readSupabaseUrl().replace(/\/$/, "");
  return `${url}/storage/v1/object/public/${WEEKLY_STORAGE_BUCKET}/${path}`;
}

export function buildWeeklyObjectPath(kind: "covers" | "pdfs", fileName: string) {
  const safe = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `${kind}/${stamp}-${safe || "file"}`;
}
