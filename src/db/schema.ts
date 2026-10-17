import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull().default("Untitled Document"),
  contentMarkdown: text("content_markdown").notNull(),
  contentJson: text("content_json"),
  icon: text("icon").default("📄"),
  isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const documentRevisions = sqliteTable("document_revisions", {
  id: text("id").primaryKey(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  contentMarkdown: text("content_markdown").notNull(),
  summary: text("summary").default("Auto-saved revision"),
  createdAt: integer("created_at").notNull(),
});

export type DocumentRecord = typeof documents.$inferSelect;
export type NewDocumentRecord = typeof documents.$inferInsert;
export type RevisionRecord = typeof documentRevisions.$inferSelect;
