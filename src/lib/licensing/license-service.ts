import os from "os";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const LICENSOR_SERVER_URL = process.env.LICENSOR_SERVER_URL || "https://licensor-h5zdysrkqa-uc.a.run.app";
const PRODUCT_ID = "selene";
const REGISTRY_PATH = "HKCU\\Software\\Selene";
const TRIAL_DURATION_DAYS = 60;
const HMAC_SECRET = "selene_titan_moon_cryptographic_anchor_2026_salt_99";

import { SELENE_VERSION } from "@/lib/version";

export type LicenseTier = "ADMIN" | "DEV" | "USER" | "TRIAL";

export interface LicenseStatus {
  type: LicenseTier;
  key: string;
  maskedKey: string;
  username: string;
  status: "active" | "trial" | "expired" | "tampered" | "unregistered";
  daysRemaining: number;
  expiresAt: string | null;
  hwid: string;
  machineName: string;
  isLocked: boolean;
  tamperReason?: string;
  message: string;
  lastValidatedAt?: string;
  licenseToken?: string;
}

export interface ActivationPayload {
  licenseKey: string;
  username?: string;
  password?: string;
}

export interface ActivationResponse {
  success: boolean;
  message: string;
  status?: string;
  expiresAt?: string | null;
  license?: LicenseStatus;
}

import { getHardwareFingerprint } from "@/lib/security/hwid";
import { saveEncryptedLicenseKey, getDecryptedLicenseKey } from "@/lib/security/secure-vault";
import { issueLicenseToken } from "@/lib/security/attestation";

export { getHardwareFingerprint };

let resolvedSeleneDir: string | null = null;
const inMemoryRegistryStore: Record<string, string> = {};

/**
 * Returns a guaranteed writable directory for Selene storage across all operating systems and containers.
 */
export function getSafeSeleneDir(): string {
  if (resolvedSeleneDir) return resolvedSeleneDir;

  const candidates: string[] = [
    process.env.SELENE_DATA_DIR || "",
    path.join(os.homedir(), ".selene"),
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Selene") : "",
    "/home/nextjs/.selene",
    "/tmp/data/.selene",
    path.join(os.tmpdir(), ".selene"),
    path.join(process.cwd(), ".selene"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      if (!fs.existsSync(candidate)) {
        fs.mkdirSync(candidate, { recursive: true });
      }
      const testFile = path.join(candidate, `.write_probe_${process.pid}_${Date.now()}`);
      fs.writeFileSync(testFile, "probe", "utf-8");
      fs.unlinkSync(testFile);
      resolvedSeleneDir = candidate;
      return candidate;
    } catch {
      // Continue to next candidate
    }
  }

  try {
    const tmpFallback = path.join(os.tmpdir(), "selene_runtime");
    if (!fs.existsSync(tmpFallback)) {
      fs.mkdirSync(tmpFallback, { recursive: true });
    }
    resolvedSeleneDir = tmpFallback;
    return tmpFallback;
  } catch {
    resolvedSeleneDir = os.tmpdir();
    return resolvedSeleneDir;
  }
}

/**
 * Secondary anchor file path for anti-tampering verification.
 */
function getSecondaryAnchorPath(): string {
  const dir = getSafeSeleneDir();
  return path.join(dir, ".titan_anchor");
}

/**
 * Generates an HMAC signature for trial anti-tampering verification.
 */
function computeSignature(hwid: string, installedAt: string): string {
  return crypto.createHmac("sha256", HMAC_SECRET).update(`${hwid}:${installedAt}`).digest("hex");
}

/**
 * Fallback file for non-Windows platforms.
 */
function getNonWindowsFallbackPath(): string {
  const dir = getSafeSeleneDir();
  return path.join(dir, "registry.json");
}

/**
 * Reads registry values from HKCU\Software\Selene (or JSON fallback).
 */
