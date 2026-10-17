export interface DocumentItem {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  icon?: string;
}

export const STARTER_TEMPLATES: DocumentItem[] = [
  {
    id: "doc-architecture",
    title: "🌙 Selene Architecture & Live Canvas",
    icon: "🚀",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 60000,
    content: `# 🌙 Selene Technical Specification & Live Canvas

Welcome to **Selene** — the hypermodern technical document & code canvas where markdown prose seamlessly integrates with live code execution and vector graphics! ✨

> [!NOTE]
> All live code renders run inside **isolated sandbox contexts with zero CSS bleed**, ensuring that your document typography and your project components never clash.

---

## ⚡ 1. Live React & Tailwind Sandbox

Below is an interactive live React component. Click **Tweak Props** in the header above the sandbox to adjust theme colors, corner radiuses, and padding visually with no-code controls!

\`\`\`tsx
import React, { useState } from "react";

export default function LiveInteractiveCard() {
  const [likes, setLikes] = useState(42);

  return (
    <div className="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-slate-700/60 shadow-xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
          S
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Selene Live Preview</h3>
          <p className="text-xs text-sky-400">Isolated HMR Sandbox</p>
        </div>
      </div>
      <p className="text-sm text-slate-300">
        Edit this code directly or use the Tweak Props panel to adjust visual styling without writing code!
      </p>
      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
        <button
          onClick={() => setLikes(l => l + 1)}
          className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          ❤️ Like ({likes})
        </button>
        <span className="text-xs font-mono text-slate-400">Tailwind CSS Active</span>
      </div>
    </div>
  );
}
\`\`\`

---

## 📊 2. Live Mermaid.js System Diagram

Text-based diagrams compile into responsive SVG graphics dynamically:

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Developer
    participant Canvas as 🌙 Selene Canvas
    participant Engine as ⚡ Polymorphic Engine
    participant Sandbox as 🛡️ Sandpack / Iframe

    User->>Canvas: Type Markdown or Code
    Canvas->>Engine: Route AST Node Update
    alt Web Component
        Engine->>Sandbox: In-Memory Hot Reload & Inject Tailwind
        Sandbox-->>Canvas: Seamless Live Render
    else Architecture Diagram
        Engine->>Canvas: Render Responsive SVG (Mermaid)
    else LaTeX Formula
        Engine->>Canvas: Typeset KaTeX Equation
    end
\`\`\`

---

## 📐 3. Mathematical Typesetting

Equations typeset in sub-millisecond speeds:

\`\`\`math
\\mathcal{L}_{\\text{total}} = \\lambda_1 \\mathcal{L}_{\\text{fidelity}} + \\lambda_2 \\sum_{i=1}^N \\| \\hat{y}_i - y_i \\|^2 + \\mathbb{E}_{x \\sim p_{\\text{data}}}[\\log D(x)]
\`\`\`
`,
  },
  {
    id: "doc-ui-playground",
    title: "🎨 Interactive Web UI Components",
    icon: "🧩",
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 120000,
    content: `# 🎨 Interactive Web UI Components

Test multiple web framework stacks side-by-side with zero CSS leakage.

## 1. Metric Counter Card (React + Tailwind)

\`\`\`tsx
import React, { useState } from "react";

export default function MetricCard() {
  const [metric, setMetric] = useState(98.4);

  return (
    <div className="p-6 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-xl max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">System Uptime</span>
        <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
      </div>
      <div className="text-3xl font-extrabold text-white">{metric}%</div>
      <p className="text-xs text-slate-400 mt-1">High availability cluster node</p>
      <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
        <button
          onClick={() => setMetric(m => +(m + 0.1).toFixed(1))}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Boost
        </button>
      </div>
    </div>
  );
}
\`\`\`

## 2. Gradient Banner (Vanilla HTML)

\`\`\`html
<div class="p-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 rounded-2xl text-white shadow-2xl">
  <h2 class="text-xl font-black">Zero-Leak Web Canvas</h2>
  <p class="text-sm opacity-90 mt-1">Tailwind utility classes render directly in isolated iframe contexts.</p>
</div>
\`\`\`
`,
  },
  {
    id: "doc-api-rfc",
    title: "📋 Distributed API RFC Document",
    icon: "📑",
    createdAt: Date.now() - 14400000,
    updatedAt: Date.now() - 300000,
    content: `# 📋 RFC: Real-Time Event Ingestion Engine

> [!WARNING]
> This RFC introduces breaking changes to existing REST endpoints in favor of gRPC and WebSocket streaming.

---

### Architecture Overview

\`\`\`mermaid
flowchart LR
    A[Client App] -->|WebSocket| B[Edge Ingestion Gateway]
    B --> C[(Kafka Message Stream)]
    C --> D[Flink Event Processor]
    D --> E[(ClickHouse Analytics)]
\`\`\`

### Payload Contract

\`\`\`typescript
export interface IngestionEvent {
  id: string;
  timestamp: number;
  source: string;
  eventType: 'USER_ACTION' | 'SYSTEM_ALERT';
  payload: Record<string, unknown>;
}
\`\`\`
`,
  },
];

const STORAGE_KEY = "selene_documents_v2";

export function loadDocuments(): DocumentItem[] {
  if (typeof window === "undefined") return STARTER_TEMPLATES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDocuments(STARTER_TEMPLATES);
      return STARTER_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : STARTER_TEMPLATES;
  } catch {
    return STARTER_TEMPLATES;
  }
}

export function saveDocuments(docs: DocumentItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (err) {
    console.error("Failed to save documents to localStorage", err);
  }
}
