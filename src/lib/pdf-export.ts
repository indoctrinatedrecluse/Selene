/**
 * Selene Publication-Grade PDF & Print Engine
 * Renders high-fidelity vector PDF print documents with:
 * - KaTeX mathematical typesetting
 * - Formatted code blocks with language badges
 * - Admonition callout boxes
 * - Print-optimized page breaks and margins
 */

import katex from "katex";

export interface PdfExportOptions {
  title: string;
  markdown: string;
  theme?: "clean-print" | "lunar-dark";
  pageSize?: "A4" | "Letter";
  orientation?: "portrait" | "landscape";
  includeCover?: boolean;
}

/**
 * Converts markdown text into print-optimized HTML.
 */
export function convertMarkdownToPrintHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const htmlParts: string[] = [];

  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockBuffer: string[] = [];

  let inMathBlock = false;
  let mathBlockBuffer: string[] = [];

  let inCallout = false;
  let calloutType = "note";
  let calloutBuffer: string[] = [];

  const flushCodeBlock = () => {
    if (!inCodeBlock) return;
    const rawCode = codeBlockBuffer.join("\n");
    const escaped = rawCode
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    htmlParts.push(`
      <div class="code-container">
        <div class="code-header">
          <span class="code-lang">${codeBlockLang.toUpperCase() || "CODE"}</span>
          <span class="code-tag">Selene Component</span>
        </div>
        <pre class="code-content"><code>${escaped}</code></pre>
      </div>
    `);

    inCodeBlock = false;
    codeBlockLang = "";
    codeBlockBuffer = [];
  };

  const flushMathBlock = () => {
    if (!inMathBlock) return;
    const formula = mathBlockBuffer.join("\n").trim();
    try {
      const rendered = katex.renderToString(formula, {
        displayMode: true,
        throwOnError: false,
      });
      htmlParts.push(`<div class="math-container">${rendered}</div>`);
    } catch {
      htmlParts.push(`<pre class="math-fallback">${formula}</pre>`);
    }
    inMathBlock = false;
    mathBlockBuffer = [];
  };

  const flushCallout = () => {
    if (!inCallout) return;
    const content = calloutBuffer.join("<br>");
    const titles: Record<string, string> = {
      note: "NOTE",
      tip: "TIP",
      warning: "WARNING",
      caution: "CAUTION",
    };
    htmlParts.push(`
      <div class="callout callout-${calloutType}">
        <div class="callout-title">${titles[calloutType] || "NOTE"}</div>
        <div class="callout-body">${content}</div>
      </div>
    `);
    inCallout = false;
    calloutType = "note";
    calloutBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Math block fence
    if (line.trim().startsWith("```math") || line.trim().startsWith("```latex")) {
      flushCallout();
      flushCodeBlock();
      inMathBlock = true;
      mathBlockBuffer = [];
      continue;
    }

    // Code block fence
    if (line.trim().startsWith("```")) {
      if (inMathBlock) {
        flushMathBlock();
        continue;
      }
      if (inCodeBlock) {
        flushCodeBlock();
        continue;
      }
      flushCallout();
      inCodeBlock = true;
      codeBlockLang = line.trim().replace(/^```/, "").trim();
      codeBlockBuffer = [];
      continue;
    }

    if (inMathBlock) {
      mathBlockBuffer.push(line);
      continue;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      continue;
    }

    // Callout detection: > [!NOTE] or > [!WARNING]
    const calloutMatch = line.match(/^>\s*\[!(NOTE|TIP|WARNING|CAUTION)\]/i);
    if (calloutMatch) {
      flushCallout();
      inCallout = true;
      calloutType = calloutMatch[1].toLowerCase();
      calloutBuffer = [];
      continue;
    }

    if (inCallout) {
      if (line.startsWith(">")) {
        calloutBuffer.push(line.replace(/^>\s*/, ""));
        continue;
      } else {
        flushCallout();
      }
    }

    // Horizontal rule
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      htmlParts.push('<hr class="divider" />');
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      htmlParts.push(`<h1 class="heading-1">${parseInline(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      htmlParts.push(`<h2 class="heading-2">${parseInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      htmlParts.push(`<h3 class="heading-3">${parseInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("#### ")) {
      htmlParts.push(`<h4 class="heading-4">${parseInline(line.slice(5))}</h4>`);
      continue;
    }

    // Unordered List
    if (/^[-*+]\s+/.test(line)) {
      const itemText = line.replace(/^[-*+]\s+/, "");
      // Check task list
      if (itemText.startsWith("[ ] ")) {
        htmlParts.push(`<div class="task-item"><span class="task-box">☐</span> ${parseInline(itemText.slice(4))}</div>`);
      } else if (itemText.startsWith("[x] ")) {
        htmlParts.push(`<div class="task-item"><span class="task-box checked">☑</span> ${parseInline(itemText.slice(4))}</div>`);
      } else {
        htmlParts.push(`<li class="list-item">${parseInline(itemText)}</li>`);
      }
      continue;
    }

    // Ordered List
    const numMatch = line.match(/^\d+\.\s+(.*)/);
    if (numMatch) {
      htmlParts.push(`<li class="ordered-item">${parseInline(numMatch[1])}</li>`);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      htmlParts.push('<div class="spacer"></div>');
      continue;
    }

    // Standard paragraph
    htmlParts.push(`<p class="paragraph">${parseInline(line)}</p>`);
  }

  // Flush remaining
  flushCodeBlock();
  flushMathBlock();
  flushCallout();

  return htmlParts.join("\n");
}

/**
 * Parses inline formatting like bold, italics, inline code, and inline math.
 */
function parseInline(text: string): string {
  let result = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Inline math: $formula$
  result = result.replace(/\$([^$]+)\$/g, (_, math) => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch {
      return `<code>$${math}$</code>`;
    }
  });

  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Bold: **text**
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  return result;
}

/**
 * Exports document as publication-grade PDF via browser print API.
 */
export function exportDocumentToPdf(options: PdfExportOptions): void {
  const {
    title,
    markdown,
    theme = "clean-print",
    pageSize = "A4",
    orientation = "portrait",
  } = options;

  const bodyHtml = convertMarkdownToPrintHtml(markdown);
  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isDark = theme === "lunar-dark";
  const bg = isDark ? "#070a14" : "#ffffff";
  const text = isDark ? "#e2e8f0" : "#0f172a";
  const border = isDark ? "#1e293b" : "#e2e8f0";
  const codeBg = isDark ? "#0b0f19" : "#f8fafc";
  const headerBg = isDark ? "#0f172a" : "#f1f5f9";

  const printDocument = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} — Selene Publication</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    @page {
      size: ${pageSize} ${orientation};
      margin: 18mm 15mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: ${bg};
      color: ${text};
      line-height: 1.65;
      font-size: 13px;
      padding: 0;
      margin: 0;
    }
    .publication-container {
      max-width: 820px;
      margin: 0 auto;
      padding: 24px;
    }

    /* Publication Header Banner */
    .pub-header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pub-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pub-logo {
      font-size: 24px;
      line-height: 1;
    }
    .pub-brand-text {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #0284c7;
    }
    .pub-meta {
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
      text-align: right;
    }

    /* Headings */
    h1.heading-1 {
      font-size: 24px;
      font-weight: 800;
      color: ${isDark ? "#f8fafc" : "#0f172a"};
      margin-top: 0;
      margin-bottom: 16px;
      line-height: 1.25;
      border-bottom: 1px solid ${border};
      padding-bottom: 8px;
    }
    h2.heading-2 {
      font-size: 18px;
      font-weight: 700;
      color: ${isDark ? "#38bdf8" : "#0369a1"};
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
      break-after: avoid;
    }
    h3.heading-3 {
      font-size: 14px;
      font-weight: 600;
      color: ${isDark ? "#e2e8f0" : "#1e293b"};
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
      break-after: avoid;
    }
    h4.heading-4 {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      margin-top: 14px;
      margin-bottom: 6px;
    }

    /* Content */
    p.paragraph {
      margin: 8px 0;
      text-align: justify;
    }
    .spacer {
      height: 8px;
    }
    .divider {
      border: none;
      border-top: 1px solid ${border};
      margin: 20px 0;
    }

    /* Code Blocks */
    .code-container {
      background: ${codeBg};
      border: 1px solid ${border};
      border-radius: 8px;
      margin: 14px 0;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .code-header {
      background: ${headerBg};
      padding: 6px 12px;
      font-size: 10px;
      font-family: monospace;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid ${border};
      color: #64748b;
    }
    .code-lang {
      font-weight: 700;
      color: #0284c7;
    }
    pre.code-content {
      margin: 0;
      padding: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      line-height: 1.5;
      overflow-x: auto;
      color: ${isDark ? "#f1f5f9" : "#0f172a"};
    }
    code.inline-code {
      font-family: ui-monospace, monospace;
      font-size: 11px;
      background: ${headerBg};
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid ${border};
      color: #0284c7;
    }

    /* Math */
    .math-container {
      padding: 14px;
      margin: 14px 0;
      text-align: center;
      background: ${codeBg};
      border: 1px solid ${border};
      border-radius: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Admonitions */
    .callout {
      padding: 12px 16px;
      margin: 14px 0;
      border-radius: 8px;
      border-left: 4px solid;
      background: ${codeBg};
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .callout-title {
      font-size: 10px;
      font-weight: 800;
      font-family: monospace;
      letter-spacing: 0.08em;
      margin-bottom: 4px;
    }
    .callout-note {
      border-left-color: #0284c7;
      background: ${isDark ? "rgba(2, 132, 199, 0.1)" : "#f0f9ff"};
    }
    .callout-note .callout-title { color: #0284c7; }
    .callout-tip {
      border-left-color: #10b981;
      background: ${isDark ? "rgba(16, 185, 129, 0.1)" : "#f0fdf4"};
    }
    .callout-tip .callout-title { color: #10b981; }
    .callout-warning {
      border-left-color: #f59e0b;
      background: ${isDark ? "rgba(245, 158, 11, 0.1)" : "#fffbeb"};
    }
    .callout-warning .callout-title { color: #f59e0b; }
    .callout-caution {
      border-left-color: #ef4444;
      background: ${isDark ? "rgba(239, 68, 68, 0.1)" : "#fef2f2"};
    }
    .callout-caution .callout-title { color: #ef4444; }

    /* Lists */
    .list-item, .ordered-item {
      margin: 4px 0;
      padding-left: 4px;
    }
    .task-item {
      margin: 4px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .task-box {
      font-family: monospace;
      color: #64748b;
    }
    .task-box.checked {
      color: #10b981;
    }

    /* Footer */
    .pub-footer {
      margin-top: 40px;
      border-top: 1px solid ${border};
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
      font-family: monospace;
    }

    @media print {
      body {
        background: transparent !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="publication-container">
    <div class="pub-header">
      <div class="pub-brand">
        <span class="pub-logo">🌙</span>
        <span class="pub-brand-text">Selene Publication Engine</span>
      </div>
      <div class="pub-meta">
        <div>Date: ${now}</div>
        <div>Standard Technical Specification</div>
      </div>
    </div>

    ${bodyHtml}

    <div class="pub-footer">
      <span>🌙 Engineered with Selene — Titaness of the Moon</span>
      <span>Confidential & Technical Specification</span>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
`;

  const printWindow = window.open("", "_blank", "width=900,height=800");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();
  }
}