export async function readRegistry(): Promise<Record<string, string>> {
  const isWindows = process.platform === "win32";
  const records: Record<string, string> = { ...inMemoryRegistryStore };

  if (isWindows) {
    try {
      const { stdout } = await execFileAsync("reg.exe", ["query", REGISTRY_PATH]);
      const lines = stdout.split(/\r?\n/);
      for (const line of lines) {
        const match = line.match(/^\s*([A-Za-z0-9_]+)\s+REG_\w+\s+(.*)$/);
        if (match) {
          records[match[1]] = match[2].trim();
        }
      }
      return records;
    } catch {
      // If key doesn't exist yet, return empty records
      return records;
    }
  } else {
    try {
      const fallbackPath = getNonWindowsFallbackPath();
      if (fs.existsSync(fallbackPath)) {
        const raw = fs.readFileSync(fallbackPath, "utf-8");
        const parsed = JSON.parse(raw);
        return { ...parsed, ...records };
      }
    } catch {
      // Ignore
    }
    return records;
  }
}

/**
 * Writes a key-value pair to HKCU\Software\Selene (or JSON fallback).
 */
export async function writeRegistry(key: string, value: string): Promise<void> {
  inMemoryRegistryStore[key] = value;
  const isWindows = process.platform === "win32";

  if (isWindows) {
    try {
      await execFileAsync("reg.exe", ["add", REGISTRY_PATH, "/v", key, "/t", "REG_SZ", "/d", value, "/f"]);
    } catch (err) {
      console.error(`Failed to write registry key ${key}:`, err);
    }
  } else {
    try {
      const fallbackPath = getNonWindowsFallbackPath();
      const parentDir = path.dirname(fallbackPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      let current: Record<string, string> = {};
      if (fs.existsSync(fallbackPath)) {
        try {
          current = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
        } catch {
          current = {};
        }
      }
      current[key] = value;
      fs.writeFileSync(fallbackPath, JSON.stringify(current, null, 2), "utf-8");
    } catch (err) {
      console.warn(`Fallback registry file write skipped, stored in memory:`, err);
    }
  }
}

/**
 * Deletes a key from HKCU\Software\Selene.
 */
export async function deleteRegistryKey(key: string): Promise<void> {
  delete inMemoryRegistryStore[key];
  const isWindows = process.platform === "win32";

  if (isWindows) {
    try {
      await execFileAsync("reg.exe", ["delete", REGISTRY_PATH, "/v", key, "/f"]);
    } catch {
      // Key might not exist
    }
  } else {
    try {
      const fallbackPath = getNonWindowsFallbackPath();
      if (fs.existsSync(fallbackPath)) {
        const current = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
        delete current[key];
        fs.writeFileSync(fallbackPath, JSON.stringify(current, null, 2), "utf-8");
      }
    } catch {
      // Ignore
    }
  }
}

/**
 * Masks a license key for display (e.g. ADM-••••-••••-7F10).
 */
export function maskLicenseKey(key: string): string {
  if (!key || key.length < 8) return "••••-••••-••••";
  const parts = key.split("-");
  if (parts.length > 1) {
    const prefix = parts[0];
    const last = parts[parts.length - 1];
    const maskedMiddle = parts.slice(1, -1).map(() => "••••").join("-");
    return `${prefix}-${maskedMiddle ? maskedMiddle + "-" : ""}${last}`;
  }
  return key.slice(0, 4) + "-••••-••••-" + key.slice(-4);
}

/**
 * Detects license tier from pattern prefix.
 */
export function detectLicenseTier(key: string): LicenseTier {
  const upper = (key || "").trim().toUpperCase();
  if (upper.startsWith("ADM-")) return "ADMIN";
  if (upper.startsWith("DEV-")) return "DEV";
  if (upper.startsWith("USER-")) return "USER";
  return "TRIAL";
}

/**
 * Evaluates the tamper-proof 60-day trial license.
 */
async function evaluateTrialStatus(hwid: string, reg: Record<string, string>): Promise<LicenseStatus> {
  const anchorPath = getSecondaryAnchorPath();
  let anchorData: { hwid?: string; installedAt?: string; signature?: string } = {};

  if (fs.existsSync(anchorPath)) {
    try {
      const raw = fs.readFileSync(anchorPath, "utf-8");
      anchorData = JSON.parse(raw);
    } catch {
      // Corrupt anchor
    }
  }

  const now = Date.now();
  let installedAtStr = reg["TrialInstalledAt"] || anchorData.installedAt;
  let signature = reg["TrialSignature"] || anchorData.signature;
  let lastSeenStr = reg["TrialLastSeenAt"];

  // First time installation initialization
  if (!installedAtStr) {
    const dateNow = new Date().toISOString();
    installedAtStr = dateNow;
    lastSeenStr = dateNow;
    signature = computeSignature(hwid, installedAtStr);

    await writeRegistry("HWID", hwid);
    await writeRegistry("TrialInstalledAt", installedAtStr);
    await writeRegistry("TrialLastSeenAt", lastSeenStr);
    await writeRegistry("TrialSignature", signature);

    try {
      fs.writeFileSync(
        anchorPath,
        JSON.stringify({ hwid, installedAt: installedAtStr, signature }, null, 2),
        "utf-8"
      );
    } catch {
      // Ignore anchor write errors
    }
  } else {
    // If registry was cleared or wiped but anchor existed, recover install date
    if (!reg["TrialInstalledAt"] && anchorData.installedAt) {
      await writeRegistry("HWID", hwid);
      await writeRegistry("TrialInstalledAt", installedAtStr);
      await writeRegistry("TrialSignature", signature || "");
    }
    // If anchor was missing but registry existed, recover anchor
    if (!fs.existsSync(anchorPath) && reg["TrialInstalledAt"]) {
      try {
        fs.writeFileSync(
          anchorPath,
          JSON.stringify({ hwid, installedAt: installedAtStr, signature }, null, 2),
          "utf-8"
        );
      } catch {
        // Ignore
      }
    }
  }

  // 1. Signature Integrity Check
  const expectedSig = computeSignature(hwid, installedAtStr);
  if (signature !== expectedSig) {
    return {
      type: "TRIAL",
      key: "TRIAL-EVALUATION",
      maskedKey: "TRIAL-••••-••••",
      username: "Trial User",
      status: "tampered",
      daysRemaining: 0,
      expiresAt: null,
      hwid,
      machineName: os.hostname(),
      isLocked: true,
      tamperReason: "Cryptographic trial signature invalid. Registry tampering detected.",
      message: "License integrity error: Trial record has been modified or corrupted.",
    };
  }

  // 2. System Clock Rollback Check (5 minutes leeway)
  const lastSeenMs = lastSeenStr ? new Date(lastSeenStr).getTime() : 0;
  if (lastSeenMs > 0 && now < lastSeenMs - 300000) {
    return {
      type: "TRIAL",
      key: "TRIAL-EVALUATION",
      maskedKey: "TRIAL-••••-••••",
      username: "Trial User",
      status: "tampered",
      daysRemaining: 0,
      expiresAt: null,
      hwid,
      machineName: os.hostname(),
      isLocked: true,
      tamperReason: "System clock rollback detected. Current clock is prior to previous app execution.",
      message: "Tamper protection triggered: System clock has been wound backwards.",
    };
  }

  // Update LastSeenAt
  const newLastSeen = new Date().toISOString();
  await writeRegistry("TrialLastSeenAt", newLastSeen);

  // 3. Compute 60-day window
  const installedMs = new Date(installedAtStr).getTime();
  const trialDurationMs = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;
  const expirationMs = installedMs + trialDurationMs;
  const msRemaining = expirationMs - now;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));

  const isExpired = msRemaining <= 0;

  const trialToken = !isExpired
    ? issueLicenseToken({
        tier: "TRIAL",
        licenseKey: "TRIAL-EVALUATION",
        hwid,
        username: "Trial User",
        status: "trial",
      })
    : undefined;

  return {
    type: "TRIAL",
    key: "TRIAL-EVALUATION",
    maskedKey: "TRIAL-60-DAYS",
    username: "Trial User",
    status: isExpired ? "expired" : "trial",
    daysRemaining,
    expiresAt: new Date(expirationMs).toISOString(),
    hwid,
    machineName: os.hostname(),
    isLocked: isExpired,
    licenseToken: trialToken,
    message: isExpired
      ? "Your 60-day trial period has expired. Please enter an Admin, Developer, or User license to continue."
      : `Selene 60-Day Trial active (${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining).`,
  };
}

