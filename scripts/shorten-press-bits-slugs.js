/**
 * Shorten press_bits.slug values for cleaner public URLs.
 * Usage: node scripts/shorten-press-bits-slugs.js
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

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function main() {
  loadEnvLocal();
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const pool = createPool(databaseUrl);
  const { rows } = await pool.query("SELECT id, title, slug FROM press_bits ORDER BY created_at ASC");
  const used = new Set();

  for (const row of rows) {
    let base = slugify(row.title) || String(row.id).slice(0, 8);
    let candidate = base;
    let n = 1;
    while (used.has(candidate)) {
      n += 1;
      candidate = `${base.slice(0, 70)}-${n}`;
    }
    used.add(candidate);

    if (candidate !== row.slug) {
      await pool.query("UPDATE press_bits SET slug = $1, updated_at = NOW() WHERE id = $2", [
        candidate,
        row.id,
      ]);
      console.log("updated:", candidate);
    } else {
      console.log("keep:", candidate);
    }
  }

  await pool.end();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
