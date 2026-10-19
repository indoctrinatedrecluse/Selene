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

export type RubyDevicePreset = "desktop" | "iphone" | "tablet";
export type RubyViewMode = "split" | "canvas" | "code";
export type RubyEngineMode = "erb-engine" | "puma-server";

interface RubyRailsRendererProps {
  initialCode?: string;
  className?: string;
  defaultEngineMode?: RubyEngineMode;
  localServerPort?: number;
  onCodeChange?: (newCode: string) => void;
}

export const RUBY_RAILS_PRESETS: Record<string, { label: string; code: string }> = {
  turbo_frame_card: {
    label: "🚀 Rails Hotwire / Turbo Frame (ERB + Stimulus)",
    code: `<%
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
`,
  },
  activerecord_collection: {
    label: "💎 ActiveRecord Query Table (ERB .each loop)",
    code: `<%
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
`,
  },
};

/**
 * Lightweight in-browser ERB compiler:
 * Compiles Ruby instance variable declarations (<% @var = ... %>),
 * loops (<% @collection.each do |item| %> ... <% end %>),
 * conditionals (<% if ... %> ... <% else %> ... <% end %>),
 * helpers (number_to_currency, pluralize, turbo_frame_tag),
 * and injects Tailwind CSS + Stimulus runtime.
 */
// Helper to parse a Ruby literal (string, number, boolean, array, hash)
function parseRubyLiteral(input: string): unknown {
  const str = input.trim();
  if (!str) return undefined;
  if (str === "true") return true;
  if (str === "false") return false;
  if (str === "nil") return null;
  if (/^-?\d+(\.\d+)?$/.test(str)) return Number(str);
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }

  // Handle arrays or hashes
  if ((str.startsWith("[") && str.endsWith("]")) || (str.startsWith("{") && str.endsWith("}"))) {
    try {
      const jsonLike = str
        .replace(/([a-zA-Z0-9_]+):/g, '"$1":')
        .replace(/:([a-zA-Z0-9_]+)\s*=>/g, '"$1":')
        .replace(/=>/g, ":")
        .replace(/'/g, '"')
        .replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(jsonLike);
    } catch {
      return str;
    }
  }

  return str;
}

