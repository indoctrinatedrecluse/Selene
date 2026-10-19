import { Editor, Range } from "@tiptap/core";
import {
  Sparkles,
  SquareCode,
  GitGraph,
  Sigma,
  AlertCircle,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Flame,
  LayoutTemplate,
  Zap,
  Shield,
  Smartphone,
  Presentation,
  Terminal,
  Database,
  BarChart2,
  Code2,
  Cpu,
  Send,
  Wind,
} from "lucide-react";

export interface CommandItem {
  title: string;
  description: string;
  category:
    | "Hephaestus's Living Sandboxes"
    | "Daedalus & Archimedes (Vector & Math)"
    | "Calliope's Sacred Typography"
    | "Delphic Oracles & Admonitions";
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  command: (params: { editor: Editor; range: Range }) => void;
}

export const SLASH_COMMANDS: CommandItem[] = [
  // --- Hephaestus's Living Sandboxes ---
  {
    title: "Forge of Hephaestus (React + Tailwind)",
    description: "Interactive React 19 + Tailwind component with live HMR & zero CSS bleed",
    category: "Hephaestus's Living Sandboxes",
    badge: "TSX",
    icon: Sparkles,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`tsx\nexport function Widget() {\n  const [count, setCount] = React.useState(0);\n  return (\n    <div className="p-4 bg-slate-900 rounded-xl border border-sky-500/30 text-white space-y-2">\n      <h4 className="font-semibold text-sky-400">Interactive Component</h4>\n      <button\n        onClick={() => setCount(c => c + 1)}\n        className="px-3 py-1 bg-sky-500 text-xs rounded-lg font-medium hover:bg-sky-400 transition-colors cursor-pointer"\n      >\n        Count: {count}\n      </button>\n    </div>\n  );\n}\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Phoenix of Olympus (Elixir LiveView HEEx)",
    description: "BEAM assigns (@cluster), Phoenix Core Components & phx-click reactivity",
    category: "Hephaestus's Living Sandboxes",
    badge: "HEEx",
    icon: Flame,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`heex\n<div class="p-5 bg-[#090d1d] rounded-2xl border border-purple-500/40 text-slate-100 space-y-4">\n  <div class="flex items-center justify-between">\n    <h3 class="text-sm font-bold text-purple-300">🔥 Phoenix of Olympus Node</h3>\n    <.badge variant="phoenix">BEAM Nominal</.badge>\n  </div>\n  <p class="text-xs text-slate-300">Cluster: <%= @cluster %> • Active Workers: <%= @active_workers %></p>\n  <button phx-click="rebalance" class="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md cursor-pointer">\n    Rebalance Workers\n  </button>\n</div>\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Zephyr Swift Canvas (Apple SwiftUI)",
    description: "Multiplatform SwiftUI views with @State, SF symbols & Cupertino styling",
    category: "Hephaestus's Living Sandboxes",
    badge: "SwiftUI",
    icon: Wind,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`swiftui\nstruct CelestialDashboardView: View {\n    @State private var telemetryActive = true\n    @State private var orbitalVelocity = 7.68\n\n    var body: some View {\n        VStack(alignment: .leading, spacing: 14) {\n            HStack {\n                Image(systemName: "moon.stars.fill")\n                    .foregroundStyle(.cyan)\n                Text("Zephyr Orbital Station")\n                    .font(.headline)\n                    .fontWeight(.bold)\n                Spacer()\n                Toggle("Telemetry", isOn: $telemetryActive)\n                    .labelsHidden()\n            }\n            Text("Velocity: \\(String(format: "%.2f", orbitalVelocity)) km/s")\n                .font(.subheadline)\n                .foregroundStyle(.secondary)\n        }\n        .padding(16)\n        .background(Color(white: 0.1))\n        .cornerRadius(16)\n    }\n}\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Hermes Relay (API & GraphQL Client)",
    description: "Interactive HTTP, REST, cURL & GraphQL playground with latency telemetry",
    category: "Hephaestus's Living Sandboxes",
    badge: "HTTP",
    icon: Send,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`http\nPOST https://api.olympus.celestial/v1/telemetry\nContent-Type: application/json\nAuthorization: Bearer selene_lunar_key_99\n\n{\n  "station": "Selene-Alpha",\n  "status": "operational",\n  "coordinates": { "lat": 24.1, "lng": 89.4 }\n}\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Live Vue 3 Sandbox",
    description: "Single File Component with isolated preview and Composition API",
    category: "Hephaestus's Living Sandboxes",
    badge: "Vue",
    icon: Flame,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`vue\n<template>\n  <div class="p-4 bg-slate-900 rounded-xl border border-emerald-500/30 text-white">\n    <h3 class="text-emerald-400 font-bold">Vue 3 Live Preview</h3>\n    <p class="text-sm text-slate-300">Count: {{ count }}</p>\n    <button @click="count++" class="mt-2 px-3 py-1 bg-emerald-600 rounded text-xs font-semibold cursor-pointer">\n      Increment\n    </button>\n  </div>\n</template>\n\n<script setup>\nimport { ref } from 'vue';\nconst count = ref(0);\n</script>\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Live Svelte Sandbox",
    description: "Compile-time reactive Svelte component with scoped CSS",
    category: "Hephaestus's Living Sandboxes",
    badge: "Svelte",
    icon: Zap,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`svelte\n<script>\n  let count = 0;\n  $: doubled = count * 2;\n</script>\n\n<div class="p-4 bg-slate-900 rounded-xl border border-orange-500/30 text-white">\n  <h3 class="text-orange-400 font-bold">Svelte Live Preview</h3>\n  <p class="text-sm text-slate-300">Count: {count} ({doubled}x)</p>\n  <button on:click={() => count++} class="mt-2 px-3 py-1 bg-orange-600 hover:bg-orange-500 rounded text-xs font-semibold cursor-pointer">\n    Increment\n  </button>\n</div>\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Live Angular Sandbox",
    description: "Angular Ivy component with two-way binding & scoped styles",
    category: "Hephaestus's Living Sandboxes",
    badge: "Angular",
    icon: Shield,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`angular\nimport { Component } from "@angular/core";\n\n@Component({\n  selector: "app-root",\n  template: \\\`\n    <div class="p-4 bg-slate-900 rounded-xl border border-rose-500/30 text-white">\n      <h3 class="text-rose-400 font-bold">Angular Ivy Live Preview</h3>\n      <p class="text-sm text-slate-300">Clicks: {{ count }}</p>\n      <button (click)="increment()" class="mt-2 px-3 py-1 bg-rose-600 hover:bg-rose-500 rounded text-xs font-semibold cursor-pointer">\n        Click Me\n      </button>\n    </div>\n  \\\`,\n})\nexport class AppComponent {\n  count = 0;\n  increment() {\n    this.count++;\n  }\n}\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Live Flutter Web Sandbox",
    description: "Material 3 / Cupertino widget running via CanvasKit WASM",
    category: "Hephaestus's Living Sandboxes",
    badge: "Flutter",
    icon: Smartphone,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`flutter\nimport 'package:flutter/material.dart';\n\nvoid main() => runApp(const MyApp());\n\nclass MyApp extends StatelessWidget {\n  const MyApp({super.key});\n\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      debugShowCheckedModeBanner: false,\n      theme: ThemeData.dark(),\n      home: Scaffold(\n        body: Center(\n          child: Container(\n            padding: const EdgeInsets.all(20),\n            decoration: BoxDecoration(\n              color: const Color(0xFF0F172A),\n              borderRadius: BorderRadius.circular(16),\n              border: Border.all(color: const Color(0xFF0284C7)),\n            ),\n            child: const Text(\n              'Flutter Web Live Canvas',\n              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),\n            ),\n          ),\n        ),\n      ),\n    );\n  }\n}\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Live Vanilla HTML/CSS",
    description: "Raw HTML & Tailwind markup with instant preview",
    category: "Hephaestus's Living Sandboxes",
    badge: "HTML",
    icon: LayoutTemplate,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`html\n<div class="p-6 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl text-white shadow-xl">\n  <h2 class="text-xl font-bold">Modern Web Canvas</h2>\n  <p class="text-sm text-sky-100 mt-1">Rendered with Tailwind runtime inside an isolated sandbox.</p>\n</div>\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Pythian Python WASM Cell",
    description: "Interactive Python notebook with NumPy & Matplotlib in WebAssembly",
    category: "Hephaestus's Living Sandboxes",
    badge: "Python",
    icon: Terminal,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`python\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# Lunar Orbital Mechanics Simulation\ntheta = np.linspace(0, 2 * np.pi, 500)\nr_moon = 8.0\nt = np.linspace(0, 10, 500)\nx = 4 * np.cos(t) + 3.5 * np.cos(3 * t)\ny = 2.5 * np.sin(t) - 2.0 * np.sin(2 * t)\n\nfig, ax = plt.subplots(figsize=(6, 4))\nax.scatter([0], [0], color='#38bdf8', s=300, label='Earth')\nax.scatter([r_moon * np.cos(1.2)], [r_moon * np.sin(1.2)], color='#fbbf24', s=150, label='Moon (Selene)')\nax.plot(x, y, color='#a855f7', linewidth=2, label='Transfer Orbit')\nax.plot(r_moon * np.cos(theta), r_moon * np.sin(theta), '--', color='#475569', alpha=0.5)\nax.set_title("Selene Trans-Lunar Injection", fontsize=11, fontweight='bold')\nax.legend(loc='upper right', fontsize=8)\nax.grid(True, linestyle=':', alpha=0.3)\nplt.tight_layout()\nplt.show()\n\nprint("✓ Orbital delta-V computation complete.")\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Live Laravel Blade Sandbox",
    description: "PHP 8.3 & Laravel 11 Blade directives with Alpine.js & Tailwind",
    category: "Hephaestus's Living Sandboxes",
    badge: "PHP",
    icon: Code2,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`blade\n@php\n  $service = "Selene Blade Gateway";\n  $status = "nominal";\n@endphp\n\n<div x-data="{ count: 42 }" class="p-5 bg-slate-900 rounded-xl border border-red-500/30 text-white space-y-3">\n  <div class="flex items-center justify-between">\n    <h4 class="font-bold text-red-400">{{ $service }}</h4>\n    <span class="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">{{ strtoupper($status) }}</span>\n  </div>\n  <button @click="count++" class="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs font-semibold cursor-pointer">\n    ⚡ Increment: <span x-text="count"></span>\n  </button>\n</div>\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Live Ruby on Rails Sandbox",
    description: "Ruby 3.3 & Rails 8 ERB scriptlet engine with Turbo Frames",
    category: "Hephaestus's Living Sandboxes",
    badge: "Rails",
    icon: Flame,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`erb\n<%\n  @title = "Lunar Telemetry Node"\n  @metric = 94.2\n%>\n\n<div class="p-5 bg-slate-900 rounded-xl border border-rose-500/30 text-white space-y-2">\n  <h4 class="font-bold text-rose-400"><%= @title %></h4>\n  <p class="text-xs text-slate-300">Throughput: <%= number_to_percentage(@metric, precision: 1) %></p>\n</div>\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Live Go Template Sandbox",
    description: "Go 1.23 html/template & Hugo pipeline filter engine",
    category: "Hephaestus's Living Sandboxes",
    badge: "Go",
    icon: Cpu,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`go\n{{/* Context: { "Cluster": "Alpha-Centauri", "Health": "healthy" } */}}\n\n<div class="p-5 bg-slate-900 rounded-xl border border-cyan-500/30 text-white space-y-2">\n  <h4 class="font-bold text-cyan-400">{{ .Cluster }}</h4>\n  <span class="text-xs font-mono text-emerald-400">{{ upper .Health }}</span>\n</div>\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Live Django / Jinja Sandbox",
    description: "Python 3.12 Django & Jinja2 template tags & filters",
    category: "Hephaestus's Living Sandboxes",
    badge: "Django",
    icon: Terminal,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`django\n{# Context: { "service": "Authentication Core", "status": "active" } #}\n\n<div class="p-5 bg-slate-900 rounded-xl border border-emerald-500/30 text-white space-y-2">\n  <h4 class="font-bold text-emerald-400">{{ service }}</h4>\n  <span class="text-xs font-mono text-emerald-300">{{ status|upper }}</span>\n</div>\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Live Rust WASM Sandbox",
    description: "Rust WebAssembly (Yew & Leptos) reactive component",
    category: "Hephaestus's Living Sandboxes",
    badge: "Rust",
    icon: Cpu,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`rust\nuse yew::prelude::*;\n\n#[function_component(App)]\npub fn app() -> Html {\n    html! {\n        <div class="p-5 bg-slate-900 rounded-xl border border-amber-500/30 text-white space-y-2">\n            <h4 class="font-bold text-amber-400">{ "Rust WebAssembly Kernel" }</h4>\n            <p class="text-xs text-slate-400">{ "Zero GC Overhead • Memory Safe" }</p>\n        </div>\n    }\n}\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Relational Agora (SQL Data Studio)",
    description: "In-browser relational query engine with live grid filtering",
    category: "Hephaestus's Living Sandboxes",
    badge: "SQL",
    icon: Database,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`sql\nSELECT \n  id, \n  name, \n  target_celestial_body, \n  budget_millions_usd, \n  status \nFROM celestial_missions \nWHERE status = 'active'\nORDER BY budget_millions_usd DESC;\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Columnar Agora (DuckDB Analytical OLAP)",
    description: "Sub-10ms in-browser columnar vector processing (OLAP)",
    category: "Hephaestus's Living Sandboxes",
    badge: "DuckDB",
    icon: Database,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`duckdb\nSELECT \n  region,\n  COUNT(*) AS total_requests,\n  ROUND(AVG(latency_ms), 2) AS avg_latency_ms,\n  ROUND(AVG(cpu_pct), 1) AS avg_cpu_pct\nFROM telemetry_logs\nGROUP BY region\nORDER BY avg_latency_ms ASC;\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Iris's Prismatic Shaders (GLSL WebGL)",
    description: "Hardware-accelerated GLSL fragment shader with uniforms",
    category: "Hephaestus's Living Sandboxes",
    badge: "GLSL",
    icon: Sparkles,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`glsl\nprecision mediump float;\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution.xy;\n  vec3 col = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0, 2, 4));\n  gl_FragColor = vec4(col, 1.0);\n}\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Standard Code Block",
    description: "Syntax highlighted source code snippet",
    category: "Hephaestus's Living Sandboxes",
    icon: SquareCode,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleCodeBlock({ language: "typescript" })
        .run();
    },
  },

  // --- Daedalus & Archimedes (Vector & Math) ---
  {
    title: "Daedalus's Blueprint (Mermaid Diagram)",
    description: "Flowcharts, sequence charts, and architectural diagrams",
    category: "Daedalus & Archimedes (Vector & Math)",
    badge: "SVG",
    icon: GitGraph,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`mermaid\nflowchart TD\n    A[Client Request] --> B[API Gateway]\n    B --> C{Authentication}\n    C -->|Valid| D[Microservice Engine]\n    C -->|Invalid| E[401 Unauthorized]\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Archimedes' Lemma (LaTeX KaTeX Formula)",
    description: "Sub-millisecond mathematical typesetting with KaTeX",
    category: "Daedalus & Archimedes (Vector & Math)",
    badge: "TeX",
    icon: Sigma,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`math\n\\oint_{\\partial \\Sigma} \\mathbf{B} \\cdot d\\boldsymbol{\\ell} = \\mu_0 \\left( I_{\\text{enc}} + \\varepsilon_0 \\frac{d\\Phi_E}{dt} \\right)\n\`\`\`\n`
        )
        .run();
    },
  },
  {
    title: "Declarative Vector Chart",
    description: "Pure SVG multi-series visualization (bar, line, area, donut)",
    category: "Daedalus & Archimedes (Vector & Math)",
    badge: "Chart",
    icon: BarChart2,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(
          `\`\`\`chart\n{\n  "type": "area",\n  "title": "Mission Telemetry Throughput",\n  "xKey": "quarter",\n  "yKey": ["telemetry", "uplink"],\n  "colors": ["#38bdf8", "#818cf8"],\n  "data": [\n    { "quarter": "Q1", "telemetry": 140, "uplink": 90 },\n    { "quarter": "Q2", "telemetry": 260, "uplink": 150 },\n    { "quarter": "Q3", "telemetry": 420, "uplink": 230 },\n    { "quarter": "Q4", "telemetry": 680, "uplink": 380 }\n  ]\n}\n\`\`\`\n`
        )
        .run();
    },
  },

  // --- Delphic Oracles & Admonitions ---
  {
    title: "Apollo's Note Callout",
    description: "Highlighted informational celestial note box",
    category: "Delphic Oracles & Admonitions",
    badge: "Cyan",
    icon: AlertCircle,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCallout({ type: "note" })
        .insertContent("Informational note details go here...")
        .run();
    },
  },
  {
    title: "Athena's Tip Callout",
    description: "Divine architectural wisdom and performance recommendation",
    category: "Delphic Oracles & Admonitions",
    badge: "Emerald",
    icon: AlertCircle,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCallout({ type: "tip" })
        .insertContent("Pro-tip: Utilize isolated iframes to prevent CSS bleeding.")
        .run();
    },
  },
  {
    title: "Nemesis Warning Callout",
    description: "Cautionary advice, security hazards, or breaking changes",
    category: "Delphic Oracles & Admonitions",
    badge: "Amber",
    icon: AlertCircle,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCallout({ type: "warning" })
        .insertContent("Warning: Ensure all peer dependencies are compatible.")
        .run();
    },
  },

  // --- Calliope's Sacred Typography ---
  {
    title: "Major Epithet (Heading 1)",
    description: "Large top-level document heading",
    category: "Calliope's Sacred Typography",
    icon: Heading1,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: "Section Inscription (Heading 2)",
    description: "Medium section heading",
    category: "Calliope's Sacred Typography",
    icon: Heading2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: "Sub-section Inscription (Heading 3)",
    description: "Sub-section heading",
    category: "Calliope's Sacred Typography",
    icon: Heading3,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: "Olympian Task Checklist",
    description: "Interactive actionable to-do list",
    category: "Calliope's Sacred Typography",
    icon: CheckSquare,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Sacred Bullet List",
    description: "Unordered bulleted points",
    category: "Calliope's Sacred Typography",
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Ordered Sequence",
    description: "Sequential numbered points",
    category: "Calliope's Sacred Typography",
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Pythian Inscription (Blockquote)",
    description: "Quoted passage or callout citation",
    category: "Calliope's Sacred Typography",
    icon: Quote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Horizon Divider",
    description: "Visual horizontal line separator",
    category: "Calliope's Sacred Typography",
    icon: Minus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Dionysian Amphitheater (Slide Break)",
    description: "Inserts a slide break partition for interactive presentation mode",
    category: "Calliope's Sacred Typography",
    badge: "Slides",
    icon: Presentation,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];
