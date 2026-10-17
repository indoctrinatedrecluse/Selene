import fs from "fs";
import path from "path";

export type CssFramework = "tailwind" | "bootstrap" | "scoped-css" | "vanilla";
export type JsFramework =
  | "nextjs"
  | "vite-react"
  | "vite-vue"
  | "vite-svelte"
  | "vue"
  | "svelte"
  | "angular"
  | "cra"
  | "react"
  | "flutter"
  | "unknown";

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
 * Supports Next.js, Vite (React/Vue/Svelte), Vue 3, Svelte, Angular, and Flutter.
 */
export function detectProjectMetadata(projectRoot: string = process.cwd()): ProjectMetadata {
  // Check for Flutter project first (pubspec.yaml)
  const pubspecPath = path.join(projectRoot, "pubspec.yaml");
  if (fs.existsSync(pubspecPath)) {
    return {
      name: "Flutter App",
      version: "1.0.0",
      jsFramework: "flutter",
      cssFramework: "vanilla",
      hasDevScript: true,
      packageManager: "npm",
      suggestedPort: 8080,
      detectedDependencies: ["flutter"],
    };
  }

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

  // 1. Detect Framework & Default Port
  let jsFramework: JsFramework = "unknown";
  let suggestedPort = 3000;

  if (depNames.includes("next")) {
    jsFramework = "nextjs";
    suggestedPort = 3000;
  } else if (depNames.includes("@angular/core")) {
    jsFramework = "angular";
    suggestedPort = 4200;
  } else if (depNames.includes("@sveltejs/kit") || depNames.includes("svelte")) {
    jsFramework = depNames.includes("vite") ? "vite-svelte" : "svelte";
    suggestedPort = 5173;
  } else if (depNames.includes("nuxt") || depNames.includes("vue")) {
    jsFramework = depNames.includes("vite") ? "vite-vue" : "vue";
    suggestedPort = depNames.includes("nuxt") ? 3000 : 5173;
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

  // 2. Detect CSS Framework & Standards (Tailwind vs Scoped CSS vs Bootstrap vs Vanilla)
  let cssFramework: CssFramework = "vanilla";
  const hasTailwind =
    depNames.includes("tailwindcss") ||
    depNames.includes("@tailwindcss/postcss") ||
    depNames.some((d) => d.startsWith("@tailwindcss/"));

  if (hasTailwind) {
    cssFramework = "tailwind";
  } else if (depNames.includes("bootstrap") || depNames.includes("react-bootstrap")) {
    cssFramework = "bootstrap";
  } else if (jsFramework === "vue" || jsFramework === "vite-vue" || jsFramework === "svelte" || jsFramework === "vite-svelte") {
    cssFramework = "scoped-css";
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
  const hasDevScript = Boolean(scripts.dev || scripts.start);

  return {
    name: (pkg.name as string) || "Selene Project",
    version: (pkg.version as string) || "1.0.0",
    jsFramework,
    cssFramework,
    hasDevScript,
    packageManager,
    suggestedPort,
    detectedDependencies: depNames.filter((d) =>
      [
        "react",
        "next",
        "vue",
        "nuxt",
        "svelte",
        "@sveltejs/kit",
        "@angular/core",
        "vite",
        "tailwindcss",
        "bootstrap",
        "react-bootstrap",
      ].includes(d)
    ),
  };
}

/**
 * Resolves a file path to its expected dev server HTTP route.
 * Handles Next.js (App & Pages), SvelteKit, Nuxt 3, Vue Router, Angular, and Vite SPAs.
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

  // 1. SvelteKit Routes: src/routes/.../+page.svelte
  const svelteKitMatch = normalized.match(/(?:^|\/)(?:src\/)?routes(\/.*?)\/\+page\.svelte$/);
  if (svelteKitMatch) {
    return {
      filePath,
      resolvedRoute: svelteKitMatch[1] || "/",
      isComponent: false,
      confidence: "exact",
    };
  }
  if (/(?:^|\/)(?:src\/)?routes\/\+page\.svelte$/.test(normalized)) {
    return {
      filePath,
      resolvedRoute: "/",
      isComponent: false,
      confidence: "exact",
    };
  }

  // 2. Next.js App Router: (src/)?app/.../page.(tsx|jsx|js|ts)
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

  if (/(?:^|\/)(?:src\/)?app\/page\.(?:tsx|jsx|js|ts)$/.test(normalized)) {
    return {
      filePath,
      resolvedRoute: "/",
      isComponent: false,
      confidence: "exact",
    };
  }

  // 3. Nuxt / Vue Pages Router: (src/)?pages/.../index.vue or (src/)?pages/...(file).vue
  const vuePageIndexMatch = normalized.match(/(?:^|\/)(?:src\/)?pages(\/.*?)\/index\.vue$/);
  if (vuePageIndexMatch) {
    return {
      filePath,
      resolvedRoute: vuePageIndexMatch[1] || "/",
      isComponent: false,
      confidence: "exact",
    };
  }

  const vuePageMatch = normalized.match(/(?:^|\/)(?:src\/)?pages(\/.*?)\.vue$/);
  if (vuePageMatch) {
    const route = vuePageMatch[1];
    return {
      filePath,
      resolvedRoute: route === "/index" ? "/" : route,
      isComponent: false,
      confidence: "exact",
    };
  }

  // 4. Vue Views Router: (src/)?views/.../(view).vue
  const vueViewMatch = normalized.match(/(?:^|\/)(?:src\/)?views(\/.*?)\.vue$/);
  if (vueViewMatch) {
    const route = vueViewMatch[1];
    return {
      filePath,
      resolvedRoute: route === "/Home" || route === "/index" ? "/" : route.toLowerCase(),
      isComponent: false,
      confidence: "exact",
    };
  }

  // 5. Angular Component Routes: (src/)?app/.../(feature).component.ts
  const angularMatch = normalized.match(/(?:^|\/)(?:src\/)?app(\/.*?)\/.*\.component\.ts$/);
  if (angularMatch) {
    const route = angularMatch[1];
    return {
      filePath,
      resolvedRoute: route || "/",
      isComponent: false,
      confidence: "exact",
    };
  }

  // 6. Next.js Pages Router: (src/)?pages/.../index.(tsx|jsx) or (src/)?pages/.../(file).(tsx|jsx)
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

  // 7. Component detection (e.g., src/components/Header.vue, Card.svelte, Button.tsx)
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
