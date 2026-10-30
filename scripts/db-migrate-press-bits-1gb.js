/**
 * Apply database/migrations/016-press-bits-upload-1gb.sql
 * Usage: node scripts/db-migrate-press-bits-1gb.js
 */
const fs = require("fs");
const path = require("path");
const { createPool } = require("./db-pool");

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
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, "..", "database", "migrations", "016-press-bits-upload-1gb.sql");
  const pool = createPool(databaseUrl);
  const client = await pool.connect();
  try {
    console.log("Applying 016-press-bits-upload-1gb.sql...");
    await client.query(fs.readFileSync(sqlPath, "utf8"));
    const result = await client.query(
      "SELECT id, file_size_limit FROM storage.buckets WHERE id = 'press-bits'",
    );
    console.log("press-bits bucket:", result.rows[0] ?? null);
    console.log(
      "Also set Supabase Storage → Settings → Global file size limit to at least 1000 MB if uploads still fail.",
    );
    console.log("Done.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
