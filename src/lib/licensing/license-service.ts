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

/**
 * Computes a stable, tamper-resistant Hardware Identifier (HWID).
 */
export async function getHardwareFingerprint(): Promise<string> {
  const isWindows = process.platform === "win32";
  let machineGuid = "";

  if (isWindows) {
    try {
      const { stdout } = await execFileAsync("reg.exe", [
        "query",
        "HKLM\\SOFTWARE\\Microsoft\\Cryptography",
        "/v",
        "MachineGuid",
      ]);
      const match = stdout.match(/MachineGuid\s+REG_SZ\s+([A-Fa-f0-9-]+)/i);
      if (match && match[1]) {
        machineGuid = match[1].trim();
      }
    } catch {
      // Fallback if reg query fails
    }
  }

  const hostname = os.hostname();
  const platform = os.platform();
  const arch = os.arch();
  const cpus = os.cpus();
  const cpuModel = cpus && cpus.length > 0 ? cpus[0].model : "unknown-cpu";

  const raw = `${machineGuid}|${hostname}|${platform}|${arch}|${cpuModel}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex").toUpperCase();

  // Format as HWID-XXXX-XXXX-XXXX-XXXX (24 characters total)
  return `HWID-${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}`;
}

/**
 * Secondary anchor file path for anti-tampering verification.
 */
function getSecondaryAnchorPath(): string {
  const baseDir =
    process.env.LOCALAPPDATA ||
    (process.platform === "win32" ? path.join(os.homedir(), "AppData", "Local") : path.join(os.homedir(), ".config"));
  const dir = path.join(baseDir, "Selene");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // Ignore directory creation errors
    }
  }
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
  const dir = path.join(os.homedir(), ".selene");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // Ignore
    }
  }
  return path.join(dir, "registry.json");
}

/**
 * Reads registry values from HKCU\Software\Selene (or JSON fallback).
 */
export async function readRegistry(): Promise<Record<string, string>> {
  const isWindows = process.platform === "win32";
  const records: Record<string, string> = {};

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
    const fallbackPath = getNonWindowsFallbackPath();
    if (fs.existsSync(fallbackPath)) {
      try {
        const raw = fs.readFileSync(fallbackPath, "utf-8");
        return JSON.parse(raw);
      } catch {
        return records;
      }
    }
    return records;
  }
}

/**
 * Writes a key-value pair to HKCU\Software\Selene (or JSON fallback).
 */
export async function writeRegistry(key: string, value: string): Promise<void> {
  const isWindows = process.platform === "win32";

  if (isWindows) {
    try {
      await execFileAsync("reg.exe", ["add", REGISTRY_PATH, "/v", key, "/t", "REG_SZ", "/d", value, "/f"]);
    } catch (err) {
      console.error(`Failed to write registry key ${key}:`, err);
    }
  } else {
    const fallbackPath = getNonWindowsFallbackPath();
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
  }
}

/**
 * Deletes a key from HKCU\Software\Selene.
 */
export async function deleteRegistryKey(key: string): Promise<void> {
  const isWindows = process.platform === "win32";

  if (isWindows) {
    try {
      await execFileAsync("reg.exe", ["delete", REGISTRY_PATH, "/v", key, "/f"]);
    } catch {
      // Key might not exist
    }
  } else {
    const fallbackPath = getNonWindowsFallbackPath();
    if (fs.existsSync(fallbackPath)) {
      try {
        const current = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
        delete current[key];
        fs.writeFileSync(fallbackPath, JSON.stringify(current, null, 2), "utf-8");
      } catch {
        // Ignore
      }
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

  const activeKey = reg["LicenseKey"]?.trim();
  const licenseType = (reg["LicenseType"]?.trim().toUpperCase() as LicenseTier) || detectLicenseTier(activeKey);
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
  const appVersion = "0.1.0";

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
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.error || data.message || `Activation failed with HTTP status ${res.status}`,
      };
    }

    // Successfully activated! Save in Windows Registry
    await writeRegistry("LicenseKey", key);
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
  } catch (err: unknown) {
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
    });

    const data = await res.json();

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
    });
  } catch {
    // Continue local cleanup even if server is unreachable
  }

  // Clear license from registry
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
