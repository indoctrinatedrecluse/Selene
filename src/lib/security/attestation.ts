import crypto from "crypto";

/**
 * Selene Cryptographic Client Attestation & License Gatekeeper
 * 
 * Ensures that the hosted backend ONLY accepts requests originating from:
 * 1. Legitimate Selene application clients (Desktop Tauri, Electron shell, or authenticated Web app).
 * 2. Clients possessing a verified, active license (ADM, DEV, USER) or valid evaluation trial.
 * 
 * Rejects raw unauthorized cURL, Postman, automated scrapers, and third-party callers.
 */

export const SELENE_APP_ID = "selene-titan-app-v1";
export const ATTESTATION_WINDOW_SECONDS = 300; // 5-minute replay-prevention window

const DEFAULT_SECRET = "selene_titan_celestial_secret_auth_key_2026_abmitra";

export function getBackendSecret(): string {
  return process.env.SELENE_BACKEND_SECRET || DEFAULT_SECRET;
}

export function getClientSecret(): string {
  return process.env.NEXT_PUBLIC_SELENE_CLIENT_SECRET || DEFAULT_SECRET;
}

export interface LicenseTokenPayload {
  tier: "ADM" | "DEV" | "USER" | "TRIAL";
  licenseKey: string;
  hwid: string;
  username: string;
  status: string;
  iat: number;
  exp: number;
}

/**
 * Generates an HMAC-SHA256 signature for a client request.
 */
export function signRequest(
  method: string,
  pathname: string,
  timestamp: string,
  hwid: string,
  secret: string = getClientSecret()
): string {
  const normalizedMethod = method.toUpperCase();
  const raw = `${SELENE_APP_ID}:${normalizedMethod}:${pathname}:${timestamp}:${hwid}`;
  return crypto.createHmac("sha256", secret).update(raw).digest("hex");
}

/**
 * Issues a cryptographically signed license attestation token.
 */
export function issueLicenseToken(payload: Omit<LicenseTokenPayload, "iat" | "exp">, durationSeconds: number = 86400 * 30): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: LicenseTokenPayload = {
    ...payload,
    iat: now,
    exp: now + durationSeconds,
  };

  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getBackendSecret())
    .update(`${SELENE_APP_ID}:${payloadB64}`)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies and decodes a license attestation token.
 */
export function verifyLicenseToken(token: string): { valid: boolean; payload?: LicenseTokenPayload; reason?: string } {
  if (!token || !token.includes(".")) {
    return { valid: false, reason: "Malformed license token format." };
  }

  const [payloadB64, signature] = token.split(".");
  const expectedSignature = crypto
    .createHmac("sha256", getBackendSecret())
    .update(`${SELENE_APP_ID}:${payloadB64}`)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return { valid: false, reason: "Cryptographic license token signature mismatch. Tampering detected." };
  }

  try {
    const payload: LicenseTokenPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      return { valid: false, reason: "License attestation token has expired." };
    }

    if (payload.status === "tampered" || payload.status === "expired") {
      return { valid: false, reason: `License status is invalid (${payload.status}).` };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: "Failed to parse license token payload." };
  }
}

/**
 * Validates incoming HTTP headers for client attestation.
 */
export function verifyRequestAttestation(
  method: string,
  pathname: string,
  headers: Headers
): { valid: boolean; reason?: string } {
  const appId = headers.get("x-selene-app-id");
  const timestamp = headers.get("x-selene-timestamp");
  const hwid = headers.get("x-selene-hwid") || "unknown-hwid";
  const signature = headers.get("x-selene-signature");

  if (!appId || appId !== SELENE_APP_ID) {
    return { valid: false, reason: "Missing or invalid Application Attestation ID (X-Selene-App-ID)." };
  }

  if (!timestamp || !signature) {
    return { valid: false, reason: "Missing required attestation signature or timestamp headers." };
  }

  // Replay Attack & Clock Drift Protection
  const reqTimeMs = new Date(timestamp).getTime();
  if (isNaN(reqTimeMs)) {
    return { valid: false, reason: "Invalid attestation timestamp format." };
  }

  const nowMs = Date.now();
  const diffSeconds = Math.abs(nowMs - reqTimeMs) / 1000;

  if (diffSeconds > ATTESTATION_WINDOW_SECONDS) {
    return {
      valid: false,
      reason: `Attestation timestamp expired (${Math.round(diffSeconds)}s drift exceeds ${ATTESTATION_WINDOW_SECONDS}s window). Replay rejected.`,
    };
  }

  // Verify HMAC signature
  const expectedSignature = signRequest(method, pathname, timestamp, hwid, getBackendSecret());

  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, reason: "Client attestation signature mismatch. Request origin not recognized." };
    }
  } catch {
    return { valid: false, reason: "Signature verification failed." };
  }

  return { valid: true };
}
