import { SELENE_APP_ID } from "./security/attestation";

const DEFAULT_SECRET = "selene_titan_celestial_secret_auth_key_2026_abmitra";

function getClientSecret(): string {
  return process.env.NEXT_PUBLIC_SELENE_CLIENT_SECRET || DEFAULT_SECRET;
}

// In-memory token cache
let cachedLicenseToken: string | null = null;
let cachedHwid: string | null = null;

export function setCachedLicenseToken(token: string | null) {
  cachedLicenseToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      sessionStorage.setItem("selene_license_token", token);
    } else {
      sessionStorage.removeItem("selene_license_token");
    }
  }
}

export function getCachedLicenseToken(): string | null {
  if (cachedLicenseToken) return cachedLicenseToken;
  if (typeof window !== "undefined") {
    cachedLicenseToken = sessionStorage.getItem("selene_license_token");
  }
  return cachedLicenseToken;
}

export function setCachedHwid(hwid: string) {
  cachedHwid = hwid;
  if (typeof window !== "undefined") {
    localStorage.setItem("selene_cached_hwid", hwid);
  }
}

export function getCachedHwid(): string {
  if (cachedHwid) return cachedHwid;
  if (typeof window !== "undefined") {
    cachedHwid = localStorage.getItem("selene_cached_hwid");
  }
  return cachedHwid || "HWID-WEB-CLIENT-ANON";
}

/**
 * Detects whether the frontend is running inside Tauri, Electron, or Web browser.
 */
export function detectClientEnvironment(): string {
  if (typeof window === "undefined") return "server-ssr";
  if ((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ || (window as unknown as { __TAURI__?: unknown }).__TAURI__) {
    return "desktop-tauri";
  }
  if ((window as unknown as { seleneDesktop?: unknown }).seleneDesktop) {
    return "desktop-electron";
  }
  return "selene-web";
}

/**
 * Computes an HMAC-SHA256 signature using browser-native Web Cryptography API.
 */
async function computeSignature(
  method: string,
  pathname: string,
  timestamp: string,
  hwid: string,
  secret: string = getClientSecret()
): Promise<string> {
  const normalizedMethod = method.toUpperCase();
  const raw = `${SELENE_APP_ID}:${normalizedMethod}:${pathname}:${timestamp}:${hwid}`;

  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await window.crypto.subtle.sign("HMAC", key, enc.encode(raw));
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // Fallback for SSR or non-browser environments
  const nodeCrypto = await import("crypto");
  return nodeCrypto.createHmac("sha256", secret).update(raw).digest("hex");
}

/**
 * Authenticated fetch wrapper that automatically computes and attaches:
 * - App Attestation proof (App ID, Timestamp, HWID, Signature)
 * - Cryptographic License Attestation Token
 */
export async function apiFetch(input: string | URL | Request, init: RequestInit = {}): Promise<Response> {
  const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  let pathname = urlStr;
  try {
    const parsed = new URL(urlStr, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    pathname = parsed.pathname;
  } catch {
    // Keep relative string
  }

  const method = (init.method || "GET").toUpperCase();
  const timestamp = new Date().toISOString();
  const hwid = getCachedHwid();
  const clientType = detectClientEnvironment();
  const signature = await computeSignature(method, pathname, timestamp, hwid);
  const licenseToken = getCachedLicenseToken();

  const headers = new Headers(init.headers || {});
  headers.set("x-selene-app-id", SELENE_APP_ID);
  headers.set("x-selene-client", clientType);
  headers.set("x-selene-timestamp", timestamp);
  headers.set("x-selene-hwid", hwid);
  headers.set("x-selene-signature", signature);

  if (licenseToken) {
    headers.set("x-selene-license-token", licenseToken);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  return response;
}
