import { NextRequest, NextResponse } from "next/server";
import { activateLicense } from "@/lib/licensing/license-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await activateLicense(body);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, message: "Activation failed", details: msg },
      { status: 500 }
    );
  }
}
