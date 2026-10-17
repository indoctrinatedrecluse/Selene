import { NextResponse } from "next/server";
import { validateLicenseOnline } from "@/lib/licensing/license-service";

export async function POST() {
  try {
    const status = await validateLicenseOnline();
    return NextResponse.json(status);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Validation request failed", details: msg },
      { status: 500 }
    );
  }
}
