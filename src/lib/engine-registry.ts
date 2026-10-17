/**
 * Selene Polymorphic Engine Registry & Heavy-Duty Dispatcher
 *
 * Coordinates execution across:
 * - Playbox Micro-Sandbox (In-browser Sandpack/Worker bundler for React, Vue 3, Svelte, HTML)
 * - Project Dev Server Tunnel (Next.js, Vite React, Vite Vue, SvelteKit, Nuxt)
 * - Angular CLI Engine (ng serve on port 4200)
 * - Flutter / Dart Web Engine (flutter run web on port 8080+)
 * - Vector & Typesetting Engines (Mermaid SVG, KaTeX Math)
 * - WASM Runtimes (Pyodide Python)
 */

import { ProjectMetadata, RouteResolution, resolveFileToRoute } from "./project-detector";

export type EngineType =
  | "playbox-sandbox"
  | "project-dev-server"
  | "angular-live"
  | "flutter-web"
  | "vector-canvas"
  | "wasm-runtime";

export type SupportedStack =
  | "react-tailwind"
  | "react-bootstrap"
  | "react-vanilla"
  | "vue-sfc"
  | "svelte-reactive"
  | "vite-spa"
  | "nextjs-fullstack"
  | "angular-component"
  | "flutter-dart"
  | "mermaid-diagram"
  | "latex-math"
  | "python-wasm"
  | "html-vanilla";

export type CssStandard = "tailwind" | "scoped-css" | "css-modules" | "bootstrap" | "vanilla";

export interface EngineDispatchResult {
  engineType: EngineType;
  stack: SupportedStack;
  cssStandard: CssStandard;
  title: string;
  template: string;
  suggestedPort: number;
  supportsTweakProps: boolean;
  resolvedRoute?: RouteResolution;
  description: string;
}

export interface EngineDispatchContext {
  language?: string;
  filePath?: string;
  code?: string;
  preferredMode?: "sandbox" | "project";
  projectMeta?: ProjectMetadata | null;
  isServerRunning?: boolean;
}

/**
 * Heavy-duty polymorphic engine dispatcher.
 * Selects the optimal execution engine and CSS runtime based on file context, stack, and environment.
 */
