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
  Flame,
} from "lucide-react";
import { UniversalPropertyInspector } from "./UniversalPropertyInspector";
import { applyVisualProps, UniversalVisualProps } from "@/lib/ast-transformer";
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

export type PhoenixDevicePreset = "desktop" | "iphone" | "tablet";
export type PhoenixViewMode = "split" | "canvas" | "code";
export type PhoenixEngineMode = "liveview-engine" | "mix-server";

interface PhoenixLiveViewRendererProps {
  initialCode?: string;
  className?: string;
  defaultEngineMode?: PhoenixEngineMode;
  localServerPort?: number;
  onCodeChange?: (newCode: string) => void;
}

export const PHOENIX_PRESETS: Record<string, { label: string; code: string }> = {
  telemetry_card: {
    label: "🔥 Phoenix LiveView Telemetry Dashboard",
    code: `<%# Assigns:
  @cluster = "Olympus-Phoenix-01"
  @uptime = "99.999%"
  @throughput = "48,200 msg/s"
  @status = "optimal"
  @services = [
    %{ name: "BEAM Cluster Node A", port: 4000, status: "active", latency: "0.2ms" },
    %{ name: "Phoenix PubSub Channel", port: 4001, status: "active", latency: "0.1ms" },
    %{ name: "Postgrex Ecto Pool", port: 5432, status: "active", latency: "0.6ms" },
    %{ name: "Telemetry ETS Cache", port: 6379, status: "active", latency: "0.05ms" }
  ]
%>

<div class="p-6 max-w-lg mx-auto bg-slate-900/90 rounded-2xl border border-violet-500/30 shadow-2xl backdrop-blur-md text-slate-100 font-sans">
  <%# Header with Phoenix Flame Branding %>
  <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/25">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      </div>
      <div>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span><%= @cluster %></span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <%= String.upcase(@status) %>
          </span>
        </h3>
        <p class="text-xs text-violet-400/90 font-mono">Elixir 1.17 • Phoenix LiveView 1.0 (BEAM)</p>
      </div>
    </div>
    <div class="text-right">
      <span class="text-xs font-mono text-violet-400 font-semibold"><%= @uptime %></span>
      <p class="text-[10px] text-slate-500">BEAM Fault-Tolerance</p>
    </div>
  </div>

  <%# Telemetry Metric Grid %>
  <div class="grid grid-cols-2 gap-3 mb-4">
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Actor Throughput</span>
      <span class="text-sm font-bold font-mono text-white"><%= @throughput %></span>
    </div>
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">GenServer Processes</span>
      <span id="beam-counter" class="text-sm font-bold font-mono text-violet-400">142,080 Active</span>
    </div>
  </div>

  <%# Active Microservice Loop %>
  <div class="space-y-2 mb-4">
    <div class="flex items-center justify-between text-xs text-slate-400 px-1">
      <span>Connected BEAM Sockets</span>
      <span class="font-mono text-[11px]"><%= length(@services) %> active</span>
    </div>
    <%= for service <- @services do %>
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-medium text-slate-200"><%= service[:name] %></span>
          <span class="text-[10px] font-mono text-slate-500">:<%= service[:port] %></span>
        </div>
        <span class="font-mono text-violet-300 text-[11px]"><%= service[:latency] %></span>
      </div>
    <% end %>
  </div>

  <%# Interactive LiveView Dispatch Button %>
  <div class="pt-2 flex items-center justify-between border-t border-slate-800">
    <button id="phx-dispatch-btn" phx-click="ping_cluster" class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
      <span>⚡ phx-click: Dispatch Pulse</span>
      <span id="phx-event-counter" class="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]">0</span>
    </button>
    <span id="phx-status-msg" class="text-xs text-slate-400 font-mono">LiveSocket Connected</span>
  </div>
</div>`,
  },
  cluster_nodes: {
    label: "⚡ Phoenix LiveView Node Cluster Table",
    code: `<%# Assigns:
  @nodes = [
    %{ id: "node-01", region: "iad-1", actors: 42000, status: "healthy", memory: "1.2 GB" },
    %{ id: "node-02", region: "fra-1", actors: 38500, status: "healthy", memory: "1.1 GB" },
    %{ id: "node-03", region: "nrt-1", actors: 29800, status: "syncing", memory: "940 MB" },
    %{ id: "node-04", region: "syd-1", actors: 18400, status: "healthy", memory: "780 MB" }
  ]
%>

<div class="p-6 max-w-xl mx-auto bg-slate-900 rounded-2xl border border-violet-500/25 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-4">
    <div>
      <h3 class="text-base font-bold text-white flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse"></span>
        <span>Phoenix.Cluster.Nodes</span>
      </h3>
      <p class="text-xs text-violet-400/90 font-mono">Distributed BEAM Topologies</p>
    </div>
    <span class="text-xs font-mono px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300">
      <%= length(@nodes) %> Nodes Online
    </span>
  </div>

  <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
    <table class="w-full text-left text-xs">
      <thead class="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
        <tr>
          <th class="p-3">Node ID</th>
          <th class="p-3">Region</th>
          <th class="p-3">Actors</th>
          <th class="p-3">Status</th>
          <th class="p-3 text-right">RAM</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800/60">
        <%= for node <- @nodes do %>
          <tr class="hover:bg-slate-800/40 transition-colors">
            <td class="p-3 font-mono text-slate-300"><%= node[:id] %></td>
            <td class="p-3 font-mono text-violet-400"><%= node[:region] %></td>
            <td class="p-3 font-mono"><%= node[:actors] %></td>
            <td class="p-3">
              <%= if node[:status] == "healthy" do %>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">HEALTHY</span>
              <% else %>
                <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">SYNCING</span>
              <% end %>
            </td>
            <td class="p-3 text-right font-mono text-slate-400"><%= node[:memory] %></td>
          </tr>
        <% end %>
      </tbody>
    </table>
  </div>
</div>`,
  },
};

