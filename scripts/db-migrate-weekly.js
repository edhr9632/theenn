/**
 * Apply only database/migrations/007-weekly-editions.sql
 * Usage: node scripts/db-migrate-weekly.js
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

  const sqlPath = path.join(__dirname, "..", "database", "migrations", "007-weekly-editions.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error("Missing 007-weekly-editions.sql");
    process.exit(1);
  }

  const pool = createPool(databaseUrl);
  const client = await pool.connect();
  try {
    console.log("Applying 007-weekly-editions.sql...");
    await client.query(fs.readFileSync(sqlPath, "utf8"));
    const cities = await client.query("SELECT id, name FROM weekly_cities ORDER BY sort_order");
    const issues = await client.query("SELECT slug, title FROM weekly_issues ORDER BY updated_at DESC");
    console.log("Cities:", cities.rows);
    console.log("Issues:", issues.rows);
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
