"use client";

import React, { useState } from "react";
import {
  UniversalVisualProps,
  ACCENT_THEMES,
  SURFACE_THEMES,
  PADDING_OPTIONS,
  RADIUS_OPTIONS,
  SHADOW_OPTIONS,
  WIDTH_OPTIONS,
  extractVisualProps,
  AccentColorId,
  SurfaceThemeId,
  PaddingOptionId,
  RadiusOptionId,
  ShadowOptionId,
  MaxWidthOptionId,
} from "@/lib/ast-transformer";
import {
  SlidersHorizontal,
  Palette,
  Maximize2,
  Sparkles,
  Type,
  RotateCcw,
  Sun,
  Layout,
  Check,
  Zap,
  Code2,
  Layers,
} from "lucide-react";

interface UniversalPropertyInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language?: string;
  onApplyToProps: (props: UniversalVisualProps) => void;
}

type TabType = "theme" | "layout" | "content" | "state";

export function UniversalPropertyInspector({
  isOpen,
  onClose,
  code,
  language = "tsx",
  onApplyToProps,
}: UniversalPropertyInspectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("theme");
  const [prevCode, setPrevCode] = useState(code);
  const [prevLang, setPrevLang] = useState(language);
  const [props, setProps] = useState<UniversalVisualProps>(() =>
    extractVisualProps(code, language)
  );
  const [copied, setCopied] = useState(false);

  // Synchronize extracted props when code or language updates externally
  if (code !== prevCode || language !== prevLang) {
    setPrevCode(code);
    setPrevLang(language);
    setProps(extractVisualProps(code, language));
  }

  if (!isOpen) return null;

  const updateProp = <K extends keyof UniversalVisualProps>(
    key: K,
    val: UniversalVisualProps[K]
  ) => {
    const next = { ...props, [key]: val };
    setProps(next);
    onApplyToProps(next);
  };

  const handleReset = () => {
    const extracted = extractVisualProps(code, language);
    setProps(extracted);
    onApplyToProps(extracted);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLanguageBadge = (lang: string) => {
    const map: Record<string, string> = {
      tsx: "React + Tailwind",
      jsx: "React JSX",
      vue: "Vue 3 SFC",
      svelte: "Svelte Reactive",
      angular: "Angular Ivy",
      html: "HTML / Tailwind",
    };
    return map[lang.toLowerCase()] || lang.toUpperCase();
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950/95 text-xs text-slate-300 backdrop-blur-xl transition-all animate-in slide-in-from-top-2">
      {/* Top Header & Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-inner">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-tight">
                Universal No-Code Inspector
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                AST Bi-directional Sync
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Target Stack: <span className="text-sky-400">{formatLanguageBadge(language)}</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("theme")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-all ${
              activeTab === "theme"
                ? "bg-slate-800 text-sky-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Palette className="w-3 h-3" />
            <span>Theme & Colors</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("layout")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-all ${
              activeTab === "layout"
                ? "bg-slate-800 text-sky-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layout className="w-3 h-3" />
            <span>Layout & Spacing</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-all ${
              activeTab === "content"
                ? "bg-slate-800 text-sky-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Type className="w-3 h-3" />
            <span>Content & Text</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("state")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-all ${
              activeTab === "state"
                ? "bg-slate-800 text-sky-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>State & Logic</span>
          </button>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-[11px] transition-colors"
            title="Copy modified AST source code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Code2 className="w-3 h-3 text-slate-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-[11px] px-2 py-1"
            title="Reset to original code values"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Revert</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-sm font-bold px-2 py-0.5 rounded hover:bg-slate-800/60"
            title="Close Inspector"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="p-4">
        {/* --- TAB 1: THEME & COLORS --- */}
        {activeTab === "theme" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Accent Theme Palette */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Palette className="w-3.5 h-3.5 text-sky-400" />
                <span>Primary Accent Theme</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {ACCENT_THEMES.map((theme) => {
                  const isSelected = props.accentColor === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => updateProp("accentColor", theme.id as AccentColorId)}
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "bg-slate-800 border-sky-400/80 shadow-md ring-1 ring-sky-400/50"
                          : "bg-slate-950 border-slate-800/80 hover:bg-slate-900 opacity-80 hover:opacity-100"
                      }`}
                      title={theme.name}
                    >
                      <span
                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: theme.hex }}
                      />
                      <span className="text-[10px] font-medium truncate text-slate-300">
                        {theme.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Surface Theme Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Surface & Material</span>
              </label>
              <div className="space-y-1 pt-1">
                {SURFACE_THEMES.map((surf) => {
                  const isSelected = props.surfaceTheme === surf.id;
                  return (
                    <button
                      key={surf.id}
                      type="button"
                      onClick={() => updateProp("surfaceTheme", surf.id as SurfaceThemeId)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "bg-slate-800 border-indigo-400/80 text-white font-semibold"
                          : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      <span className="text-[11px]">{surf.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shadow & Elevation */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Elevation & Glow</span>
              </label>
              <div className="space-y-1 pt-1">
                {SHADOW_OPTIONS.map((opt) => {
                  const isSelected = props.shadow === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateProp("shadow", opt.id as ShadowOptionId)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "bg-slate-800 border-amber-400/80 text-white font-semibold"
                          : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      <span className="text-[11px]">{opt.label}</span>
                      {isSelected && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: LAYOUT & SPACING --- */}
        {activeTab === "layout" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Corner Radius */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Corner Radius</span>
              </label>
              <div className="space-y-1">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateProp("borderRadius", opt.id as RadiusOptionId)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-left transition-all ${
                      props.borderRadius === opt.id
                        ? "bg-slate-800 border-emerald-400/80 text-white font-semibold"
                        : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span className="text-[11px]">{opt.label}</span>
                    <span className="text-[10px] font-mono text-slate-500">{opt.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Padding */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Internal Padding</span>
              </label>
              <div className="space-y-1">
                {PADDING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateProp("padding", opt.id as PaddingOptionId)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-left transition-all ${
                      props.padding === opt.id
                        ? "bg-slate-800 border-sky-400/80 text-white font-semibold"
                        : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span className="text-[11px]">{opt.label}</span>
                    <span className="text-[10px] font-mono text-slate-500">{opt.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Max Container Width */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Layout className="w-3.5 h-3.5 text-violet-400" />
                <span>Max Container Width</span>
              </label>
              <div className="space-y-1">
                {WIDTH_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateProp("maxWidth", opt.id as MaxWidthOptionId)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-left transition-all ${
                      props.maxWidth === opt.id
                        ? "bg-slate-800 border-violet-400/80 text-white font-semibold"
                        : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span className="text-[11px]">{opt.label}</span>
                    <span className="text-[10px] font-mono text-slate-500">{opt.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: CONTENT & TEXT --- */}
        {activeTab === "content" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Type className="w-3.5 h-3.5 text-sky-400" />
                <span>Primary Heading Text</span>
              </label>
              <input
                type="text"
                value={props.title}
                onChange={(e) => updateProp("title", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs font-medium"
                placeholder="Component title..."
              />
              <p className="text-[10px] text-slate-500">
                Maps to &lt;h1&gt;-&lt;h4&gt; tags inside the component template.
              </p>
            </div>

            {/* Subtitle / Description */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Type className="w-3.5 h-3.5 text-indigo-400" />
                <span>Subtitle / Description</span>
              </label>
              <input
                type="text"
                value={props.subtitle}
                onChange={(e) => updateProp("subtitle", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                placeholder="Component subtitle..."
              />
              <p className="text-[10px] text-slate-500">
                Updates description paragraphs or sub-headers dynamically.
              </p>
            </div>

            {/* Button / CTA Label */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Action Button Label</span>
              </label>
              <input
                type="text"
                value={props.buttonText}
                onChange={(e) => updateProp("buttonText", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs"
                placeholder="Button text..."
              />
              <p className="text-[10px] text-slate-500">
                Preserves dynamic reactive expressions (e.g. &#123;&#123; count &#125;&#125;).
              </p>
            </div>
          </div>
        )}

        {/* --- TAB 4: STATE & LOGIC --- */}
        {activeTab === "state" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Initial Reactive State Value</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={props.initialCount ?? 0}
                  onChange={(e) => updateProp("initialCount", parseFloat(e.target.value) || 0)}
                  className="w-32 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={() => updateProp("initialCount", (props.initialCount ?? 0) + 10)}
                  className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold"
                >
                  +10 Boost
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Syncs directly to useState(N) (React), ref(N) (Vue), let count = N (Svelte), or count = N (Angular).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
