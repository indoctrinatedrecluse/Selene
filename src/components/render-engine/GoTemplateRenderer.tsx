"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

export type GoDevicePreset = "desktop" | "iphone" | "tablet";
export type GoViewMode = "split" | "canvas" | "code";
export type GoEngineMode = "gotemplate-engine" | "go-server";

interface GoTemplateRendererProps {
  initialCode?: string;
  className?: string;
  defaultEngineMode?: GoEngineMode;
  localServerPort?: number;
  onCodeChange?: (newCode: string) => void;
}

export const GO_TEMPLATE_PRESETS: Record<string, { label: string; code: string }> = {
  telemetry_card: {
    label: "🐹 Go Microservice Telemetry (html/template)",
    code: `{{/* Context:
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
      <span class="text-sm font-bold font-mono text-white">{{ .Goroutines }} routines</span>
    </div>
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Ingestion Throughput</span>
      <span class="text-sm font-bold font-mono text-cyan-400">{{ .Throughput }}</span>
    </div>
  </div>

  {{/* Services Range Loop */}}
  <div class="space-y-2 mb-4">
    {{ range .Services }}
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-medium text-slate-200">{{ .Name }}</span>
          <span class="text-[10px] font-mono text-slate-500">:{{ .Port }}</span>
        </div>
        <span class="font-mono text-slate-400 text-[11px]">{{ .Latency }}</span>
      </div>
    {{ end }}
  </div>

  {{/* Interactive Dispatcher */}}
  <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
    <button
      id="dispatch-btn"
      class="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
    >
      <span>⚡ Dispatch Goroutine</span>
      <span id="goroutine-counter" class="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]">{{ .Goroutines }}</span>
    </button>
    <span id="dispatch-msg" class="text-xs text-emerald-400 font-mono">
      Channels Synced
    </span>
  </div>
</div>
`,
  },
  struct_collection: {
    label: "📦 Go Struct Range Table (range .Collection)",
    code: `{{/* Context:
{
  "Title": "github.com/selene/node/v2",
  "Nodes": [
    { "ID": "node-01", "Zone": "us-central1-a", "Arch": "linux/amd64", "Status": "ready", "Allocated": "2.1 GB" },
    { "ID": "node-02", "Zone": "us-central1-b", "Arch": "linux/amd64", "Status": "ready", "Allocated": "1.8 GB" },
    { "ID": "node-03", "Zone": "europe-west1-d", "Arch": "linux/arm64", "Status": "syncing", "Allocated": "3.4 GB" },
    { "ID": "node-04", "Zone": "asia-east1-a", "Arch": "linux/arm64", "Status": "ready", "Allocated": "980 MB" }
  ]
}
*/}}

<div class="p-6 max-w-xl mx-auto bg-slate-900 rounded-2xl border border-cyan-500/25 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-4">
    <div>
      <h3 class="text-base font-bold text-white">{{ .Title }}</h3>
      <p class="text-xs text-cyan-400/90 font-mono">Go html/template • Pipeline Range</p>
    </div>
    <span class="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
      {{ len .Nodes }} Nodes
    </span>
  </div>

  <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
    <table class="w-full text-left text-xs">
      <thead class="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
        <tr>
          <th class="p-3">Node ID</th>
          <th class="p-3">Zone</th>
          <th class="p-3">Architecture</th>
          <th class="p-3">Status</th>
          <th class="p-3 text-right">Memory</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800/60">
        {{ range .Nodes }}
          <tr class="hover:bg-slate-800/40 transition-colors">
            <td class="p-3 font-mono text-cyan-400 font-semibold">{{ .ID }}</td>
            <td class="p-3 text-slate-300 font-mono text-[11px]">{{ .Zone }}</td>
            <td class="p-3 font-mono text-slate-400">{{ .Arch }}</td>
            <td class="p-3">
              {{ if eq .Status "ready" }}
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">Ready</span>
              {{ else }}
                <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">Syncing</span>
              {{ end }}
            </td>
            <td class="p-3 text-right font-mono text-slate-300">{{ .Allocated }}</td>
          </tr>
        {{ end }}
      </tbody>
    </table>
  </div>
</div>
`,
  },
};

