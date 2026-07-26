import "server-only";

import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;

  if (!pool) {
    pool = new Pool({
      connectionString: url,
      max: 10,
      idleTimeoutMillis: 30_000,
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
