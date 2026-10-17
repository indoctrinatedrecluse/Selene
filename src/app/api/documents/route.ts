import { NextResponse } from "next/server";
import { db, initDb } from "@/db";
import { documents, documentRevisions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { STARTER_TEMPLATES } from "@/lib/workspace-store";

export async function GET() {
  try {
    await initDb();
    let records = await db
      .select()
      .from(documents)
      .orderBy(desc(documents.updatedAt));

    // If database is empty, seed with starter templates
    if (records.length === 0) {
      for (const t of STARTER_TEMPLATES) {
        await db.insert(documents).values({
          id: t.id,
          title: t.title,
          contentMarkdown: t.content,
          icon: t.icon || "📄",
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        });
      }
      records = await db
        .select()
        .from(documents)
        .orderBy(desc(documents.updatedAt));
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error("Failed to fetch documents", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await initDb();
    const body = await req.json();
    const id = body.id || `doc-${Date.now()}`;
    const title = body.title || "Untitled Document";
    const content =
      body.content ||
      `# Untitled Technical Canvas\n\nType \`/\` to insert live sandboxes, diagrams, or math formulas.\n`;
    const icon = body.icon || "📄";
    const now = Date.now();

    await db.insert(documents).values({
      id,
      title,
      contentMarkdown: content,
      icon,
      createdAt: now,
      updatedAt: now,
    });

    // Create initial revision
    await db.insert(documentRevisions).values({
      id: `rev-${Date.now()}`,
      documentId: id,
      contentMarkdown: content,
      summary: "Created document",
      createdAt: now,
    });

    const [created] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create document", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
