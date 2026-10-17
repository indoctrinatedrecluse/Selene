"use client";

import React from "react";
import {
  Sparkles,
  Globe,
  Layers,
  ArrowRightLeft,
} from "lucide-react";

export type RenderEngineMode = "sandbox" | "project" | "split";

interface RenderEngineSwitcherProps {
  currentMode: RenderEngineMode;
  onModeChange: (mode: RenderEngineMode) => void;
  className?: string;
  projectPort?: number;
  isServerRunning?: boolean;
}

export function RenderEngineSwitcher({
  currentMode,
  onModeChange,
  className = "",
  projectPort = 3000,
  isServerRunning = true,
}: RenderEngineSwitcherProps) {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-xl text-xs backdrop-blur-md ${className}`}
    >
      <div className="flex items-center gap-1 px-2 text-slate-400 font-mono text-[11px] border-r border-slate-800 mr-1 select-none">
        <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
        <span className="font-semibold text-slate-300">Engine</span>
      </div>

      {/* Sandbox / Playbox Mode */}
      <button
        type="button"
        onClick={() => onModeChange("sandbox")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
          currentMode === "sandbox"
            ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 font-semibold"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
        }`}
        title="Micro-Sandbox: Isolated in-browser execution with Tweak Props"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Playbox Sandbox</span>
      </button>

      {/* Full Project Dev Server Mode */}
      <button
        type="button"
        onClick={() => onModeChange("project")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
          currentMode === "project"
            ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 font-semibold"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
        }`}
        title={`Live Project Engine: Connected to background dev server on port ${projectPort}`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Project Server</span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isServerRunning ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
          }`}
        ></span>
      </button>

      {/* Split Dual Mode */}
      <button
        type="button"
        onClick={() => onModeChange("split")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
          currentMode === "split"
            ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 font-semibold"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
        }`}
        title="Dual Canvas: Side-by-side Editor & Live Project Preview"
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Dual Split</span>
      </button>
    </div>
  );
}
