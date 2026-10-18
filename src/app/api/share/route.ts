import { NextResponse } from "next/server";
import { db, initDb } from "@/db";
import { sharedDocuments } from "@/db/schema";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await initDb();
    const body = await req.json();

    const title = (body.title || "Untitled Document").trim();
    const contentMarkdown = body.contentMarkdown || body.content || "";
    if (!contentMarkdown) {
      return NextResponse.json(
        { error: "Document content is required to create a share link" },
        { status: 400 }
      );
    }

    const author = (body.author || "Anonymous").trim();
    const rawPassword = body.password ? String(body.password).trim() : null;
    const isPasswordProtected = Boolean(rawPassword);
    const passwordHash = rawPassword
      ? crypto.createHash("sha256").update(rawPassword).digest("hex")
      : null;

    const expiresInHours = Number(body.expiresInHours) || 0;
    const now = Date.now();
    const expiresAt = expiresInHours > 0 ? now + expiresInHours * 3600 * 1000 : null;

    // Generate unique short share ID
    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const timestampSuffix = now.toString(36).slice(-4);
    const shareId = `sh_${randomSuffix}${timestampSuffix}`;

    await db.insert(sharedDocuments).values({
      id: shareId,
      title,
      contentMarkdown,
      author,
      isPasswordProtected,
      passwordHash,
      expiresAt,
      viewCount: 0,
      createdAt: now,
    });

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    const shareUrl = `${protocol}://${host}/share/${shareId}`;

    return NextResponse.json({
      success: true,
      id: shareId,
      url: shareUrl,
      title,
      author,
      isPasswordProtected,
      expiresAt,
      createdAt: now,
    });
  } catch (error) {
    console.error("Failed to create shared document", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}
