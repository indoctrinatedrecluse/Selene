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
  | "wasm-runtime"
  | "data-studio"
  | "shader-canvas"
  | "backend-template";

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
  | "html-vanilla"
  | "php-blade"
  | "ruby-erb"
  | "go-template"
  | "django-jinja"
  | "rust-wasm"
  | "sql-studio"
  | "duckdb-olap"
  | "declarative-chart"
  | "glsl-shader";

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

  // 7. Declarative Vector Charts & Visualizations
  if (lang === "chart" || lang === "plot") {
    return {
      engineType: "vector-canvas",
      stack: "declarative-chart",
      cssStandard: "vanilla",
      title: "Declarative Vector Chart Engine",
      template: "chart",
      suggestedPort: 0,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Pure SVG multi-series visualization engine for bar, line, area, scatter, donut, and heatmap graphics.",
    };
  }

  // 8. Analytical DuckDB & Columnar OLAP Studio
  if (lang === "duckdb" || lang === "olap" || lang === "parquet" || ext === "duckdb") {
    return {
      engineType: "data-studio",
      stack: "duckdb-olap",
      cssStandard: "vanilla",
      title: "DuckDB Analytical OLAP Studio",
      template: "duckdb",
      suggestedPort: 0,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Sub-10ms in-browser columnar vector processing with interactive dataset switching and CSV exports.",
    };
  }

  // 9. Relational SQL & LibSQL Studio
  if (lang === "sql" || lang === "sqlite" || lang === "libsql" || ext === "sql") {
    return {
      engineType: "data-studio",
      stack: "sql-studio",
      cssStandard: "vanilla",
      title: "SQL & LibSQL Data Studio",
      template: "sql",
      suggestedPort: 0,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Client-side relational query engine with real-time grid filtering, column sorting, and CSV export.",
    };
  }

  // 10. WebGL / GLSL Fragment Shader Canvas
  if (lang === "glsl" || lang === "wgsl" || lang === "shader") {
    return {
      engineType: "shader-canvas",
      stack: "glsl-shader",
      cssStandard: "vanilla",
      title: "WebGL Fragment Shader Canvas",
      template: "glsl",
      suggestedPort: 0,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Hardware-accelerated WebGL canvas with interactive uniforms, pause/play, time scrub, and FPS telemetry.",
    };
  }

  // 11. Rust WebAssembly (Yew / Leptos)
  if (lang === "rust" || lang === "rs" || lang === "yew" || lang === "leptos" || ext === "rs") {
    return {
      engineType: "wasm-runtime",
      stack: "rust-wasm",
      cssStandard: "tailwind",
      title: "Rust WebAssembly Engine",
      template: "rust",
      suggestedPort: 8080,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Rust WebAssembly component runner with zero GC overhead, fine-grained reactivity, and local trunk bridge.",
    };
  }

  // 12. PHP & Laravel Blade Engine
  if (lang === "php" || lang === "laravel" || lang === "blade" || ext === "blade.php" || ext === "php") {
    return {
      engineType: "backend-template",
      stack: "php-blade",
      cssStandard: "tailwind",
      title: "Laravel Blade Engine",
      template: "blade",
      suggestedPort: 8000,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Laravel 11 Blade template engine with Alpine.js 3.x reactivity, Tailwind styling, and artisan bridge.",
    };
  }

  // 13. Ruby on Rails ERB Engine
  if (lang === "ruby" || lang === "rails" || lang === "erb" || ext === "erb" || ext === "rb") {
    return {
      engineType: "backend-template",
      stack: "ruby-erb",
      cssStandard: "tailwind",
      title: "Ruby on Rails ERB Engine",
      template: "erb",
      suggestedPort: 3000,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Rails 8 ERB scriptlet engine with Hotwire Turbo Frame simulation, Rails helpers, and puma bridge.",
    };
  }

  // 14. Go html/template & Hugo Engine
  if (lang === "go" || lang === "golang" || lang === "gotemplate" || lang === "hugo" || ext === "go") {
    return {
      engineType: "backend-template",
      stack: "go-template",
      cssStandard: "tailwind",
      title: "Go Template & Hugo Engine",
      template: "go",
      suggestedPort: 8080,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Go 1.23 html/template engine with pipeline filters, context variable interpolation, and Hugo simulation.",
    };
  }

  // 15. Python Django / Jinja2 Engine
  if (lang === "django" || lang === "jinja" || lang === "jinja2") {
    return {
      engineType: "backend-template",
      stack: "django-jinja",
      cssStandard: "tailwind",
      title: "Django & Jinja2 Template Engine",
      template: "django",
      suggestedPort: 8000,
      supportsTweakProps: false,
      resolvedRoute,
      description: "Django DTL & Jinja2 template engine with template filters, control tags, and manage.py runserver bridge.",
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
