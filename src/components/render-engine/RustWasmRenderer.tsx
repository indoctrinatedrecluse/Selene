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
  Cpu,
} from "lucide-react";
import { UniversalPropertyInspector } from "./UniversalPropertyInspector";
import { applyVisualProps, UniversalVisualProps } from "@/lib/ast-transformer";
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

export type RustDevicePreset = "desktop" | "iphone" | "tablet";
export type RustViewMode = "split" | "canvas" | "code";
export type RustEngineMode = "wasm-engine" | "trunk-server";

interface RustWasmRendererProps {
  initialCode?: string;
  className?: string;
  defaultEngineMode?: RustEngineMode;
  localServerPort?: number;
  onCodeChange?: (newCode: string) => void;
}

export const RUST_WASM_PRESETS: Record<string, { label: string; code: string }> = {
  yew_telemetry: {
    label: "🦀 Rust Yew Component (WebAssembly)",
    code: `use yew::prelude::*;

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
`,
  },
  leptos_fine_grained: {
    label: "⚡ Leptos Fine-Grained Reactive Card",
    code: `use leptos::*;

#[component]
pub fn LeptosCard() -> impl IntoView {
    let (count, set_count) = create_signal(100);

    view! {
        <div class="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-amber-500/30 shadow-2xl text-slate-100 font-sans">
            <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    { "LEPTOS 0.6" }
                </span>
                <span class="text-xs font-mono text-emerald-400 font-semibold">{ "Sub-Millisecond VDOM-Free" }</span>
            </div>
            <h3 class="text-base font-bold text-white mb-2">{ "Fine-Grained Reactive Rust" }</h3>
            <p class="text-xs text-slate-400 leading-relaxed mb-4">
                { "Compiles directly to WebAssembly with zero virtual-DOM overhead and fine-grained DOM pinpoint updates." }
            </p>
            <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button id="rust-counter-btn" class="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md transition-all active:scale-95">
                    { "Increment: " } <span id="rust-counter-val" class="font-mono">{ count }</span>
                </button>
                <span class="text-amber-400 font-mono">{ "wasm32" }</span>
            </div>
        </div>
    }
}
`,
  },
};

/**
 * Lightweight in-browser Rust/Yew/Leptos compiler simulation.
 * Parses html! { ... } or view! { ... } RSX macros, converts to HTML,
 * injects Tailwind CSS, and wires WebAssembly state handlers.
 */
function compileRustWasmToHtml(code: string): string {
  const source = code.trim();
  if (!source) {
    throw new Error("Rust WASM code cannot be empty.");
  }

  // 1. Extract initial numeric count from use_state(|| X) or create_signal(X)
  let initialCount = 42;
  const useStateMatch = source.match(/use_state\(\s*\|\|\s*(\d+)\s*\)/);
  if (useStateMatch) {
    initialCount = parseInt(useStateMatch[1], 10);
  } else {
    const signalMatch = source.match(/create_signal\(\s*(\d+)\s*\)/);
    if (signalMatch) initialCount = parseInt(signalMatch[1], 10);
  }

  // 2. Extract RSX macro content: html! { ... } or view! { ... }
  const macroMatch = source.match(/(?:html|view)!\s*\{([\s\S]*)\}/);
  if (!macroMatch && !source.includes("<")) {
    throw new Error("Expected Rust RSX macro `html! { ... }` or `view! { ... }` or component markup.");
  }
  let rsx = macroMatch ? macroMatch[1] : source;

  // 3. Convert Rust string literals inside JSX: { "text" } -> text
  rsx = rsx.replace(/\{\s*"([^"]*)"\s*\}/g, "$1");

  // 4. Convert format! expressions: { format!("...", ...) }
  rsx = rsx.replace(/\{\s*format!\s*\("([^"]*)",?\s*([^)]*)\)\s*\}/g, "$1");

  // 5. Convert Rust variable interpolations: { *count }, { count }, { memory_alloc }
  rsx = rsx.replace(/\{\s*\*?count\s*\}/g, `<span id="rust-counter-val">${initialCount}</span>`);
  rsx = rsx.replace(/\{\s*\*?([a-zA-Z0-9_]+)\s*\}/g, (_match, varName) => {
    // Look for let varName = "value";
    const letMatch = source.match(new RegExp(`let\\s+${varName}\\s*=\\s*"([^"]+)";`));
    if (letMatch) return letMatch[1];
    return varName;
  });

  // 6. Clean up Rust attributes: {onclick} -> id="rust-counter-btn"
  rsx = rsx.replace(/\{onclick\}/g, 'id="rust-counter-btn"');
  rsx = rsx.replace(/on:click=move\s*\|_[^}]*}/g, 'id="rust-counter-btn"');

  return rsx.trim();
}