export function dispatchEngine(context: EngineDispatchContext): EngineDispatchResult {
  const {
    language = "tsx",
    filePath = "",
    preferredMode,
    projectMeta,
    isServerRunning = false,
  } = context;

  const lang = language.toLowerCase();
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  const resolvedRoute = filePath ? resolveFileToRoute(filePath) : undefined;

  // 1. Vector & Math Graphics
  if (lang === "mermaid" || ext === "mmd") {
    return {
      engineType: "vector-canvas",
      stack: "mermaid-diagram",
      cssStandard: "vanilla",
      title: "Mermaid.js Vector Engine",
      template: "svg",
      suggestedPort: 0,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Client-side SVG compilation with pan/zoom and dynamic dark theme matching.",
    };
  }

  if (lang === "math" || lang === "latex" || ext === "tex") {
    return {
      engineType: "vector-canvas",
      stack: "latex-math",
      cssStandard: "vanilla",
      title: "KaTeX Mathematical Engine",
      template: "katex",
      suggestedPort: 0,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Sub-millisecond mathematical typography rendering TeX formulas into accessible MathML.",
    };
  }

  // 2. Python WASM
  if (lang === "python" || lang === "py" || ext === "py") {
    return {
      engineType: "wasm-runtime",
      stack: "python-wasm",
      cssStandard: "vanilla",
      title: "Pyodide WASM Engine",
      template: "pyodide",
      suggestedPort: 0,
      supportsTweakProps: false,
      resolvedRoute,
      description: "In-browser WebAssembly Python kernel with NumPy and Matplotlib execution.",
    };
  }

  // 3. Flutter & Dart Web Engine
  if (lang === "dart" || lang === "flutter" || ext === "dart") {
    return {
      engineType: "flutter-web",
      stack: "flutter-dart",
      cssStandard: "vanilla",
      title: "Flutter Web Multiplatform Engine",
      template: "flutter",
      suggestedPort: 8080,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Hardware-accelerated Skia / CanvasKit Flutter Web execution container with responsive device simulator.",
    };
  }

  // 4. Angular (Playbox Micro-Sandbox & Project Server)
  if (lang === "angular" || filePath.includes(".component.ts") || filePath.includes(".component.html")) {
    if (preferredMode === "sandbox" || !filePath) {
      return {
        engineType: "playbox-sandbox",
        stack: "angular-component",
        cssStandard: "scoped-css",
        title: "Angular Ivy Playbox",
        template: "angular",
        suggestedPort: 4200,
        supportsTweakProps: true,
        resolvedRoute,
        description: "In-browser Angular Ivy micro-sandbox with component-scoped CSS encapsulation and Tailwind utilities.",
      };
    }
    return {
      engineType: isServerRunning ? "project-dev-server" : "angular-live",
      stack: "angular-component",
      cssStandard: "scoped-css",
      title: "Angular CLI Engine",
      template: "angular",
      suggestedPort: 4200,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Angular Ivy compilation with component-scoped encapsulation and CLI hot reload on port 4200.",
    };
  }

  // 5. Check if User Explicitly Requested Project Server OR if Project File is Linked to Running Server
  const isProjectCandidate =
    preferredMode === "project" ||
    (Boolean(filePath) && isServerRunning && resolvedRoute?.confidence === "exact");

  if (isProjectCandidate) {
    const jsFramework = projectMeta?.jsFramework || "nextjs";
    const cssFramework = projectMeta?.cssFramework || "tailwind";

    return {
      engineType: "project-dev-server",
      stack: jsFramework === "nextjs" ? "nextjs-fullstack" : "vite-spa",
      cssStandard: cssFramework === "tailwind" ? "tailwind" : cssFramework === "bootstrap" ? "bootstrap" : "vanilla",
      title: "Project Dev Server Tunnel",
      template: jsFramework,
      suggestedPort: projectMeta?.suggestedPort || 3000,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Connected to background project server with intelligent route navigation and real HMR.",
    };
  }

  // 6. Micro-Sandbox Playbox Dispatch
  // Vue 3 Single File Component (SFC)
  if (lang === "vue" || ext === "vue") {
    return {
      engineType: "playbox-sandbox",
      stack: "vue-sfc",
      cssStandard: "scoped-css",
      title: "Vue 3 SFC Playbox",
      template: "vue",
      suggestedPort: 5173,
      supportsTweakProps: true,
      resolvedRoute,
      description: "Single File Component with <template>, <script setup>, scoped <style>, and Tailwind utilities.",
    };
  }

  // Svelte Component
  if (lang === "svelte" || ext === "svelte") {
    return {
      engineType: "playbox-sandbox",
      stack: "svelte-reactive",
      cssStandard: "scoped-css",
      title: "Svelte Reactive Playbox",
      template: "svelte",
      suggestedPort: 5173,
      supportsTweakProps: true,
      resolvedRoute,
      description: "Compile-time reactive component with isolated scoped CSS and zero virtual DOM overhead.",
    };
  }

  // HTML / Vanilla CSS
  if (lang === "html" || lang === "static" || ext === "html") {
    return {
      engineType: "playbox-sandbox",
      stack: "html-vanilla",
      cssStandard: "tailwind",
      title: "Vanilla HTML/CSS Playbox",
      template: "static",
      suggestedPort: 3000,
      supportsTweakProps: true,
      resolvedRoute,
      description: "DOM rendering with Tailwind Play CDN pre-injected in isolated iframe context.",
    };
  }

  // React (TypeScript / JSX) Default
  return {
    engineType: "playbox-sandbox",
    stack: "react-tailwind",
    cssStandard: "tailwind",
    title: "React + Tailwind Playbox",
    template: lang === "jsx" ? "react" : "react-ts",
    suggestedPort: 3000,
    supportsTweakProps: true,
    resolvedRoute,
    description: "React 19 with Tailwind CSS v4, live HMR, and no-code Tweak Props controls.",
  };
}
