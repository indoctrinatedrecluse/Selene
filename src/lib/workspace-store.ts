export interface DocumentItem {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  icon?: string;
  folder?: string;
}

export const STARTER_TEMPLATES: DocumentItem[] = [
  {
    id: "doc-architecture",
    title: "01_selene_architecture_and_live_canvas.md",
    icon: "🌙",
    folder: "samples",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 60000,
    content: `# 🌙 Selene Technical Specification & Live Canvas

Welcome to **Selene** — the hypermodern technical document & code canvas where markdown prose seamlessly integrates with live code execution and vector graphics! ✨

> [!NOTE]
> 🏛️ **Named for Selene, Titaness of the Moon (Σελήνη)**:
> In Greek mythology, Selene drives her radiant silver chariot across the nocturnal cosmos, illuminating the earth with gentle, serene clarity. Selene is engineered with that same philosophy: illuminating complex codebases, AST nodes, and technical documentation with effortless live rendering, isolated sandboxes, and zero CSS leakage. Click **Titan Lore** in the top navigation bar to explore the heritage.

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

---

## 📊 4. Declarative Vector Charting Engine

Render vector line, bar, area, scatter, donut, and heatmap graphics directly using declarative specifications:

\`\`\`chart
{
  "type": "area",
  "title": "Selene Distributed Inferences & Latency",
  "xKey": "epoch",
  "yKey": ["throughput", "efficiency"],
  "colors": ["#38bdf8", "#818cf8"],
  "data": [
    { "epoch": "E1", "throughput": 120, "efficiency": 85 },
    { "epoch": "E2", "throughput": 240, "efficiency": 110 },
    { "epoch": "E3", "throughput": 390, "efficiency": 160 },
    { "epoch": "E4", "throughput": 560, "efficiency": 230 }
  ]
}
\`\`\`

---

## 🦆 5. DuckDB Analytical OLAP Studio

Query thousands of rows locally with sub-10ms in-memory SIMD execution:

\`\`\`duckdb
SELECT 
  region,
  COUNT(*) AS count,
  ROUND(AVG(latency_ms), 1) AS mean_latency
FROM telemetry_logs
GROUP BY region
ORDER BY mean_latency ASC;
\`\`\`
`,
  },
  {
    id: "doc-ui-playground",
    title: "02_interactive_web_ui_components.md",
    icon: "🎨",
    folder: "samples",
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
    title: "04_distributed_api_rfc.md",
    icon: "📋",
    folder: "samples",
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
  {
    id: "doc-angular-showcase",
    title: "03_angular_and_flutter_showcase.md",
    icon: "🅰️",
    folder: "samples",
    createdAt: Date.now() - 5400000,
    updatedAt: Date.now() - 45000,
    content: `# 🅰️ Angular Ivy Live Showcase & Architecture

Selene includes full first-class live rendering for **Angular** components running through an optimized Ivy in-memory compiler with real-time template compilation, emulated view encapsulation, dependency injection, and Tailwind utility class integration!

> [!NOTE]
> **Zero Configuration & In-Memory Ivy Compilation**:
> Standard TypeScript code fences with language \`angular\` compile directly inside Selene's isolated Sandpack Ivy engine. You can also connect to a local Angular CLI project (\`ng serve\` on port \`4200\`) using the **Engine Switcher** at the top right.

---

## ⚡ 1. Angular Mission Control Telemetry Card

This component demonstrates reactive state binding, dynamic calculations, badge state transitions, and component-scoped CSS:

\`\`\`angular
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: \`
    <div class="mission-card">
      <div class="card-header">
        <div class="logo-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <h3>Selene Artemis Lunar Station</h3>
          <p class="subtitle">Angular Ivy Engine • Port 4200</p>
        </div>
        <span class="status-pill" [class.active]="shieldActive">
          {{ shieldActive ? 'SHIELDS ONLINE' : 'SHIELDS OFFLINE' }}
        </span>
      </div>

      <div class="telemetry-grid">
        <div class="metric-box">
          <span class="metric-label">Orbital Velocity</span>
          <span class="metric-value">{{ velocity }} km/s</span>
        </div>
        <div class="metric-box">
          <span class="metric-label">Lunar Altitude</span>
          <span class="metric-value">{{ altitude }} km</span>
        </div>
        <div class="metric-box">
          <span class="metric-label">Reactor Core</span>
          <span class="metric-value" [style.color]="coreTemp > 90 ? '#ef4444' : '#10b981'">
            {{ coreTemp }}°C
          </span>
        </div>
      </div>

      <div class="controls-row">
        <button (click)="boostThrusters()" class="btn-primary">
          🚀 Thruster Boost (+0.5 km/s)
        </button>
        <button (click)="toggleShields()" [class.shield-btn-on]="shieldActive" class="btn-secondary">
          🛡️ {{ shieldActive ? 'Lower Shields' : 'Raise Shields' }}
        </button>
      </div>

      <div class="footer-bar">
        <span>⚡ Emulated View Encapsulation</span>
        <span>Reactive Ivy Runtime</span>
      </div>
    </div>
  \`,
  styles: [\`
    .mission-card {
      background: #090d16;
      border: 1px solid rgba(244, 63, 94, 0.35);
      border-radius: 1.25rem;
      padding: 1.5rem;
      color: #f1f5f9;
      max-width: 480px;
      margin: 0 auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      font-family: ui-sans-serif, system-ui, sans-serif;
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      position: relative;
    }
    .logo-badge {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #e11d48, #be123c);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(225, 29, 72, 0.4);
    }
    .logo-badge svg {
      width: 1.35rem;
      height: 1.35rem;
    }
    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .subtitle {
      margin: 0;
      font-size: 0.7rem;
      color: #fb7185;
      font-family: monospace;
    }
    .status-pill {
      margin-left: auto;
      font-size: 0.65rem;
      font-weight: 700;
      font-family: monospace;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
      transition: all 0.2s ease;
    }
    .status-pill.active {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.4);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
    }
    .telemetry-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .metric-box {
      background: #0f172a;
      border: 1px solid #1e293b;
      padding: 0.75rem 0.5rem;
      border-radius: 0.75rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .metric-label {
      font-size: 0.65rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .metric-value {
      font-size: 1.1rem;
      font-weight: 800;
      font-family: monospace;
      color: #fff;
    }
    .controls-row {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .btn-primary, .btn-secondary {
      flex: 1;
      padding: 0.6rem 0.75rem;
      border-radius: 0.625rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: #e11d48;
      color: white;
      box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
    }
    .btn-primary:hover {
      background: #f43f5e;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
    }
    .btn-secondary:hover {
      background: #334155;
    }
    .btn-secondary.shield-btn-on {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.5);
      color: #34d399;
    }
    .footer-bar {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #1e293b;
      padding-top: 0.75rem;
      font-size: 0.65rem;
      color: #64748b;
      font-family: monospace;
    }
  \`]
})
export class AppComponent {
  velocity = 7.68;
  altitude = 112;
  coreTemp = 64;
  shieldActive = true;

  boostThrusters() {
    this.velocity = +(this.velocity + 0.5).toFixed(2);
    this.altitude = +(this.altitude + 4.2).toFixed(1);
    this.coreTemp = Math.min(120, this.coreTemp + 8);
  }

  toggleShields() {
    this.shieldActive = !this.shieldActive;
    if (!this.shieldActive) {
      this.coreTemp = Math.max(40, this.coreTemp - 15);
    }
  }
}
\`\`\`

---

## 🔬 2. Angular CLI Dev Server Integration

When working on a real Angular workspace:
1. Run \`ng serve\` in your project directory (defaults to port \`4200\`).
2. In Selene, switch the header **Engine Switcher** to **Project Server**.
3. Selene maps any code files matching \`src/app/.../*.component.ts\` to the corresponding Angular route with instant live preview.
`,
  },
  {
    id: "doc-flutter-showcase",
    title: "flutter_wasm_engine_demo.md",
    icon: "🎯",
    folder: "samples",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 30000,
    content: `# 🎯 Flutter & Dart Web Showcase & Hardware Engine

Selene provides a state-of-the-art **Flutter & Dart Web Rendering Engine** powered by WebAssembly and the CanvasKit / Skia graphics pipeline.

> [!TIP]
> **Cross-Platform Responsive Simulator**:
> The live Flutter frame includes a device emulator bar at the top:
> - **iPhone 15 Pro** (393 × 852)
> - **Google Pixel 8** (412 × 915)
> - **iPad Mini** (768 × 1024)
> - **Desktop Canvas** (100% Fluid)
> - **Device Orientation Toggle** (Portrait / Landscape)
> - **Local Flutter Dev Tunnel**: Connect directly to your local \`flutter run -d web-server --web-port=8080\` process!

---

## 📱 1. Material 3 Lunar Telemetry App

This interactive Flutter widget demonstrates Material 3 theme seeding, elevated action buttons, animated state counters, and dark celestial styling:

\`\`\`flutter
import 'package:flutter/material.dart';

void main() => runApp(const SeleneLunarApp());

class SeleneLunarApp extends StatelessWidget {
  const SeleneLunarApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF070A14),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF38BDF8),
          brightness: Brightness.dark,
        ),
      ),
      home: const LunarDashboardScreen(),
    );
  }
}

class LunarDashboardScreen extends StatefulWidget {
  const LunarDashboardScreen({super.key});

  @override
  State<LunarDashboardScreen> createState() => _LunarDashboardScreenState();
}

class _LunarDashboardScreenState extends State<LunarDashboardScreen> {
  int _collectedSamples = 14;
  double _batteryLevel = 0.88;
  bool _roverDeployed = true;

  void _gatherSample() {
    setState(() {
      _collectedSamples++;
      _batteryLevel = (_batteryLevel - 0.03).clamp(0.05, 1.0);
    });
  }

  void _rechargeBattery() {
    setState(() {
      _batteryLevel = 1.0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Selene Lunar Station',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFF0F172A),
        actions: [
          IconButton(
            icon: Icon(
              _roverDeployed ? Icons.radar : Icons.radar_outlined,
              color: const Color(0xFF38BDF8),
            ),
            onPressed: () {
              setState(() => _roverDeployed = !_roverDeployed);
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0x4438BDF8), width: 1.5),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x2238BDF8),
                    blurRadius: 20,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0x2238BDF8),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.nightlight_round, color: Color(0xFF38BDF8)),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text(
                                'Mare Tranquillitatis',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              Text(
                                'Latitude: 0.6740° N, 23.4720° E',
                                style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8), fontFamily: 'monospace'),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: _roverDeployed ? const Color(0x3310B981) : const Color(0x33EF4444),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: _roverDeployed ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                          ),
                        ),
                        child: Text(
                          _roverDeployed ? 'ACTIVE' : 'STANDBY',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: _roverDeployed ? const Color(0xFF34D399) : const Color(0xFFF87171),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Solar Battery Level',
                              style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                            ),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: LinearProgressIndicator(
                                value: _batteryLevel,
                                minHeight: 8,
                                backgroundColor: const Color(0xFF334155),
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  _batteryLevel > 0.3 ? const Color(0xFF38BDF8) : const Color(0xFFEF4444),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        '\${(_batteryLevel * 100).toInt()}%',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Stats Counter Tile
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      const Text('Regolith Samples', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                      const SizedBox(height: 4),
                      Text('\$_collectedSamples', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                    ],
                  ),
                  Container(width: 1, height: 36, color: const Color(0xFF1E293B)),
                  Column(
                    children: [
                      const Text('Telemetry Ping', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                      const SizedBox(height: 4),
                      const Text('1.28 sec', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Action Buttons
            ElevatedButton.icon(
              onPressed: _batteryLevel > 0.05 ? _gatherSample : null,
              icon: const Icon(Icons.science, size: 18),
              label: Text('Drill Regolith Sample (\$_collectedSamples logged)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0284C7),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: _rechargeBattery,
              icon: const Icon(Icons.solar_power, size: 18),
              label: const Text('Align Solar Panels (Full Charge)'),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF38BDF8),
                side: const BorderSide(color: Color(0xFF0284C7)),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
\`\`\`

---

## 🎨 2. Cupertino iOS Styling & Custom Canvas

Selene supports Cupertino iOS widgets and Flutter \`CustomPainter\` shaders. Switch presets using the selector toolbar inside the Flutter preview canvas to explore the Cupertino Settings Card and the Trigonometric Celestial Orbit painter.
`,
  },
  {
    id: "doc-python-datascience",
    title: "05_python_wasm_datascience_notebook.md",
    icon: "🐍",
    folder: "samples",
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 30000,
    content: `# 🐍 In-Browser Data Science & Computational Notebooks

Welcome to Selene's high-performance **WebAssembly Python Kernel**, powered by Pyodide v0.26! Execute Python, compute matrix algebra with **NumPy**, analyze telemetry with **Pandas**, and render publication-grade scientific figures with **Matplotlib** — 100% in-browser with zero backend servers or containers.

> [!TIP]
> ⚡ **Zero-Install Python**: Press **Run Cell** (or \`Ctrl+Enter\` inside the cell) to download the WASM binary and execute client-side. The kernel automatically parses \`import\` statements and loads required scientific libraries on-demand.

---

## 🌙 1. Orbital Mechanics & Matplotlib Trajectory Simulation

Simulate a Trans-Lunar Injection (TLI) transfer orbit from Earth (*Gaia*) to the Moon (*Selene*) with Apollo/Artemis free-return orbital mechanics:

\`\`\`python
import numpy as np
import matplotlib.pyplot as plt

# Trans-Lunar Injection (TLI) Orbital Mechanics Simulation
theta = np.linspace(0, 2 * np.pi, 500)
moon_orbit_r = 8.0

# Orbital trajectory coordinates
t = np.linspace(0, 10, 500)
x_orbit = 4 * np.cos(t) + 3.5 * np.cos(3 * t)
y_orbit = 2.5 * np.sin(t) - 2.0 * np.sin(2 * t)

fig, ax = plt.subplots(figsize=(7, 4.5))

# Plot Earth and Moon
ax.scatter([0], [0], color='#38bdf8', s=350, label='Earth (Gaia)', zorder=5)
ax.scatter([moon_orbit_r * np.cos(1.2)], [moon_orbit_r * np.sin(1.2)], color='#fbbf24', s=180, label='Moon (Selene)', zorder=5)

# Plot Trajectories
ax.plot(x_orbit, y_orbit, color='#a855f7', linewidth=2, label='Artemis Free-Return Trajectory')
ax.plot(moon_orbit_r * np.cos(theta), moon_orbit_r * np.sin(theta), '--', color='#475569', alpha=0.5, label='Lunar Orbital Path')

ax.set_title("Selene Mission: Trans-Lunar Injection & Orbital Insertion", fontsize=12, pad=12, fontweight='bold')
ax.set_xlabel("Equatorial Distance (x10^4 km)", fontsize=10)
ax.set_ylabel("Orbital Plane (x10^4 km)", fontsize=10)
ax.legend(loc='upper right', fontsize=8, facecolor='#0f172a', edgecolor='#1e293b')
ax.grid(True, linestyle=':', alpha=0.3)

plt.tight_layout()
plt.show()

print("✓ Orbital mechanics computation completed with 500 integration steps.")
print("✓ Target lunar insertion delta-V: 1,024 m/s (Nominal).")
\`\`\`

---

## 🎲 2. Monte Carlo Crater Impact & Pi Estimation (NumPy)

High-speed vectorized statistical sampling directly in browser WebAssembly:

\`\`\`python
import numpy as np

# Estimate Pi and Crater Impact Density using 200,000 Monte Carlo samples
n_samples = 200_000
x = np.random.uniform(-1, 1, n_samples)
y = np.random.uniform(-1, 1, n_samples)

inside_circle = (x**2 + y**2) <= 1.0
pi_estimate = 4.0 * np.sum(inside_circle) / n_samples
error_pct = abs(pi_estimate - np.pi) / np.pi * 100

print("==================================================")
print("  Selene Computational Mathematics Kernel        ")
print("==================================================")
print(f"Simulation Samples  : {n_samples:,}")
print(f"Estimated Value of π : {pi_estimate:.6f}")
print(f"True Value of π      : {np.pi:.6f}")
print(f"Relative Error       : {error_pct:.4f}%")
print(f"Crater Density Score : {np.sum(inside_circle):,} impacts within lunar disk")
\`\`\`

---

## 📊 3. Lunar Rover Telemetry Analysis (Pandas)

Real-time sensor telemetry processing with Pandas DataFrames and descriptive statistics:

\`\`\`python
import pandas as pd
import numpy as np

# Generate time series telemetry for Lunar Rover Exploration
np.random.seed(42)
timestamps = pd.date_range("2026-10-18 00:00:00", periods=6, freq="10min")
telemetry = pd.DataFrame({
    "Regolith Temp (°C)": np.random.uniform(-130, -110, 6).round(1),
    "Solar Array (Watts)": np.random.uniform(420, 480, 6).round(0),
    "Radiation (mSv/h)": np.random.uniform(0.02, 0.05, 6).round(3),
    "Battery SoC (%)": [98, 95, 91, 88, 86, 82],
    "Rover Subsystem": ["Core", "Nav", "Drill", "Radio", "Camera", "Spectro"]
}, index=timestamps)

print("=== LUNAR ROVER ARTEMIS IV TELEMETRY LOG ===")
print(telemetry.to_string())
print("\\nDescriptive Statistics Summary:")
print(telemetry.describe().round(2).to_string())
\`\`\`
`,
  },
  {
    id: "doc-laravel-showcase",
    title: "06_php_laravel_blade_showcase.md",
    icon: "🐘",
    folder: "samples",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 30000,
    content: `# 🐘 PHP & Laravel 11 Blade Engine Showcase

Selene now features native, zero-config live render execution for **PHP 8.3 & Laravel Blade** templates! This engine compiles Blade directives in-memory and injects **Alpine.js 3.x** and **Tailwind CSS 3.4** inside an isolated sandbox.

> [!NOTE]
> ⚡ **Dual Execution Runtime**:
> 1. **In-Browser Blade Engine**: Compiles \`@php\`, \`@foreach\`, \`@if\`, \`{{ }}\`, and Alpine.js reactivity with zero latency and 100% offline capability.
> 2. **Artisan Serve Bridge**: Connect directly to your local \`php artisan serve\` instance running on port \`8000\` using the engine toggle in the block header.

---

## ⚡ 1. Interactive Blade Metric Card (Alpine.js + Directives)

Below is a live Blade component featuring variable scopes, nested associative arrays, loops, and Alpine.js interactive tabs:

\`\`\`blade
@php
  $cluster = "Artemis-Prime-04";
  $uptime = "99.98%";
  $memoryUsage = "4.2 GB / 16 GB";
  $status = "optimal";
  $services = [
    ["name" => "Auth Gatekeeper", "port" => 8080, "status" => "active", "latency" => "12ms"],
    ["name" => "Polymorphic AST", "port" => 9000, "status" => "active", "latency" => "4ms"],
    ["name" => "LibSQL Replica", "port" => 5432, "status" => "syncing", "latency" => "28ms"],
  ];
@endphp

<div x-data="{ count: 42, activeTab: 'overview', boosted: false }" class="p-6 max-w-lg mx-auto bg-slate-900/90 rounded-2xl border border-red-500/30 shadow-2xl backdrop-blur-md text-slate-100 font-sans">
  {{-- Header with Laravel Crimson Branding --}}
  <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg shadow-red-500/20">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>{{ $cluster }}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {{ strtoupper($status) }}
          </span>
        </h3>
        <p class="text-xs text-slate-400 font-mono">Laravel 11 • Blade Template Engine</p>
      </div>
    </div>
    <div class="text-right">
      <span class="text-xs font-mono text-red-400 font-semibold">{{ $uptime }}</span>
      <p class="text-[10px] text-slate-500">Service SLA</p>
    </div>
  </div>

  {{-- Interactive Alpine.js Tab Switcher --}}
  <div class="flex items-center gap-2 mb-4 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs font-medium">
    <button @click="activeTab = 'overview'" :class="activeTab === 'overview' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'" class="flex-1 py-1 rounded-md transition-all">
      Overview
    </button>
    <button @click="activeTab = 'services'" :class="activeTab === 'services' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'" class="flex-1 py-1 rounded-md transition-all">
      Services ({{ count($services) }})
    </button>
  </div>

  {{-- Tab 1: Overview --}}
  <div x-show="activeTab === 'overview'" class="space-y-3">
    <div class="grid grid-cols-2 gap-3">
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Memory Allocation</span>
        <span class="text-sm font-bold font-mono text-white">{{ $memoryUsage }}</span>
      </div>
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Interactive Metric</span>
        <span class="text-sm font-bold font-mono text-red-400" x-text="'Payload ' + count + ' MB/s'"></span>
      </div>
    </div>

    <div class="pt-2 flex items-center justify-between">
      <button @click="count += 5; boosted = true" class="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2">
        <span>⚡ Trigger Pipeline Event</span>
        <span class="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]" x-text="count"></span>
      </button>
      <span x-show="boosted" class="text-xs text-emerald-400 font-mono animate-pulse">✓ Signal Dispatched</span>
    </div>
  </div>

  {{-- Tab 2: Service Loop (@foreach simulation) --}}
  <div x-show="activeTab === 'services'" class="space-y-2">
    @foreach ($services as $service)
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full {{ $service['status'] === 'active' ? 'bg-emerald-400' : 'bg-amber-400' }} animate-pulse"></span>
          <span class="font-medium text-slate-200">{{ $service['name'] }}</span>
          <span class="text-[10px] font-mono text-slate-500">:{{ $service['port'] }}</span>
        </div>
        <span class="font-mono text-slate-400 text-[11px]">{{ $service['latency'] }}</span>
      </div>
    @endforeach
  </div>
</div>
\`\`\`

---

## 📦 2. Eloquent Collection Table (Blade Directives)

\`\`\`blade
@php
  $users = [
    ["id" => 1, "name" => "Selene Titan", "role" => "Celestial Admin", "status" => "online", "tokens" => "1.2M"],
    ["id" => 2, "name" => "Hyperion Sun", "role" => "AST Architect", "status" => "online", "tokens" => "840K"],
    ["id" => 3, "name" => "Phoebe Corona", "role" => "Security Auditor", "status" => "idle", "tokens" => "420K"],
    ["id" => 4, "name" => "Theia Dawn", "role" => "Compiler Ops", "status" => "busy", "tokens" => "2.4M"],
  ];
@endphp

<div class="p-6 max-w-xl mx-auto bg-slate-900 rounded-2xl border border-red-500/25 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-4">
    <div>
      <h3 class="text-base font-bold text-white">App\\Models\\CelestialTeam::all()</h3>
      <p class="text-xs text-red-400/90 font-mono">Eloquent Collection • Dynamic Blade Directives</p>
    </div>
    <span class="text-xs font-mono px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300">
      {{ count($users) }} Records
    </span>
  </div>

  <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
    <table class="w-full text-left text-xs">
      <thead class="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
        <tr>
          <th class="p-3">ID</th>
          <th class="p-3">Member</th>
          <th class="p-3">Role</th>
          <th class="p-3">Status</th>
          <th class="p-3 text-right">Throughput</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800/60">
        @foreach ($users as $user)
          <tr class="hover:bg-slate-800/40 transition-colors">
            <td class="p-3 font-mono text-slate-500">#{{ $user['id'] }}</td>
            <td class="p-3 font-semibold text-white">{{ $user['name'] }}</td>
            <td class="p-3 text-slate-400">{{ $user['role'] }}</td>
            <td class="p-3">
              @if ($user['status'] === 'online')
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">Online</span>
              @elseif ($user['status'] === 'busy')
                <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">Busy</span>
              @else
                <span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">Idle</span>
              @endif
            </td>
            <td class="p-3 text-right font-mono text-red-400">{{ $user['tokens'] }}</td>
          </tr>
        @endforeach
      </tbody>
    </table>
  </div>
</div>
\`\`\`
`,
  },
  {
    id: "doc-rails-showcase",
    title: "07_ruby_on_rails_erb_showcase.md",
    icon: "💎",
    folder: "samples",
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 15000,
    content: `# 💎 Ruby on Rails 8.0 & ERB Engine Showcase

Selene includes full native live rendering for **Ruby on Rails 8.0 & ERB** templates! The engine parses ERB scriptlets (\`<% %>\`), output tags (\`<%= %>\`), and evaluates Rails view helpers, Hotwire Turbo Frames, and Stimulus data controllers in real-time.

> [!NOTE]
> 🚀 **Dual Execution Runtime**:
> 1. **In-Browser ERB & Hotwire Engine**: Compiles Ruby collections, \`turbo_frame_tag\`, Rails helpers, and Stimulus interactivity client-side with zero dependencies.
> 2. **Puma Server Bridge**: Connect directly to your local Rails development server (\`bin/rails server\` on port \`3000\`) using the **Puma Server** toggle in the header.

---

## 🚀 1. Rails Hotwire & Turbo Frame Card (Stimulus + ERB)

Below is an interactive Rails component rendering within a Turbo Frame and responding to Stimulus actions:

\`\`\`erb
<%
  @cluster = "Olympus-Rails-08"
  @uptime = "99.99%"
  @mrr = 28450.00
  @status = "optimal"
  @services = [
    { name: "Turbo Streams Hub", port: 3000, status: "healthy", latency: "3ms" },
    { name: "Sidekiq Job Worker", port: 7433, status: "healthy", latency: "6ms" },
    { name: "PostgreSQL Replica", port: 5432, status: "healthy", latency: "1ms" },
    { name: "Redis Cache Store", port: 6379, status: "healthy", latency: "0.8ms" }
  ]
%>

<%= turbo_frame_tag "metrics_panel" do %>
  <div data-controller="telemetry" class="p-6 max-w-lg mx-auto bg-slate-900/90 rounded-2xl border border-rose-500/30 shadow-2xl backdrop-blur-md text-slate-100 font-sans">
    <%# Rails Header with Ruby Crimson Branding %>
    <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-600/25">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <span><%= @cluster %></span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <%= @status.upcase %>
            </span>
          </h3>
          <p class="text-xs text-rose-400/90 font-mono">Rails 8.0 • Hotwire & Turbo Frames</p>
        </div>
      </div>
      <div class="text-right">
        <span class="text-xs font-mono text-rose-400 font-semibold"><%= @uptime %></span>
        <p class="text-[10px] text-slate-500">Service SLA</p>
      </div>
    </div>

    <%# Metrics Row %>
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Monthly Run Rate</span>
        <span class="text-sm font-bold font-mono text-white"><%= number_to_currency(@mrr) %></span>
      </div>
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Active Services</span>
        <span class="text-sm font-bold font-mono text-rose-400"><%= pluralize(@services.count, "Worker Node") %></span>
      </div>
    </div>

    <%# Services List %>
    <div class="space-y-2 mb-4">
      <% @services.each do |service| %>
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="font-medium text-slate-200"><%= service[:name] %></span>
            <span class="text-[10px] font-mono text-slate-500">:<%= service[:port] %></span>
          </div>
          <span class="font-mono text-slate-400 text-[11px]"><%= service[:latency] %></span>
        </div>
      <% end %>
    </div>

    <%# Interactive Stimulus Controller %>
    <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
      <button
        data-action="click->telemetry#dispatchPulse"
        class="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
      >
        <span>⚡ Turbo Stream Pulse</span>
        <span data-telemetry-target="counter" class="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]">1</span>
      </button>
      <span data-telemetry-target="message" class="text-xs text-emerald-400 font-mono">
        Hotwire Connected
      </span>
    </div>
  </div>
<% end %>
\`\`\`

---

## 💎 2. ActiveRecord Relation Table (ERB Iteration)

\`\`\`erb
<%
  @deployments = [
    { id: 104, commit: "8e35ea0", branch: "main", author: "Selene Titan", status: "deployed", latency: "14ms" },
    { id: 103, commit: "4f9b2c1", branch: "feat/turbo", author: "Hyperion Sun", status: "deployed", latency: "18ms" },
    { id: 102, commit: "1a8d9e2", branch: "fix/stimulus", author: "Phoebe Corona", status: "running", latency: "32ms" },
    { id: 101, commit: "9c3f0b4", branch: "chore/deps", author: "Theia Dawn", status: "queued", latency: "0ms" }
  ]
%>

<div class="p-6 max-w-xl mx-auto bg-slate-900 rounded-2xl border border-rose-500/25 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-4">
    <div>
      <h3 class="text-base font-bold text-white">Deployment.recent.includes(:author)</h3>
      <p class="text-xs text-rose-400/90 font-mono">ActiveRecord Relation • ERB Iteration</p>
    </div>
    <span class="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
      <%= pluralize(@deployments.count, "Deployment") %>
    </span>
  </div>

  <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
    <table class="w-full text-left text-xs">
      <thead class="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
        <tr>
          <th class="p-3">ID</th>
          <th class="p-3">Commit</th>
          <th class="p-3">Branch</th>
          <th class="p-3">Author</th>
          <th class="p-3">Status</th>
          <th class="p-3 text-right">Latency</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800/60">
        <% @deployments.each do |dep| %>
          <tr class="hover:bg-slate-800/40 transition-colors">
            <td class="p-3 font-mono text-slate-500">#<%= dep[:id] %></td>
            <td class="p-3 font-mono text-rose-400"><%= dep[:commit] %></td>
            <td class="p-3 text-slate-300 font-mono text-[11px]"><%= dep[:branch] %></td>
            <td class="p-3 font-medium text-white"><%= dep[:author] %></td>
            <td class="p-3">
              <% if dep[:status] == "deployed" %>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">Deployed</span>
              <% elsif dep[:status] == "running" %>
                <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">Running</span>
              <% else %>
                <span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">Queued</span>
              <% end %>
            </td>
            <td class="p-3 text-right font-mono text-slate-400"><%= dep[:latency] %></td>
          </tr>
        <% end %>
      </tbody>
    </table>
  </div>
</div>
\`\`\`
`,
  },
  {
    id: "doc-go-showcase",
    title: "08_go_template_hugo_showcase.md",
    icon: "🐹",
    folder: "samples",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 60000,
    content: `# 🐹 Go Template & Hugo Engine Showcase

Selene brings native, high-performance live rendering for **Go 1.23 \`html/template\`** and **Hugo Static Site** templates! This engine compiles Go template directives in-memory with instant feedback, complete with mock context extraction, scoped conditionals, range iterations, and **Tailwind CSS 3.4** integration.

> [!NOTE]
> ⚡ **Dual Execution Runtime**:
> 1. **In-Browser Go Template Engine**: Evaluates \`{{ .Property }}\`, \`{{ range .Collection }}\`, \`{{ if eq .Field "val" }}\`, pipeline functions (\`upper\`, \`len\`, \`lower\`), and embedded JSON context with 0ms latency.
> 2. **Go HTTP Server Bridge**: Connect seamlessly to your local Go server (\`http.ListenAndServe(":8080", ...)\`) or Hugo dev server (\`hugo server -p 1313\`) via the engine switcher in the header!

---

## ⚡ 1. Microservice Distributed Telemetry Dashboard (\`html/template\`)

The block below demonstrates a Go template with embedded mock context, pipeline filters, service loop iteration, and visual property tweaking:

\`\`\`go
{{/* Context:
{
  "Cluster": "Artemis-Golang-10",
  "Uptime": "99.99%",
  "Goroutines": 14280,
  "Throughput": "184.2 MB/s",
  "Status": "optimal",
  "Services": [
    { "Name": "gRPC Ingestion Gateway", "Port": 50051, "Status": "active", "Latency": "0.4ms" },
    { "Name": "Raft Consensus Cluster", "Port": 7000, "Status": "active", "Latency": "1.2ms" },
    { "Name": "Zero-Alloc Memory Pool", "Port": 9090, "Status": "active", "Latency": "0.1ms" },
    { "Name": "Pebble KV Engine", "Port": 6380, "Status": "active", "Latency": "0.6ms" }
  ]
}
*/}}

<div class="p-6 max-w-lg mx-auto bg-slate-900/90 rounded-2xl border border-cyan-500/30 shadow-2xl backdrop-blur-md text-slate-100 font-sans">
  {{/* Header with Go Cyan Branding */}}
  <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 8h4l2 4-2 4h-4"/>
          <circle cx="8" cy="12" r="5"/>
          <path d="M13 12h3"/>
        </svg>
      </div>
      <div>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>{{ .Cluster }}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {{ upper .Status }}
          </span>
        </h3>
        <p class="text-xs text-cyan-400/90 font-mono">Go 1.23 • html/template Engine</p>
      </div>
    </div>
    <div class="text-right">
      <span class="text-xs font-mono text-cyan-400 font-semibold">{{ .Uptime }}</span>
      <p class="text-[10px] text-slate-500">Service SLA</p>
    </div>
  </div>

  {{/* Metrics Grid */}}
  <div class="grid grid-cols-2 gap-3 mb-4">
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Active Goroutines</span>
      <span class="text-sm font-bold font-mono text-white">{{ .Goroutines }}</span>
    </div>
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Throughput Rate</span>
      <span class="text-sm font-bold font-mono text-cyan-400">{{ .Throughput }}</span>
    </div>
  </div>

  {{/* Active Microservice Endpoints */}}
  <div class="space-y-2 mb-4">
    <div class="flex items-center justify-between text-xs text-slate-400 px-1">
      <span>Consensus Nodes</span>
      <span class="font-mono text-[11px]">{{ len .Services }} active</span>
    </div>
    {{ range .Services }}
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-medium text-slate-200">{{ .Name }}</span>
          <span class="text-[10px] font-mono text-slate-500">:{{ .Port }}</span>
        </div>
        <span class="font-mono text-cyan-400/80 text-[11px]">{{ .Latency }}</span>
      </div>
    {{ end }}
  </div>

  {{/* Interactive Trigger */}}
  <div class="pt-2 flex items-center justify-between border-t border-slate-800">
    <button id="go-sync-btn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2">
      <span>⚡ Rebalance Channels</span>
      <span class="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]">SYNC</span>
    </button>
    <span id="go-sync-msg" class="text-xs text-slate-400 font-mono">Standby</span>
  </div>
</div>
\`\`\`

---

## 🚀 2. Hugo Static Component / Content Widget (\`hugo\`)

Selene also supports Hugo site generators and shortcodes, parsing templates seamlessly:

\`\`\`gotemplate
{{/* Context:
{
  "Title": "High-Throughput Go Pipelines",
  "Author": "Gopher Ops",
  "ReadingTime": "4 min read",
  "Tag": "CONCURRENCY",
  "Stars": 8420
}
*/}}

<div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-sky-500/30 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-3">
    <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
      {{ .Tag }}
    </span>
    <span class="text-xs text-slate-400 font-mono">{{ .ReadingTime }}</span>
  </div>
  <h3 class="text-base font-bold text-white mb-2">{{ .Title }}</h3>
  <p class="text-xs text-slate-400 leading-relaxed mb-4">
    Learn how Go channels and worker pools process gigabytes of data concurrently with zero memory leaks.
  </p>
  <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
    <span class="text-slate-400">By <strong class="text-slate-200">{{ .Author }}</strong></span>
    <span class="text-sky-400 font-mono">⭐ {{ .Stars }}</span>
  </div>
</div>
\`\`\`
`,
  },
  {
    id: "doc-django-showcase",
    title: "09_django_jinja2_python_showcase.md",
    icon: "🐍",
    folder: "samples",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 60000,
    content: `# 🐍 Django & Jinja2 Template Engine Showcase

Selene brings native, high-performance live rendering for **Python 3.12**, **Django Template Language (DTL)**, and **Jinja2**! This engine compiles Django & Jinja2 templates in-memory with instant feedback, complete with mock context extraction, filters (\`|upper\`, \`|length\`, \`|lower\`), tags (\`{% for %}\`, \`{% if %}\`), and **Tailwind CSS 3.4** integration.

> [!NOTE]
> ⚡ **Dual Execution Runtime**:
> 1. **In-Browser Jinja2 / DTL Engine**: Evaluates \`{{ var }}\`, \`{% for item in col %}\`, \`{% if cond %}\`, pipeline filters (\`|upper\`, \`|length\`), and embedded JSON context with 0ms latency.
> 2. **Django / FastAPI Server Bridge**: Connect seamlessly to your local Django server (\`python manage.py runserver 8000\`) or FastAPI/Flask dev server (\`uvicorn app:app --port 8000\`) via the engine switcher in the block header!

---

## ⚡ 1. Django ASGI Microservice Telemetry Card (\`django\`)

The block below demonstrates a Django template with embedded mock context, template filters, service loop iteration, and visual property tweaking:

\`\`\`django
{# Context:
{
  "cluster": "Artemis-Django-11",
  "uptime": "99.98%",
  "workers": 8,
  "status": "optimal",
  "throughput": "9,420 req/s",
  "services": [
    { "name": "Django ASGI Gateway", "port": 8000, "status": "active", "latency": "1.2ms" },
    { "name": "Celery Task Broker", "port": 5555, "status": "active", "latency": "3.8ms" },
    { "name": "PostgreSQL Connection Pool", "port": 6432, "status": "active", "latency": "0.5ms" },
    { "name": "Redis Session Cache", "port": 6379, "status": "active", "latency": "0.2ms" }
  ]
}
#}

<div class="p-6 max-w-lg mx-auto bg-slate-900/90 rounded-2xl border border-emerald-500/30 shadow-2xl backdrop-blur-md text-slate-100 font-sans">
  {# Header with Django Emerald Branding #}
  <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/25">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h4v16H4zM12 8h4v12h-4zM20 12h-4"/>
        </svg>
      </div>
      <div>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>{{ cluster }}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {{ status|upper }}
          </span>
        </h3>
        <p class="text-xs text-emerald-400/90 font-mono">Django 5.0 • ASGI & Jinja2 Template</p>
      </div>
    </div>
    <div class="text-right">
      <span class="text-xs font-mono text-emerald-400 font-semibold">{{ uptime }}</span>
      <p class="text-[10px] text-slate-500">Service SLA</p>
    </div>
  </div>

  {# Metrics Grid #}
  <div class="grid grid-cols-2 gap-3 mb-4">
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Gunicorn / Uvicorn Workers</span>
      <span class="text-sm font-bold font-mono text-white">{{ workers }} Active</span>
    </div>
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Throughput Rate</span>
      <span class="text-sm font-bold font-mono text-emerald-400">{{ throughput }}</span>
    </div>
  </div>

  {# Active Microservice Endpoints #}
  <div class="space-y-2 mb-4">
    <div class="flex items-center justify-between text-xs text-slate-400 px-1">
      <span>Discovered Endpoints</span>
      <span class="font-mono text-[11px]">{{ services|length }} active</span>
    </div>
    {% for service in services %}
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-medium text-slate-200">{{ service.name }}</span>
          <span class="text-[10px] font-mono text-slate-500">:{{ service.port }}</span>
        </div>
        <span class="font-mono text-emerald-400/80 text-[11px]">{{ service.latency }}</span>
      </div>
    {% endfor %}
  </div>

  {# Interactive Action Footer #}
  <div class="pt-2 flex items-center justify-between border-t border-slate-800">
    <button id="django-purge-btn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2">
      <span>⚡ Invalidate Redis Cache</span>
      <span class="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]">FLUSH</span>
    </button>
    <span id="django-purge-msg" class="text-xs text-slate-400 font-mono">Idle</span>
  </div>
</div>
\`\`\`

---

## 🐍 2. Jinja2 / FastAPI Modern Card (\`jinja2\`)

Selene also supports FastAPI, Flask, and Jinja2 templates:

\`\`\`jinja2
{# Context:
{
  "title": "FastAPI High Performance Async Service",
  "author": "Python Core Ops",
  "status": "ready",
  "version": "v2.4.0",
  "stars": 12890
}
#}

<div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-emerald-500/30 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-3">
    <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      {{ version }}
    </span>
    <span class="text-xs font-mono text-emerald-400 font-semibold">{{ status|upper }}</span>
  </div>
  <h3 class="text-base font-bold text-white mb-2">{{ title }}</h3>
  <p class="text-xs text-slate-400 leading-relaxed mb-4">
    Built on Starlette and Pydantic, executing asynchronous requests with peak Python performance.
  </p>
  <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
    <span class="text-slate-400">Maintained by <strong class="text-slate-200">{{ author }}</strong></span>
    <span class="text-emerald-400 font-mono">⭐ {{ stars }}</span>
  </div>
</div>
\`\`\`
`,
  },
  {
    id: "doc-rust-showcase",
    title: "10_rust_yew_leptos_showcase.md",
    icon: "🦀",
    folder: "samples",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 60000,
    content: `# 🦀 Rust WebAssembly (Yew & Leptos) Engine Showcase

Selene brings native, high-performance live rendering for **Rust WebAssembly (\`wasm32-unknown-unknown\`)** components! This engine compiles and simulates Rust RSX macros (\`html! { ... }\` and \`view! { ... }\`), linear memory telemetry, and fine-grained reactive state inside an isolated sandbox with **Tailwind CSS 3.4**.

> [!NOTE]
> ⚡ **Dual Execution Runtime**:
> 1. **In-Browser WASM Engine**: Evaluates Rust RSX macros, hooks (\`use_state\`), signals (\`create_signal\`), and linear memory bounds with 0ms latency.
> 2. **Trunk Server Bridge**: Connect directly to your local Trunk or Cargo development server (\`trunk serve -p 8080\`) using the engine switcher in the block header!

---

## ⚡ 1. Rust Yew Microservice Telemetry Component (\`yew\`)

Below is a live Rust Yew component featuring state hooks, thread-safe memory allocations, and visual property tweaking:

\`\`\`rust
use yew::prelude::*;

#[function_component(TelemetryApp)]
pub fn app() -> Html {
    let count = use_state(|| 42);
    let cluster = "Artemis-Rust-WASM";
    let memory_alloc = "1.2 MB / 4.0 MB (Zero Garbage Collector)";

    html! {
        <div class="p-6 max-w-lg mx-auto bg-slate-900/90 rounded-2xl border border-amber-500/30 shadow-2xl backdrop-blur-md text-slate-100 font-sans">
            <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                            <polyline points="2 17 12 22 22 17"/>
                            <polyline points="2 12 12 17 22 12"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-white flex items-center gap-2">
                            <span>{ "Artemis-Rust-WASM" }</span>
                            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                { "OPTIMAL" }
                            </span>
                        </h3>
                        <p class="text-xs text-amber-400/90 font-mono">{ "Yew 0.21 • wasm32-unknown-unknown" }</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs font-mono text-amber-400 font-semibold">{ "99.999%" }</span>
                    <p class="text-[10px] text-slate-500">{ "Zero Panics" }</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">{ "Linear Memory" }</span>
                    <span class="text-sm font-bold font-mono text-white">{ memory_alloc }</span>
                </div>
                <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">{ "Thread Safety" }</span>
                    <span class="text-sm font-bold font-mono text-emerald-400">{ "Send + Sync Validated" }</span>
                </div>
            </div>

            <div class="pt-2 flex items-center justify-between border-t border-slate-800">
                <button id="rust-counter-btn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2">
                    <span>{ "⚡ Execute WASM Cycle" }</span>
                    <span id="rust-counter-val" class="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]">{ *count }</span>
                </button>
                <span class="text-xs text-slate-400 font-mono">{ "SIMD Enabled" }</span>
            </div>
        </div>
    }
}
\`\`\`
`,
  },
  {
    id: "doc-sql-showcase",
    title: "11_sql_sqlite_libsql_showcase.md",
    icon: "🗄️",
    folder: "samples",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 60000,
    content: `# 🗄️ SQL & LibSQL In-Browser Data Studio Showcase

Selene now features a native, zero-latency **SQL & LibSQL In-Browser Data Studio**! Execute relational queries, inspect data grids, filter records, sort columns, and export data directly within your markdown documents.

> [!NOTE]
> ⚡ **Interactive Data Studio Capabilities**:
> 1. **In-Memory SQL Execution**: Evaluates \`SELECT\`, \`JOIN\`, \`GROUP BY\`, \`ORDER BY\`, \`ROUND()\`, \`AVG()\`, and aggregation functions with sub-millisecond latency.
> 2. **Interactive Tabular Grid**: Sort by clicking column headers, filter records dynamically via the instant search input, and inspect schema structures.
> 3. **Export Suite**: Export result sets to CSV with 1-click.

---

## ⚡ 1. Mission Telemetry Join (Aggregates & Metrics)

Below is an interactive SQL query block joining \`celestial_missions\` with \`telemetry_nodes\`. Click **Run Query** (\`Ctrl+Enter\`) to evaluate in real-time:

\`\`\`sql
-- Selene SQL Data Studio • Mission Telemetry Aggregation
SELECT 
  m.name AS mission_name,
  m.target_celestial_body,
  m.status,
  COUNT(t.node_id) AS active_nodes,
  ROUND(AVG(t.latency_ms), 1) AS avg_latency_ms,
  ROUND(SUM(t.bandwidth_mbps), 1) AS total_bandwidth_mbps
FROM celestial_missions m
LEFT JOIN telemetry_nodes t ON m.id = t.mission_id
WHERE m.status IN ('active', 'nominal')
GROUP BY m.id, m.name, m.target_celestial_body, m.status
ORDER BY avg_latency_ms ASC;
\`\`\`

---

## 🚀 2. High-Priority Lunar & Martian Missions

Filter missions with budget thresholds over $400M:

\`\`\`sqlite
-- Filter active missions targeting Lunar or Martian orbit
SELECT 
  id,
  name,
  target_celestial_body,
  budget_millions_usd,
  launch_year,
  status
FROM celestial_missions
WHERE budget_millions_usd >= 400.00
ORDER BY budget_millions_usd DESC;
\`\`\`

---

## 👥 3. Crew Manifest & Specialist Roster

Inspect astronaut ranks, callsigns, and assigned missions:

\`\`\`libsql
-- Inspect officer ranks and specialist assignments
SELECT 
  c.callsign,
  c.full_name,
  c.rank,
  c.specialization,
  m.name AS assigned_mission
FROM crew_manifest c
INNER JOIN celestial_missions m ON c.mission_id = m.id
ORDER BY c.rank DESC, c.full_name ASC;
\`\`\`
`,
  },
  {
    id: "doc-shader-showcase",
    title: "12_glsl_webgl_shaders_showcase.md",
    icon: "🌌",
    folder: "samples",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 60000,
    content: `# 🌌 WebGL Canvas Shader Engine Showcase

Selene brings native, hardware-accelerated **WebGL & GLSL Canvas Shaders** directly into your technical markdown canvas! Render mathematical animations, procedural noise, raymarched 3D geometries, and generative art in real time.

> [!NOTE]
> ⚡ **Shader Engine Features**:
> 1. **Hardware Accelerated**: Full GPU rendering via WebGL2/WebGL1 context on HTML5 \`<canvas>\`.
> 2. **Standard Shader Inputs**: Automatically provides \`u_time\` (elapsed seconds), \`u_resolution\` (viewport dimensions), and \`u_mouse\` (normalized cursor coordinates).
> 3. **Animation Controls**: Play, pause, reset time, and live FPS counter.

---

## ⚡ 1. Cosmic Lunar Nebula (FBM Plasma)

The block below runs a Fractional Brownian Motion (FBM) plasma shader producing celestial nebula clouds:

\`\`\`glsl
// Selene WebGL Fragment Shader • Cosmic Nebula
#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    float t = u_time * 0.4;

    // Fractional Brownian Motion (FBM) & Plasma rings
    float d = length(uv);
    for (float i = 1.0; i < 4.0; i++) {
        uv.x += 0.3 / i * sin(i * 3.0 * uv.y + t) + 0.1;
        uv.y += 0.3 / i * cos(i * 3.0 * uv.x + t) + 0.1;
    }

    vec3 col = vec3(0.0);
    col.r = 0.5 + 0.5 * sin(uv.x + t * 0.8 + 0.0);
    col.g = 0.5 + 0.5 * sin(uv.y + t * 0.6 + 2.0);
    col.b = 0.5 + 0.5 * sin(uv.x + uv.y + t * 1.0 + 4.0);

    // Deep moonlit vignette & glow
    col *= 1.2 - d * 0.6;
    col += vec3(0.05, 0.15, 0.25) / (d + 0.2);

    gl_FragColor = vec4(col, 1.0);
}
\`\`\`

---

## 🪐 2. Raymarched Titan Orb (3D SDF Geometry)

Render a 3D raymarched sphere with diffuse lighting, rim glow, and camera ray tracing:

\`\`\`shader
// Selene WebGL Fragment Shader • Raymarched Sphere
#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float sphereSDF(vec3 p, float r) {
    return length(p) - r;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 ro = vec3(0.0, 0.0, -3.0); // Camera Ray origin
    vec3 rd = normalize(vec3(uv, 1.0)); // Ray direction

    // Raymarching loop
    float t = 0.0;
    vec3 spherePos = vec3(sin(u_time * 0.8) * 0.3, cos(u_time * 0.6) * 0.2, 0.0);
    for (int i = 0; i < 40; i++) {
        vec3 p = ro + rd * t;
        float d = sphereSDF(p - spherePos, 1.0);
        if (d < 0.001 || t > 10.0) break;
        t += d;
    }

    vec3 col = vec3(0.03, 0.05, 0.1); // Background void
    if (t < 10.0) {
        vec3 p = ro + rd * t;
        vec3 n = normalize(p - spherePos);
        vec3 lightDir = normalize(vec3(1.0, 1.5, -1.0));
        float diff = max(dot(n, lightDir), 0.0);
        float rim = 1.0 - max(dot(n, -rd), 0.0);

        vec3 surfaceColor = vec3(0.08, 0.45, 0.85); // Lunar Azure
        col = surfaceColor * diff + vec3(0.2, 0.8, 1.0) * pow(rim, 3.0);
    }

    gl_FragColor = vec4(col, 1.0);
}
\`\`\`
`,
  },
  {
    id: "doc-chart-showcase",
    title: "13_declarative_charts_and_plots.md",
    icon: "📊",
    folder: "samples",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 60000,
    content: `# 📊 Declarative Charting & Data Plotting Engine

Selene introduces a native **Declarative Charting Engine** (\`chart\` / \`plot\`) allowing data scientists, engineers, and researchers to author interactive vector charts directly inside markdown canvases.

> [!NOTE]
> 📈 **Declarative Vector Graphics**:
> - **Zero External Bundle Dependencies**: Rendered using ultra-crisp responsive SVGs with hardware-accelerated animations.
> - **Supported Visualizations**: Bar (grouped/stacked), Line (smooth Catmull-Rom), Area, Scatter, Donut / Pie, and Heatmap matrices.
> - **Interactive Controls**: Real-time chart-type switcher, interactive hover tooltips, live specification editor, tabular data inspector, and 1-click SVG/CSV downloads.

---

## ⚡ 1. High-Performance Multi-Series Line Chart

Below is a declarative line plot tracking inference throughput across global clusters:

\`\`\`chart
{
  "type": "line",
  "title": "Global Neural Cluster Throughput",
  "description": "Requests per second (kRPS) across distributed edge nodes",
  "xKey": "month",
  "yKey": ["us_east", "eu_west", "ap_southeast"],
  "colors": ["#38bdf8", "#818cf8", "#34d399"],
  "data": [
    { "month": "Jan", "us_east": 45, "eu_west": 32, "ap_southeast": 28 },
    { "month": "Feb", "us_east": 58, "eu_west": 41, "ap_southeast": 36 },
    { "month": "Mar", "us_east": 72, "eu_west": 54, "ap_southeast": 49 },
    { "month": "Apr", "us_east": 89, "eu_west": 68, "ap_southeast": 61 },
    { "month": "May", "us_east": 115, "eu_west": 87, "ap_southeast": 79 },
    { "month": "Jun", "us_east": 142, "eu_west": 105, "ap_southeast": 98 }
  ]
}
\`\`\`

---

## ⚡ 2. Grouped Bar & Cost Efficiency Breakdown

\`\`\`chart
{
  "type": "bar",
  "title": "Cloud Compute vs On-Premises Cost (USD/M Tokens)",
  "description": "Comparison of inferencing unit cost across hardware architectures",
  "xKey": "model",
  "yKey": ["cloud_gpu", "local_fpga", "optimized_npu"],
  "colors": ["#f472b6", "#fbbf24", "#38bdf8"],
  "data": [
    { "model": "Mistral-7B", "cloud_gpu": 0.42, "local_fpga": 0.28, "optimized_npu": 0.14 },
    { "model": "Llama-3-70B", "cloud_gpu": 2.85, "local_fpga": 1.95, "optimized_npu": 1.12 },
    { "model": "DeepSeek-V3", "cloud_gpu": 1.65, "local_fpga": 1.10, "optimized_npu": 0.65 },
    { "model": "Gemini-2.5", "cloud_gpu": 0.95, "local_fpga": 0.65, "optimized_npu": 0.38 }
  ]
}
\`\`\`

---

## ⚡ 3. Donut Market Share Distribution

\`\`\`chart
{
  "type": "donut",
  "title": "Global Model Ingestion Distribution",
  "description": "Proportion of documents transcribed via multimodal vision pipelines",
  "xKey": "modality",
  "yKey": "volume_share",
  "colors": ["#38bdf8", "#818cf8", "#34d399", "#fbbf24"],
  "data": [
    { "modality": "Academic Papers (PDF)", "volume_share": 42 },
    { "modality": "Architecture Diagrams", "volume_share": 28 },
    { "modality": "Handwritten Math", "volume_share": 18 },
    { "modality": "Technical Code Docs", "volume_share": 12 }
  ]
}
\`\`\`
`,
  },
  {
    id: "doc-duckdb-showcase",
    title: "14_duckdb_wasm_analytical_olap.md",
    icon: "🦆",
    folder: "samples",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 60000,
    content: `# 🦆 DuckDB-WASM In-Browser Analytical OLAP Engine

Welcome to the **DuckDB-WASM Analytical OLAP Studio**! Selene brings true vectorized columnar SQL querying directly into your browser, allowing you to run aggregations, percentiles, and complex group-by analytical queries over multi-thousand row datasets in **single-digit milliseconds**.

> [!NOTE]
> ⚡ **DuckDB In-Browser Capabilities**:
> - **Vectorized Columnar Execution**: Scans thousands of rows with SIMD-optimized memory layouts.
> - **Zero Server Dependencies**: Executes 100% locally in-memory inside the browser runtime.
> - **Pre-Loaded & Custom Datasets**: Query real-time telemetry logs, fintech orders, or retail orders with instantaneous responsiveness.
> - **Interactive Studio**: Built-in syntax highlighting, <kbd>Ctrl</kbd>+<kbd>Enter</kbd> execution, column sorting, pagination, and CSV export.

---

## ⚡ 1. Edge Telemetry Analysis (Aggregation & Group By)

Run the query below to calculate mean latency, CPU utilization, and request volume grouped across global cloud regions:

\`\`\`duckdb
-- In-Browser Analytical OLAP Query
SELECT 
  region,
  COUNT(*) AS total_samples,
  ROUND(AVG(latency_ms), 1) AS mean_latency_ms,
  MAX(latency_ms) AS peak_latency_ms,
  ROUND(AVG(cpu_pct), 1) AS avg_cpu_pct
FROM telemetry_logs
WHERE latency_ms > 25
GROUP BY region
ORDER BY mean_latency_ms ASC;
\`\`\`

---

## ⚡ 2. High-Frequency Fintech Volume-Weighted Analysis

Switch the dataset to \`fintech_orders\` to analyze volume-weighted average price (VWAP) across major tickers:

\`\`\`duckdb
SELECT 
  ticker,
  exchange,
  COUNT(*) AS order_count,
  SUM(volume) AS total_shares,
  ROUND(AVG(price_usd), 2) AS avg_execution_price,
  ROUND(SUM(fee_usd), 2) AS total_fees_paid
FROM fintech_orders
WHERE volume > 200
GROUP BY ticker, exchange
ORDER BY total_shares DESC
LIMIT 20;
\`\`\`
`,
  },
];

const STORAGE_KEY = "selene_documents_v12";
const LEGACY_STORAGE_KEYS = [
  "selene_documents_v11",
  "selene_documents_v10",
  "selene_documents_v9",
  "selene_documents_v8",
  "selene_documents_v7",
  "selene_documents_v6",
  "selene_documents_v5",
  "selene_documents_v4",
  "selene_documents_v3",
  "selene_documents_v2",
  "selene_documents_v1",
];

export function getDocumentFolder(doc: { id?: string | null; folder?: string | null }): string {
  if (doc.folder) return doc.folder;
  const id = doc.id || "";
  if (
    id.startsWith("doc-starter") ||
    id.startsWith("doc-sample") ||
    id === "doc-architecture" ||
    id === "doc-ui-playground" ||
    id === "doc-api-rfc" ||
    id === "doc-angular-showcase" ||
    id === "doc-flutter-showcase" ||
    id === "doc-python-datascience" ||
    id === "doc-laravel-showcase" ||
    id === "doc-rails-showcase" ||
    id === "doc-go-showcase" ||
    id === "doc-django-showcase" ||
    id === "doc-rust-showcase" ||
    id === "doc-sql-showcase" ||
    id === "doc-shader-showcase" ||
    id === "doc-chart-showcase" ||
    id === "doc-duckdb-showcase" ||
    id.startsWith("sample-")
  ) {
    return "samples";
  }
  return "documents";
}

export function loadDocuments(): DocumentItem[] {
  if (typeof window === "undefined") return STARTER_TEMPLATES;
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        raw = localStorage.getItem(legacyKey);
        if (raw) break;
      }
    }

    if (!raw) {
      saveDocuments(STARTER_TEMPLATES);
      return STARTER_TEMPLATES;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveDocuments(STARTER_TEMPLATES);
      return STARTER_TEMPLATES;
    }

    // Ensure all items have valid titles, icons, and a folder assigned
    const mapped: DocumentItem[] = parsed.map((doc: DocumentItem) => ({
      ...doc,
      title: doc.title && doc.title.trim() ? doc.title : "Untitled Document",
      icon: doc.icon && doc.icon.trim() ? doc.icon : "📄",
      folder: getDocumentFolder(doc),
    }));

    // Ensure built-in starter templates are present in samples/
    const existingIds = new Set(mapped.map((d) => d.id));
    const missingStarters = STARTER_TEMPLATES.filter((s) => !existingIds.has(s.id));
    const finalDocs = missingStarters.length > 0 ? [...missingStarters, ...mapped] : mapped;

    saveDocuments(finalDocs);
    return finalDocs;
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
