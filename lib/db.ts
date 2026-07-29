import "server-only";

import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;
let poolUrl: string | null = null;

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

  const useSsl =
    hostname.includes("supabase.com") ||
    hostname.includes("pooler.supabase.com") ||
    hostname.endsWith(".supabase.co") ||
    rawUrl.includes("sslmode=require");

  return {
    connectionString,
    // Serverless (Vercel): keep pool tiny; avoid leaked connections.
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
    allowExitOnIdle: true,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

export function getPool(): Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;

  if (!pool || poolUrl !== url) {
    if (pool) {
      void pool.end().catch(() => undefined);
    }
    poolUrl = url;
    pool = new Pool(buildPoolConfig(url));
    pool.on("error", (err) => {
      console.error("[pg pool]", err);
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const db = getPool();
  if (!db) {
    throw new Error(
      "DATABASE_URL is not set. Add Supabase Postgres URI in Vercel → Settings → Environment Variables (Production), then Redeploy.",
    );
  }
  const result = await db.query<T>(text, params);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}