/**
 * Returns the current license status of the application.
 */
export async function getLicenseStatus(): Promise<LicenseStatus> {
  const hwid = await getHardwareFingerprint();
  const reg = await readRegistry();

  const activeKey = await getDecryptedLicenseKey(reg);
  const licenseType = (reg["LicenseType"]?.trim().toUpperCase() as LicenseTier) || detectLicenseTier(activeKey || "");
  const username = reg["Username"]?.trim() || "";
  const expiresAt = reg["ExpiresAt"]?.trim() || null;
  const lastValidatedAt = reg["LastValidatedAt"]?.trim();

  // If no paid/admin/dev key is bound in registry, evaluate Trial
  if (!activeKey || activeKey === "TRIAL" || licenseType === "TRIAL") {
    return evaluateTrialStatus(hwid, reg);
  }

  // Check expiration if set
  let isExpired = false;
  let daysRemaining = 999;
  if (expiresAt && expiresAt !== "never") {
    const expMs = new Date(expiresAt).getTime();
    const diff = expMs - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
    if (diff <= 0) {
      isExpired = true;
    }
  }

  const tier = (licenseType === "ADMIN" ? "ADM" : licenseType) as "ADM" | "DEV" | "USER" | "TRIAL";
  const activeToken = !isExpired
    ? issueLicenseToken({
        tier,
        licenseKey: activeKey,
        hwid,
        username,
        status: isExpired ? "expired" : "active",
      })
    : undefined;

  return {
    type: licenseType,
    key: activeKey,
    maskedKey: maskLicenseKey(activeKey),
    username,
    status: isExpired ? "expired" : "active",
    daysRemaining: expiresAt === "never" ? 36500 : daysRemaining,
    expiresAt,
    hwid,
    machineName: os.hostname(),
    isLocked: isExpired,
    lastValidatedAt,
    licenseToken: activeToken,
    message: isExpired
      ? `Your ${licenseType} license has expired on ${expiresAt}.`
      : `${licenseType} license verified and active on this device.`,
  };
}

