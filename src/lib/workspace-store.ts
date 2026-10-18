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
];

const STORAGE_KEY = "selene_documents_v7";
const LEGACY_STORAGE_KEY = "selene_documents_v6";

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
      // Check legacy v6 storage
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
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
