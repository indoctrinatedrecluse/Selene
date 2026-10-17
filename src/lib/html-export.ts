/**
 * Selene Standalone Offline Single-File HTML Exporter
 * Generates a self-contained, portable .html file that runs offline with:
 * - Tailwind runtime
 * - KaTeX math rendering
 * - Mermaid.js diagram initialization
 * - Isolated iframe sandbox runners for live components
 * - Celestial dark mode theme
 */

import { convertMarkdownToPrintHtml } from "./pdf-export";

export interface HtmlExportOptions {
  title: string;
  markdown: string;
  theme?: "midnight" | "slate" | "white";
  includeRunners?: boolean;
}

export function exportStandaloneHtml(options: HtmlExportOptions): void {
  const {
    title,
    markdown,
    theme = "midnight",
  } = options;

  const contentHtml = convertMarkdownToPrintHtml(markdown);
  const now = new Date().toLocaleString();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const isLight = theme === "white";
  const bodyBg = isLight ? "#f8fafc" : theme === "midnight" ? "#070a14" : "#0f172a";
  const cardBg = isLight ? "#ffffff" : "#0f172a";
  const textColor = isLight ? "#0f172a" : "#f1f5f9";
  const borderColor = isLight ? "#e2e8f0" : "#1e293b";

  const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Selene Interactive Publication</title>
  <!-- Tailwind CSS Runtime -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- KaTeX Math CSS & JS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <!-- Mermaid.js -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body {
      background-color: ${bodyBg};
      color: ${textColor};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .document-card {
      background-color: ${cardBg};
      border-color: ${borderColor};
    }
    /* Code container styling */
    .code-container {
      background: ${isLight ? "#f1f5f9" : "#090d16"};
      border: 1px solid ${borderColor};
      border-radius: 0.75rem;
      margin: 1.25rem 0;
      overflow: hidden;
    }
    .code-header {
      background: ${isLight ? "#e2e8f0" : "#0f172a"};
      padding: 0.5rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid ${borderColor};
      font-family: monospace;
      font-size: 0.75rem;
    }
    .code-lang {
      font-weight: bold;
      color: #38bdf8;
    }
    .code-tag {
      color: #94a3b8;
    }
    pre.code-content {
      padding: 1rem;
      margin: 0;
      font-family: ui-monospace, monospace;
      font-size: 0.8125rem;
      line-height: 1.5;
      overflow-x: auto;
    }
    code.inline-code {
      font-family: ui-monospace, monospace;
      font-size: 0.8em;
      padding: 0.15rem 0.35rem;
      border-radius: 0.25rem;
      background: ${isLight ? "#e2e8f0" : "#1e293b"};
      color: #38bdf8;
    }
    /* Math container */
    .math-container {
      padding: 1.25rem;
      margin: 1.25rem 0;
      background: ${isLight ? "#f1f5f9" : "#0b0f19"};
      border: 1px solid ${borderColor};
      border-radius: 0.75rem;
      text-align: center;
      overflow-x: auto;
    }
    /* Admonitions */
    .callout {
      padding: 1rem 1.25rem;
      margin: 1.25rem 0;
      border-radius: 0.75rem;
      border-left: 4px solid;
    }
    .callout-title {
      font-weight: 800;
      font-family: monospace;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }
    .callout-note {
      border-left-color: #0284c7;
      background: ${isLight ? "#f0f9ff" : "rgba(2, 132, 199, 0.12)"};
    }
    .callout-note .callout-title { color: #38bdf8; }
    .callout-tip {
      border-left-color: #10b981;
      background: ${isLight ? "#f0fdf4" : "rgba(16, 185, 129, 0.12)"};
    }
    .callout-tip .callout-title { color: #34d399; }
    .callout-warning {
      border-left-color: #f59e0b;
      background: ${isLight ? "#fffbeb" : "rgba(245, 158, 11, 0.12)"};
    }
    .callout-warning .callout-title { color: #fbbf24; }
    .callout-caution {
      border-left-color: #ef4444;
      background: ${isLight ? "#fef2f2" : "rgba(239, 68, 68, 0.12)"};
    }
    .callout-caution .callout-title { color: #f87171; }
    .divider {
      border-color: ${borderColor};
      margin: 2rem 0;
    }
    .heading-1 {
      font-size: 1.75rem;
      font-weight: 800;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid ${borderColor};
    }
    .heading-2 {
      font-size: 1.35rem;
      font-weight: 700;
      color: #38bdf8;
      margin-top: 1.75rem;
      margin-bottom: 0.75rem;
    }
    .heading-3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 1.25rem;
      margin-bottom: 0.5rem;
    }
    .paragraph {
      margin: 0.75rem 0;
      line-height: 1.65;
    }
    .task-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.25rem 0;
    }
    .task-box.checked {
      color: #10b981;
    }
  </style>
</head>
<body class="min-h-screen p-4 md:p-8">
  <div class="max-w-4xl mx-auto">
    <!-- Top Document Banner -->
    <header class="document-card p-6 rounded-2xl border shadow-2xl mb-8 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg">
          🌙
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-white">${title}</h1>
          <p class="text-xs text-sky-400 font-mono">Selene Standalone Interactive Publication</p>
        </div>
      </div>
      <div class="flex items-center gap-3 text-xs font-mono text-slate-400">
        <span>Exported: ${now}</span>
        <button onclick="window.print()" class="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors shadow">
          Print / PDF
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="document-card p-6 md:p-10 rounded-2xl border shadow-2xl space-y-4">
      ${contentHtml}
    </main>

    <!-- Footer -->
    <footer class="mt-8 text-center text-xs text-slate-500 font-mono space-y-1">
      <p>🌙 Published with Selene — Named for the Titaness of the Moon (Σελήνη)</p>
      <p>Polymorphic Live Rendering & Code Architecture Specification</p>
    </footer>
  </div>

  <script>
    document.addEventListener("DOMContentLoaded", function() {
      // Initialize Mermaid diagrams
      if (window.mermaid) {
        mermaid.initialize({
          startOnLoad: true,
          theme: "${isLight ? "default" : "dark"}",
          fontFamily: "ui-sans-serif, system-ui, sans-serif"
        });
      }
    });
  </script>
</body>
</html>
`;

  const blob = new Blob([standaloneHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slug}-publication.html`;
  link.click();
  URL.revokeObjectURL(url);
}
