/**
 * Seed PostgreSQL with the two homepage promo banners:
 * - tv_schedule (Knowledge Plus · Hosted by Vibha Raj)
 * - partner_msa (Partner - Advertisement · MSA)
 *
 * Run: node scripts/seed-promos.js
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

loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

async function upsertPromo(client, row) {
  await client.query(
    `INSERT INTO site_promo_banners (id, eyebrow, title, subtitle, cta_label, cta_url, variant)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO UPDATE SET
       eyebrow = EXCLUDED.eyebrow,
       title = EXCLUDED.title,
       subtitle = EXCLUDED.subtitle,
       cta_label = EXCLUDED.cta_label,
       cta_url = EXCLUDED.cta_url,
       enabled = TRUE,
       updated_at = NOW()`,
    [row.id, row.eyebrow, row.title, row.subtitle, row.ctaLabel, row.ctaUrl, row.variant],
  );
}

async function main() {
  const pool = createPool(databaseUrl);
  const client = await pool.connect();

  try {
    await upsertPromo(client, {
      id: "tv_schedule",
      eyebrow: "TV Schedule",
      title: "Knowledge Plus - Education News Network",
      subtitle: "Hosted by Vibha Raj",
      ctaLabel: "Watch our live discussion @3PM",
      ctaUrl: "https://www.youtube.com/@EducationTodayNews",
      variant: "tv_schedule",
    });

    await upsertPromo(client, {
      id: "partner_msa",
      eyebrow: "Partner - Advertisement",
      title: "Looking for school admission? Visit MSA",
      subtitle:
        "My School Admission helps parents discover schools, compare options, and apply with ease.",
      ctaLabel: "Visit MSA",
      ctaUrl: "https://myschooladmission.com/",
      variant: "partner",
    });

    console.log("Promo banners upserted: tv_schedule, partner_msa");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

