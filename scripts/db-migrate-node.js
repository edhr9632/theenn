/**
 * Apply database/schema.sql + database/migrations/*.sql using node-pg (no psql required).
 * Usage: node scripts/db-migrate-node.js
 * Uses DATABASE_URL from .env.local unless DATABASE_URL is passed in the environment.
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

async function runSqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  await client.query(sql);
}

async function main() {
  loadEnvLocal();

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Add it to .env.local");
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
  if (!fs.existsSync(schemaPath)) {
    console.error("Missing database/schema.sql");
    process.exit(1);
  }

  const pool = createPool(databaseUrl);
  const client = await pool.connect();

  try {
    console.log("Applying schema.sql...");
    await runSqlFile(client, schemaPath);

    const migrationsDir = path.join(__dirname, "..", "database", "migrations");
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

    console.log("Schema and migrations applied successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