// Resolves a Go template expression (e.g. .Field, $item.Field, len .Collection, upper .Field)
function resolveGoExpression(expr: string, context: Record<string, unknown>): unknown {
  const trimmed = expr.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "nil") return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  // Helper functions: len, upper, lower
  const fnMatch = trimmed.match(/^(len|upper|lower)\s+(.+)$/);
  if (fnMatch) {
    const fn = fnMatch[1];
    const argVal = resolveGoExpression(fnMatch[2], context);
    if (fn === "len") {
      if (Array.isArray(argVal)) return argVal.length;
      if (typeof argVal === "string") return argVal.length;
      if (argVal && typeof argVal === "object") return Object.keys(argVal).length;
      return 0;
    }
    if (fn === "upper") {
      return typeof argVal === "string" ? argVal.toUpperCase() : String(argVal ?? "");
    }
    if (fn === "lower") {
      return typeof argVal === "string" ? argVal.toLowerCase() : String(argVal ?? "");
    }
  }

  // Field access: .Field or $var.Field
  const fieldMatch = trimmed.match(/^(?:\$([a-zA-Z0-9_]+)\.|\.)([a-zA-Z0-9_]+)$/);
  if (fieldMatch) {
    const varName = fieldMatch[1];
    const fieldName = fieldMatch[2];
    const targetObj = varName ? (context[varName] as Record<string, unknown>) : context;
    if (targetObj && typeof targetObj === "object") {
      // Look up exact match, lowercase, or capitalized
      const keys = Object.keys(targetObj);
      const matchedKey = keys.find((k) => k.toLowerCase() === fieldName.toLowerCase());
      if (matchedKey !== undefined) {
        return targetObj[matchedKey];
      }
    }
    return undefined;
  }

  // Direct variable access: $var or var
  const cleanVar = trimmed.replace(/^\$/, "");
  if (context[cleanVar] !== undefined) {
    return context[cleanVar];
  }

  return trimmed;
}

function evaluateGoCondition(condition: string, context: Record<string, unknown>): boolean {
  try {
    const cond = condition.trim();
    // Go template syntax: if eq .Status "ready" or if ne .Status "ready" or if gt .Count 5
    const compMatch = cond.match(/^(eq|ne|gt|lt|ge|le)\s+(\S+)\s+(.+)$/);
    if (compMatch) {
      const op = compMatch[1];
      const leftVal = resolveGoExpression(compMatch[2], context);
      const rightVal = resolveGoExpression(compMatch[3], context);

      if (op === "eq") return leftVal == rightVal;
      if (op === "ne") return leftVal != rightVal;
      if (op === "gt") return Number(leftVal) > Number(rightVal);
      if (op === "lt") return Number(leftVal) < Number(rightVal);
      if (op === "ge") return Number(leftVal) >= Number(rightVal);
      if (op === "le") return Number(leftVal) <= Number(rightVal);
    }
    const val = resolveGoExpression(cond, context);
    return Boolean(val);
  } catch {
    return false;
  }
}

