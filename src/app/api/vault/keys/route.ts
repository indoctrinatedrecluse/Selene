import { NextRequest, NextResponse } from "next/server";
import {
  getAIKeysMetadata,
  storeAIKey,
  removeAIKey,
  AIProvider,
} from "@/lib/security/secure-vault";

export async function GET() {
  try {
    const keys = await getAIKeysMetadata();
    return NextResponse.json(keys);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to read vault keys metadata", details: msg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const provider = body.provider as AIProvider;
    const apiKey = (body.apiKey || "").trim();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { success: false, message: "provider and apiKey are required" },
        { status: 400 }
      );
    }

    if (provider !== "gemini" && provider !== "openai" && provider !== "anthropic") {
      return NextResponse.json(
        { success: false, message: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }

    await storeAIKey(provider, apiKey);
    const updated = await getAIKeysMetadata();

    return NextResponse.json({
      success: true,
      message: `Successfully encrypted and saved ${provider.toUpperCase()} API key to Windows Registry Vault!`,
      keys: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, message: "Failed to store key in vault", details: msg },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const provider = body.provider as AIProvider;

    if (!provider) {
      return NextResponse.json(
        { success: false, message: "provider is required" },
        { status: 400 }
      );
    }

    await removeAIKey(provider);
    const updated = await getAIKeysMetadata();

    return NextResponse.json({
      success: true,
      message: `Removed ${provider.toUpperCase()} API key from vault.`,
      keys: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, message: "Failed to remove key from vault", details: msg },
      { status: 500 }
    );
  }
}
