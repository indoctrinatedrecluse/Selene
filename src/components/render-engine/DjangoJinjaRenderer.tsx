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

export type DjangoDevicePreset = "desktop" | "iphone" | "tablet";
export type DjangoViewMode = "split" | "canvas" | "code";
export type DjangoEngineMode = "jinja-engine" | "django-server";

interface DjangoJinjaRendererProps {
  initialCode?: string;
  className?: string;
  defaultEngineMode?: DjangoEngineMode;
  localServerPort?: number;
  onCodeChange?: (newCode: string) => void;
}

export const DJANGO_JINJA_PRESETS: Record<string, { label: string; code: string }> = {
  telemetry_card: {
    label: "🐍 Django ASGI Telemetry Card (Jinja2 / DTL)",
    code: `{# Context:
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
        <p class="text-xs text-emerald-400/90 font-mono">Django 5.1 • Jinja2 / DTL Engine</p>
      </div>
    </div>
    <div class="text-right">
      <span class="text-xs font-mono text-emerald-400 font-semibold">{{ uptime }}</span>
      <p class="text-[10px] text-slate-500">Service SLA</p>
    </div>
  </div>

  {# Telemetry Stats #}
  <div class="grid grid-cols-2 gap-3 mb-4">
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Gunicorn Workers</span>
      <span class="text-sm font-bold font-mono text-white">{{ workers }} ASGI Workers</span>
    </div>
    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <span class="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Live Throughput</span>
      <span class="text-sm font-bold font-mono text-emerald-400">{{ throughput }}</span>
    </div>
  </div>

  {# Services Loop #}
  <div class="space-y-2 mb-4">
    {% for service in services %}
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-medium text-slate-200">{{ service.name }}</span>
          <span class="text-[10px] font-mono text-slate-500">:{{ service.port }}</span>
        </div>
        <span class="font-mono text-slate-400 text-[11px]">{{ service.latency }}</span>
      </div>
    {% endfor %}
  </div>

  {# Interactive Celery Trigger #}
  <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
    <button
      id="celery-btn"
      class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
    >
      <span>⚡ Queue Celery Task</span>
      <span id="celery-counter" class="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]">1</span>
    </button>
    <span id="celery-msg" class="text-xs text-emerald-400 font-mono">
      Broker Connected
    </span>
  </div>
</div>
`,
  },
  queryset_collection: {
    label: "📦 Django QuerySet Table (Model.objects.all())",
    code: `{# Context:
{
  "title": "TelemetryEvent.objects.order_by('-created_at')[:4]",
  "events": [
    { "id": 501, "topic": "auth.gatekeeper", "level": "INFO", "latency": "0.4ms", "status": "processed" },
    { "id": 502, "topic": "payment.settlement", "level": "SUCCESS", "latency": "1.2ms", "status": "processed" },
    { "id": 503, "topic": "ml.inference.cluster", "level": "WARN", "latency": "14.2ms", "status": "queued" },
    { "id": 504, "topic": "storage.gcs.snapshot", "level": "INFO", "latency": "3.1ms", "status": "processed" }
  ]
}
#}

<div class="p-6 max-w-xl mx-auto bg-slate-900 rounded-2xl border border-emerald-500/25 shadow-2xl text-slate-100 font-sans">
  <div class="flex items-center justify-between mb-4">
    <div>
      <h3 class="text-base font-bold text-white">{{ title }}</h3>
      <p class="text-xs text-emerald-400/90 font-mono">Django ORM QuerySet • Template Rendering</p>
    </div>
    <span class="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
      {{ events|length }} Records
    </span>
  </div>

  <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
    <table class="w-full text-left text-xs">
      <thead class="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
        <tr>
          <th class="p-3">ID</th>
          <th class="p-3">Topic Event</th>
          <th class="p-3">Level</th>
          <th class="p-3">Status</th>
          <th class="p-3 text-right">Latency</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800/60">
        {% for event in events %}
          <tr class="hover:bg-slate-800/40 transition-colors">
            <td class="p-3 font-mono text-slate-500">#{{ event.id }}</td>
            <td class="p-3 font-semibold text-white">{{ event.topic }}</td>
            <td class="p-3 font-mono text-emerald-400">{{ event.level }}</td>
            <td class="p-3">
              {% if event.status == "processed" %}
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">Processed</span>
              {% else %}
                <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">Queued</span>
              {% endif %}
            </td>
            <td class="p-3 text-right font-mono text-slate-400">{{ event.latency }}</td>
          </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
</div>
`,
  },
};

