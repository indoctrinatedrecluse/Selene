import { NextResponse } from "next/server";
import { APP_VERSION, APP_EDITION } from "@/lib/version";

interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
  content_type: string;
}

interface GitHubReleaseResponse {
  tag_name: string;
  name: string;
  html_url: string;
  body: string;
  published_at: string;
  assets: GitHubAsset[];
}

function compareSemver(remote: string, current: string): number {
  const parseParts = (v: string) =>
    v
      .replace(/^v/, "")
      .split(/[-+]/)[0]
      .split(".")
      .map((part) => parseInt(part, 10) || 0);

  const rParts = parseParts(remote);
  const cParts = parseParts(current);
  const len = Math.max(rParts.length, cParts.length, 3);

  for (let i = 0; i < len; i++) {
    const r = rParts[i] ?? 0;
    const c = cParts[i] ?? 0;
    if (r > c) return 1;
    if (r < c) return -1;
  }
  return 0;
}

function categorizeAsset(name: string): "windows" | "macos" | "linux" | "android" | "other" {
  const lower = name.toLowerCase();
  if (lower.endsWith(".msi") || lower.endsWith(".exe")) return "windows";
  if (lower.endsWith(".dmg") || lower.includes("macos") || lower.includes("darwin")) return "macos";
  if (lower.endsWith(".appimage") || lower.endsWith(".deb") || lower.includes("linux")) return "linux";
  if (lower.endsWith(".apk")) return "android";
  return "other";
}

export async function GET() {
  try {
    const repoUrl = "https://api.github.com/repos/indoctrinatedrecluse/Selene/releases/latest";
    const response = await fetch(repoUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": `Selene-${APP_EDITION}-${APP_VERSION}`,
      },
      next: { revalidate: 300 }, // Cache check for 5 minutes
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          currentVersion: APP_VERSION,
          latestVersion: APP_VERSION,
          updateAvailable: false,
          releaseName: `Selene v${APP_VERSION}`,
          releaseTag: `v${APP_VERSION}`,
          releaseUrl: "https://github.com/indoctrinatedrecluse/Selene/releases",
          releaseNotes: "You are running the latest version of Selene.",
          publishedAt: new Date().toISOString(),
          assets: [],
          checkedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json(
        {
          error: `GitHub API returned ${response.status}: ${response.statusText}`,
          currentVersion: APP_VERSION,
          updateAvailable: false,
        },
        { status: 200 }
      );
    }

    const data: GitHubReleaseResponse = await response.json();
    const rawTag = data.tag_name || `v${APP_VERSION}`;
    const cleanTag = rawTag.replace(/^v/, "").trim();
    const isNewer = compareSemver(cleanTag, APP_VERSION) > 0;

    const assets = (data.assets || []).map((asset) => ({
      name: asset.name,
      downloadUrl: asset.browser_download_url,
      size: asset.size,
      platform: categorizeAsset(asset.name),
    }));

    return NextResponse.json({
      currentVersion: APP_VERSION,
      latestVersion: cleanTag,
      updateAvailable: isNewer,
      releaseName: data.name || rawTag,
      releaseTag: rawTag,
      releaseUrl: data.html_url || "https://github.com/indoctrinatedrecluse/Selene/releases",
      releaseNotes: data.body || "",
      publishedAt: data.published_at || new Date().toISOString(),
      assets,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: `Failed to check for updates: ${message}`,
        currentVersion: APP_VERSION,
        updateAvailable: false,
      },
      { status: 200 }
    );
  }
}
