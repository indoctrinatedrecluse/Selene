import type { SandpackPredefinedTemplate } from "@codesandbox/sandpack-react";

export interface StackTemplateConfig {
  id: string;
  name: string;
  icon: string;
  template: SandpackPredefinedTemplate;
  defaultFile: string;
  files: Record<string, string>;
  dependencies?: Record<string, string>;
}

export const TAILWIND_HTML_SHELL = `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Selene Live Render</title>
    <!-- Tailwind CSS Play CDN for 100% accurate live compilation -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              brand: {
                50: '#f0f9ff',
                100: '#e0f2fe',
                400: '#38bdf8',
                500: '#0ea5e9',
                600: '#0284c7',
                900: '#0c4a6e',
              }
            }
          }
        }
      }
    </script>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background-color: #0b0f19;
        color: #f8fafc;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        min-height: 100vh;
      }
      #root {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1.5rem;
        box-sizing: border-box;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

export const BASE_STYLES_CSS = `
html, body {
  margin: 0;
  padding: 0;
  background-color: #0b0f19;
  color: #f8fafc;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  min-height: 100vh;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  box-sizing: border-box;
}
`;

export const REACT_INDEX_TSX = `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import * as AppModule from "./App";

// Provide global React to guarantee unimported or legacy snippets execute without ReferenceError
if (typeof window !== "undefined") {
  (window as any).React = React;
  document.documentElement.classList.add("dark");
}

let Component: any = AppModule.default;
if (!Component) {
  for (const key of Object.keys(AppModule)) {
    if (typeof (AppModule as any)[key] === "function" && /^[A-Z]/.test(key)) {
      Component = (AppModule as any)[key];
      break;
    }
  }
}

if (!Component) {
  Component = () => (
    <div style={{ color: "#ef4444", padding: "1.5rem", fontFamily: "ui-monospace, monospace", textAlign: "center" }}>
      ⚠️ No valid React component exported. Please export a default or named function component.
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <Component />
    </StrictMode>
  );
}
`;

export const REACT_INDEX_JS = `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import * as AppModule from "./App";

if (typeof window !== "undefined") {
  window.React = React;
  document.documentElement.classList.add("dark");
}

let Component = AppModule.default;
if (!Component) {
  for (const key of Object.keys(AppModule)) {
    if (typeof AppModule[key] === "function" && /^[A-Z]/.test(key)) {
      Component = AppModule[key];
      break;
    }
  }
}

if (!Component) {
  Component = () => (
    <div style={{ color: "#ef4444", padding: "1.5rem", fontFamily: "ui-monospace, monospace", textAlign: "center" }}>
      ⚠️ No valid React component exported. Please export a default or named function component.
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <Component />
    </StrictMode>
  );
}
`;

export const DEFAULT_SNIPPETS_BY_LANG: Record<string, string> = {
  tsx: `import React, { useState } from "react";

export default function LiveInteractiveCard() {
  const [likes, setLikes] = useState(42);

  return (
    <div className="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-slate-700/60 shadow-2xl space-y-4 text-center">
      <div className="flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
          S
        </div>
        <div className="text-left">
          <h3 className="text-base font-semibold text-white">Selene Live Preview</h3>
          <p className="text-xs text-sky-400">React + Tailwind Active</p>
        </div>
      </div>
      <p className="text-sm text-slate-300">
        Edit this code directly or use the Tweak Props panel above to customize colors and sizing in real time!
      </p>
      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
        <button
          onClick={() => setLikes(l => l + 1)}
          className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          ❤️ Like ({likes})
        </button>
        <span className="text-xs font-mono text-slate-400">Tailwind CSS</span>
      </div>
    </div>
  );
}`,
  jsx: `import React, { useState } from "react";

export default function Card() {
  const [count, setCount] = useState(0);
  return (
    <div className="p-6 bg-slate-900 rounded-2xl border border-sky-500/30 text-white shadow-xl text-center">
      <h3 className="font-bold text-sky-400 text-lg">React JSX Preview</h3>
      <p className="text-sm text-slate-300 mt-1">Instant rendering with Tailwind styling.</p>
      <button
        onClick={() => setCount(c => c + 1)}
        className="mt-3 px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
      >
        Count: {count}
      </button>
    </div>
  );
}`,
  vue: `<template>
  <div class="vue-card p-6 bg-slate-900 rounded-2xl border border-emerald-500/40 text-white shadow-2xl text-center max-w-sm mx-auto backdrop-blur-md">
    <div class="flex items-center justify-center gap-2.5 mb-3">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-white shadow-md text-sm">
        V3
      </div>
      <div class="text-left">
        <h3 class="text-sm font-semibold text-white">Vue 3 SFC Live</h3>
        <p class="text-[10px] text-emerald-400 font-mono">Composition API + Scoped CSS</p>
      </div>
    </div>
    <p class="text-xs text-slate-300 leading-relaxed">
      Single File Component with full reactivity, scoped styles, and Tailwind utilities compiled live in-memory.
    </p>
    <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
      <button
        @click="count++"
        class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
      >
        ✨ Count: {{ count }}
      </button>
      <span class="vue-badge text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Scoped CSS</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const count = ref(10);
</script>

<style scoped>
.vue-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.vue-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.2);
}
.vue-badge {
  letter-spacing: 0.05em;
}
</style>`,
  svelte: `<script>
  let count = 15;
  $: doubled = count * 2;
</script>

