import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "selene-backend",
    version: "0.1.0",
    edition: "Titan Edition",
    timestamp: new Date().toISOString(),
  });
}
