/**
 * Apply only missing site_videos tables (safe re-run).
 * Usage: node scripts/apply-site-videos-migration.js
 */
const fs = require("fs");
const path = require("path");
const { createPool, resolveSupabaseDatabaseUrl } = require("./db-pool");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();
  const url = process.env.DATABASE_URL?.trim() || resolveSupabaseDatabaseUrl();
  if (!url) {
    console.error("Set DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local");
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, "..", "database", "migrations", "005-site-videos.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  const pool = createPool(url);
  const client = await pool.connect();

  try {
    console.log("Applying site_videos migration...");
    await client.query(sql);
    const { rows } = await client.query(
      `SELECT tablename FROM pg_tables
       WHERE schemaname = 'public' AND tablename LIKE 'site_video%'
       ORDER BY tablename`,
    );
    console.log("Created/verified tables:", rows.map((r) => r.tablename).join(", "));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
