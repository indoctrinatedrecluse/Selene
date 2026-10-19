import { NextResponse } from "next/server";
import { db, initDb } from "@/db";
import { documents, documentRevisions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    await initDb();
    const { id } = await params;

    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const revisions = await db
      .select()
      .from(documentRevisions)
      .where(eq(documentRevisions.documentId, id))
      .orderBy(desc(documentRevisions.createdAt))
      .limit(20);

    return NextResponse.json({ ...doc, revisions });
  } catch (error) {
    console.error("Failed to fetch document", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await initDb();
    const { id } = await params;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const now = Date.now();
    const newTitle = body.title !== undefined ? body.title : existing.title;
    const newContent =
      body.contentMarkdown !== undefined
        ? body.contentMarkdown
        : existing.contentMarkdown;

    await db
      .update(documents)
      .set({
        title: newTitle,
        contentMarkdown: newContent,
        updatedAt: now,
      })
      .where(eq(documents.id, id));

    // If content changed significantly, add revision snapshot
    if (newContent !== existing.contentMarkdown) {
      await db.insert(documentRevisions).values({
        id: `rev-${Date.now()}`,
        documentId: id,
        contentMarkdown: newContent,
        summary: body.summary || "Auto-saved snapshot",
        createdAt: now,
      });
    }

    const [updated] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update document", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await initDb();
    const { id } = await params;

    await db.delete(documentRevisions).where(eq(documentRevisions.documentId, id));
    await db.delete(documents).where(eq(documents.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
