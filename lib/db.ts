import "server-only";

import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;

  if (!pool) {
    let connectionString = url;
    let hostname = "";
    try {
      const parsed = new URL(url);
      hostname = parsed.hostname;
      const isSupabase =
        hostname.includes("supabase.com") ||
        hostname.includes("pooler.supabase.com") ||
        hostname.endsWith(".supabase.co");
      if (isSupabase || url.includes("sslmode=")) {
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
      url.includes("sslmode=require");

    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const db = getPool();
  if (!db) return [];
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
