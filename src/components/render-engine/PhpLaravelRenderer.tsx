"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Code2,
  Eye,
  Columns,
  Copy,
  Check,
  Server,
  Zap,
  SlidersHorizontal,
} from "lucide-react";
import { UniversalPropertyInspector } from "./UniversalPropertyInspector";
import { applyVisualProps, UniversalVisualProps } from "@/lib/ast-transformer";

export type PhpDevicePreset = "desktop" | "iphone" | "tablet";
export type PhpViewMode = "split" | "canvas" | "code";
export type PhpEngineMode = "blade-engine" | "artisan-server";

interface PhpLaravelRendererProps {
  initialCode?: string;
  className?: string;
  defaultEngineMode?: PhpEngineMode;
  localServerPort?: number;
  onCodeChange?: (newCode: string) => void;
}

export const PHP_LARAVEL_PRESETS: Record<string, { label: string; code: string }> = {
  telemetry_card: {
    label: "⚡ Laravel Metric Card (Blade + Alpine.js)",
    code: `@php
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
  {{-- Header with Laravel Branding --}}
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

    {{-- Interactive Button --}}
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
`,
  },
  eloquent_collection: {
    label: "📦 Eloquent Collection Table (Blade @foreach)",
    code: `@php
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
`,
  },
};

/**
 * Lightweight in-browser Blade compiler:
 * Compiles @php, {{ }}, {!! !!}, @if, @foreach, and injects Tailwind CSS + Alpine.js.
 */
