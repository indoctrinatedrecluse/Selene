import fs from "fs";
import path from "path";

export type CssFramework = "tailwind" | "bootstrap" | "vanilla";
export type JsFramework = "nextjs" | "vite-react" | "cra" | "react" | "unknown";

export interface ProjectMetadata {
  name: string;
  version: string;
  jsFramework: JsFramework;
  cssFramework: CssFramework;
  hasDevScript: boolean;
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
  suggestedPort: number;
  detectedDependencies: string[];
}

export interface RouteResolution {
  filePath: string;
  resolvedRoute: string;
  isComponent: boolean;
  confidence: "exact" | "inferred" | "root";
}

/**
 * Scans a project directory and detects framework, CSS styling stack, and package scripts.
 */
export function detectProjectMetadata(projectRoot: string = process.cwd()): ProjectMetadata {
  const pkgPath = path.join(projectRoot, "package.json");
  let pkg: Record<string, unknown> = {};

  if (fs.existsSync(pkgPath)) {
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as Record<string, unknown>;
    } catch {
      pkg = {};
    }
  }

  const pkgDeps = (pkg.dependencies as Record<string, string>) || {};
  const pkgDevDeps = (pkg.devDependencies as Record<string, string>) || {};

  const allDeps: Record<string, string> = {
    ...pkgDeps,
    ...pkgDevDeps,
  };

  const depNames = Object.keys(allDeps);

  // 1. Detect JS/React Framework
  let jsFramework: JsFramework = "unknown";
  let suggestedPort = 3000;

  if (depNames.includes("next")) {
    jsFramework = "nextjs";
    suggestedPort = 3000;
  } else if (depNames.includes("vite")) {
    jsFramework = "vite-react";
    suggestedPort = 5173;
  } else if (depNames.includes("react-scripts")) {
    jsFramework = "cra";
    suggestedPort = 3000;
  } else if (depNames.includes("react")) {
    jsFramework = "react";
    suggestedPort = 3000;
  }

  // 2. Detect CSS Framework (Tailwind vs Bootstrap vs Vanilla)
  let cssFramework: CssFramework = "vanilla";
  if (
    depNames.includes("tailwindcss") ||
    depNames.includes("@tailwindcss/postcss") ||
    depNames.some((d) => d.startsWith("@tailwindcss/"))
  ) {
    cssFramework = "tailwind";
  } else if (
    depNames.includes("bootstrap") ||
    depNames.includes("react-bootstrap")
  ) {
    cssFramework = "bootstrap";
  }

  // 3. Detect Package Manager
  let packageManager: "npm" | "yarn" | "pnpm" | "bun" = "npm";
  if (fs.existsSync(path.join(projectRoot, "pnpm-lock.yaml"))) {
    packageManager = "pnpm";
  } else if (fs.existsSync(path.join(projectRoot, "yarn.lock"))) {
    packageManager = "yarn";
  } else if (fs.existsSync(path.join(projectRoot, "bun.lockb"))) {
    packageManager = "bun";
  }

  const scripts = (pkg.scripts as Record<string, string>) || {};
  const hasDevScript = Boolean(scripts.dev);

  return {
    name: (pkg.name as string) || "Selene Project",
    version: (pkg.version as string) || "1.0.0",
    jsFramework,
    cssFramework,
    hasDevScript,
    packageManager,
    suggestedPort,
    detectedDependencies: depNames.filter((d) =>
      ["react", "next", "vite", "tailwindcss", "bootstrap", "react-bootstrap"].includes(d)
    ),
  };
}

/**
 * Resolves a file path to its expected dev server HTTP route.
 * Handles Next.js App Router, Pages Router, and standard React SPAs.
 *
 * Examples:
 * - src/app/dashboard/page.tsx -> /dashboard
 * - src/app/page.tsx -> /
 * - pages/pricing/index.tsx -> /pricing
 * - src/components/Card.tsx -> / (isComponent: true)
 */
export function resolveFileToRoute(filePath: string): RouteResolution {
  if (!filePath) {
    return {
      filePath: "",
      resolvedRoute: "/",
      isComponent: false,
      confidence: "root",
    };
  }

  const normalized = filePath.replace(/\\/g, "/");

  // Next.js App Router: (src/)?app/.../page.(tsx|jsx|js|ts)
  const appPageMatch = normalized.match(/(?:^|\/)(?:src\/)?app(\/.*?)\/page\.(?:tsx|jsx|js|ts)$/);
  if (appPageMatch) {
    const route = appPageMatch[1] || "/";
    return {
      filePath,
      resolvedRoute: route,
      isComponent: false,
      confidence: "exact",
    };
  }

  // Next.js Root App Page: (src/)?app/page.(tsx|jsx|js|ts)
  if (/(?:^|\/)(?:src\/)?app\/page\.(?:tsx|jsx|js|ts)$/.test(normalized)) {
    return {
      filePath,
      resolvedRoute: "/",
      isComponent: false,
      confidence: "exact",
    };
  }

  // Next.js Pages Router: (src/)?pages/.../index.(tsx|jsx) or (src/)?pages/.../(file).(tsx|jsx)
  const pagesIndexMatch = normalized.match(/(?:^|\/)(?:src\/)?pages(\/.*?)\/index\.(?:tsx|jsx|js|ts)$/);
  if (pagesIndexMatch) {
    return {
      filePath,
      resolvedRoute: pagesIndexMatch[1] || "/",
      isComponent: false,
      confidence: "exact",
    };
  }

  const pagesMatch = normalized.match(/(?:^|\/)(?:src\/)?pages(\/.*?)\.(?:tsx|jsx|js|ts)$/);
  if (pagesMatch) {
    const route = pagesMatch[1];
    return {
      filePath,
      resolvedRoute: route === "/_app" || route === "/_document" ? "/" : route,
      isComponent: false,
      confidence: "exact",
    };
  }

  // Component detection (e.g., src/components/Header.tsx)
  const isComponent =
    normalized.includes("/components/") ||
    normalized.includes("/ui/") ||
    /^[A-Z]/.test(path.basename(normalized));

  return {
    filePath,
    resolvedRoute: "/",
    isComponent,
    confidence: "inferred",
  };
}
