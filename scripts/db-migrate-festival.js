/**
 * Apply only database/migrations/006-festival-popup.sql
 * Usage: node scripts/db-migrate-festival.js
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
    console.error("DATABASE_URL is not set. Add it to .env.local");
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, "..", "database", "migrations", "006-festival-popup.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error("Missing 006-festival-popup.sql");
    process.exit(1);
  }

  const pool = createPool(databaseUrl);
  const client = await pool.connect();
  try {
    console.log("Applying 006-festival-popup.sql...");
    await client.query(fs.readFileSync(sqlPath, "utf8"));
    const posts = await client.query("SELECT id, title FROM site_festival_posts ORDER BY sort_order");
    const cfg = await client.query(
      "SELECT enabled, active_post_id, storage_key FROM site_festival_config WHERE id = 1",
    );
    console.log("Festival posts:", posts.rows);
    console.log("Festival config:", cfg.rows[0] || null);
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
