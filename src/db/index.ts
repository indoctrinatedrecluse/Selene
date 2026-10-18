import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

// Support DATABASE_URL (Turso / remote LibSQL) or fallback to local SQLite
const databaseUrl = process.env.DATABASE_URL;

let dbUrl = databaseUrl;
if (!dbUrl) {
  // In serverless / container environments (like Cloud Run), use /tmp if root is read-only
  const isServerless = process.env.K_SERVICE || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  const baseDir = isServerless ? "/tmp" : process.cwd();
  const dataDir = path.join(baseDir, "data");

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (err) {
    console.warn("Could not create local dataDir, falling back to /tmp:", err);
  }

  const dbPath = path.join(dataDir, "selene.db");
  dbUrl = `file:${dbPath.replace(/\\/g, "/")}`;
}

const client = createClient({
  url: dbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

// Auto-initialize schema tables on first run
export async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Untitled Document',
      content_markdown TEXT NOT NULL,
      content_json TEXT,
      icon TEXT DEFAULT '📄',
      is_favorite INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS document_revisions (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      content_markdown TEXT NOT NULL,
      summary TEXT DEFAULT 'Auto-saved revision',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS shared_documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Untitled Shared Document',
      content_markdown TEXT NOT NULL,
      author TEXT DEFAULT 'Anonymous',
      is_password_protected INTEGER DEFAULT 0,
      password_hash TEXT,
      expires_at INTEGER,
      view_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);
}
