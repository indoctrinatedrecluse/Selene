import os from "os";
import crypto from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/**
 * Computes a stable, tamper-resistant Hardware Identifier (HWID).
 * Derived from Windows MachineGuid (or OS node), CPU, architecture, and platform.
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
      // Fallback
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
