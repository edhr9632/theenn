/**
 * Apply database/migrations/009-press-bits.sql
 * Usage: node scripts/db-migrate-press-bits.js
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

  const sqlPath = path.join(__dirname, "..", "database", "migrations", "009-press-bits.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error("Missing 009-press-bits.sql");
    process.exit(1);
  }

  const pool = createPool(databaseUrl);
  const client = await pool.connect();
  try {
    console.log("Applying 009-press-bits.sql...");
    await client.query(fs.readFileSync(sqlPath, "utf8"));
    const count = await client.query("SELECT COUNT(*)::int AS n FROM press_bits");
    console.log("press_bits rows:", count.rows[0]?.n ?? 0);
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
