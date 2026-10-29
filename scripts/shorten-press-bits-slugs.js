/**
 * Rebuild SEO slugs: school/org + event name.
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

function slugify(value, maxLength = 72) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

function cleanSlugPhrase(value) {
  return String(value || "")
    .replace(/\s*[-–—|:·]+\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractEventYear(value) {
  const match = String(value || "").match(/\b(20\d{2})(?:-\d{2})?\b/);
  return match?.[1] ?? "";
}

function buildPressBitSeoSlug(title, maxLength = 72) {
  const parts = String(title || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  const schoolRaw = parts[0] || String(title || "");
  const eventRaw = parts.length > 1 ? parts[parts.length - 1] : "";

  const school = cleanSlugPhrase(
    schoolRaw
      .replace(/\bawards?\b/gi, " ")
      .replace(/\bwinner(?:'s)?\b/gi, " ")
      .replace(/\binterview(?:s)?\b/gi, " ")
      .replace(/\bkeynote\b/gi, " ")
      .replace(/\bspeaker\b/gi, " ")
      .replace(/\bpanel\b/gi, " ")
      .replace(/\bsponsor\b/gi, " ")
      .replace(/\b20\d{2}(?:-\d{2})?\b/g, " "),
  );

  const eventYear = extractEventYear(eventRaw);
  const event = cleanSlugPhrase(
    eventRaw
      .replace(/\band\b/gi, " ")
      .replace(/\bawards?\b/gi, " ")
      .replace(/\b20\d{2}(?:-\d{2})?\b/g, " "),
  );

  const eventSlug = slugify(event, 40);
  const eventPart = [eventSlug, eventYear].filter(Boolean).join("-");
  const schoolBudget = Math.max(18, maxLength - (eventPart ? eventPart.length + 1 : 0));
  let schoolSlug = slugify(school || schoolRaw, schoolBudget);
  if (schoolSlug.length >= schoolBudget) {
    const cut = schoolSlug.lastIndexOf("-", schoolBudget);
    if (cut >= 12) schoolSlug = schoolSlug.slice(0, cut);
  }

  const combined = [schoolSlug, eventPart].filter(Boolean).join("-");
  return slugify(combined || title, maxLength) || "press-byte";
}

async function main() {
  loadEnvLocal();
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const pool = createPool(databaseUrl);
  await pool.query(`ALTER TABLE press_bits ADD COLUMN IF NOT EXISTS previous_slug TEXT`);

  const { rows } = await pool.query("SELECT id, title, slug FROM press_bits ORDER BY created_at ASC");
  const used = new Set();

  for (const row of rows) {
    let base = buildPressBitSeoSlug(row.title);
    let candidate = base;
    let n = 1;
    while (used.has(candidate)) {
      n += 1;
      candidate = `${base.slice(0, 64)}-${n}`;
    }
    used.add(candidate);

    if (candidate !== row.slug) {
      await pool.query(
        `UPDATE press_bits
         SET previous_slug = CASE
               WHEN $1::text IS DISTINCT FROM slug THEN slug
               ELSE previous_slug
             END,
             slug = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [candidate, row.id],
      );
      console.log(`${row.slug}\n  → ${candidate}\n`);
    } else {
      console.log(`keep: ${candidate}`);
    }
  }

  await pool.end();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
