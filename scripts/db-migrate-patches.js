/**
 * Apply SQL files in database/migrations only (safe for existing DBs).
 * Usage: node scripts/db-migrate-patches.js
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

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

function parseDatabaseUrl(url) {
  const parsed = new URL(url);
  return {
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    host: parsed.hostname,
    port: parsed.port || "5432",
    database: parsed.pathname.replace(/^\//, ""),
  };
}

function findPsql() {
  const candidates = [
    process.env.PSQL_PATH,
    "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe",
    "C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe",
    "C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe",
    "psql",
  ].filter(Boolean);

  for (const candidate of candidates) {
    const check =
      candidate.includes("\\") || candidate.includes("/")
        ? spawnSync(candidate, ["--version"], { encoding: "utf8" })
        : spawnSync("where.exe", [candidate], { encoding: "utf8" });

    if (check.status === 0) {
      if (candidate.includes("\\") || candidate.includes("/")) return candidate;
      const first = (check.stdout || "").split(/\r?\n/).find(Boolean);
      if (first) return first.trim();
    }
  }

  return null;
}

loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const psql = findPsql();
if (!psql) {
  console.error("psql not found.");
  process.exit(1);
}

const { user, password, host, port, database } = parseDatabaseUrl(databaseUrl);
const migrationsDir = path.join(__dirname, "..", "database", "migrations");

if (!fs.existsSync(migrationsDir)) {
  console.log("No migrations folder.");
  process.exit(0);
}

const files = fs.readdirSync(migrationsDir).filter((name) => name.endsWith(".sql")).sort();

for (const file of files) {
  const migrationPath = path.join(migrationsDir, file);
  console.log(`Applying ${file}...`);
  const result = spawnSync(
    psql,
    ["-U", user, "-h", host, "-p", port, "-d", database, "-v", "ON_ERROR_STOP=1", "-f", migrationPath],
    {
      encoding: "utf8",
      env: { ...process.env, PGPASSWORD: password },
    },
  );
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("Migrations applied.");
