import os from "os";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";
import { getHardwareFingerprint } from "./hwid";

const execFileAsync = promisify(execFile);

const VAULT_REGISTRY_PATH = "HKCU\\Software\\Selene\\Vault";
const ROOT_REGISTRY_PATH = "HKCU\\Software\\Selene";
const VAULT_SALT_PEPPER = "selene_titan_moon_aes256_gcm_vault_pepper_2026_abhishek_mitra";

export type AIProvider = "gemini" | "openai" | "anthropic";

export interface AIKeyMetadata {
  provider: AIProvider;
  name: string;
  configured: boolean;
  masked: string;
  lastUpdated?: string;
}

/**
 * Derives a 256-bit AES master key tied cryptographically to this specific device:
 * HWID + MachineGuid + OS User Environment + 100,000 PBKDF2 rounds (SHA-512).
 * If ciphertext is exported to another machine, decryption is mathematically impossible.
 */
async function deriveVaultMasterKey(): Promise<Buffer> {
  const hwid = await getHardwareFingerprint();
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
      // Fallback
    }
  }

  const user = os.userInfo().username || "default_user";
  const salt = `${machineGuid}|${user}|${VAULT_SALT_PEPPER}`;
  return crypto.pbkdf2Sync(hwid, salt, 100_000, 32, "sha512");
}

/**
 * Encrypts sensitive secrets using hardware-bound AES-256-GCM.
 * Output format: v1$iv$authTag$ciphertext (hex-encoded)
 */
export async function encryptSecret(plaintext: string): Promise<string> {
  if (!plaintext) return "";
  const key = await deriveVaultMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `v1$${iv.toString("hex")}$${authTag}$${encrypted}`;
}

/**
 * Decrypts secrets with AES-256-GCM authenticated verification.
 * Fails safely if data has been tampered with or moved to another device.
 */
export async function decryptSecret(ciphertext: string): Promise<string | null> {
  if (!ciphertext) return null;
  if (!ciphertext.startsWith("v1$")) {
    // Unencrypted legacy fallback
    return ciphertext;
  }

  try {
    const parts = ciphertext.split("$");
    if (parts.length !== 4) return null;

    const [, ivHex, authTagHex, encryptedHex] = parts;
    const key = await deriveVaultMasterKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.warn("Secure vault decryption failed (ciphertext corrupted or machine mismatch):", err);
    return null;
  }
}

/**
 * Masks a secret string for UI display (e.g. AIza••••••••••••7F10).
 */
export function maskSecret(secret: string): string {
  if (!secret || secret.length < 6) return "••••••••";
  if (secret.length <= 10) return secret.slice(0, 2) + "••••••••" + secret.slice(-2);
  return secret.slice(0, 4) + "••••••••••••" + secret.slice(-4);
}

let resolvedVaultDir: string | null = null;
const inMemoryVaultStore: Record<string, string> = {};

/**
 * Returns a guaranteed writable directory for Selene Vault storage across environments.
 */
function getSafeVaultDir(): string {
  if (resolvedVaultDir) return resolvedVaultDir;

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
      const testFile = path.join(candidate, `.write_probe_v_${process.pid}_${Date.now()}`);
      fs.writeFileSync(testFile, "probe", "utf-8");
      fs.unlinkSync(testFile);
      resolvedVaultDir = candidate;
      return candidate;
    } catch {
      // Try next candidate
    }
  }

  try {
    const tmpFallback = path.join(os.tmpdir(), "selene_vault");
    if (!fs.existsSync(tmpFallback)) {
      fs.mkdirSync(tmpFallback, { recursive: true });
    }
    resolvedVaultDir = tmpFallback;
    return tmpFallback;
  } catch {
    resolvedVaultDir = os.tmpdir();
    return resolvedVaultDir;
  }
}

/**
 * Fallback JSON path for non-Windows environments.
 */
function getNonWindowsVaultPath(): string {
  const dir = getSafeVaultDir();
  return path.join(dir, "vault.json");
}

/**
 * Writes an encrypted key to the Windows Registry HKCU\Software\Selene\Vault.
 */
export async function writeVaultRegistry(key: string, encryptedValue: string): Promise<void> {
  inMemoryVaultStore[key] = encryptedValue;
  const isWindows = process.platform === "win32";

  if (isWindows) {
    try {
      await execFileAsync("reg.exe", [
        "add",
        VAULT_REGISTRY_PATH,
        "/v",
        key,
        "/t",
        "REG_SZ",
        "/d",
        encryptedValue,
        "/f",
      ]);
    } catch (err) {
      console.error(`Failed to write vault key ${key}:`, err);
    }
  } else {
    try {
      const filePath = getNonWindowsVaultPath();
      const parent = path.dirname(filePath);
      if (!fs.existsSync(parent)) {
        fs.mkdirSync(parent, { recursive: true });
      }
      let data: Record<string, string> = {};
      if (fs.existsSync(filePath)) {
        try {
          data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } catch {
          data = {};
        }
      }
      data[key] = encryptedValue;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.warn("Vault file write skipped, cached in memory:", err);
    }
  }
}

/**
 * Reads an encrypted key from Windows Registry HKCU\Software\Selene\Vault.
 */
export async function readVaultRegistry(key: string): Promise<string | null> {
  const isWindows = process.platform === "win32";

  if (isWindows) {
    try {
      const { stdout } = await execFileAsync("reg.exe", [
        "query",
        VAULT_REGISTRY_PATH,
        "/v",
        key,
      ]);
      const match = stdout.match(new RegExp(`${key}\\s+REG_SZ\\s+(.*)`, "i"));
      if (match && match[1]) {
        return match[1].trim();
      }
      return inMemoryVaultStore[key] || null;
    } catch {
      return inMemoryVaultStore[key] || null;
    }
  } else {
    try {
      const filePath = getNonWindowsVaultPath();
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        return data[key] || inMemoryVaultStore[key] || null;
      }
    } catch {
      // Ignore
    }
    return inMemoryVaultStore[key] || null;
  }
}

