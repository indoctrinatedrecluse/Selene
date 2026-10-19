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
  Wind,
} from "lucide-react";
import { UniversalPropertyInspector } from "./UniversalPropertyInspector";
import { applyVisualProps, UniversalVisualProps } from "@/lib/ast-transformer";
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

export type SwiftDevicePreset = "iphone" | "ipad" | "desktop";
export type SwiftViewMode = "split" | "canvas" | "code";
export type SwiftEngineMode = "swiftui-engine" | "swift-server";

interface SwiftUiRendererProps {
  initialCode?: string;
  className?: string;
  defaultEngineMode?: SwiftEngineMode;
  localServerPort?: number;
  onCodeChange?: (newCode: string) => void;
}

export const SWIFT_PRESETS: Record<string, { label: string; code: string }> = {
  telemetry_card: {
    label: "💨 Zephyr SwiftUI Mission Telemetry Card",
    code: `import SwiftUI

struct ApolloTelemetryView: View {
    @State private var telemetryPulse = 42
    @State private var shieldsEngaged = true
    @State private var thrusterOutput = 98.4
    
    var body: some View {
        VStack(spacing: 16) {
            // Header with Apple Cupertino Aesthetic
            HStack {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(LinearGradient(colors: [.cyan, .blue], startPoint: .topLeading, endPoint: .bottomTrailing))
                        .frame(width: 44, height: 44)
                    Image(systemName: "wind")
                        .foregroundColor(.white)
                        .font(.system(size: 20, weight: .bold))
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("Zephyr Lunar Orbiter")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("SwiftUI 6.0 • Multiplatform Canvas")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundColor(.cyan)
                }
                
                Spacer()
                
                Text(shieldsEngaged ? "ARMED" : "STANDBY")
                    .font(.system(size: 10, weight: .semibold, design: .monospaced))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(shieldsEngaged ? Color.green.opacity(0.15) : Color.gray.opacity(0.2))
                    .foregroundColor(shieldsEngaged ? .green : .gray)
                    .cornerRadius(8)
            }
            .padding(.bottom, 6)
            
            // Metrics Row
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("THRUSTER DELTA-V")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.gray)
                    Text("\\(String(format: "%.1f", thrusterOutput)) km/s")
                        .font(.system(size: 18, weight: .heavy, design: .monospaced))
                        .foregroundColor(.white)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
                .background(Color(white: 0.12))
                .cornerRadius(12)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("PULSES LOGGED")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.gray)
                    Text("\\(telemetryPulse)")
                        .font(.system(size: 18, weight: .heavy, design: .monospaced))
                        .foregroundColor(.cyan)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
                .background(Color(white: 0.12))
                .cornerRadius(12)
            }
            
            // Interactive Controls
            VStack(spacing: 10) {
                Button(action: {
                    telemetryPulse += 1
                    thrusterOutput += 0.2
                }) {
                    HStack {
                        Image(systemName: "bolt.fill")
                        Text("Pulse Inertial Vector (\\(telemetryPulse))")
                    }
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(LinearGradient(colors: [.blue, .cyan], startPoint: .leading, endPoint: .trailing))
                    .cornerRadius(12)
                }
                
                Toggle("Engage Deflector Matrix", isOn: $shieldsEngaged)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white)
                    .padding(.horizontal, 4)
            }
        }
        .padding(20)
        .background(Color(white: 0.08))
        .cornerRadius(20)
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.cyan.opacity(0.3), lineWidth: 1)
        )
    }
}
`,
  },
  settings_form: {
    label: "⚙️ SwiftUI Settings & Navigation Form",
    code: `import SwiftUI

struct NavigationSettingsView: View {
    @State private var autoSync = true
    @State private var telemetryInterval = 5
    @State private var channelName = "Artemis-Prime"
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Communications & Beacon")
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            
            VStack(spacing: 0) {
                HStack {
                    Text("Transponder Beacon")
                        .foregroundColor(.white)
                    Spacer()
                    Toggle("", isOn: $autoSync)
                }
                .padding(14)
                
                Divider().background(Color(white: 0.2))
                
                HStack {
                    Text("Telemetry Channel")
                        .foregroundColor(.white)
                    Spacer()
                    Text(channelName)
                        .font(.system(size: 13, design: .monospaced))
                        .foregroundColor(.cyan)
                }
                .padding(14)
            }
            .background(Color(white: 0.12))
            .cornerRadius(14)
            
            Button("Reset Avionics Calibration") {
                telemetryInterval = 5
            }
            .font(.system(size: 12, weight: .medium))
            .foregroundColor(.red)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
        }
        .padding(20)
        .background(Color(white: 0.07))
        .cornerRadius(20)
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.white.opacity(0.15), lineWidth: 1)
        )
    }
}
`,
  },
};

