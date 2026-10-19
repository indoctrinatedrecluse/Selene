import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SELENE_APP_ID = "selene-titan-app-v1";
const ATTESTATION_WINDOW_SECONDS = 300; // 5-minute replay window
const DEFAULT_SECRET = "selene_titan_celestial_secret_auth_key_2026_abmitra";

function getSecret(): string {
  return process.env.SELENE_BACKEND_SECRET || DEFAULT_SECRET;
}

/**
 * Computes an HMAC-SHA256 hex string using standard Web Crypto API.
 */
async function computeHmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Computes base64url HMAC-SHA256 for token verification.
 */
async function computeHmacSha256Base64Url(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const bytes = new Uint8Array(signature);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Validates a signed license attestation token.
 */
async function verifyToken(token: string): Promise<{ valid: boolean; tier?: string; reason?: string }> {
  if (!token || !token.includes(".")) {
    return { valid: false, reason: "Malformed license token format." };
  }

  const [payloadB64, sig] = token.split(".");
  const expectedSig = await computeHmacSha256Base64Url(`${SELENE_APP_ID}:${payloadB64}`, getSecret());

  if (sig !== expectedSig) {
    return { valid: false, reason: "Cryptographic license token signature mismatch. Tampering detected." };
  }

  try {
    const rawJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(rawJson);
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, reason: "License attestation token has expired." };
    }

    if (payload.status === "tampered" || payload.status === "expired") {
      return { valid: false, reason: `License status is invalid: ${payload.status}` };
    }

    return { valid: true, tier: payload.tier };
  } catch {
    return { valid: false, reason: "Failed to decode license token payload." };
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept API endpoints
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 1. Health check probe is always public (Cloud Run container probes)
  if (pathname === "/api/health") {
    return NextResponse.next();
  }

  // 2. Licensing handshake endpoints: Allowed so clients can fetch initial status and activate
  if (pathname.startsWith("/api/license/")) {
    return NextResponse.next();
  }

  // 3. Public Cloud Share & Gist endpoints: Allowed so public readers and embedded iframes can load shared documents
  if (pathname.startsWith("/api/share")) {
    return NextResponse.next();
  }

  // 4. For all protected data and computation endpoints:
  // (/api/documents, /api/vault, /api/project, /api/ai/*)

  // A. App Attestation Verification
  const appId = request.headers.get("x-selene-app-id");
  const timestamp = request.headers.get("x-selene-timestamp");
  const hwid = request.headers.get("x-selene-hwid") || "unknown-hwid";
  const signature = request.headers.get("x-selene-signature");

  if (!appId || appId !== SELENE_APP_ID) {
    return NextResponse.json(
      {
        error: "Access Denied: Request must originate from an authorized Selene application client.",
        code: "INVALID_APP_ATTESTATION",
      },
      { status: 401 }
    );
  }

  if (!timestamp || !signature) {
    return NextResponse.json(
      {
        error: "Access Denied: Missing cryptographic app attestation signature or timestamp.",
        code: "MISSING_ATTESTATION_HEADERS",
      },
      { status: 401 }
    );
  }

  // Check timestamp drift / replay attack
  const reqTimeMs = new Date(timestamp).getTime();
  if (isNaN(reqTimeMs)) {
    return NextResponse.json(
      { error: "Access Denied: Malformed attestation timestamp.", code: "INVALID_TIMESTAMP" },
      { status: 401 }
    );
  }

  const diffSeconds = Math.abs(Date.now() - reqTimeMs) / 1000;
  if (diffSeconds > ATTESTATION_WINDOW_SECONDS) {
    return NextResponse.json(
      {
        error: `Access Denied: Attestation timestamp expired (${Math.round(diffSeconds)}s drift). Replay rejected.`,
        code: "ATTESTATION_EXPIRED",
      },
      { status: 401 }
    );
  }

  // Verify HMAC signature
  const method = request.method.toUpperCase();
  const expectedSig = await computeHmacSha256(
    `${SELENE_APP_ID}:${method}:${pathname}:${timestamp}:${hwid}`,
    getSecret()
  );

  if (signature.toLowerCase() !== expectedSig.toLowerCase()) {
    return NextResponse.json(
      {
        error: "Access Denied: Application attestation signature mismatch. Unrecognized client.",
        code: "SIGNATURE_MISMATCH",
      },
      { status: 401 }
    );
  }

  // B. License Attestation Verification
  const licenseToken = request.headers.get("x-selene-license-token");
  if (!licenseToken) {
    return NextResponse.json(
      {
        error: "Access Denied: An active Selene license (ADM, DEV, USER) or valid evaluation trial is required.",
        code: "LICENSE_REQUIRED",
      },
      { status: 403 }
    );
  }

  const tokenResult = await verifyToken(licenseToken);
  if (!tokenResult.valid) {
    return NextResponse.json(
      {
        error: `Access Denied: License token rejected: ${tokenResult.reason}`,
        code: "INVALID_LICENSE_TOKEN",
      },
      { status: 403 }
    );
  }

  // Passed all security checks
  const response = NextResponse.next();
  if (tokenResult.tier) {
    response.headers.set("x-selene-tier", tokenResult.tier);
  }
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