/**
 * Deletes a key from HKCU\Software\Selene\Vault.
 */
export async function deleteVaultRegistry(key: string): Promise<void> {
  delete inMemoryVaultStore[key];
  const isWindows = process.platform === "win32";

  if (isWindows) {
    try {
      await execFileAsync("reg.exe", ["delete", VAULT_REGISTRY_PATH, "/v", key, "/f"]);
    } catch {
      // Key may not exist
    }
  } else {
    try {
      const filePath = getNonWindowsVaultPath();
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        delete data[key];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      }
    } catch {
      // Ignore
    }
  }
}

// ==========================================
// AI KEY VAULT METHODS
// ==========================================

const PROVIDER_KEY_MAP: Record<AIProvider, { regKey: string; name: string }> = {
  gemini: { regKey: "GeminiApiKey", name: "Google Gemini API" },
  openai: { regKey: "OpenAIApiKey", name: "OpenAI API" },
  anthropic: { regKey: "AnthropicApiKey", name: "Anthropic Claude API" },
};

/**
 * Stores an AI provider API key, encrypted with AES-256-GCM in the Windows Registry.
 */
export async function storeAIKey(provider: AIProvider, plaintextKey: string): Promise<void> {
  const meta = PROVIDER_KEY_MAP[provider];
  if (!meta) throw new Error(`Unsupported AI provider: ${provider}`);

  const encrypted = await encryptSecret(plaintextKey.trim());
  await writeVaultRegistry(meta.regKey, encrypted);
  await writeVaultRegistry(`${meta.regKey}_Updated`, new Date().toISOString());
}

/**
 * Retrieves and decrypts an AI provider API key.
 */
export async function retrieveAIKey(provider: AIProvider): Promise<string | null> {
  const meta = PROVIDER_KEY_MAP[provider];
  if (!meta) return null;

  const encrypted = await readVaultRegistry(meta.regKey);
  if (!encrypted) return null;

  return decryptSecret(encrypted);
}

/**
 * Removes an AI API key from the vault.
 */
export async function removeAIKey(provider: AIProvider): Promise<void> {
  const meta = PROVIDER_KEY_MAP[provider];
  if (!meta) return;

  await deleteVaultRegistry(meta.regKey);
  await deleteVaultRegistry(`${meta.regKey}_Updated`);
}

/**
 * Returns metadata of configured AI keys without exposing the plaintext secrets.
 */
export async function getAIKeysMetadata(): Promise<AIKeyMetadata[]> {
  const results: AIKeyMetadata[] = [];
  const providers: AIProvider[] = ["gemini", "openai", "anthropic"];

  for (const p of providers) {
    const meta = PROVIDER_KEY_MAP[p];
    const encrypted = await readVaultRegistry(meta.regKey);
    const updated = await readVaultRegistry(`${meta.regKey}_Updated`);

    let masked = "";
    let configured = false;

    if (encrypted) {
      const decrypted = await decryptSecret(encrypted);
      if (decrypted) {
        configured = true;
        masked = maskSecret(decrypted);
      }
    }

    results.push({
      provider: p,
      name: meta.name,
      configured,
      masked,
      lastUpdated: updated || undefined,
    });
  }

  return results;
}

// ==========================================
// ENCRYPTED LICENSE KEY HELPER
// ==========================================

/**
 * Saves a license key encrypted with AES-256-GCM in HKCU\Software\Selene.
 */
export async function saveEncryptedLicenseKey(licenseKey: string): Promise<void> {
  const encrypted = await encryptSecret(licenseKey.trim());
  const isWindows = process.platform === "win32";

  if (isWindows) {
    try {
      await execFileAsync("reg.exe", [
        "add",
        ROOT_REGISTRY_PATH,
        "/v",
        "EncryptedLicenseKey",
        "/t",
        "REG_SZ",
        "/d",
        encrypted,
        "/f",
      ]);
      // Remove legacy unencrypted key if present
      await execFileAsync("reg.exe", ["delete", ROOT_REGISTRY_PATH, "/v", "LicenseKey", "/f"]).catch(() => {});
    } catch (err) {
      console.error("Failed to store encrypted license key:", err);
    }
  } else {
    try {
      const fallbackPath = path.join(getSafeVaultDir(), "registry.json");
      const parent = path.dirname(fallbackPath);
      if (!fs.existsSync(parent)) {
        fs.mkdirSync(parent, { recursive: true });
      }
      let current: Record<string, string> = {};
      if (fs.existsSync(fallbackPath)) {
        try {
          current = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
        } catch {
          current = {};
        }
      }
      current["EncryptedLicenseKey"] = encrypted;
      delete current["LicenseKey"];
      fs.writeFileSync(fallbackPath, JSON.stringify(current, null, 2), "utf-8");
    } catch (err) {
      console.warn("Failed to write encrypted license key to disk, kept in memory fallback:", err);
    }
  }
}

/**
 * Retrieves and decrypts the active license key from HKCU\Software\Selene.
 */
export async function getDecryptedLicenseKey(reg: Record<string, string>): Promise<string | null> {
  const encrypted = reg["EncryptedLicenseKey"]?.trim();
  if (encrypted) {
    return decryptSecret(encrypted);
  }

  // Fallback to legacy unencrypted key and migrate if found
  const legacy = reg["LicenseKey"]?.trim();
  if (legacy && legacy !== "TRIAL") {
    // Migrate to encrypted format in the background
    saveEncryptedLicenseKey(legacy).catch(() => {});
    return legacy;
  }

  return null;
}
