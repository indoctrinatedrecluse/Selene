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

export const sharedDocuments = sqliteTable("shared_documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull().default("Untitled Shared Document"),
  contentMarkdown: text("content_markdown").notNull(),
  author: text("author").default("Anonymous"),
  isPasswordProtected: integer("is_password_protected", { mode: "boolean" }).default(false),
  passwordHash: text("password_hash"),
  expiresAt: integer("expires_at"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});

export type DocumentRecord = typeof documents.$inferSelect;
export type NewDocumentRecord = typeof documents.$inferInsert;
export type RevisionRecord = typeof documentRevisions.$inferSelect;
export type SharedDocumentRecord = typeof sharedDocuments.$inferSelect;
export type NewSharedDocumentRecord = typeof sharedDocuments.$inferInsert;
