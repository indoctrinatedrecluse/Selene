import { NextRequest, NextResponse } from "next/server";
import { deactivateLicense } from "@/lib/licensing/license-service";

export async function POST(req: NextRequest) {
  try {
    let password = "";
    try {
      const body = await req.json();
      password = body.password || "";
    } catch {
      // Body is optional
    }

    const result = await deactivateLicense(password);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, message: "Deactivation failed", details: msg },
      { status: 500 }
    );
  }
}
