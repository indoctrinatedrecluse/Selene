import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

// Ensure local data directory exists for local development SQLite database
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "selene.db");
const client = createClient({
  url: `file:${dbPath.replace(/\\/g, "/")}`,
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
}