function renderGoConditionals(text: string, context: Record<string, unknown>): string {
  // Matches {{ if ... }} ... {{ end }}
  const ifRegex = /{{\s*if\s+([\s\S]*?)\s*}}([\s\S]*?){{\s*end\s*}}/g;
  return text.replace(ifRegex, (_, firstCond, body) => {
    const chunks: { cond: string | null; content: string }[] = [];
    const branchRegex = /{{\s*(else\s+if\s+[\s\S]*?|else)\s*}}/g;
    let lastIndex = 0;
    let currentCond: string | null = firstCond;
    let match: RegExpExecArray | null;

    while ((match = branchRegex.exec(body)) !== null) {
      const branchContent = body.slice(lastIndex, match.index);
      chunks.push({ cond: currentCond, content: branchContent });
      lastIndex = match.index + match[0].length;
      if (match[1].startsWith("else if")) {
        const cMatch = match[1].match(/else\s+if\s+([\s\S]*)/);
        currentCond = cMatch ? cMatch[1] : "false";
      } else {
        currentCond = null;
      }
    }
    chunks.push({ cond: currentCond, content: body.slice(lastIndex) });

    for (const chunk of chunks) {
      if (chunk.cond === null) {
        return chunk.content;
      }
      if (evaluateGoCondition(chunk.cond, context)) {
        return chunk.content;
      }
    }
    return "";
  });
}

/**
 * Robust in-browser Go template compiler:
 * Compiles comments, {{ .Field }}, {{ range .Collection }}, multi-branch {{ if / else if / else }},
 * pipeline functions (len, upper, lower), and injects Tailwind CSS runtime.
 */
function compileGoTemplateToHtml(template: string): string {
  let source = template;
  let goContext: Record<string, unknown> = {};

  // 1. Extract JSON context comment if present: {{/* Context: { ... } */}}
  const contextMatch = source.match(/{{\/\*\s*[Cc]ontext:\s*([\s\S]*?)\*\/\}}/);
  if (contextMatch && contextMatch[1]) {
    try {
      goContext = JSON.parse(contextMatch[1]);
    } catch {
      goContext = {};
    }
  }

  // 2. Strip comments: {{/* ... */}}
  source = source.replace(/{{\/\*[\s\S]*?\*\/\}}/g, "");

  // 3. Process range loops: {{ range .Collection }} or {{ range $item := .Collection }}
  source = source.replace(
    /{{\s*range\s+(?:(?:\$[a-zA-Z0-9_]+\s*,\s*)?\$([a-zA-Z0-9_]+)\s*:=\s*)?\.([a-zA-Z0-9_]+)\s*}}([\s\S]*?){{\s*end\s*}}/g,
    (_: string, itemVar: string | undefined, colName: string, loopBody: string) => {
      // Find collection matching exact or lowercase
      const colKey = Object.keys(goContext).find((k) => k.toLowerCase() === colName.toLowerCase());
      const collection = colKey ? goContext[colKey] : undefined;
      if (!Array.isArray(collection)) return "";

      return collection
        .map((item: Record<string, unknown>) => {
          let rendered = loopBody;
          const itemScope: Record<string, unknown> = {
            ...goContext,
            ...item,
            ...(itemVar ? { [itemVar]: item } : {}),
          };

          // Conditionals inside loop
          rendered = renderGoConditionals(rendered, itemScope);

          // Interpolation inside loop: {{ .Field }} or {{ $item.Field }} or {{ upper .Field }}
          rendered = rendered.replace(/{{\s*([^}]+?)\s*}}/g, (__, expr) => {
            const val = resolveGoExpression(expr, itemScope);
            return val !== undefined ? String(val) : "";
          });

          return rendered;
        })
        .join("");
    }
  );

  // 4. Process outer conditionals
  source = renderGoConditionals(source, goContext);

  // 5. Process top-level interpolation: {{ .Field }}, {{ upper .Field }}, {{ len .Collection }}
  source = source.replace(/{{\s*([^}]+?)\s*}}/g, (_: string, expr: string) => {
    const val = resolveGoExpression(expr, goContext);
    return val !== undefined ? String(val) : "";
  });

  // 6. Clean up remaining unresolved Go template tags
  source = source.replace(/{{[\s\S]*?}}/g, "");

  return source.trim();
}

