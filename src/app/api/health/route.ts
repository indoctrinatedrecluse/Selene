import { NextResponse } from "next/server";
import { SELENE_VERSION, SELENE_EDITION } from "@/lib/version";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "selene-backend",
    version: SELENE_VERSION,
    edition: SELENE_EDITION,
    timestamp: new Date().toISOString(),
  });
}
