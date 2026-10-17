import { NextResponse } from "next/server";
import { getLicenseStatus } from "@/lib/licensing/license-service";

export async function GET() {
  try {
    const status = await getLicenseStatus();
    return NextResponse.json(status);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to evaluate license status", details: msg },
      { status: 500 }
    );
  }
}
