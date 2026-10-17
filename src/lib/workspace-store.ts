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

## 2. Reactive SFC Card (Vue 3 + Scoped CSS)

\`\`\`vue
<template>
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
</style>
\`\`\`

## 3. Reactive Declarations (Svelte + Scoped CSS)

\`\`\`svelte
<script>
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
</style>
\`\`\`

## 4. Gradient Banner (Vanilla HTML & Tailwind)

\`\`\`html
<div class="p-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 rounded-2xl text-white shadow-2xl text-center max-w-sm mx-auto">
  <h2 class="text-xl font-black">Zero-Leak Web Canvas</h2>
  <p class="text-sm opacity-90 mt-1">Tailwind utility classes render directly in isolated iframe contexts.</p>
</div>
\`\`\`

## 5. Angular Component (Ivy + Scoped Encapsulation)

\`\`\`angular
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: \`
    <div class="angular-card">
      <div class="header">
        <div class="badge">NG</div>
        <div>
          <h3>Angular Ivy Live Engine</h3>
          <p class="sub">Component-Scoped Encapsulation</p>
        </div>
      </div>
      <p class="desc">
        Real-time two-way data binding, dependency injection, and scoped styles running inside Selene.
      </p>
      <div class="footer">
        <button (click)="increment()" class="btn">
          🚀 Clicks: {{ count }} ({{ count * 5 }} pts)
        </button>
        <span class="encapsulation">Emulated Scoped CSS</span>
      </div>
    </div>
  \`,
  styles: [\`
    .angular-card {
      background: #0f172a;
      border: 1px solid rgba(225, 29, 72, 0.4);
      border-radius: 1rem;
      padding: 1.5rem;
      color: #fff;
      max-width: 380px;
      margin: 0 auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      transition: all 0.2s ease;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }
    .angular-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 25px 30px -5px rgba(225, 29, 72, 0.25);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .badge {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #e11d48, #be123c);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      box-shadow: 0 4px 6px -1px rgba(225, 29, 72, 0.3);
    }
    h3 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .sub {
      margin: 0;
      font-size: 0.65rem;
      color: #fb7185;
      font-family: monospace;
    }
    .desc {
      font-size: 0.75rem;
      color: #94a3b8;
      line-height: 1.5;
      margin: 0 0 1rem 0;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #1e293b;
      padding-top: 0.75rem;
    }
    .btn {
      background: #e11d48;
      color: white;
      border: none;
      padding: 0.4rem 0.85rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.75rem;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(225, 29, 72, 0.3);
      transition: all 0.15s ease;
    }
    .btn:hover {
      background: #f43f5e;
    }
    .encapsulation {
      font-size: 0.65rem;
      font-family: monospace;
      color: #fb7185;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  \`]
})
export class AppComponent {
  count = 7;
  increment() {
    this.count++;
  }
}
\`\`\`

## 6. Flutter Mobile Widget (CanvasKit / Skia WASM)

\`\`\`flutter
import 'package:flutter/material.dart';

void main() => runApp(const SeleneFlutterApp());

class SeleneFlutterApp extends StatelessWidget {
  const SeleneFlutterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0B0F19),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0284C7),
          brightness: Brightness.dark,
        ),
      ),
      home: const CounterScreen(),
    );
  }
}

class CounterScreen extends StatefulWidget {
  const CounterScreen({super.key});

  @override
  State<CounterScreen> createState() => _CounterScreenState();
}

class _CounterScreenState extends State<CounterScreen> {
  int _counter = 42;

  void _increment() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Container(
          margin: const EdgeInsets.all(24),
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0x330284C7), width: 1.5),
            boxShadow: const [
              BoxShadow(
                color: Color(0x220284C7),
                blurRadius: 30,
                offset: Offset(0, 10),
              )
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0284C7), Color(0xFF38BDF8)],
                      ),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.flutter_dash, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Flutter Web Engine',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Hardware Skia / CanvasKit',
                        style: TextStyle(
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: Color(0xFF38BDF8),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 18),
              const Text(
                'Compiled WebAssembly execution with hardware acceleration and 60 FPS fluid rendering.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8), height: 1.4),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _increment,
                icon: const Icon(Icons.bolt, size: 18),
                label: Text('Taps: \${_counter} (\${_counter * 10} pts)'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0284C7),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
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

const STORAGE_KEY = "selene_documents_v4";

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
