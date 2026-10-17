"use client";

import React, { useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import {
  generateSandpackFiles,
  getTemplateForLanguage,
  detectDynamicDependencies,
} from "./stack-templates";
import {
  LivePropertyInspector,
  ComponentVisualProps,
} from "./LivePropertyInspector";
import {
  Eye,
  Code2,
  Columns,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  Globe,
} from "lucide-react";
import { ProjectServerRenderer } from "./ProjectServerRenderer";

export type RenderViewMode = "split" | "preview" | "code";

interface LiveSandboxRendererProps {
  initialCode: string;
  language?: string;
  className?: string;
  filePath?: string;
}

export function LiveSandboxRenderer({
  initialCode,
  language = "tsx",
  className = "",
  filePath = "src/app/page.tsx",
}: LiveSandboxRendererProps) {
  const [engineMode, setEngineMode] = useState<"sandbox" | "project">("sandbox");
  const [viewMode, setViewMode] = useState<RenderViewMode>("split");
  const [prevInitialCode, setPrevInitialCode] = useState(initialCode);
  const [currentCode, setCurrentCode] = useState(initialCode);

  if (initialCode !== prevInitialCode) {
    setPrevInitialCode(initialCode);
    setCurrentCode(initialCode);
  }

  const [prevLang, setPrevLang] = useState(language);
  const [activeLang, setActiveLang] = useState(language);

  if (language !== prevLang) {
    setPrevLang(language);
    setActiveLang(language);
  }

  const [showInspector, setShowInspector] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const template = getTemplateForLanguage(activeLang);
  const files = generateSandpackFiles(currentCode, activeLang);

  const handleRestart = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleApplyVisualProps = (vProps: ComponentVisualProps) => {
    let updated = currentCode;

    // Dynamically replace title if present
    const titleMatch = updated.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/);
    if (titleMatch) {
      updated = updated.replace(
        /<h([1-6])([^>]*)>(.*?)<\/h\1>/,
        `<h$1$2>${vProps.title}</h$1>`
      );
    }

    // Replace padding classes
    updated = updated.replace(/\bp-(?:3|4|6|8)\b/g, vProps.padding);

    // Replace border radius classes
    updated = updated.replace(
      /\brounded-(?:none|md|lg|xl|2xl|full)\b/g,
      vProps.borderRadius
    );

    // Replace accent colors in bg and text
    const colorMap: Record<string, string> = {
      sky: "sky",
      indigo: "indigo",
      emerald: "emerald",
      rose: "rose",
      amber: "amber",
      violet: "violet",
    };
    const targetColor = colorMap[vProps.accentColor] || "sky";
    updated = updated.replace(
      /\b(?:bg|text|from|to|border)-(?:sky|indigo|emerald|rose|amber|violet)-([0-9]{2,3})\b/g,
      (match, shade) => {
        const prefix = match.split("-")[0];
        return `${prefix}-${targetColor}-${shade}`;
      }
    );

    setCurrentCode(updated);
  };

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-2xl transition-all my-6 ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Engine Mode Switcher */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setEngineMode("sandbox")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
                engineMode === "sandbox"
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Component Playbox Sandbox (Isolated in-memory render with zero CSS bleed)"
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Playbox</span>
            </button>
            <button
              type="button"
              onClick={() => setEngineMode("project")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
                engineMode === "project"
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Live Project Dev Server (Background server with route navigation and live reload)"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>Project Server</span>
            </button>
          </div>

          {engineMode === "sandbox" && (
            <>
              {/* Status Badge */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-xs font-medium text-sky-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span>HMR Active</span>
              </div>

              {/* Stack / Language Badge */}
              <select
                value={activeLang}
                onChange={(e) => setActiveLang(e.target.value)}
                className="text-xs font-mono font-medium bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-md px-2 py-0.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
              >
                <option value="tsx">React (TypeScript + Tailwind)</option>
                <option value="jsx">React (JSX)</option>
                <option value="vue">Vue 3 (SFC + Scoped CSS)</option>
                <option value="svelte">Svelte (Reactive + Scoped CSS)</option>
                <option value="angular">Angular (Ivy + Scoped CSS)</option>
                <option value="html">Vanilla HTML / CSS</option>
              </select>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {engineMode === "sandbox" && (
            <>
              {/* No-Code Inspector Toggle */}
              <button
                type="button"
                onClick={() => setShowInspector(!showInspector)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  showInspector
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm"
                    : "bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60"
                }`}
                title="Toggle Visual Property Controls"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                <span>Tweak Props</span>
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode("code")}
                  title="Code View"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    viewMode === "code"
                      ? "bg-slate-800 text-sky-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("split")}
                  title="Split View (Code & Live Render)"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    viewMode === "split"
                      ? "bg-slate-800 text-sky-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Split</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  title="Live Render WYSIWYG"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    viewMode === "preview"
                      ? "bg-slate-800 text-sky-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Render</span>
                </button>
              </div>

              {/* Reset / Reload Button */}
              <button
                type="button"
                onClick={handleRestart}
                title="Reload Sandbox"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Conditionally Render: Project Server Mode OR Playbox Sandbox */}
      {engineMode === "project" ? (
        <ProjectServerRenderer
          currentFilePath={filePath}
          className="border-none !rounded-none min-h-[440px]"
        />
      ) : (
        <>
          {/* No-Code Visual Property Inspector Bar */}
          <LivePropertyInspector
            isOpen={showInspector}
            onClose={() => setShowInspector(false)}
            onApplyToProps={handleApplyVisualProps}
          />

      {/* Sandpack Isolated Sandbox Execution Engine */}
      <SandpackProvider
        key={`${activeLang}-${refreshKey}`}
        template={template}
        theme="dark"
        files={files}
        customSetup={{
          dependencies: detectDynamicDependencies(currentCode),
        }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
          autoReload: true,
          recompileMode: "delayed",
          recompileDelay: 300,
        }}
      >
        <SandpackLayout
          className={`border-none !rounded-none !bg-transparent min-h-[360px] ${
            viewMode === "code"
              ? "[&>.sp-preview-container]:!hidden"
              : viewMode === "preview"
              ? "[&>.sp-code-editor]:!hidden"
              : ""
          }`}
        >
          {viewMode !== "preview" && (
            <SandpackCodeEditor
              showLineNumbers
              showInlineErrors
              wrapContent
              style={{ height: 380 }}
            />
          )}
          {viewMode !== "code" && (
            <div className="relative flex-1 min-w-[280px]">
              <div className="absolute top-2 right-2 z-10 pointer-events-none flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] text-slate-400 backdrop-blur-sm">
                <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                <span>Isolated CSS Sandbox</span>
              </div>
              <SandpackPreview
                showRefreshButton={true}
                showOpenInCodeSandbox={false}
                style={{ height: 380 }}
              />
            </div>
          )}
        </SandpackLayout>
      </SandpackProvider>
      </>
      )}
    </div>
  );
}