/**
 * Lightweight in-browser Jinja2 / Django Template compiler:
 * Compiles {# ... #}, {{ variable }}, {{ variable|upper }}, {{ variable|length }},
 * {% for item in items %}, {% if item.status == 'val' %},
 * and injects Tailwind CSS runtime.
 */
function compileJinjaToHtml(template: string): string {
  try {
    let source = template;
    let jinjaContext: Record<string, unknown> = {};

    // 1. Extract JSON context comment if present: {# Context: { ... } #}
    const contextMatch = source.match(/{#\s*Context:\s*([\s\S]*?)#}/);
    if (contextMatch && contextMatch[1]) {
      try {
        jinjaContext = JSON.parse(contextMatch[1]);
      } catch {
        jinjaContext = {};
      }
    }

    // Strip comments: {# ... #}
    source = source.replace(/{#[\s\S]*?#}/g, "");

    // 2. Process for loops: {% for item in items %} ... {% endfor %}
    source = source.replace(
      /{%\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([a-zA-Z0-9_]+)\s*%}([\s\S]*?){%\s*endfor\s*%}/g,
      (_: string, itemName: string, colName: string, loopBody: string) => {
        const collection = jinjaContext[colName];
        if (!Array.isArray(collection)) return "";

        return collection
          .map((item: Record<string, unknown>) => {
            let rendered = loopBody;

            // Replace {{ item.property }} or {{ item['property'] }}
            rendered = rendered.replace(
              new RegExp(`{{\\s*${itemName}\\.([a-zA-Z0-9_]+)\\s*}}`, "g"),
              (__: string, field: string) => (item[field] !== undefined ? String(item[field]) : "")
            );

            // Replace conditionals inside loop:
            // {% if item.status == "processed" %} ... {% else %} ... {% endif %}
            rendered = rendered.replace(
              new RegExp(
                `{%\s*if\s+${itemName}\\.([a-zA-Z0-9_]+)\s*==\s*["']([^"']+)["']\s*%}([\\s\\S]*?)(?:{%\s*else\s*%}([\\s\\S]*?))?{%\s*endif\s*%}`,
                "g"
              ),
              (__: string, field: string, expected: string, ifBranch: string, elseBranch: string) => {
                return item[field] === expected ? ifBranch : (elseBranch || "");
              }
            );

            return rendered;
          })
          .join("");
      }
    );

    // 3. Process filter: {{ collection|length }}
    source = source.replace(/{{\s*([a-zA-Z0-9_]+)\|length\s*}}/g, (_: string, colName: string) => {
      const col = jinjaContext[colName];
      return Array.isArray(col) ? String(col.length) : "0";
    });

    // 4. Process filter: {{ variable|upper }}
    source = source.replace(/{{\s*([a-zA-Z0-9_]+)\|upper\s*}}/g, (_: string, field: string) => {
      const val = jinjaContext[field];
      return typeof val === "string" ? val.toUpperCase() : String(val || "");
    });

    // 5. Process top-level variable interpolation: {{ variable }}
    source = source.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_: string, field: string) => {
      return jinjaContext[field] !== undefined ? String(jinjaContext[field]) : "";
    });

    // 6. Clean up remaining unresolved Jinja tags
    source = source.replace(/{%.*?%}/g, "");
    source = source.replace(/{{.*?}}/g, "");

    return source.trim();
  } catch (err) {
    console.error("Jinja/Django template compilation error:", err);
    return `<div class="p-4 bg-emerald-950/40 text-emerald-300 rounded-lg">Django/Jinja Template Compile Error: ${String(err)}</div>`;
  }
}

export function DjangoJinjaRenderer({
  initialCode,
  className = "",
  defaultEngineMode = "jinja-engine",
  localServerPort = 8000,
  onCodeChange,
}: DjangoJinjaRendererProps) {
  const codeToUse = initialCode || DJANGO_JINJA_PRESETS.telemetry_card.code;
  const [code, setCode] = useState(codeToUse);
  const [device, setDevice] = useState<DjangoDevicePreset>("desktop");
  const [viewMode, setViewMode] = useState<DjangoViewMode>("split");
  const [engineMode, setEngineMode] = useState<DjangoEngineMode>(defaultEngineMode);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleApplyVisualProps = (newProps: UniversalVisualProps) => {
    const patched = applyVisualProps(code, "django", newProps);
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

  // Ping local Django server if in django-server mode
  useEffect(() => {
    if (engineMode !== "django-server") return;
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

    if (engineMode === "django-server") {
      iframe.src = `http://localhost:${localServerPort}`;
      return;
    }

    const compiledBody = compileJinjaToHtml(code);
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
  ${compiledBody}

  <script>
    document.addEventListener("click", function(e) {
      const btn = e.target.closest('#celery-btn');
      if (!btn) return;
      const counter = document.getElementById('celery-counter');
      const msg = document.getElementById('celery-msg');
      if (counter) {
        let current = parseInt(counter.textContent || "0", 10);
        counter.textContent = (current + 1).toString();
      }
      if (msg) {
        msg.textContent = "⚡ Celery Task Queued (" + new Date().toLocaleTimeString() + ")";
        msg.classList.add("text-emerald-400");
        setTimeout(() => {
          msg.textContent = "Broker Connected";
        }, 1200);
      }
    });
  </script>
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
    const preset = DJANGO_JINJA_PRESETS[key];
    if (preset) {
      setCode(preset.code);
      if (onCodeChange) onCodeChange(preset.code);
    }
  };

  const deviceWidthMap: Record<DjangoDevicePreset, string> = {
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Django 5.1 • Jinja2 / DTL</span>
          </div>

          {/* Preset Selector */}
          <select
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            {Object.entries(DJANGO_JINJA_PRESETS).map(([key, item]) => (
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
            onClick={() => setEngineMode("jinja-engine")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "jinja-engine"
                ? "bg-emerald-600 text-white shadow-sm font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="In-Browser Jinja2 / Django template execution engine"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Jinja Engine</span>
          </button>
          <button
            type="button"
            onClick={() => setEngineMode("django-server")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "django-server"
                ? "bg-emerald-600 text-white shadow-sm font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title={`Connect to local Django server on port ${localServerPort}`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Django Server</span>
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
                className={`p-1.5 rounded-md ${device === "desktop" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white"}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("tablet")}
                className={`p-1.5 rounded-md ${device === "tablet" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white"}`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("iphone")}
                className={`p-1.5 rounded-md ${device === "iphone" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white"}`}
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
              className={`p-1.5 rounded-md ${viewMode === "canvas" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white"}`}
              title="Canvas Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-md ${viewMode === "split" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white"}`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={`p-1.5 rounded-md ${viewMode === "code" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white"}`}
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
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Toggle Visual Property Controls (No-Code)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tweak Props</span>
          </button>

          {/* Reload Button */}
          <button
            type="button"
            onClick={handleReload}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Recompile Django Template"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
          </button>

          {/* Copy Snippet Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Copy Django Template Code"
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
        language="django"
        onApplyToProps={handleApplyVisualProps}
      />

      {/* Main Execution Body */}
      <div className="flex-1 flex overflow-hidden min-h-[440px]">
        {/* Code Editor Pane */}
        {(viewMode === "split" || viewMode === "code") && (
          <div className={`${viewMode === "split" ? "w-1/2 border-r border-slate-800" : "w-full"} flex flex-col bg-[#060a14]`}>
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/60 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span>templates/components/telemetry.html</span>
              <span className="text-emerald-400">Django/Jinja2 Active</span>
            </div>
            <textarea
              value={code}
              onChange={handleCodeEdit}
              spellCheck={false}
              className="flex-1 p-4 bg-transparent font-mono text-xs text-slate-200 resize-none focus:outline-none leading-relaxed selection:bg-emerald-500/30 overflow-y-auto"
            />
          </div>
        )}

        {/* Live Canvas Preview Pane */}
        {(viewMode === "split" || viewMode === "canvas") && (
          <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} flex flex-col items-center justify-center p-4 bg-[#03060c] overflow-auto`}>
            <div className={`${deviceWidthMap[device]} h-full min-h-[380px] rounded-xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#070b14] flex flex-col transition-all duration-300`}>
              <iframe
                ref={iframeRef}
                title="Django Jinja2 Live Preview"
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
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Django 5.1 / Jinja2</span>
          </span>
          <span>•</span>
          <span className="text-slate-500">Filter Pipes & Tags</span>
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