function compileBladeToHtml(template: string): string {
  try {
    let source = template;
    const phpScope: Record<string, unknown> = {};

    // 1. Extract and evaluate @php ... @endphp blocks safely
    source = source.replace(/@php([\s\S]*?)@endphp/g, (_, phpCode) => {
      // Parse variable declarations like: $var = "value"; or $var = [...];
      const varMatches = phpCode.matchAll(/\$([a-zA-Z0-9_]+)\s*=\s*([^;]+);/g);
      for (const m of varMatches) {
        const varName = m[1];
        const rawVal = m[2].trim();

        try {
          // Normalize PHP array syntax ['a' => 1] to JSON-compatible {"a": 1}
          if (rawVal.startsWith("[") && rawVal.endsWith("]")) {
            let jsonLike = rawVal
              .replace(/=>/g, ":")
              .replace(/'/g, '"')
              .replace(/\[/g, "{")
              .replace(/\]/g, "}");
            // Handle lists vs associative arrays
            if (!rawVal.includes("=>")) {
              jsonLike = rawVal.replace(/'/g, '"');
            }
            phpScope[varName] = JSON.parse(jsonLike);
          } else if (rawVal.startsWith('"') || rawVal.startsWith("'")) {
            phpScope[varName] = rawVal.slice(1, -1);
          } else if (!isNaN(Number(rawVal))) {
            phpScope[varName] = Number(rawVal);
          } else if (rawVal === "true") {
            phpScope[varName] = true;
          } else if (rawVal === "false") {
            phpScope[varName] = false;
          }
        } catch {
          // Fallback literal
          phpScope[varName] = rawVal.replace(/['"]/g, "");
        }
      }
      return "";
    });

    // 2. Process Blade loops: @foreach ($collection as $item) ... @endforeach
    source = source.replace(/@foreach\s*\(\s*\$([a-zA-Z0-9_]+)\s+as\s+\$([a-zA-Z0-9_]+)\s*\)([\s\S]*?)@endforeach/g, (_, colName, itemName, loopBody) => {
      const collection = phpScope[colName];
      if (!Array.isArray(collection)) return "";

      return collection
        .map((item) => {
          let renderedItem = loopBody;
          // Replace $item['prop']
          renderedItem = renderedItem.replace(
            new RegExp(`{{\\s*\\$${itemName}\\['([a-zA-Z0-9_]+)'\\]\\s*}}`, "g"),
            (__: string, prop: string) => item[prop] ?? ""
          );
          // Replace conditional expressions in @if
          renderedItem = renderedItem.replace(
            new RegExp(`@if\\s*\\(\\s*\\$${itemName}\\['([a-zA-Z0-9_]+)'\\]\\s*===\\s*['"]([^'"]+)['"]\\s*\\)([\\s\\S]*?)(?:@elseif|@else|@endif)`, "g"),
            (__: string, prop: string, targetVal: string, innerContent: string) => {
              return item[prop] === targetVal ? innerContent : "";
            }
          );
          return renderedItem;
        })
        .join("");
    });

    // 3. Process Blade conditionals: @if ... @else ... @endif
    source = source.replace(/@if\s*\((.*?)\)([\s\S]*?)(?:@else([\s\S]*?))?@endif/g, (_, cond, ifBranch, elseBranch) => {
      return ifBranch || elseBranch || "";
    });

    // 4. Process Blade expressions: {{ count($var) }}
    source = source.replace(/{{\s*count\(\$([a-zA-Z0-9_]+)\)\s*}}/g, (_, vName) => {
      const val = phpScope[vName];
      return Array.isArray(val) ? String(val.length) : "0";
    });

    // 5. Process Blade string transformations: {{ strtoupper($var) }}
    source = source.replace(/{{\s*strtoupper\(\$([a-zA-Z0-9_]+)\)\s*}}/g, (_, vName) => {
      const val = phpScope[vName];
      return typeof val === "string" ? val.toUpperCase() : String(val || "");
    });

    // 6. Process standard interpolated expressions: {{ $var }}
    source = source.replace(/{{\s*\$([a-zA-Z0-9_]+)\s*}}/g, (_, vName) => {
      return phpScope[vName] !== undefined ? String(phpScope[vName]) : "";
    });

    // 7. Strip Blade comments: {{-- comment --}}
    source = source.replace(/{{--[\s\S]*?--}}/g, "");

    return source.trim();
  } catch (err) {
    console.error("Blade compilation error:", err);
    return `<div class="p-4 bg-red-950/40 text-red-300 rounded-lg">Blade Compile Error: ${String(err)}</div>`;
  }
}

export function PhpLaravelRenderer({
  initialCode,
  className = "",
  defaultEngineMode = "blade-engine",
  localServerPort = 8000,
  onCodeChange,
}: PhpLaravelRendererProps) {
  const codeToUse = initialCode || PHP_LARAVEL_PRESETS.telemetry_card.code;
  const [code, setCode] = useState(codeToUse);
  const [device, setDevice] = useState<PhpDevicePreset>("desktop");
  const [viewMode, setViewMode] = useState<PhpViewMode>("split");
  const [engineMode, setEngineMode] = useState<PhpEngineMode>(defaultEngineMode);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleApplyVisualProps = (newProps: UniversalVisualProps) => {
    const patched = applyVisualProps(code, "blade", newProps);
    setCode(patched);
    if (onCodeChange) onCodeChange(patched);
  };

  // Sync prop changes without effect cascading renders
  const [prevInitialCode, setPrevInitialCode] = useState(initialCode);
  if (initialCode !== prevInitialCode) {
    setPrevInitialCode(initialCode);
    if (initialCode) {
      setCode(initialCode);
    }
  }

  // Ping local artisan server if in artisan mode
  useEffect(() => {
    if (engineMode !== "artisan-server") return;
    let isMounted = true;

    async function checkServer() {
      try {
        await fetch(`http://localhost:${localServerPort}`, { mode: "no-cors" });
        if (isMounted) setServerOnline(true);
      } catch {
        if (isMounted) setServerOnline(false);
      }
    }

    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [engineMode, localServerPort]);

  // Render iframe content when code or mode changes
  const updateIframeContent = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (engineMode === "artisan-server") {
      iframe.src = `http://localhost:${localServerPort}`;
      return;
    }

    const compiledBody = compileBladeToHtml(code);
    const fullHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 1.5rem;
      background-color: #070B14;
      color: #F8FAFC;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  ${compiledBody}
</body>
</html>`;

    iframe.srcdoc = fullHtml;
  }, [code, engineMode, localServerPort]);

  useEffect(() => {
    updateIframeContent();
  }, [updateIframeContent]);

  const handleCodeEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setCode(next);
    if (onCodeChange) onCodeChange(next);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    setIsRefreshing(true);
    updateIframeContent();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSelectPreset = (key: string) => {
    const preset = PHP_LARAVEL_PRESETS[key];
    if (preset) {
      setCode(preset.code);
      if (onCodeChange) onCodeChange(preset.code);
    }
  };

  const deviceWidthMap: Record<PhpDevicePreset, string> = {
    desktop: "w-full",
    tablet: "w-[680px]",
    iphone: "w-[390px]",
  };

  return (
    <div className={`flex flex-col rounded-2xl border border-slate-800 bg-[#070b16] shadow-2xl overflow-hidden transition-all ${className}`}>
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#090e1d] border-b border-slate-800 gap-2">
        {/* Left: Branding & Presets */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>PHP 8.3 • Laravel Blade</span>
          </div>

          {/* Preset Selector */}
          <select
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
          >
            {Object.entries(PHP_LARAVEL_PRESETS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Engine Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setEngineMode("blade-engine")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "blade-engine"
                ? "bg-red-600 text-white shadow-sm font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="In-Browser Blade + Alpine.js execution engine"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Blade Engine</span>
          </button>
          <button
            type="button"
            onClick={() => setEngineMode("artisan-server")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "artisan-server"
                ? "bg-red-600 text-white shadow-sm font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title={`Connect to local artisan serve on port ${localServerPort}`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Artisan Serve</span>
            <span className={`w-1.5 h-1.5 rounded-full ${serverOnline ? "bg-emerald-400" : "bg-amber-400"}`}></span>
          </button>
        </div>

        {/* Right: View & Device Switchers */}
        <div className="flex items-center gap-1.5">
          {/* Device Preset Switcher (Active in canvas & split) */}
          {viewMode !== "code" && (
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`p-1.5 rounded-md ${device === "desktop" ? "bg-slate-800 text-red-400" : "text-slate-400 hover:text-white"}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("tablet")}
                className={`p-1.5 rounded-md ${device === "tablet" ? "bg-slate-800 text-red-400" : "text-slate-400 hover:text-white"}`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("iphone")}
                className={`p-1.5 rounded-md ${device === "iphone" ? "bg-slate-800 text-red-400" : "text-slate-400 hover:text-white"}`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("canvas")}
              className={`p-1.5 rounded-md ${viewMode === "canvas" ? "bg-slate-800 text-red-400" : "text-slate-400 hover:text-white"}`}
              title="Canvas Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-md ${viewMode === "split" ? "bg-slate-800 text-red-400" : "text-slate-400 hover:text-white"}`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={`p-1.5 rounded-md ${viewMode === "code" ? "bg-slate-800 text-red-400" : "text-slate-400 hover:text-white"}`}
              title="Code Only"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tweak Props Button (Visual Property Inspector) */}
          <button
            type="button"
            onClick={() => setShowInspector(!showInspector)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              showInspector
                ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Toggle Visual Property Controls (No-Code)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-red-400" />
            <span>Tweak Props</span>
          </button>

          {/* Reload Button */}
          <button
            type="button"
            onClick={handleReload}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Recompile Blade Template"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-red-400" : ""}`} />
          </button>

          {/* Copy Snippet Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Copy Blade Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Universal No-Code Visual Property Inspector */}
      <UniversalPropertyInspector
        isOpen={showInspector}
        onClose={() => setShowInspector(false)}
        code={code}
        language="blade"
        onApplyToProps={handleApplyVisualProps}
      />

      {/* Main Execution Body */}
      <div className="flex-1 flex overflow-hidden min-h-[440px]">
        {/* Code Editor Pane (Split or Code View) */}
        {(viewMode === "split" || viewMode === "code") && (
          <div className={`${viewMode === "split" ? "w-1/2 border-r border-slate-800" : "w-full"} flex flex-col bg-[#060a14]`}>
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/60 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span>resources/views/components/dashboard.blade.php</span>
              <span className="text-red-400">Blade Active</span>
            </div>
            <textarea
              value={code}
              onChange={handleCodeEdit}
              spellCheck={false}
              className="flex-1 p-4 bg-transparent font-mono text-xs text-slate-200 resize-none focus:outline-none leading-relaxed selection:bg-red-500/30 overflow-y-auto"
            />
          </div>
        )}

        {/* Live Canvas Preview Pane (Split or Canvas View) */}
        {(viewMode === "split" || viewMode === "canvas") && (
          <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} flex flex-col items-center justify-center p-4 bg-[#03060c] overflow-auto`}>
            <div className={`${deviceWidthMap[device]} h-full min-h-[380px] rounded-xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#070b14] flex flex-col transition-all duration-300`}>
              <iframe
                ref={iframeRef}
                title="Laravel Blade Live Preview"
                className="w-full h-full flex-1 border-none"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#090e1d] border-t border-slate-800 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span>Blade Parser v11.4</span>
          </span>
          <span>•</span>
          <span className="text-slate-500">Alpine.js v3.14 Active</span>
          <span>•</span>
          <span className="text-slate-500">Tailwind CSS v3.4</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span>Isolated Iframe Sandbox</span>
        </div>
      </div>
    </div>
  );
}
