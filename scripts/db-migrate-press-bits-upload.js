/**
 * Apply Press Bits video-upload + storage migrations
 * Usage: node scripts/db-migrate-press-bits-upload.js
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

async function applySql(client, fileName) {
  const sqlPath = path.join(__dirname, "..", "database", "migrations", fileName);
  if (!fs.existsSync(sqlPath)) {
    console.error("Missing", fileName);
    process.exit(1);
  }
  console.log("Applying", fileName, "...");
  await client.query(fs.readFileSync(sqlPath, "utf8"));
}

async function main() {
  loadEnvLocal();
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Add it to .env.local");
    process.exit(1);
  }

  const pool = createPool(databaseUrl);
  const client = await pool.connect();
  try {
    // Ensure base table exists, then upgrade columns for video upload support
    await applySql(client, "009-press-bits.sql");

    // If an older table still has youtube_url, rename it
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'press_bits' AND column_name = 'youtube_url'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'press_bits' AND column_name = 'video_url'
        ) THEN
          ALTER TABLE press_bits RENAME COLUMN youtube_url TO video_url;
        END IF;
      END $$;
    `);

    await client.query(`
      ALTER TABLE press_bits
        ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'youtube';
    `);

    await applySql(client, "011-press-bits-storage-bucket.sql");

    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'press_bits'
      ORDER BY ordinal_position
    `);
    console.log(
      "press_bits columns:",
      cols.rows.map((row) => row.column_name).join(", "),
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
