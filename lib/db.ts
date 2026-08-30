import "server-only";

import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;
let poolUrl: string | null = null;

const DATABASE_ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "SUPABASE_DATABASE_URL",
  "DIRECT_URL",
] as const;

function stripEnvQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function readDatabaseUrl(): { url: string; envKey: string } | null {
  for (const key of DATABASE_ENV_KEYS) {
    const raw = process.env[key];
    if (!raw?.trim()) continue;
    const url = stripEnvQuotes(raw);
    if (url) return { url, envKey: key };
  }
  return null;
}

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function buildPoolConfig(rawUrl: string) {
  let connectionString = rawUrl;
  let hostname = "";
  try {
    const parsed = new URL(rawUrl);
    hostname = parsed.hostname;
    const isSupabase =
      hostname.includes("supabase.com") ||
      hostname.includes("pooler.supabase.com") ||
      hostname.endsWith(".supabase.co");
    if (isSupabase || rawUrl.includes("sslmode=")) {
      // Avoid pg treating sslmode=require as verify-full against Supabase pooler certs.
      parsed.searchParams.set("uselibpqcompat", "true");
      parsed.searchParams.set("sslmode", "require");
      connectionString = parsed.toString();
    }
  } catch {
    /* use raw url */
  }

  const local = isLocalHost(hostname);
  const useSsl =
    !local &&
    (hostname.includes("supabase.com") ||
      hostname.includes("pooler.supabase.com") ||
      hostname.endsWith(".supabase.co") ||
      rawUrl.includes("sslmode=require"));

  // Local Next.js can issue many parallel page queries; Vercel serverless stays tiny.
  const onVercel = Boolean(process.env.VERCEL);
  const max = onVercel ? 1 : 5;

  return {
    connectionString,
    max,
    idleTimeoutMillis: onVercel ? 10_000 : 30_000,
    connectionTimeoutMillis: onVercel ? 15_000 : 30_000,
    allowExitOnIdle: true,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

function destroyPool() {
  if (!pool) return;
  const ending = pool;
  pool = null;
  poolUrl = null;
  void ending.end().catch(() => undefined);
}

export function getPool(): Pool | null {
  const resolved = readDatabaseUrl();
  if (!resolved) return null;
  const url = resolved.url;

  if (!pool || poolUrl !== url) {
    destroyPool();
    poolUrl = url;
    pool = new Pool(buildPoolConfig(url));
    pool.on("error", (err) => {
      console.error("[pg pool]", err.message);
      destroyPool();
    });
  }

  return pool;
}

function isConnectionError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { message?: string; code?: string };
  const message = (err.message || "").toLowerCase();
  return (
    err.code === "ETIMEDOUT" ||
    err.code === "ECONNRESET" ||
    err.code === "ECONNREFUSED" ||
    err.code === "57P01" ||
    message.includes("timeout exceeded when trying to connect") ||
    message.includes("connection terminated") ||
    message.includes("cannot connect") ||
    message.includes("server closed the connection")
  );
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const db = getPool();
  if (!db) {
    throw new Error(
      "DATABASE_URL is not set. Add Supabase Postgres URI in .env.local (local) or Vercel → Settings → Environment Variables (Production), then Redeploy.",
    );
  }

  try {
    const result = await db.query<T>(text, params);
    return result.rows;
  } catch (error) {
    if (!isConnectionError(error)) throw error;

    // Stale / timed-out pool: rebuild once and retry.
    console.warn("[pg] connection issue — recreating pool and retrying once");
    destroyPool();
    const retryPool = getPool();
    if (!retryPool) throw error;
    const result = await retryPool.query<T>(text, params);
    return result.rows;
  }
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export function isDbConfigured() {
  return Boolean(readDatabaseUrl());
}