/**
 * Extracts Elixir assigns from comments or declarations:
 * <%# Assigns: @var = ... %> or <% @var = ... %>
 */
function extractElixirAssigns(code: string): Record<string, unknown> {
  const scope: Record<string, unknown> = {};

  // Matches either <%# ... %> or <% ... %> containing assignments
  const assignBlockRegex = /<%#?\s*(?:Assigns:)?([\s\S]*?)%>/g;
  let match: RegExpExecArray | null;

  while ((match = assignBlockRegex.exec(code)) !== null) {
    const rawContent = match[1];
    const lines = rawContent.split("\n");

    let currentVar: string | null = null;
    let currentBuffer: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const varMatch = line.match(/^@([a-zA-Z0-9_]+)\s*=\s*(.*)$/);
      if (varMatch) {
        if (currentVar) {
          scope[currentVar] = parseElixirLiteral(currentBuffer.join("\n"));
        }
        currentVar = varMatch[1];
        currentBuffer = [varMatch[2]];
      } else if (currentVar) {
        currentBuffer.push(line);
      }
    }

    if (currentVar) {
      scope[currentVar] = parseElixirLiteral(currentBuffer.join("\n"));
    }
  }

  return scope;
}

/**
 * Parses Elixir literals: strings, numbers, atoms (:atom), lists [1, 2],
 * and maps (%{ key: "val" } or %{ "key" => "val" }).
 */
function parseElixirLiteral(expr: string): unknown {
  const trimmed = expr.trim();

  // Strings
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  // Numbers
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  // Booleans
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "nil") return null;

  // Atoms :atom
  if (trimmed.startsWith(":") && /^[a-zA-Z0-9_]+$/.test(trimmed.slice(1))) {
    return trimmed.slice(1);
  }

  // Elixir Lists or Maps
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return splitTopLevel(inner).map(parseElixirLiteral);
  }

  // Elixir Map: %{ key: val, ... } or %{ "key" => val }
  if (trimmed.startsWith("%{") && trimmed.endsWith("}")) {
    const inner = trimmed.slice(2, -1).trim();
    const mapObj: Record<string, unknown> = {};
    if (!inner) return mapObj;

    const pairs = splitTopLevel(inner);
    for (const pair of pairs) {
      // Check for key: val or "key" => val or :key => val
      const colonMatch = pair.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
      const arrowMatch = pair.match(/^(?::([a-zA-Z0-9_]+)|"([^"]+)"|'([^']+)')\s*=>\s*(.*)$/);

      if (colonMatch) {
        const k = colonMatch[1];
        mapObj[k] = parseElixirLiteral(colonMatch[2]);
      } else if (arrowMatch) {
        const k = arrowMatch[1] || arrowMatch[2] || arrowMatch[3];
        mapObj[k] = parseElixirLiteral(arrowMatch[4]);
      }
    }
    return mapObj;
  }

  return trimmed;
}

