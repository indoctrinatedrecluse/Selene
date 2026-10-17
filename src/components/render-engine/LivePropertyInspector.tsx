"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Palette,
  Maximize2,
  Sparkles,
  Type,
  RotateCcw,
  Sun,
} from "lucide-react";

export interface ComponentVisualProps {
  title: string;
  accentColor: string;
  borderRadius: string;
  padding: string;
  shadow: string;
  showBadge: boolean;
}

export const DEFAULT_VISUAL_PROPS: ComponentVisualProps = {
  title: "Selene Live Preview",
  accentColor: "sky",
  borderRadius: "rounded-2xl",
  padding: "p-6",
  shadow: "shadow-xl",
  showBadge: true,
};

interface LivePropertyInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToProps: (props: ComponentVisualProps) => void;
}

const ACCENT_COLORS = [
  { id: "sky", name: "Sky Blue", bg: "bg-sky-500", text: "text-sky-400", hex: "#38bdf8" },
  { id: "indigo", name: "Indigo", bg: "bg-indigo-500", text: "text-indigo-400", hex: "#6366f1" },
  { id: "emerald", name: "Emerald", bg: "bg-emerald-500", text: "text-emerald-400", hex: "#10b981" },
  { id: "rose", name: "Rose", bg: "bg-rose-500", text: "text-rose-400", hex: "#f43f5e" },
  { id: "amber", name: "Amber", bg: "bg-amber-500", text: "text-amber-400", hex: "#f59e0b" },
  { id: "violet", name: "Violet", bg: "bg-violet-500", text: "text-violet-400", hex: "#8b5cf6" },
];

const RADIUS_OPTIONS = [
  { id: "rounded-none", label: "Sharp" },
  { id: "rounded-lg", label: "Medium" },
  { id: "rounded-2xl", label: "Smooth" },
  { id: "rounded-full", label: "Pill" },
];

const PADDING_OPTIONS = [
  { id: "p-3", label: "Compact" },
  { id: "p-6", label: "Balanced" },
  { id: "p-8", label: "Spacious" },
];

const SHADOW_OPTIONS = [
  { id: "shadow-none", label: "Flat" },
  { id: "shadow-md", label: "Subtle" },
  { id: "shadow-xl", label: "Elevated" },
  { id: "shadow-2xl", label: "Glow" },
];

export function LivePropertyInspector({
  isOpen,
  onClose,
  onApplyToProps,
}: LivePropertyInspectorProps) {
  const [props, setProps] = useState<ComponentVisualProps>(DEFAULT_VISUAL_PROPS);

  if (!isOpen) return null;

  const updateProp = <K extends keyof ComponentVisualProps>(
    key: K,
    val: ComponentVisualProps[K]
  ) => {
    const next = { ...props, [key]: val };
    setProps(next);
    onApplyToProps(next);
  };

  const handleReset = () => {
    setProps(DEFAULT_VISUAL_PROPS);
    onApplyToProps(DEFAULT_VISUAL_PROPS);
  };

  return (
    <div className="border-t border-slate-800 bg-slate-900/95 p-4 text-xs text-slate-300 backdrop-blur-md transition-all animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-sky-500/20 text-sky-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-white">
            No-Code Visual Property Inspector
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-mono">
            Live DOM Sync
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-[11px]"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-sm font-bold px-1"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 font-medium text-slate-400">
            <Type className="w-3.5 h-3.5 text-slate-500" />
            <span>Card Title</span>
          </label>
          <input
            type="text"
            value={props.title}
            onChange={(e) => updateProp("title", e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Component heading..."
          />
        </div>

        {/* Accent Color Palette */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 font-medium text-slate-400">
            <Palette className="w-3.5 h-3.5 text-slate-500" />
            <span>Accent Theme</span>
          </label>
          <div className="flex items-center gap-1.5 pt-0.5">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => updateProp("accentColor", color.id)}
                className={`w-6 h-6 rounded-full ${color.bg} transition-transform ${
                  props.accentColor === color.id
                    ? "ring-2 ring-white scale-110 shadow-md"
                    : "opacity-70 hover:opacity-100"
                }`}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 font-medium text-slate-400">
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Corner Radius</span>
          </label>
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateProp("borderRadius", opt.id)}
                className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${
                  props.borderRadius === opt.id
                    ? "bg-slate-800 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Padding & Spacing */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 font-medium text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>Padding</span>
          </label>
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {PADDING_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateProp("padding", opt.id)}
                className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${
                  props.padding === opt.id
                    ? "bg-slate-800 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shadow Intensity */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 font-medium text-slate-400">
            <Sun className="w-3.5 h-3.5 text-slate-500" />
            <span>Shadow</span>
          </label>
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {SHADOW_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateProp("shadow", opt.id)}
                className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${
                  props.shadow === opt.id
                    ? "bg-slate-800 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
