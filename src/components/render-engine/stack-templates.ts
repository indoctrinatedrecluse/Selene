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
      "/src/App.vue": code,
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
  // Check if code has an export default or named export
  const hasExport = code.includes("export default") || code.includes("export function") || code.includes("export const");
  
  let appCode = code;
  if (!hasExport) {
    appCode = `export default function App() {\n  return (\n    <div>\n      ${code}\n    </div>\n  );\n}`;
  } else if (!code.includes("export default")) {
    // If it has named export like 'export function Component()', export it as default
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
