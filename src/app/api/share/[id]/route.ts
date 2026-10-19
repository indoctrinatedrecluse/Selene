import { NextResponse } from "next/server";
import { db, initDb } from "@/db";
import { sharedDocuments } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;

    const results = await db
      .select()
      .from(sharedDocuments)
      .where(eq(sharedDocuments.id, id))
      .limit(1);

    if (results.length === 0) {
      return NextResponse.json(
        { error: "Shared document not found" },
        { status: 404 }
      );
    }

    const doc = results[0];
    const now = Date.now();

    // Check expiration
    if (doc.expiresAt && now > doc.expiresAt) {
      return NextResponse.json(
        { error: "This shared link has expired", expired: true },
        { status: 410 }
      );
    }

    // Check password protection
    if (doc.isPasswordProtected && doc.passwordHash) {
      const url = new URL(req.url);
      const providedPassword =
        req.headers.get("x-share-password") || url.searchParams.get("password") || "";

      const providedHash = crypto
        .createHash("sha256")
        .update(providedPassword)
        .digest("hex");

      const hashBuffer = Buffer.from(providedHash);
      const expectedBuffer = Buffer.from(doc.passwordHash);
      const isMatch =
        hashBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(hashBuffer, expectedBuffer);

      if (!isMatch) {
        return NextResponse.json(
          {
            isPasswordProtected: true,
            id: doc.id,
            title: doc.title,
            author: doc.author,
            createdAt: doc.createdAt,
            error: providedPassword ? "Invalid password" : "Password required",
          },
          { status: 401 }
        );
      }
    }

    // Increment view count asynchronously
    db.update(sharedDocuments)
      .set({ viewCount: doc.viewCount + 1 })
      .where(eq(sharedDocuments.id, id))
      .catch((err) => console.error("Failed to update viewCount", err));

    return NextResponse.json({
      id: doc.id,
      title: doc.title,
      contentMarkdown: doc.contentMarkdown,
      author: doc.author,
      isPasswordProtected: doc.isPasswordProtected,
      viewCount: doc.viewCount + 1,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
    });
  } catch (error) {
    console.error("Failed to retrieve shared document", error);
    return NextResponse.json(
      { error: "Failed to retrieve shared document" },
      { status: 500 }
    );
  }
}
