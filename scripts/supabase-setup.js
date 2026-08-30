/**
 * Create ENN tables + promo banners on Supabase Postgres.
 *
 * Option A — add to .env.local (do not commit):
 *   SUPABASE_DB_PASSWORD=your_database_password
 *
 * Option B — one-time in PowerShell:
 *   $env:SUPABASE_DB_PASSWORD='your_password'; npm run supabase:setup
 *
 * Option C — full URI:
 *   SUPABASE_DATABASE_URL=postgresql://... npm run supabase:setup
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
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

async function upsertPromos(client) {
  const promos = [
    {
      id: "tv_schedule",
      eyebrow: "TV Schedule",
      title: "Knowledge Plus - Education News Network",
      subtitle: "Hosted by Vibha Raj",
      ctaLabel: "Watch our live discussion @3PM",
      ctaUrl: "https://www.youtube.com/@EducationTodayNews",
      variant: "tv_schedule",
    },
    {
      id: "partner_msa",
      eyebrow: "Partner - Advertisement",
      title: "Looking for school admission? Visit MSA",
      subtitle:
        "My School Admission helps parents discover schools, compare options, and apply with ease.",
      ctaLabel: "Visit MSA",
      ctaUrl: "https://myschooladmission.com/",
      variant: "partner",
    },
  ];

  for (const row of promos) {
    await client.query(
      `INSERT INTO site_promo_banners (id, eyebrow, title, subtitle, cta_label, cta_url, variant, enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       ON CONFLICT (id) DO UPDATE SET
         eyebrow = EXCLUDED.eyebrow,
         title = EXCLUDED.title,
         subtitle = EXCLUDED.subtitle,
         cta_label = EXCLUDED.cta_label,
         cta_url = EXCLUDED.cta_url,
         variant = EXCLUDED.variant,
         enabled = TRUE,
         updated_at = NOW()`,
      [row.id, row.eyebrow, row.title, row.subtitle, row.ctaLabel, row.ctaUrl, row.variant],
    );
  }
}

async function runSqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  await client.query(sql);
}

function tryCopyLocalData(localUrl, remoteUrl) {
  if (process.env.SUPABASE_SKIP_LOCAL_COPY === "1") return;

  let localHost;
  try {
    localHost = new URL(localUrl).hostname;
  } catch {
    return;
  }

  if (localHost !== "localhost" && localHost !== "127.0.0.1") return;

  const psqlCandidates = [
    process.env.PSQL_PATH,
    "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe",
    "C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe",
    "C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe",
  ].filter(Boolean);

  let psql = null;
  for (const candidate of psqlCandidates) {
    const check = spawnSync(candidate, ["--version"], { encoding: "utf8" });
    if (check.status === 0) {
      psql = candidate;
      break;
    }
  }

  const pgDumpCandidates = psql
    ? [psql.replace(/psql\.exe$/i, "pg_dump.exe")]
    : [];

  let pgDump = null;
  for (const candidate of pgDumpCandidates) {
    if (!fs.existsSync(candidate)) continue;
    const check = spawnSync(candidate, ["--version"], { encoding: "utf8" });
    if (check.status === 0) {
      pgDump = candidate;
      break;
    }
  }

  if (!pgDump || !psql) {
    console.log("Skipping local data copy (pg_dump/psql not found). Promos are still seeded.");
    return;
  }

  const tmpFile = path.join(__dirname, "..", ".tmp-enn-data.sql");
  const local = new URL(localUrl);
  const remote = new URL(remoteUrl);

  console.log("Copying data from local PostgreSQL to Supabase (this may take a minute)...");

  const dump = spawnSync(
    pgDump,
    [
      "-h",
      local.hostname,
      "-p",
      local.port || "5432",
      "-U",
      decodeURIComponent(local.username),
      "-d",
      local.pathname.replace(/^\//, ""),
      "--data-only",
      "--inserts",
      "--disable-triggers",
      "-f",
      tmpFile,
    ],
    {
      encoding: "utf8",
      env: { ...process.env, PGPASSWORD: decodeURIComponent(local.password) },
    },
  );

  if (dump.status !== 0) {
    console.warn("Local data dump failed; Supabase schema + promos are still ready.");
    if (dump.stderr) process.stderr.write(dump.stderr);
    return;
  }

  const restore = spawnSync(
    psql,
    [
      "-h",
      remote.hostname,
      "-p",
      remote.port || "5432",
      "-U",
      decodeURIComponent(remote.username),
      "-d",
      remote.pathname.replace(/^\//, "").split("?")[0],
      "-v",
      "ON_ERROR_STOP=0",
      "-f",
      tmpFile,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        PGPASSWORD: decodeURIComponent(remote.password),
        PGSSLMODE: "require",
      },
    },
  );

  try {
    fs.unlinkSync(tmpFile);
  } catch {
    /* ignore */
  }

  if (restore.status !== 0 && restore.stderr) {
    console.warn("Some local rows may not have copied (duplicate keys are OK on re-run).");
    process.stderr.write(restore.stderr);
  } else {
    console.log("Local database content copied to Supabase.");
  }
}

async function main() {
  loadEnvLocal();

  const supabaseUrl = resolveSupabaseDatabaseUrl();
  if (!supabaseUrl) {
    console.error(`
Supabase database password is not configured.

Do ONE of the following, then run again:

1) In .env.local (gitignored), add:
   SUPABASE_DB_PASSWORD=your_supabase_database_password

2) Or in PowerShell (one-time):
   $env:SUPABASE_DB_PASSWORD='your_password'; npm run supabase:setup

Find / reset the password: Supabase Dashboard → Project Settings → Database → Database password
`);
    process.exit(1);
  }

  const localUrl =
    process.env.LOCAL_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
  const root = path.join(__dirname, "..");
  const schemaPath = path.join(root, "database", "schema.sql");
  const migrationsDir = path.join(root, "database", "migrations");

  const pool = createPool(supabaseUrl);
  const client = await pool.connect();

  try {
    console.log("Connecting to Supabase Postgres...");
    await client.query("SELECT 1");

    console.log("Applying schema.sql...");
    await runSqlFile(client, schemaPath);

    if (fs.existsSync(migrationsDir)) {
      const files = fs
        .readdirSync(migrationsDir)
        .filter((name) => name.endsWith(".sql"))
        .sort();
      for (const file of files) {
        console.log(`Applying migration ${file}...`);
        await runSqlFile(client, path.join(migrationsDir, file));
      }
    }

    console.log("Seeding promo banners (Knowledge Plus + MSA)...");
    await upsertPromos(client);

    const { rows } = await client.query(
      `SELECT id, title, enabled FROM site_promo_banners ORDER BY id`,
    );
    console.log("site_promo_banners:", rows);
  } finally {
    client.release();
    await pool.end();
  }

  if (localUrl) {
    try {
      const host = new URL(localUrl).hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        tryCopyLocalData(localUrl, supabaseUrl);
      }
    } catch {
      /* skip copy */
    }
  }

  console.log(`
Done. Next steps:
1) Set DATABASE_URL in .env.local to the same Supabase connection string (or keep SUPABASE_DB_PASSWORD and we build the URL on setup only).
2) Add DATABASE_URL on Vercel → Redeploy.
`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