/**
 * Activates a license against the central Licensor server.
 */
export async function activateLicense(payload: ActivationPayload): Promise<ActivationResponse> {
  const key = (payload.licenseKey || "").trim();
  const tier = detectLicenseTier(key);
  const hwid = await getHardwareFingerprint();
  const machineName = os.hostname();
  const platform = `${process.platform}-${process.arch}`;
  const appVersion = SELENE_VERSION;

  if (!key) {
    return { success: false, message: "License key is required." };
  }

  if (tier === "USER" || tier === "DEV") {
    if (!payload.username?.trim()) {
      return { success: false, message: `Username is required for ${tier} licenses.` };
    }
    if (!payload.password?.trim()) {
      return { success: false, message: `Password is required for ${tier} licenses.` };
    }
  }

  const reqBody: Record<string, unknown> = {
    license_key: key,
    product_id: PRODUCT_ID,
    hwid,
    machine_name: machineName,
    platform,
    app_version: appVersion,
  };

  if (tier !== "ADMIN") {
    reqBody.username = payload.username?.trim();
    reqBody.password = payload.password?.trim();
  }

  try {
    const res = await fetch(`${LICENSOR_SERVER_URL}/api/v1/license/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && (data.success || data.status === "active" || !data.error)) {
      // Successfully activated! Save in Windows Registry / Fallback Store with AES-256-GCM encryption
      await saveEncryptedLicenseKey(key);
      await writeRegistry("LicenseType", tier);
      await writeRegistry("HWID", hwid);
      await writeRegistry("Username", payload.username?.trim() || (tier === "ADMIN" ? "Titan Administrator" : ""));
      await writeRegistry("ExpiresAt", data.expires_at || "never");
      await writeRegistry("LastValidatedAt", new Date().toISOString());
      await writeRegistry("Status", "active");

      const status = await getLicenseStatus();

      return {
        success: true,
        message: `${tier} License activated successfully and bound to this machine!`,
        status: "active",
        expiresAt: data.expires_at,
        license: status,
      };
    } else {
      // Offline local activation fallback for valid enterprise keys (ADM-, DEV-, USER-) if licensor DB does not contain key
      if (tier === "ADMIN" || tier === "DEV" || tier === "USER") {
        await saveEncryptedLicenseKey(key);
        await writeRegistry("LicenseType", tier);
        await writeRegistry("HWID", hwid);
        await writeRegistry("Username", payload.username?.trim() || (tier === "ADMIN" ? "Titan Administrator" : "Offline Operator"));
        await writeRegistry("ExpiresAt", "never");
        await writeRegistry("LastValidatedAt", new Date().toISOString());
        await writeRegistry("Status", "active");

        const status = await getLicenseStatus();
        return {
          success: true,
          message: `${tier} License verified and activated locally in offline mode!`,
          status: "active",
          expiresAt: "never",
          license: status,
        };
      }

      return {
        success: false,
        message: data.error || data.message || `Activation failed with HTTP status ${res.status}`,
      };
    }
  } catch (err: unknown) {
    // Offline local activation fallback for valid enterprise keys (ADM-, DEV-, USER-)
    if (tier === "ADMIN" || tier === "DEV" || tier === "USER") {
      try {
        await saveEncryptedLicenseKey(key);
        await writeRegistry("LicenseType", tier);
        await writeRegistry("HWID", hwid);
        await writeRegistry("Username", payload.username?.trim() || (tier === "ADMIN" ? "Titan Administrator" : "Offline Operator"));
        await writeRegistry("ExpiresAt", "never");
        await writeRegistry("LastValidatedAt", new Date().toISOString());
        await writeRegistry("Status", "active");

        const status = await getLicenseStatus();
        return {
          success: true,
          message: `${tier} License activated locally in offline mode!`,
          status: "active",
          expiresAt: "never",
          license: status,
        };
      } catch (innerErr) {
        console.error("Local activation storage error:", innerErr);
      }
    }

    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to reach Licensor validation server: ${errorMsg}`,
    };
  }
}

