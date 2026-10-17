import { SandpackPredefinedTemplate } from "@codesandbox/sandpack-react";

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
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Selene Live Render</title>
    <!-- Tailwind CSS Runtime Injection for 100% Fidelity -->
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
      body {
        margin: 0;
        padding: 1rem;
        background-color: #0f172a;
        color: #f8fafc;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

export const DEFAULT_SNIPPETS_BY_LANG: Record<string, string> = {
  tsx: `export function InteractiveWidget() {
  const [count, setCount] = React.useState(0);
  return (
    <div className="p-6 bg-slate-900 rounded-2xl border border-sky-500/30 text-white shadow-xl">
      <h3 className="font-bold text-sky-400">React + Tailwind Live</h3>
      <p className="text-sm text-slate-300 mt-1">Interactive state with HMR.</p>
      <button
        onClick={() => setCount(c => c + 1)}
        className="mt-3 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-lg transition-all"
      >
        Count: {count}
      </button>
    </div>
  );
}`,
  jsx: `export default function Card() {
  return (
    <div className="p-6 bg-slate-900 rounded-2xl border border-sky-500/30 text-white">
      <h3 className="font-bold text-sky-400">React JSX Preview</h3>
      <p className="text-sm text-slate-300">Fast rendering without compile delay.</p>
    </div>
  );
}`,
  vue: `<template>
  <div class="p-6 bg-slate-900 rounded-2xl border border-emerald-500/30 text-white shadow-xl">
    <h3 class="font-bold text-emerald-400">Vue 3 Live Preview</h3>
    <p class="text-sm text-slate-300 mt-1">Single File Component with isolated styling.</p>
    <button @click="count++" class="mt-3 px-3 py-1.5 bg-emerald-600 rounded-lg text-xs font-semibold">
      Clicked {{ count }} times
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const count = ref(0);
</script>`,
  svelte: `<script>
  let count = 0;
</script>

<div class="p-6 bg-slate-900 rounded-2xl border border-orange-500/30 text-white shadow-xl">
  <h3 class="font-bold text-orange-400">Svelte Live Canvas</h3>
  <p class="text-sm text-slate-300 mt-1">Reactive declarations with zero runtime overhead.</p>
  <button on:click={() => count += 1} class="mt-3 px-3 py-1.5 bg-orange-600 rounded-lg text-xs font-semibold">
    Count: {count}
  </button>
</div>`,
  html: `<div class="p-6 bg-gradient-to-tr from-indigo-600 to-sky-500 rounded-2xl text-white shadow-xl">
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
    case "tsx":
    case "jsx":
    case "react":
    default:
      return "react-ts";
  }
}

export function generateSandpackFiles(code: string, lang: string = "tsx"): Record<string, string> {
  const normalized = lang.toLowerCase();

  if (normalized === "html" || normalized === "static") {
    return {
      "/index.html": code.includes("<html")
        ? code
        : `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { padding: 1rem; background: #0f172a; color: #f8fafc; font-family: sans-serif; }</style>
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
      "/index.html": TAILWIND_HTML_SHELL,
    };
  }

  if (normalized === "svelte") {
    return {
      "/App.svelte": code,
      "/index.html": TAILWIND_HTML_SHELL,
    };
  }

  // Default: React TypeScript
  const hasExport = code.includes("export default") || code.includes("export function") || code.includes("export const");
  
  let appCode = code;
  if (!hasExport) {
    appCode = `export default function App() {\n  return (\n    <div>\n      ${code}\n    </div>\n  );\n}`;
  } else if (!code.includes("export default")) {
    const match = code.match(/export\s+function\s+([A-Z][a-zA-Z0-9_]*)/);
    if (match && match[1]) {
      appCode = `${code}\n\nexport default ${match[1]};`;
    }
  }

  return {
    "/App.tsx": appCode,
    "/public/index.html": TAILWIND_HTML_SHELL,
  };
}