// Extract variable statements from a Ruby scriptlet block <% ... %>
function extractRubyVariables(rubyCode: string, scope: Record<string, unknown>) {
  const varRegex = /@([a-zA-Z0-9_]+)\s*=\s*/g;
  let match: RegExpExecArray | null;
  const matches: { name: string; startIndex: number; valueStart: number }[] = [];

  while ((match = varRegex.exec(rubyCode)) !== null) {
    matches.push({
      name: match[1],
      startIndex: match.index,
      valueStart: match.index + match[0].length,
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const nextStart = i + 1 < matches.length ? matches[i + 1].startIndex : rubyCode.length;
    const rawVal = rubyCode.slice(current.valueStart, nextStart).trim();
    const cleanVal = rawVal.replace(/;$/, "").trim();
    scope[current.name] = parseRubyLiteral(cleanVal);
  }
}

// Resolves a Ruby expression against a variable scope
function resolveRubyExpression(expr: string, scope: Record<string, unknown>): unknown {
  const trimmed = expr.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "nil") return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  // Check item[:prop] or item['prop'] or item.prop
  const propMatch = trimmed.match(
    /^([a-zA-Z0-9_]+)(?:\[:([a-zA-Z0-9_]+)\]|\[['"]([a-zA-Z0-9_]+)['"]\]|\.([a-zA-Z0-9_]+))$/
  );
  if (propMatch) {
    const parent = scope[propMatch[1]];
    const prop = propMatch[2] || propMatch[3] || propMatch[4];
    if (parent && typeof parent === "object") {
      return (parent as Record<string, unknown>)[prop];
    }
    return undefined;
  }

  // Check @var.count
  const countMatch = trimmed.match(/^@([a-zA-Z0-9_]+)\.count$/);
  if (countMatch) {
    const val = scope[countMatch[1]];
    return Array.isArray(val) ? val.length : 0;
  }

  // Check @var.upcase
  const upcaseMatch = trimmed.match(/^@([a-zA-Z0-9_]+)\.upcase$/);
  if (upcaseMatch) {
    const val = scope[upcaseMatch[1]];
    return typeof val === "string" ? val.toUpperCase() : String(val ?? "");
  }

  // Check @var
  const varMatch = trimmed.match(/^@([a-zA-Z0-9_]+)$/);
  if (varMatch) {
    return scope[varMatch[1]];
  }

  return trimmed;
}

function evaluateErbCondition(condition: string, scope: Record<string, unknown>): boolean {
  try {
    const cond = condition.trim();
    const compMatch = cond.match(/^(.+?)\s*(===|==|!==|!=|>=|<=|>|<)\s*(.+)$/);
    if (compMatch) {
      const leftVal = resolveRubyExpression(compMatch[1].trim(), scope);
      const op = compMatch[2];
      const rightVal = resolveRubyExpression(compMatch[3].trim(), scope);

      if (op === "===" || op === "==") return leftVal == rightVal;
      if (op === "!==" || op === "!=") return leftVal != rightVal;
      if (op === ">") return Number(leftVal) > Number(rightVal);
      if (op === "<") return Number(leftVal) < Number(rightVal);
      if (op === ">=") return Number(leftVal) >= Number(rightVal);
      if (op === "<=") return Number(leftVal) <= Number(rightVal);
    }
    const val = resolveRubyExpression(cond, scope);
    return Boolean(val);
  } catch {
    return false;
  }
}

function renderErbConditionals(text: string, scope: Record<string, unknown>): string {
  const ifRegex = /<%\s*if\s+([\s\S]*?)\s*%>([\s\S]*?)<%\s*end\s*%>/g;
  return text.replace(ifRegex, (_, firstCond, body) => {
    const chunks: { cond: string | null; content: string }[] = [];
    const branchRegex = /<%\s*(elsif\s+[\s\S]*?|else)\s*%>/g;
    let lastIndex = 0;
    let currentCond: string | null = firstCond;
    let match: RegExpExecArray | null;

    while ((match = branchRegex.exec(body)) !== null) {
      const branchContent = body.slice(lastIndex, match.index);
      chunks.push({ cond: currentCond, content: branchContent });
      lastIndex = match.index + match[0].length;
      if (match[1].startsWith("elsif")) {
        const cMatch = match[1].match(/elsif\s+([\s\S]*)/);
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
      if (evaluateErbCondition(chunk.cond, scope)) {
        return chunk.content;
      }
    }
    return "";
  });
}

/**
 * Robust in-browser ERB compiler:
 * Compiles Ruby instance variables, loops (<% @collection.each do |item| %>),
 * multi-branch conditionals (<% if / elsif / else / end %>),
 * helpers (number_to_currency, pluralize, turbo_frame_tag),
 * and injects Tailwind CSS + Stimulus runtime.
 */
function compileErbToHtml(template: string): string {
  let source = template;
  const rubyScope: Record<string, unknown> = {};

  // 1. Strip ERB comments: <%# ... %>
  source = source.replace(/<%#[\s\S]*?%>/g, "");

  // 2. Extract and evaluate variable declarations inside <% ... %> scriptlet blocks
  source = source.replace(/<%([\s\S]*?)%>/g, (fullMatch, scriptlet) => {
    // If it starts with = or #, skip
    if (fullMatch.startsWith("<%=") || fullMatch.startsWith("<%#")) {
      return fullMatch;
    }
    if (scriptlet.includes("@")) {
      extractRubyVariables(scriptlet, rubyScope);
      return "";
    }
    return fullMatch;
  });

  // 3. Process turbo_frame_tag helper:
  // <%= turbo_frame_tag "id" do %> ... <% end %>
  source = source.replace(
    /<%=\s*turbo_frame_tag\s*["']([^"']+)["']\s+do\s*%>\s*([\s\S]*?)\s*<%\s*end\s*%>/g,
    (_, frameId, innerContent) => {
      return `<turbo-frame id="${frameId}">${innerContent}</turbo-frame>`;
    }
  );

  // 4. Process ERB loops:
  // <% @collection.each do |item| %> ... <% end %>
  source = source.replace(
    /<%\s*@([a-zA-Z0-9_]+)\.each\s+do\s+\|([a-zA-Z0-9_]+)\|\s*%>\s*([\s\S]*?)\s*<%\s*end\s*%>/g,
    (_, colName, itemName, loopBody) => {
      const collection = rubyScope[colName];
      if (!Array.isArray(collection)) return "";

      return collection
        .map((item) => {
          let renderedItem = loopBody;
          const itemScope: Record<string, unknown> = {
            ...rubyScope,
            [itemName]: item,
          };

          // Conditionals inside loop
          renderedItem = renderErbConditionals(renderedItem, itemScope);

          // Replace item[:prop] or item['prop'] or item.prop
          renderedItem = renderedItem.replace(
            new RegExp(`<%=\\s*${itemName}(?:\\[:(?:[a-zA-Z0-9_]+)\\]|\\[['"](?:[a-zA-Z0-9_]+)['"]\\]|\\.(?:[a-zA-Z0-9_]+))\\s*%>`, "g"),
            (match: string) => {
              const propMatch = match.match(/\[:([a-zA-Z0-9_]+)\]|\[['"]([a-zA-Z0-9_]+)['"]\]|\.([a-zA-Z0-9_]+)/);
              const prop = propMatch ? propMatch[1] || propMatch[2] || propMatch[3] : "";
              return (item as Record<string, unknown>)[prop] !== undefined
                ? String((item as Record<string, unknown>)[prop])
                : "";
            }
          );

          return renderedItem;
        })
        .join("");
    }
  );

  // 5. Process outer conditionals
  source = renderErbConditionals(source, rubyScope);

  // 6. Process helper: number_to_currency(@mrr)
  source = source.replace(/<%=\s*number_to_currency\(\s*@([a-zA-Z0-9_]+)\s*\)\s*%>/g, (_, vName) => {
    const val = Number(rubyScope[vName]) || 0;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  });

  // 7. Process helper: pluralize(@services.count, "Worker Node")
  source = source.replace(
    /<%=\s*pluralize\(\s*@([a-zA-Z0-9_]+)\.count\s*,\s*["']([^"']+)["']\s*\)\s*%>/g,
    (_, vName, word) => {
      const col = rubyScope[vName];
      const count = Array.isArray(col) ? col.length : 0;
      return `${count} ${count === 1 ? word : word + "s"}`;
    }
  );

  // 8. Process count expression: <%= @services.count %> or <%= @deployments.count %>
  source = source.replace(/<%=\s*@([a-zA-Z0-9_]+)\.count\s*%>/g, (_, vName) => {
    const col = rubyScope[vName];
    return Array.isArray(col) ? String(col.length) : "0";
  });

  // 9. Process string transforms: <%= @status.upcase %>
  source = source.replace(/<%=\s*@([a-zA-Z0-9_]+)\.upcase\s*%>/g, (_, vName) => {
    const val = rubyScope[vName];
    return typeof val === "string" ? val.toUpperCase() : String(val || "");
  });

  // 10. Process standard interpolation: <%= @var %> or <%== @var %>
  source = source.replace(/<%={1,2}\s*@([a-zA-Z0-9_]+)\s*%>/g, (_, vName) => {
    return rubyScope[vName] !== undefined ? String(rubyScope[vName]) : "";
  });

  // 11. Clean up any remaining non-evaluated ERB tags
  source = source.replace(/<%[\s\S]*?%>/g, "");

  return source.trim();
}

export function RubyRailsRenderer({
  initialCode,
  className = "",
  defaultEngineMode = "erb-engine",
  localServerPort = 3000,
  onCodeChange,
}: RubyRailsRendererProps) {
  const codeToUse = initialCode || RUBY_RAILS_PRESETS.turbo_frame_card.code;
  const [code, setCode] = useState(codeToUse);
  const [device, setDevice] = useState<RubyDevicePreset>("desktop");
  const [viewMode, setViewMode] = useState<RubyViewMode>("split");
  const [engineMode, setEngineMode] = useState<RubyEngineMode>(defaultEngineMode);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleApplyVisualProps = (newProps: UniversalVisualProps) => {
    const patched = applyVisualProps(code, "erb", newProps);
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

  // Ping local Rails / Puma server if in puma mode
  useEffect(() => {
    if (engineMode !== "puma-server") return;
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
    if (engineMode === "puma-server") {
      return { compiledBody: null, compileError: null };
    }
    try {
      const body = compileErbToHtml(code);
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

    if (engineMode === "puma-server") {
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
  <div class="p-6 max-w-md w-full bg-rose-950/40 border border-rose-500/30 rounded-2xl shadow-2xl text-center space-y-3">
    <div class="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto text-lg font-bold">
      ⚠️
    </div>
    <h3 class="text-rose-300 font-bold text-sm font-sans">Rails ERB Compilation Error</h3>
    <pre class="p-3 bg-slate-950/80 rounded-xl border border-rose-900/40 text-rose-300 text-xs font-mono text-left whitespace-pre-wrap overflow-x-auto">${safeErr}</pre>
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
    turbo-frame {
      display: block;
      width: 100%;
    }
  </style>
</head>
<body>
  ${compiledBody || ""}

  <script>
    // Lightweight Stimulus Runtime for Rails Interactive Sim
    document.addEventListener("click", function(e) {
      const btn = e.target.closest('[data-action*="telemetry#dispatchPulse"]');
      if (!btn) return;
      const counterEl = document.querySelector('[data-telemetry-target="counter"]');
      const messageEl = document.querySelector('[data-telemetry-target="message"]');
      if (counterEl) {
        let current = parseInt(counterEl.textContent || "0", 10);
        counterEl.textContent = (current + 1).toString();
      }
      if (messageEl) {
        messageEl.textContent = "⚡ Stream Dispatched (" + new Date().toLocaleTimeString() + ")";
        messageEl.classList.add("text-rose-400");
        messageEl.classList.remove("text-emerald-400");
        setTimeout(() => {
          messageEl.classList.remove("text-rose-400");
          messageEl.classList.add("text-emerald-400");
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
      if (engineMode === "puma-server") {
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
    const preset = RUBY_RAILS_PRESETS[key];
    if (preset) {
      setCode(preset.code);
      if (onCodeChange) onCodeChange(preset.code);
    }
  };

  const deviceWidthMap: Record<RubyDevicePreset, string> = {
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Ruby 3.3 • Rails 8 ERB</span>
          </div>

          {/* Preset Selector */}
          <select
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
          >
            {Object.entries(RUBY_RAILS_PRESETS).map(([key, item]) => (
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
            onClick={() => setEngineMode("erb-engine")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "erb-engine"
                ? "bg-rose-600 text-white shadow-sm font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="In-Browser ERB + Hotwire execution engine"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>ERB Engine</span>
          </button>
          <button
            type="button"
            onClick={() => setEngineMode("puma-server")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "puma-server"
                ? "bg-rose-600 text-white shadow-sm font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title={`Connect to local Puma server on port ${localServerPort}`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Puma Server</span>
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
                className={`p-1.5 rounded-md ${device === "desktop" ? "bg-slate-800 text-rose-400" : "text-slate-400 hover:text-white"}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("tablet")}
                className={`p-1.5 rounded-md ${device === "tablet" ? "bg-slate-800 text-rose-400" : "text-slate-400 hover:text-white"}`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("iphone")}
                className={`p-1.5 rounded-md ${device === "iphone" ? "bg-slate-800 text-rose-400" : "text-slate-400 hover:text-white"}`}
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
              className={`p-1.5 rounded-md ${viewMode === "canvas" ? "bg-slate-800 text-rose-400" : "text-slate-400 hover:text-white"}`}
              title="Canvas Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-md ${viewMode === "split" ? "bg-slate-800 text-rose-400" : "text-slate-400 hover:text-white"}`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={`p-1.5 rounded-md ${viewMode === "code" ? "bg-slate-800 text-rose-400" : "text-slate-400 hover:text-white"}`}
              title="Code Only"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tweak Props Button (Visual Property Controls) */}
          <button
            type="button"
            onClick={() => setShowInspector(!showInspector)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              showInspector
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Toggle Visual Property Controls (No-Code)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
            <span>Tweak Props</span>
          </button>

          {/* Reload Button */}
          <button
            type="button"
            onClick={handleReload}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Recompile ERB Template"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-rose-400" : ""}`} />
          </button>

          {/* Copy Snippet Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Copy ERB Code"
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
        language="erb"
        onApplyToProps={handleApplyVisualProps}
      />

      {/* Main Execution Body */}
      <div className="flex-1 flex overflow-hidden min-h-[440px]">
        {/* Code Editor Pane (Split or Code View) */}
        {(viewMode === "split" || viewMode === "code") && (
          <div className={`${viewMode === "split" ? "w-1/2 border-r border-slate-800" : "w-full"} flex flex-col bg-[#060a14]`}>
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/60 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span>app/views/components/_metrics.html.erb</span>
              <span className="text-rose-400">ERB Active</span>
            </div>
            <textarea
              value={code}
              onChange={handleCodeEdit}
              spellCheck={false}
              className="flex-1 p-4 bg-transparent font-mono text-xs text-slate-200 resize-none focus:outline-none leading-relaxed selection:bg-rose-500/30 overflow-y-auto"
            />
          </div>
        )}

        {/* Live Canvas Preview Pane (Split or Canvas View) */}
        {(viewMode === "split" || viewMode === "canvas") && (
          <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} flex flex-col items-center justify-center p-4 bg-[#03060c] overflow-auto relative`}>
            {compileError && (
              <div className="absolute inset-x-4 top-4 z-20">
                <SandboxAutoFixLens
                  code={code}
                  language="erb"
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
                title="Ruby on Rails ERB Live Preview"
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
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>Rails ERB Compiler v8.0</span>
          </span>
          <span>•</span>
          <span className="text-slate-500">Hotwire Turbo & Stimulus</span>
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
