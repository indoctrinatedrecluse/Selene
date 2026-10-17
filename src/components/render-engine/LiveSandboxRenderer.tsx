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
} from "./stack-templates";
import {
  Eye,
  Code2,
  Columns,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export type RenderViewMode = "split" | "preview" | "code";

interface LiveSandboxRendererProps {
  initialCode: string;
  language?: string;
  onCodeChange?: (code: string) => void;
  className?: string;
}

export function LiveSandboxRenderer({
  initialCode,
  language = "tsx",
  className = "",
}: LiveSandboxRendererProps) {
  const [viewMode, setViewMode] = useState<RenderViewMode>("split");
  const [activeLang, setActiveLang] = useState(language);
  const [refreshKey, setRefreshKey] = useState(0);

  const template = getTemplateForLanguage(activeLang);
  const files = generateSandpackFiles(initialCode, activeLang);

  const handleRestart = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-2xl transition-all my-6 ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-xs font-medium text-sky-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span>Live HMR Active</span>
          </div>

          {/* Stack / Language Badge */}
          <select
            value={activeLang}
            onChange={(e) => setActiveLang(e.target.value)}
            className="text-xs font-mono font-medium bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-md px-2.5 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
          >
            <option value="tsx">React (TypeScript + Tailwind)</option>
            <option value="jsx">React (JSX)</option>
            <option value="vue">Vue 3</option>
            <option value="svelte">Svelte</option>
            <option value="html">Vanilla HTML / CSS</option>
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Sandpack Isolated Sandbox Execution Engine */}
      <SandpackProvider
        key={`${activeLang}-${refreshKey}`}
        template={template}
        theme="dark"
        files={files}
        customSetup={{
          dependencies: {
            "lucide-react": "latest",
          },
        }}
        options={{
          autoReload: true,
          recompileMode: "delayed",
          recompileDelay: 350,
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
                showRefreshButton={false}
                showOpenInCodeSandbox={false}
                style={{ height: 380 }}
              />
            </div>
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