<div class="svelte-card p-6 bg-slate-900 rounded-2xl border border-orange-500/40 text-white shadow-2xl text-center max-w-sm mx-auto backdrop-blur-md">
  <div class="flex items-center justify-center gap-2.5 mb-3">
    <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-bold text-white shadow-md text-sm">
      Sv
    </div>
    <div class="text-left">
      <h3 class="text-sm font-semibold text-white">Svelte Reactive Live</h3>
      <p class="text-[10px] text-orange-400 font-mono">Zero Virtual DOM Overhead</p>
    </div>
  </div>
  <p class="text-xs text-slate-300 leading-relaxed">
    Compile-time reactive declarations with encapsulated scoped styles and instant HMR live reload.
  </p>
  <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
    <button
      on:click={() => count += 1}
      class="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
    >
      ⚡ Count: {count} ({doubled}x)
    </button>
    <span class="svelte-badge text-[10px] font-mono text-orange-400 uppercase tracking-wider">Scoped CSS</span>
  </div>
</div>

<style>
  .svelte-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .svelte-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px -5px rgba(249, 115, 22, 0.2);
  }
  .svelte-badge {
    letter-spacing: 0.05em;
  }
</style>`,
  html: `<div class="p-6 bg-gradient-to-tr from-indigo-600 to-sky-500 rounded-2xl text-white shadow-xl text-center max-w-sm mx-auto">
  <h2 class="text-xl font-bold">Vanilla HTML & Tailwind</h2>
  <p class="text-sm opacity-90 mt-1">Rendered with Tailwind runtime inside an isolated iframe context.</p>
</div>`,
};

export function getTemplateForLanguage(lang: string = "tsx"): SandpackPredefinedTemplate {
  const normalized = lang.toLowerCase();
  switch (normalized) {
    case "vue":
      return "vue";
    case "svelte":
      return "svelte";
    case "html":
    case "vanilla":
    case "js":
    case "javascript":
      return "static";
    case "jsx":
      return "react";
    case "tsx":
    case "react":
    default:
      return "react-ts";
  }
}

/**
 * Normalizes React user code so that:
 * 1. React and common hooks are always in scope (preventing ReferenceError: React is not defined)
 * 2. A valid default export exists (preventing "element type is invalid: expected a string or class/function but got: undefined")
 */
export function prepareReactCode(rawCode: string): string {
  let code = rawCode.trim();
  if (!code) {
    return DEFAULT_SNIPPETS_BY_LANG.tsx;
  }

  // Ensure default export exists
  const hasDefaultExport = /export\s+default\s+/.test(code);
  if (!hasDefaultExport) {
    // 1. Check for named function: export function MyComponent()
    const funcMatch = code.match(/export\s+function\s+([A-Z][a-zA-Z0-9_]*)/);
    if (funcMatch && funcMatch[1]) {
      code = `${code}\n\nexport default ${funcMatch[1]};`;
    } else {
      // 2. Check for named const: export const MyComponent = ...
      const constMatch = code.match(/export\s+const\s+([A-Z][a-zA-Z0-9_]*)/);
      if (constMatch && constMatch[1]) {
        code = `${code}\n\nexport default ${constMatch[1]};`;
      } else {
        // 3. Check for bare function: function MyComponent()
        const bareFuncMatch = code.match(/function\s+([A-Z][a-zA-Z0-9_]*)/);
        if (bareFuncMatch && bareFuncMatch[1]) {
          code = `${code}\n\nexport default ${bareFuncMatch[1]};`;
        } else {
          // 4. Wrap raw JSX expression in a default component
          code = `export default function App() {\n  return (\n    <div>\n      ${code}\n    </div>\n  );\n}`;
        }
      }
    }
  }

  // Ensure React import exists
  const hasReactImport = /import\s+.*(?:React|useState|useEffect).*\s+from\s+['"]react['"]/.test(code);
  if (!hasReactImport) {
    code = `import React, { useState, useEffect, useRef } from "react";\n${code}`;
  }

  return code;
}

export function detectDynamicDependencies(code: string): Record<string, string> {
  const deps: Record<string, string> = {};
  if (code.includes("lucide-react")) {
    deps["lucide-react"] = "^1.0.0";
  }
  return deps;
}

export function generateSandpackFiles(code: string, lang: string = "tsx"): Record<string, string> {
  const normalized = lang.toLowerCase();

  if (normalized === "html" || normalized === "static") {
    return {
      "/index.html": code.includes("<html")
        ? code
        : `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 1.5rem;
      background-color: #0b0f19;
      color: #f8fafc;
      font-family: ui-sans-serif, system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  </style>
</head>
<body>
  ${code}
</body>
</html>`,
    };
  }

  if (normalized === "vue") {
    return {
      "/src/App.vue": code.includes("<template>")
        ? code
        : DEFAULT_SNIPPETS_BY_LANG.vue,
      "/src/styles.css": BASE_STYLES_CSS,
      "/styles.css": BASE_STYLES_CSS,
      "/public/index.html": TAILWIND_HTML_SHELL,
      "/index.html": TAILWIND_HTML_SHELL,
    };
  }

  if (normalized === "svelte") {
    return {
      "/App.svelte": code,
      "/styles.css": BASE_STYLES_CSS,
      "/public/index.html": TAILWIND_HTML_SHELL,
      "/index.html": TAILWIND_HTML_SHELL,
    };
  }

  if (normalized === "jsx") {
    const appCode = prepareReactCode(code);
    return {
      "/App.js": appCode,
      "/index.js": REACT_INDEX_JS,
      "/styles.css": BASE_STYLES_CSS,
      "/public/index.html": TAILWIND_HTML_SHELL,
    };
  }

  // React TypeScript
  const appCode = prepareReactCode(code);

  return {
    "/App.tsx": appCode,
    "/index.tsx": REACT_INDEX_TSX,
    "/styles.css": BASE_STYLES_CSS,
    "/public/index.html": TAILWIND_HTML_SHELL,
  };
}