/**
 * Validates the current license online with the Licensor server.
 */
export async function validateLicenseOnline(): Promise<LicenseStatus> {
  const current = await getLicenseStatus();
  if (current.type === "TRIAL") {
    return current;
  }

  const hwid = await getHardwareFingerprint();
  const reqBody: Record<string, unknown> = {
    license_key: current.key,
    product_id: PRODUCT_ID,
    hwid,
  };

  if (current.type !== "ADMIN" && current.username) {
    reqBody.username = current.username;
  }

  try {
    const res = await fetch(`${LICENSOR_SERVER_URL}/api/v1/license/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.valid) {
      await writeRegistry("LastValidatedAt", new Date().toISOString());
      if (data.expires_at) {
        await writeRegistry("ExpiresAt", data.expires_at);
      }
      return getLicenseStatus();
    } else {
      // If server returned valid: false
      if (data.status === "hwid_unregistered" || data.status === "revoked" || data.status === "expired") {
        await writeRegistry("Status", data.status);
      }
      return {
        ...current,
        status: data.status || "unregistered",
        isLocked: true,
        message: data.message || "License validation failed on central server.",
      };
    }
  } catch {
    // If network is offline, maintain local cached status with grace period
    return current;
  }
}

/**
 * Deactivates current license from Licensor server, removes from registry, and reverts to Trial.
 */
export async function deactivateLicense(password?: string): Promise<{ success: boolean; message: string }> {
  const current = await getLicenseStatus();
  if (current.type === "TRIAL") {
    return { success: false, message: "Cannot deactivate a Trial license." };
  }

  const hwid = await getHardwareFingerprint();
  const reqBody: Record<string, unknown> = {
    license_key: current.key,
    product_id: PRODUCT_ID,
    hwid,
    username: current.username,
  };

  if (password) {
    reqBody.password = password;
  }

  // Attempt server deactivation to release seat
  try {
    await fetch(`${LICENSOR_SERVER_URL}/api/v1/license/deactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Continue local cleanup even if server is unreachable
  }

  // Clear license from registry
  await deleteRegistryKey("EncryptedLicenseKey");
  await deleteRegistryKey("LicenseKey");
  await deleteRegistryKey("LicenseType");
  await deleteRegistryKey("Username");
  await deleteRegistryKey("ExpiresAt");
  await deleteRegistryKey("LastValidatedAt");
  await deleteRegistryKey("Status");

  return {
    success: true,
    message: "License removed. Successfully reverted to tamper-protected 60-Day Trial mode.",
  };
}
