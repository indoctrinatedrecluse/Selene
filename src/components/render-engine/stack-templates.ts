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
  angular: `import { Component } from "@angular/core";

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
`,
  dart: `import 'package:flutter/material.dart';

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
                label: Text('Taps: $_counter (\${_counter * 10} pts)'),
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
`,
  blade: `@php
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

  <div class="grid grid-cols-2 gap-3 mb-4">
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
`,
  php: `@php
  $cluster = "Artemis-Prime-04";
  $uptime = "99.98%";
  $memoryUsage = "4.2 GB / 16 GB";
  $status = "optimal";
@endphp

<div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-red-500/30 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-base font-bold text-white">{{ $cluster }}</h3>
    <span class="text-xs font-mono text-emerald-400">{{ strtoupper($status) }}</span>
  </div>
  <p class="text-xs text-slate-400 mb-2">Memory: {{ $memoryUsage }}</p>
  <p class="text-xs text-slate-400">Uptime: {{ $uptime }}</p>
</div>
`,
  laravel: `@php
  $cluster = "Artemis-Prime-04";
  $uptime = "99.98%";
  $memoryUsage = "4.2 GB / 16 GB";
  $status = "optimal";
@endphp

<div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-red-500/30 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-base font-bold text-white">{{ $cluster }}</h3>
    <span class="text-xs font-mono text-emerald-400">{{ strtoupper($status) }}</span>
  </div>
  <p class="text-xs text-slate-400 mb-2">Memory: {{ $memoryUsage }}</p>
  <p class="text-xs text-slate-400">Uptime: {{ $uptime }}</p>
</div>
`,
  erb: `<%
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
    <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
      <div>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span><%= @cluster %></span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <%= @status.upcase %>
          </span>
        </h3>
        <p class="text-xs text-rose-400/90 font-mono">Rails 8.0 • Hotwire & Turbo Frames</p>
      </div>
      <div class="text-right">
        <span class="text-xs font-mono text-rose-400 font-semibold"><%= @uptime %></span>
      </div>
    </div>

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
  </div>
<% end %>
`,
  rails: `<%
  @cluster = "Olympus-Rails-08"
  @uptime = "99.99%"
  @mrr = 28450.00
  @status = "optimal"
%>

<div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-rose-500/30 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-base font-bold text-white"><%= @cluster %></h3>
    <span class="text-xs font-mono text-emerald-400"><%= @status.upcase %></span>
  </div>
  <p class="text-xs text-slate-400 mb-2">Run Rate: <%= number_to_currency(@mrr) %></p>
  <p class="text-xs text-slate-400">Uptime: <%= @uptime %></p>
</div>
`,
  ruby: `<%
  @cluster = "Olympus-Rails-08"
  @uptime = "99.99%"
  @mrr = 28450.00
  @status = "optimal"
%>

<div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-rose-500/30 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-base font-bold text-white"><%= @cluster %></h3>
    <span class="text-xs font-mono text-emerald-400"><%= @status.upcase %></span>
  </div>
  <p class="text-xs text-slate-400 mb-2">Run Rate: <%= number_to_currency(@mrr) %></p>
  <p class="text-xs text-slate-400">Uptime: <%= @uptime %></p>
</div>
`,
};

export function getTemplateForLanguage(lang: string = "tsx"): SandpackPredefinedTemplate {
  const normalized = lang.toLowerCase();
  switch (normalized) {
    case "angular":
      return "angular";
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

  if (normalized === "angular") {
    const isComponentTs = code.includes("@Component");
    const compTs = isComponentTs ? code : DEFAULT_SNIPPETS_BY_LANG.angular;

    const angularIndexHtml = `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <title>Selene Angular Live</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 1.5rem;
      background-color: #0b0f19;
      color: #f8fafc;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
    }
    app-root {
      display: block;
      width: 100%;
    }
  </style>
</head>
<body>
  <app-root></app-root>
</body>
</html>`;

    return {
      "/src/app/app.component.ts": compTs,
      "/src/index.html": angularIndexHtml,
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