export function GoTemplateRenderer({
  initialCode,
  className = "",
  defaultEngineMode = "gotemplate-engine",
  localServerPort = 8080,
  onCodeChange,
}: GoTemplateRendererProps) {
  const codeToUse = initialCode || GO_TEMPLATE_PRESETS.telemetry_card.code;
  const [code, setCode] = useState(codeToUse);
  const [device, setDevice] = useState<GoDevicePreset>("desktop");
  const [viewMode, setViewMode] = useState<GoViewMode>("split");
  const [engineMode, setEngineMode] = useState<GoEngineMode>(defaultEngineMode);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleApplyVisualProps = (newProps: UniversalVisualProps) => {
    const patched = applyVisualProps(code, "go", newProps);
    setCode(patched);
    if (onCodeChange) onCodeChange(patched);
  };

  // Sync prop changes without cascading renders
  const [prevInitialCode, setPrevInitialCode] = useState(initialCode);
  if (initialCode !== prevInitialCode) {
    setPrevInitialCode(initialCode);
    if (initialCode) {
      setCode(initialCode);
    }
  }

  // Ping local Go server if in go-server mode
  useEffect(() => {
    if (engineMode !== "go-server") return;
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

  // Derive compilation result synchronously to avoid cascading render effects
  const { compiledBody, compileError } = useMemo(() => {
    if (engineMode === "go-server") {
      return { compiledBody: null, compileError: null };
    }
    try {
      const body = compileGoTemplateToHtml(code);
      return { compiledBody: body, compileError: null };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return { compiledBody: null, compileError: errMsg };
    }
  }, [code, engineMode]);

  // Synchronize compiled markup or error document to iframe DOM
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (engineMode === "go-server") {
      iframe.src = `http://localhost:${localServerPort}`;
      return;
    }

    if (compileError) {
      const safeErr = compileError.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] || c);
      const errorHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 1.5rem;
      background-color: #070B14;
      color: #F8FAFC;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
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
  <div class="p-6 max-w-md w-full bg-cyan-950/40 border border-cyan-500/30 rounded-2xl shadow-2xl text-center space-y-3">
    <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto text-lg font-bold">
      ⚠️
    </div>
    <h3 class="text-cyan-300 font-bold text-sm font-sans">Go Template Compilation Error</h3>
    <pre class="p-3 bg-slate-950/80 rounded-xl border border-cyan-900/40 text-cyan-300 text-xs font-mono text-left whitespace-pre-wrap overflow-x-auto">${safeErr}</pre>
  </div>
</body>
</html>`;
      iframe.srcdoc = errorHtml;
      return;
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
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
  ${compiledBody || ""}

  <script>
    document.addEventListener("click", function(e) {
      const btn = e.target.closest('#dispatch-btn');
      if (!btn) return;
      const counter = document.getElementById('goroutine-counter');
      const msg = document.getElementById('dispatch-msg');
      if (counter) {
        let current = parseInt(counter.textContent || "0", 10);
        counter.textContent = (current + 10).toString();
      }
      if (msg) {
        msg.textContent = "⚡ +10 Routines Spawned";
        msg.classList.add("text-cyan-400");
        msg.classList.remove("text-emerald-400");
        setTimeout(() => {
          msg.classList.remove("text-cyan-400");
          msg.classList.add("text-emerald-400");
          msg.textContent = "Channels Synced";
        }, 1200);
      }
    });
  </script>
</body>
</html>`;

    iframe.srcdoc = fullHtml;
  }, [compiledBody, compileError, engineMode, localServerPort]);

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
    const iframe = iframeRef.current;
    if (iframe) {
      if (engineMode === "go-server") {
        iframe.src = `http://localhost:${localServerPort}`;
      } else {
        const currentDoc = iframe.srcdoc;
        iframe.srcdoc = "";
        setTimeout(() => {
          iframe.srcdoc = currentDoc;
        }, 50);
      }
    }
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleSelectPreset = (key: string) => {
    const preset = GO_TEMPLATE_PRESETS[key];
    if (preset) {
      setCode(preset.code);
      if (onCodeChange) onCodeChange(preset.code);
    }
  };

  const deviceWidthMap: Record<GoDevicePreset, string> = {
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            <span>Go 1.23 • html/template</span>
          </div>

          {/* Preset Selector */}
          <select
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            {Object.entries(GO_TEMPLATE_PRESETS).map(([key, item]) => (
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
            onClick={() => setEngineMode("gotemplate-engine")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "gotemplate-engine"
                ? "bg-cyan-600 text-white shadow-sm font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="In-Browser Go template execution engine"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Go Template</span>
          </button>
          <button
            type="button"
            onClick={() => setEngineMode("go-server")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "go-server"
                ? "bg-cyan-600 text-white shadow-sm font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title={`Connect to local Go server on port ${localServerPort}`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Go Server</span>
            <span className={`w-1.5 h-1.5 rounded-full ${serverOnline ? "bg-emerald-400" : "bg-amber-400"}`}></span>
          </button>
        </div>

        {/* Right: View & Device Switchers */}
        <div className="flex items-center gap-1.5">
          {/* Device Preset Switcher */}
          {viewMode !== "code" && (
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`p-1.5 rounded-md ${device === "desktop" ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-white"}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("tablet")}
                className={`p-1.5 rounded-md ${device === "tablet" ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-white"}`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("iphone")}
                className={`p-1.5 rounded-md ${device === "iphone" ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-white"}`}
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
              className={`p-1.5 rounded-md ${viewMode === "canvas" ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-white"}`}
              title="Canvas Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-md ${viewMode === "split" ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-white"}`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={`p-1.5 rounded-md ${viewMode === "code" ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-white"}`}
              title="Code Only"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tweak Props Button */}
          <button
            type="button"
            onClick={() => setShowInspector(!showInspector)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              showInspector
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Toggle Visual Property Controls (No-Code)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tweak Props</span>
          </button>

          {/* Reload Button */}
          <button
            type="button"
            onClick={handleReload}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Recompile Go Template"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          {/* Copy Snippet Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Copy Go Template Code"
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
        language="go"
        onApplyToProps={handleApplyVisualProps}
      />

      {/* Main Execution Body */}
      <div className="flex-1 flex overflow-hidden min-h-[440px]">
        {/* Code Editor Pane */}
        {(viewMode === "split" || viewMode === "code") && (
          <div className={`${viewMode === "split" ? "w-1/2 border-r border-slate-800" : "w-full"} flex flex-col bg-[#060a14]`}>
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/60 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span>templates/dashboard.html.tmpl</span>
              <span className="text-cyan-400">Go Template Active</span>
            </div>
            <textarea
              value={code}
              onChange={handleCodeEdit}
              spellCheck={false}
              className="flex-1 p-4 bg-transparent font-mono text-xs text-slate-200 resize-none focus:outline-none leading-relaxed selection:bg-cyan-500/30 overflow-y-auto"
            />
          </div>
        )}

        {/* Live Canvas Preview Pane */}
        {(viewMode === "split" || viewMode === "canvas") && (
          <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} flex flex-col items-center justify-center p-4 bg-[#03060c] overflow-auto relative`}>
            {compileError && (
              <div className="absolute inset-x-4 top-4 z-20">
                <SandboxAutoFixLens
                  code={code}
                  language="go"
                  errorMessage={compileError}
                  onApplyFix={(fixedCode) => {
                    setCode(fixedCode);
                    if (onCodeChange) onCodeChange(fixedCode);
                  }}
                />
              </div>
            )}
            <div className={`${deviceWidthMap[device]} h-full min-h-[380px] rounded-xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#070b14] flex flex-col transition-all duration-300`}>
              <iframe
                ref={iframeRef}
                title="Go Template Live Preview"
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
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Go Template Parser v1.23</span>
          </span>
          <span>•</span>
          <span className="text-slate-500">Pipeline Range & Functions</span>
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