/**
 * Lightweight in-browser SwiftUI to HTML compiler simulation.
 * Translates SwiftUI declarative stacks (VStack, HStack, ZStack, Text, Button, Toggle)
 * into Cupertino dark-mode HTML with fluid state handlers.
 */
function compileSwiftUiToHtml(code: string): string {
  const source = code.trim();
  if (!source) {
    throw new Error("SwiftUI code cannot be empty.");
  }

  // 1. Extract @State variables:
  const stateVars: Record<string, unknown> = {};
  const stateRegex = /@State\s+(?:private\s+)?var\s+([a-zA-Z0-9_]+)\s*=\s*(.*)$/gm;
  let sMatch: RegExpExecArray | null;

  while ((sMatch = stateRegex.exec(source)) !== null) {
    const varName = sMatch[1];
    const valStr = sMatch[2].trim();

    if (valStr === "true") stateVars[varName] = true;
    else if (valStr === "false") stateVars[varName] = false;
    else if (/^-?\d+(\.\d+)?$/.test(valStr)) stateVars[varName] = Number(valStr);
    else if (valStr.startsWith('"') && valStr.endsWith('"')) stateVars[varName] = valStr.slice(1, -1);
    else stateVars[varName] = valStr;
  }

  // 2. Locate body View closure: var body: some View { ... }
  const bodyMatch = source.match(/var\s+body:\s*some\s+View\s*\{([\s\S]*)\}\s*$/);
  let viewBody = bodyMatch ? bodyMatch[1] : source;

  // Verify SwiftUI structure
  if (!viewBody.includes("VStack") && !viewBody.includes("HStack") && !viewBody.includes("Text")) {
    throw new Error("Expected SwiftUI declarative structure (e.g. VStack, HStack, Text, Button).");
  }

  // 3. Resolve String interpolations: \(var) or \(String(format: ...))
  viewBody = viewBody.replace(/\\\(String\(format:\s*"[^"]*",\s*([a-zA-Z0-9_]+)\)\)/g, (_m, varName) => {
    return `<span id="swift-${varName}-val">${stateVars[varName] ?? "0.0"}</span>`;
  });
  viewBody = viewBody.replace(/\\\(([a-zA-Z0-9_]+)\)/g, (_m, varName) => {
    return `<span id="swift-${varName}-val">${stateVars[varName] ?? "0"}</span>`;
  });

  // 4. Translate SwiftUI primitives to HTML elements
  // Images (SF symbols)
  viewBody = viewBody.replace(/Image\(systemName:\s*"([^"]+)"\)/g, (_m, sfName) => {
    return `<span class="inline-block text-cyan-400 font-mono text-sm">✦ [${sfName}]</span>`;
  });

  // Spacers
  viewBody = viewBody.replace(/Spacer\(\)/g, '<div class="flex-1"></div>');

  // Dividers
  viewBody = viewBody.replace(/Divider\(\)(?:\.[a-zA-Z0-9_]+\([^)]*\))*/g, '<div class="h-px w-full bg-white/10 my-1"></div>');

  // Text
  viewBody = viewBody.replace(/Text\(\s*(?:"([^"]+)"|([a-zA-Z0-9_]+))\s*\)/g, (_m, strLiteral, varName) => {
    const content = strLiteral !== undefined ? strLiteral : String(stateVars[varName] ?? varName);
    return `<span class="swift-text">${content}</span>`;
  });

  // Toggles: Toggle("...", isOn: $...)
  viewBody = viewBody.replace(/Toggle\(\s*"([^"]*)",\s*isOn:\s*\$([a-zA-Z0-9_]+)\s*\)/g, (_m, label, varName) => {
    const isChecked = Boolean(stateVars[varName]);
    return `<label class="flex items-center justify-between gap-3 cursor-pointer py-1">
      <span class="text-sm font-medium text-slate-200">${label}</span>
      <div class="relative inline-flex items-center">
        <input type="checkbox" id="swift-toggle-${varName}" class="sr-only peer" ${isChecked ? "checked" : ""}>
        <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
      </div>
    </label>`;
  });

  // Buttons: Button("...") { ... } or Button(action: { ... }) { ... }
  viewBody = viewBody.replace(/Button\(action:\s*\{[\s\S]*?\}\)\s*\{([\s\S]*?)\}/g, (_m, content) => {
    return `<button id="swift-action-btn" class="w-full transition-all active:scale-98 cursor-pointer select-none">${content}</button>`;
  });
  viewBody = viewBody.replace(/Button\("([^"]+)"\)\s*\{[\s\S]*?\}/g, (_m, label) => {
    return `<button id="swift-action-btn" class="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-md">${label}</button>`;
  });

  // VStack
  viewBody = viewBody.replace(/VStack(?:\([^)]*\))?\s*\{/g, '<div class="flex flex-col gap-3">');

  // HStack
  viewBody = viewBody.replace(/HStack(?:\([^)]*\))?\s*\{/g, '<div class="flex items-center gap-3">');

  // ZStack
  viewBody = viewBody.replace(/ZStack(?:\([^)]*\))?\s*\{/g, '<div class="relative flex items-center justify-center">');

  // Close blocks
  viewBody = viewBody.replace(/\}/g, "</div>");

  // Remove SwiftUI modifier chain remnants that don't match standard HTML
  viewBody = viewBody.replace(/\.[a-zA-Z0-9_]+\([^)]*\)/g, "");

  // Wrap in Apple Cupertino dark container
  return `<div class="p-6 max-w-md w-full mx-auto bg-[#1c1c1e] text-white rounded-3xl border border-cyan-500/30 shadow-2xl font-sans space-y-4">
    ${viewBody}
  </div>`;
}