function splitTopLevel(str: string): string[] {
  const results: string[] = [];
  let depth = 0;
  let inQuote = false;
  let quoteChar = "";
  let buffer = "";

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (inQuote) {
      buffer += char;
      if (char === quoteChar && str[i - 1] !== "\\") {
        inQuote = false;
      }
    } else if (char === '"' || char === "'") {
      inQuote = true;
      quoteChar = char;
      buffer += char;
    } else if (char === "[" || char === "{" || char === "(") {
      depth++;
      buffer += char;
    } else if (char === "]" || char === "}" || char === ")") {
      depth--;
      buffer += char;
    } else if (char === "," && depth === 0) {
      if (buffer.trim()) results.push(buffer.trim());
      buffer = "";
    } else {
      buffer += char;
    }
  }

  if (buffer.trim()) results.push(buffer.trim());
  return results;
}

/**
 * Resolves an Elixir expression in scope (e.g. `@cluster`, `service[:name]`, `node.status`).
 */
function resolveElixirExpr(expr: string, scope: Record<string, unknown>): unknown {
  const clean = expr.trim();

  // String.upcase(@var)
  const upcaseMatch = clean.match(/^String\.upcase\(@?([a-zA-Z0-9_]+)\)$/);
  if (upcaseMatch) {
    const val = scope[upcaseMatch[1]];
    return typeof val === "string" ? val.toUpperCase() : String(val ?? "");
  }

  // String.downcase(@var)
  const downcaseMatch = clean.match(/^String\.downcase\(@?([a-zA-Z0-9_]+)\)$/);
  if (downcaseMatch) {
    const val = scope[downcaseMatch[1]];
    return typeof val === "string" ? val.toLowerCase() : String(val ?? "");
  }

  // length(@collection)
  const lengthMatch = clean.match(/^length\(@?([a-zA-Z0-9_]+)\)$/);
  if (lengthMatch) {
    const val = scope[lengthMatch[1]];
    return Array.isArray(val) ? val.length : 0;
  }

  // Map access: item[:prop] or item["prop"] or item.prop
  const accessMatch = clean.match(/^([a-zA-Z0-9_]+)(?:\[:([a-zA-Z0-9_]+)\]|\["([^"]+)"\]|\.([a-zA-Z0-9_]+))$/);
  if (accessMatch) {
    const target = scope[accessMatch[1]];
    const prop = accessMatch[2] || accessMatch[3] || accessMatch[4];
    if (target && typeof target === "object") {
      return (target as Record<string, unknown>)[prop];
    }
    return undefined;
  }

  // @variable or variable
  const varName = clean.startsWith("@") ? clean.slice(1) : clean;
  if (scope[varName] !== undefined) {
    return scope[varName];
  }

  return clean;
}

/**
 * Evaluates conditionals: `<%= if cond do %> ... <% else %> ... <% end %>`
 */
function renderElixirConditionals(source: string, scope: Record<string, unknown>): string {
  const ifRegex = /<%=?\s*if\s+([^%]+?)\s+do\s*%>([\s\S]*?)<% end %>/g;

  return source.replace(ifRegex, (_full, condExpr: string, body: string) => {
    const branches = body.split(/<%\s*else\s*%>/);
    const ifBranch = branches[0];
    const elseBranch = branches[1] || "";

    const isTrue = evaluateElixirCondition(condExpr.trim(), scope);
    return isTrue ? ifBranch : elseBranch;
  });
}

function evaluateElixirCondition(cond: string, scope: Record<string, unknown>): boolean {
  // item[:status] == "healthy" or @status == "optimal"
  const compMatch = cond.match(/^(.+?)\s*(===|==|!==|!=|<=|>=|<|>)\s*(.+)$/);
  if (compMatch) {
    const left = resolveElixirExpr(compMatch[1], scope);
    let right: unknown = compMatch[3].trim();

    if (
      (typeof right === "string" && right.startsWith('"') && right.endsWith('"')) ||
      (typeof right === "string" && right.startsWith("'") && right.endsWith("'"))
    ) {
      right = (right as string).slice(1, -1);
    } else if (typeof right === "string" && /^-?\d+(\.\d+)?$/.test(right)) {
      right = Number(right);
    }

    const op = compMatch[2];
    if (op === "==" || op === "===") return left == right;
    if (op === "!=" || op === "!==") return left != right;
    if (op === "<") return Number(left) < Number(right);
    if (op === ">") return Number(left) > Number(right);
    if (op === "<=") return Number(left) <= Number(right);
    if (op === ">=") return Number(left) >= Number(right);
  }

  // Simple truthiness
  const val = resolveElixirExpr(cond, scope);
  return Boolean(val && val !== "false" && val !== "nil");
}

/**
 * Compiles Phoenix HEEx template into pure HTML with Tailwind & interactive JS.
 */
function compileHeexToHtml(code: string): string {
  const source = code.trim();
  if (!source) {
    throw new Error("Phoenix HEEx code cannot be empty.");
  }

  const assigns = extractElixirAssigns(source);

  // Strip top-level assign comment blocks
  let html = source.replace(/<%#[\s\S]*?%>/g, "").trim();

  // 1. Process for-comprehension loops: `<%= for item <- @collection do %> ... <% end %>`
  const forRegex = /<%=?\s*for\s+([a-zA-Z0-9_]+)\s*<-\s*@?([a-zA-Z0-9_]+)\s+do\s*%>([\s\S]*?)<% end %>/g;
  html = html.replace(forRegex, (_full, itemName: string, colName: string, loopBody: string) => {
    const collection = assigns[colName];
    if (!Array.isArray(collection)) return "";

    return collection
      .map((item) => {
        let renderedItem = loopBody;
        const itemScope: Record<string, unknown> = {
          ...assigns,
          [itemName]: item,
        };

        // Conditionals inside loop
        renderedItem = renderElixirConditionals(renderedItem, itemScope);

        // Expression interpolations: `<%= item[:name] %>`, `<%= item.port %>`
        renderedItem = renderedItem.replace(/<%=?\s*([^%]+?)\s*%>/g, (_m, expr: string) => {
          const val = resolveElixirExpr(expr, itemScope);
          return val !== undefined ? String(val) : "";
        });

        return renderedItem;
      })
      .join("");
  });

  // 2. Process outer conditionals
  html = renderElixirConditionals(html, assigns);

  // 3. Process remaining interpolations `<%= @var %>` or `<%= length(@items) %>`
  html = html.replace(/<%=?\s*([^%]+?)\s*%>/g, (_m, expr: string) => {
    const val = resolveElixirExpr(expr, assigns);
    return val !== undefined ? String(val) : "";
  });

  // 4. Strip stray non-output Elixir tags `<% ... %>`
  html = html.replace(/<%(?!%)[^%]*%>/g, "");

  return html.trim();
}

export function PhoenixLiveViewRenderer({
  initialCode = PHOENIX_PRESETS.telemetry_card.code,
  className = "",
  defaultEngineMode = "liveview-engine",
  localServerPort = 4000,
  onCodeChange,
}: PhoenixLiveViewRendererProps) {
  const [code, setCode] = useState(initialCode);
  const [device, setDevice] = useState<PhoenixDevicePreset>("desktop");
  const [viewMode, setViewMode] = useState<PhoenixViewMode>("split");
  const [engineMode, setEngineMode] = useState<PhoenixEngineMode>(defaultEngineMode);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleApplyVisualProps = (newProps: UniversalVisualProps) => {
    const patched = applyVisualProps(code, "heex", newProps);
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

  // Ping local mix phx.server if in server mode
  useEffect(() => {
    if (engineMode !== "mix-server") return;
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
    if (engineMode === "mix-server") {
      return { compiledBody: null, compileError: null };
    }
    try {
      const body = compileHeexToHtml(code);
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

    if (engineMode === "mix-server") {
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
  <div class="p-6 max-w-md w-full bg-violet-950/40 border border-violet-500/30 rounded-2xl shadow-2xl text-center space-y-3">
    <div class="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-400 flex items-center justify-center mx-auto text-lg font-bold">
      ⚠️
    </div>
    <h3 class="text-violet-300 font-bold text-sm font-sans">Phoenix LiveView Compilation Error</h3>
    <pre class="p-3 bg-slate-950/80 rounded-xl border border-violet-900/40 text-violet-300 text-xs font-mono text-left whitespace-pre-wrap overflow-x-auto">${safeErr}</pre>
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
      const btn = e.target.closest('#phx-dispatch-btn');
      if (!btn) return;
      const counter = document.getElementById('phx-event-counter');
      const msg = document.getElementById('phx-status-msg');
      const beamCounter = document.getElementById('beam-counter');

      if (counter) {
        let current = parseInt(counter.textContent || "0", 10);
        counter.textContent = (current + 1).toString();
      }
      if (beamCounter) {
        let currentVal = parseInt(beamCounter.textContent.replace(/[^0-9]/g, "") || "142080", 10);
        beamCounter.textContent = (currentVal + 100).toLocaleString() + " Active";
      }
      if (msg) {
        msg.textContent = "⚡ phx_reply: push_event OK (" + new Date().toLocaleTimeString() + ")";
        msg.classList.add("text-violet-400");
        setTimeout(() => {
          msg.textContent = "LiveSocket Connected";
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
      if (engineMode === "mix-server") {
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
    const preset = PHOENIX_PRESETS[key];
    if (preset) {
      setCode(preset.code);
      if (onCodeChange) onCodeChange(preset.code);
    }
  };

  const deviceWidthMap: Record<PhoenixDevicePreset, string> = {
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/25 text-violet-400 font-mono text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-violet-400" />
            <span>Phoenix of Olympus (HEEx)</span>
          </div>

          {/* Preset Selector */}
          <select
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            {Object.entries(PHOENIX_PRESETS).map(([key, item]) => (
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
            onClick={() => setEngineMode("liveview-engine")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "liveview-engine"
                ? "bg-violet-600 text-white font-medium shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="In-Browser Phoenix LiveView Engine: Zero Latency Simulation"
          >
            <Zap className="w-3 h-3 text-amber-300" />
            <span>HEEx Engine</span>
          </button>
          <button
            type="button"
            onClick={() => setEngineMode("mix-server")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "mix-server"
                ? "bg-violet-600 text-white font-medium shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title={`Mix Phx Server: Bridge to local Phoenix backend on port ${localServerPort}`}
          >
            <Server className="w-3 h-3 text-violet-300" />
            <span>Mix Server</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                serverOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
          </button>
        </div>

        {/* Right: Device & View Options */}
        <div className="flex items-center gap-2">
          {/* Device Preset Switcher */}
          {viewMode !== "code" && (
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`p-1.5 rounded-md ${device === "desktop" ? "bg-slate-800 text-violet-400" : "text-slate-400 hover:text-white"}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("tablet")}
                className={`p-1.5 rounded-md ${device === "tablet" ? "bg-slate-800 text-violet-400" : "text-slate-400 hover:text-white"}`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("iphone")}
                className={`p-1.5 rounded-md ${device === "iphone" ? "bg-slate-800 text-violet-400" : "text-slate-400 hover:text-white"}`}
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
              className={`p-1.5 rounded-md ${viewMode === "canvas" ? "bg-slate-800 text-violet-400" : "text-slate-400 hover:text-white"}`}
              title="Canvas Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-md ${viewMode === "split" ? "bg-slate-800 text-violet-400" : "text-slate-400 hover:text-white"}`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={`p-1.5 rounded-md ${viewMode === "code" ? "bg-slate-800 text-violet-400" : "text-slate-400 hover:text-white"}`}
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
                ? "bg-violet-500/20 text-violet-400 border border-violet-500/40 shadow-sm"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Toggle Visual Property Controls (No-Code)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
            <span>Tweak Props</span>
          </button>

          {/* Reload Button */}
          <button
            type="button"
            onClick={handleReload}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Recompile Phoenix Template"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-violet-400" : ""}`} />
          </button>

          {/* Copy Snippet Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Copy Phoenix HEEx Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-violet-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Universal No-Code Visual Property Inspector */}
      <UniversalPropertyInspector
        isOpen={showInspector}
        onClose={() => setShowInspector(false)}
        code={code}
        language="heex"
        onApplyToProps={handleApplyVisualProps}
      />

      {/* Main Execution Body */}
      <div className="flex-1 flex overflow-hidden min-h-[440px]">
        {/* Code Editor Pane */}
        {(viewMode === "split" || viewMode === "code") && (
          <div className={`${viewMode === "split" ? "w-1/2 border-r border-slate-800" : "w-full"} flex flex-col bg-[#060a14]`}>
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/60 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-violet-400" />
                <span>lib/app_web/live/telemetry_live.html.heex</span>
              </span>
              <span className="text-violet-400">Phoenix LiveView 1.0</span>
            </div>
            <textarea
              value={code}
              onChange={handleCodeEdit}
              spellCheck={false}
              className="flex-1 p-4 bg-transparent font-mono text-xs text-slate-200 resize-none focus:outline-none leading-relaxed selection:bg-violet-500/30 overflow-y-auto"
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
                  language="heex"
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
                title="Phoenix LiveView Live Preview"
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
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
            <span>Elixir 1.17 / Phoenix LiveView 1.0</span>
          </span>
          <span>•</span>
          <span className="text-slate-500">HEEx Template Engine</span>
          <span>•</span>
          <span className="text-slate-500">BEAM WebSocket Relay</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span>Isolated Iframe Sandbox</span>
        </div>
      </div>
    </div>
  );
}
