/**
 * Shared pg Pool helpers (local Postgres + Supabase pooler).
 */
const { Pool } = require("pg");

function isSupabaseHost(hostname) {
  return (
    hostname.includes("supabase.com") ||
    hostname.includes("pooler.supabase.com") ||
    hostname.endsWith(".supabase.co")
  );
}

function createPool(connectionString) {
  let url;
  try {
    url = new URL(connectionString);
  } catch {
    return new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }

  const isSupabase = isSupabaseHost(url.hostname);
  const config = {
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
  };

  if (isSupabase) {
    // Avoid pg v8 treating sslmode=require as verify-full against pooler certs.
    url.searchParams.set("uselibpqcompat", "true");
    url.searchParams.set("sslmode", "require");
    config.connectionString = url.toString();
    config.ssl = { rejectUnauthorized: false };
  } else if (url.searchParams.get("sslmode")) {
    config.ssl = { rejectUnauthorized: false };
  }

  return new Pool(config);
}

function stripEnvQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function buildSupabasePoolerUrl(
  projectRef,
  password,
  region = "ap-northeast-2",
  port = 5432,
) {
  const aws = process.env.SUPABASE_POOLER_AWS?.trim() || "aws-1";
  const encoded = encodeURIComponent(password);
  const query =
    port === 6543 ? "pgbouncer=true&sslmode=require" : "sslmode=require";
  return `postgresql://postgres.${projectRef}:${encoded}@${aws}-${region}.pooler.supabase.com:${port}/postgres?${query}`;
}

/** Prefer session pooler / DIRECT_URL for migrations and DDL. */
function resolveSupabaseDatabaseUrl() {
  const directUrl = process.env.DIRECT_URL?.trim();
  if (directUrl) return stripEnvQuotes(directUrl);

  const explicit = process.env.SUPABASE_DATABASE_URL?.trim();
  if (explicit) return stripEnvQuotes(explicit);

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!password) return null;

  const projectRef =
    process.env.SUPABASE_PROJECT_REF?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, "").split(".")[0] ||
    "ziyqgloipgzpasdayule";

  const region = process.env.SUPABASE_REGION?.trim() || "ap-northeast-2";
  return buildSupabasePoolerUrl(projectRef, password, region, 5432);
}

module.exports = {
  createPool,
  buildSupabasePoolerUrl,
  resolveSupabaseDatabaseUrl,
  isSupabaseHost,
};