export function RustWasmRenderer({
  initialCode = RUST_WASM_PRESETS.yew_telemetry.code,
  className = "",
  defaultEngineMode = "wasm-engine",
  localServerPort = 8080,
  onCodeChange,
}: RustWasmRendererProps) {
  const [code, setCode] = useState(initialCode);
  const [prevInitialCode, setPrevInitialCode] = useState(initialCode);
  if (initialCode !== prevInitialCode) {
    setPrevInitialCode(initialCode);
    if (initialCode) setCode(initialCode);
  }

  const [device, setDevice] = useState<RustDevicePreset>("desktop");
  const [viewMode, setViewMode] = useState<RustViewMode>("split");
  const [engineMode, setEngineMode] = useState<RustEngineMode>(defaultEngineMode);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [showInspector, setShowInspector] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Ping local Trunk / Cargo server if in server mode
  useEffect(() => {
    let isMounted = true;
    if (engineMode === "trunk-server") {
      fetch(`http://localhost:${localServerPort}`, { mode: "no-cors" })
        .then(() => {
          if (isMounted) setServerOnline(true);
        })
        .catch(() => {
          if (isMounted) setServerOnline(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [engineMode, localServerPort]);

  // Derive compilation result synchronously to avoid cascading render effects
  const { compiledBody, compileError } = useMemo(() => {
    if (engineMode === "trunk-server") {
      return { compiledBody: null, compileError: null };
    }
    try {
      const body = compileRustWasmToHtml(code);
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

    if (engineMode === "trunk-server") {
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
  <div class="p-6 max-w-md w-full bg-amber-950/40 border border-amber-500/30 rounded-2xl shadow-2xl text-center space-y-3">
    <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-lg font-bold">
      ⚠️
    </div>
    <h3 class="text-amber-300 font-bold text-sm font-sans">Rust WebAssembly Compilation Error</h3>
    <pre class="p-3 bg-slate-950/80 rounded-xl border border-amber-900/40 text-amber-300 text-xs font-mono text-left whitespace-pre-wrap overflow-x-auto">${safeErr}</pre>
  </div>
</body>
</html>`;
      iframe.srcdoc = errorHtml;
      return;
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 1.5rem;
      background: transparent;
      color: #f8fafc;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="rust-app" class="w-full flex justify-center">
    ${compiledBody || ""}
  </div>

  <script>
    let rustCount = 42;
    const initialEl = document.getElementById("rust-counter-val");
    if (initialEl) {
      const parsed = parseInt(initialEl.textContent.trim(), 10);
      if (!isNaN(parsed)) rustCount = parsed;
    }

    const btn = document.getElementById("rust-counter-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        rustCount += 1;
        const valEl = document.getElementById("rust-counter-val");
        if (valEl) valEl.textContent = rustCount;
      });
    }
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
      if (engineMode === "trunk-server") {
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
    const preset = RUST_WASM_PRESETS[key];
    if (preset) {
      setCode(preset.code);
      if (onCodeChange) onCodeChange(preset.code);
    }
  };

  const deviceWidthMap: Record<RustDevicePreset, string> = {
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Rust • Yew / Leptos WASM</span>
          </div>

          {/* Preset Selector */}
          <select
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {Object.entries(RUST_WASM_PRESETS).map(([key, item]) => (
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
            onClick={() => setEngineMode("wasm-engine")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "wasm-engine"
                ? "bg-amber-600 text-white shadow-sm font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="In-Browser Rust WebAssembly execution simulation"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>WASM Engine</span>
          </button>
          <button
            type="button"
            onClick={() => setEngineMode("trunk-server")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "trunk-server"
                ? "bg-amber-600 text-white shadow-sm font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title={`Connect to local Trunk / Cargo dev server on port ${localServerPort}`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Trunk Server</span>
            <span className={`w-1.5 h-1.5 rounded-full ${serverOnline ? "bg-emerald-400" : "bg-amber-400"}`}></span>
          </button>
        </div>

        {/* Right: View & Device Switchers */}
        <div className="flex items-center gap-1.5">
          {viewMode !== "code" && (
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`p-1.5 rounded-md ${device === "desktop" ? "bg-slate-800 text-amber-400" : "text-slate-400 hover:text-white"}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("tablet")}
                className={`p-1.5 rounded-md ${device === "tablet" ? "bg-slate-800 text-amber-400" : "text-slate-400 hover:text-white"}`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("iphone")}
                className={`p-1.5 rounded-md ${device === "iphone" ? "bg-slate-800 text-amber-400" : "text-slate-400 hover:text-white"}`}
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
              className={`p-1.5 rounded-md ${viewMode === "canvas" ? "bg-slate-800 text-amber-400" : "text-slate-400 hover:text-white"}`}
              title="Canvas Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-md ${viewMode === "split" ? "bg-slate-800 text-amber-400" : "text-slate-400 hover:text-white"}`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={`p-1.5 rounded-md ${viewMode === "code" ? "bg-slate-800 text-amber-400" : "text-slate-400 hover:text-white"}`}
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
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Toggle Visual Property Controls (No-Code)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Tweak Props</span>
          </button>

          {/* Reload Button */}
          <button
            type="button"
            onClick={handleReload}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Recompile Rust WASM component"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
          </button>

          {/* Copy Snippet Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Copy Rust Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Universal No-Code Visual Property Inspector */}
      <UniversalPropertyInspector
        isOpen={showInspector}
        onClose={() => setShowInspector(false)}
        code={code}
        language="rust"
        onApplyToProps={(newProps: UniversalVisualProps) => {
          const updated = applyVisualProps(code, "rust", newProps);
          setCode(updated);
          if (onCodeChange) onCodeChange(updated);
        }}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-[380px] bg-[#050811] relative">
        {/* Code Editor Pane */}
        {(viewMode === "split" || viewMode === "code") && (
          <div className={`${viewMode === "split" ? "w-1/2 border-r border-slate-800/80" : "w-full"} flex flex-col bg-[#070a14]`}>
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/60 border-b border-slate-800/60 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-amber-400" />
                <span>lib.rs (Yew / Leptos)</span>
              </span>
              <span className="text-[10px] text-amber-400">Rust 2024 Edition</span>
            </div>
            <textarea
              value={code}
              onChange={handleCodeEdit}
              className="flex-1 w-full p-4 bg-transparent text-amber-100/90 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              spellCheck={false}
            />
          </div>
        )}

        {/* Live Canvas Preview Pane */}
        {(viewMode === "split" || viewMode === "canvas") && (
          <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} flex flex-col items-center justify-center p-4 bg-[#080d1a]/50 overflow-auto relative`}>
            {compileError && (
              <div className="absolute inset-x-4 top-4 z-20">
                <SandboxAutoFixLens
                  code={code}
                  language="rust"
                  errorMessage={compileError}
                  onApplyFix={(fixedCode) => {
                    setCode(fixedCode);
                    if (onCodeChange) onCodeChange(fixedCode);
                  }}
                />
              </div>
            )}
            <div className={`transition-all duration-300 ${deviceWidthMap[device]} flex justify-center`}>
              <iframe
                ref={iframeRef}
                title="Rust WebAssembly Live Preview"
                className="w-full h-[400px] rounded-xl border border-slate-800/80 bg-slate-950 shadow-inner"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#080d1b] border-t border-slate-800 text-[10px] text-slate-400 font-mono">
        <span className="flex items-center gap-2">
          <span className="text-amber-400">wasm32-unknown-unknown</span>
          <span>•</span>
          <span>Zero Runtime Overhead</span>
        </span>
        <span>Isolated Memory Sandbox</span>
      </div>
    </div>
  );
}
