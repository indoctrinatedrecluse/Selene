import { APP_VERSION } from "@/lib/version";

export interface UpdateAsset {
  name: string;
  downloadUrl: string;
  size: number;
  platform: "windows" | "macos" | "linux" | "android" | "other";
}

export interface UpdateCheckResult {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  releaseName: string;
  releaseTag: string;
  releaseUrl: string;
  releaseNotes: string;
  publishedAt: string;
  assets: UpdateAsset[];
  checkedAt?: string;
  error?: string;
}

export async function checkForAppUpdates(): Promise<UpdateCheckResult> {
  try {
    const res = await fetch("/api/updates/check", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Update service responded with status ${res.status}`);
    }

    return await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      currentVersion: APP_VERSION,
      latestVersion: APP_VERSION,
      updateAvailable: false,
      releaseName: `Selene v${APP_VERSION}`,
      releaseTag: `v${APP_VERSION}`,
      releaseUrl: "https://github.com/indoctrinatedrecluse/Selene/releases",
      releaseNotes: "",
      publishedAt: new Date().toISOString(),
      assets: [],
      error: message,
    };
  }
}

export function detectUserPlatform(): "windows" | "macos" | "linux" | "android" | "other" {
  if (typeof window === "undefined") return "other";
  const userAgent = window.navigator.userAgent.toLowerCase();

  if (userAgent.includes("android")) return "android";
  if (userAgent.includes("win")) return "windows";
  if (userAgent.includes("mac")) return "macos";
  if (userAgent.includes("linux")) return "linux";
  return "other";
}

export function formatByteSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