export function SwiftUiRenderer({
  initialCode = SWIFT_PRESETS.telemetry_card.code,
  className = "",
  defaultEngineMode = "swiftui-engine",
  localServerPort = 8080,
  onCodeChange,
}: SwiftUiRendererProps) {
  const [code, setCode] = useState(initialCode);
  const [device, setDevice] = useState<SwiftDevicePreset>("iphone");
  const [viewMode, setViewMode] = useState<SwiftViewMode>("split");
  const [engineMode, setEngineMode] = useState<SwiftEngineMode>(defaultEngineMode);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleApplyVisualProps = (newProps: UniversalVisualProps) => {
    const patched = applyVisualProps(code, "swift", newProps);
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

  // Ping local Swift / Vapor server if in swift-server mode
  useEffect(() => {
    if (engineMode !== "swift-server") return;
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
    if (engineMode === "swift-server") {
      return { compiledBody: null, compileError: null };
    }
    try {
      const body = compileSwiftUiToHtml(code);
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

    if (engineMode === "swift-server") {
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
      background-color: #000000;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
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
  <div class="p-6 max-w-md w-full bg-cyan-950/40 border border-cyan-500/30 rounded-3xl shadow-2xl text-center space-y-3">
    <div class="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto text-lg font-bold">
      ⚠️
    </div>
    <h3 class="text-cyan-300 font-bold text-sm font-sans">SwiftUI Compilation Error</h3>
    <pre class="p-3 bg-slate-950/80 rounded-2xl border border-cyan-900/40 text-cyan-300 text-xs font-mono text-left whitespace-pre-wrap overflow-x-auto">${safeErr}</pre>
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
      background-color: #000000;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif;
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
      const btn = e.target.closest('#swift-action-btn');
      if (!btn) return;
      
      const pulseEl = document.querySelector('[id*="telemetryPulse-val"]');
      const outputEl = document.querySelector('[id*="thrusterOutput-val"]');
      
      if (pulseEl) {
        let current = parseInt(pulseEl.textContent || "42", 10);
        pulseEl.textContent = (current + 1).toString();
      }
      if (outputEl) {
        let currentOut = parseFloat(outputEl.textContent || "98.4");
        outputEl.textContent = (currentOut + 0.2).toFixed(1);
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
      if (engineMode === "swift-server") {
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
    const preset = SWIFT_PRESETS[key];
    if (preset) {
      setCode(preset.code);
      if (onCodeChange) onCodeChange(preset.code);
    }
  };

  const deviceWidthMap: Record<SwiftDevicePreset, string> = {
    desktop: "w-full",
    ipad: "w-[680px]",
    iphone: "w-[390px]",
  };

  return (
    <div className={`flex flex-col rounded-2xl border border-slate-800 bg-[#070b16] shadow-2xl overflow-hidden transition-all ${className}`}>
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#090e1d] border-b border-slate-800 gap-2">
        {/* Left: Branding & Presets */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 font-mono text-xs font-semibold">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zephyr Swift Canvas (SwiftUI)</span>
          </div>

          {/* Preset Selector */}
          <select
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            {Object.entries(SWIFT_PRESETS).map(([key, item]) => (
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
            onClick={() => setEngineMode("swiftui-engine")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "swiftui-engine"
                ? "bg-cyan-600 text-white font-medium shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="In-Browser SwiftUI Declarative Engine: Zero Latency Simulation"
          >
            <Zap className="w-3 h-3 text-amber-300" />
            <span>SwiftUI Engine</span>
          </button>
          <button
            type="button"
            onClick={() => setEngineMode("swift-server")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              engineMode === "swift-server"
                ? "bg-cyan-600 text-white font-medium shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title={`Swift Server: Bridge to local Swift / Vapor backend on port ${localServerPort}`}
          >
            <Server className="w-3 h-3 text-cyan-300" />
            <span>Swift Server</span>
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
                className={`p-1.5 rounded-md ${device === "desktop" ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-white"}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("ipad")}
                className={`p-1.5 rounded-md ${device === "ipad" ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-white"}`}
                title="iPad View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("iphone")}
                className={`p-1.5 rounded-md ${device === "iphone" ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-white"}`}
                title="iPhone View"
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
            title="Recompile SwiftUI View"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          {/* Copy Snippet Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Copy SwiftUI Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Universal No-Code Visual Property Inspector */}
      <UniversalPropertyInspector
        isOpen={showInspector}
        onClose={() => setShowInspector(false)}
        code={code}
        language="swift"
        onApplyToProps={handleApplyVisualProps}
      />

      {/* Main Execution Body */}
      <div className="flex-1 flex overflow-hidden min-h-[440px]">
        {/* Code Editor Pane */}
        {(viewMode === "split" || viewMode === "code") && (
          <div className={`${viewMode === "split" ? "w-1/2 border-r border-slate-800" : "w-full"} flex flex-col bg-[#060a14]`}>
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/60 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Wind className="w-3 h-3 text-cyan-400" />
                <span>Sources/App/TelemetryView.swift</span>
              </span>
              <span className="text-cyan-400">SwiftUI 6.0</span>
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
                  language="swift"
                  errorMessage={compileError}
                  onApplyFix={(fixedCode) => {
                    setCode(fixedCode);
                    if (onCodeChange) onCodeChange(fixedCode);
                  }}
                />
              </div>
            )}
            <div className={`${deviceWidthMap[device]} h-full min-h-[380px] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#000000] flex flex-col transition-all duration-300`}>
              <iframe
                ref={iframeRef}
                title="SwiftUI Live Preview"
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
            <span>Swift 6.0 / SwiftUI Multiplatform</span>
          </span>
          <span>•</span>
          <span className="text-slate-500">Cupertino Dark Mode</span>
          <span>•</span>
          <span className="text-slate-500">State Hoisting</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span>Isolated Iframe Sandbox</span>
        </div>
      </div>
    </div>
  );
}
