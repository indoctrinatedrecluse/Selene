"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  Code2,
  Workflow,
  Sigma,
  Zap,
  Check,
  Copy,
  PlusCircle,
  KeyRound,
  Loader2,
} from "lucide-react";

interface SeleneAiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCode: (code: string) => void;
  onOpenLicenseVault?: () => void;
}

export type CopilotCategory = "ui" | "diagram" | "math" | "freeform";

const UI_STACK_OPTIONS = [
  { id: "tsx", label: "React TSX" },
  { id: "vue", label: "Vue 3 SFC" },
  { id: "svelte", label: "Svelte 5" },
  { id: "angular", label: "Angular Ivy" },
  { id: "blade", label: "Laravel Blade" },
  { id: "erb", label: "Rails ERB" },
  { id: "go", label: "Go Template" },
  { id: "django", label: "Django DTL" },
  { id: "rust", label: "Rust Yew/Leptos" },
  { id: "sql", label: "LibSQL / SQLite" },
  { id: "glsl", label: "WebGL Shader" },
];

const DIAGRAM_OPTIONS = [
  { id: "flowchart", label: "Architecture Flowchart" },
  { id: "sequence", label: "Sequence Diagram" },
  { id: "class", label: "Class Diagram" },
  { id: "er", label: "Entity Relationship" },
  { id: "state", label: "State Machine" },
];

const PROMPT_SUGGESTIONS: Record<CopilotCategory, string[]> = {
  ui: [
    "Mission telemetry card with glowing status and interactive counter",
    "Cyberpunk user profile with avatar and metric badges",
    "Real-time database replication status table",
  ],
  diagram: [
    "Distributed microservices architecture with Redis and LibSQL",
    "OAuth2 PKCE authorization sequence flow",
    "Satellite constellation mesh network topology",
  ],
  math: [
    "Keplerian orbital velocity and vis-viva equation",
    "Tsiolkovsky rocket equation with mass ratio logarithm",
    "Schrödinger wave equation in 3D Cartesian coordinates",
  ],
  freeform: [
    "Technical architectural RFC for distributed SQLite database",
    "Security assessment report for hardware-bound cryptographic keys",
  ],
};

export function SeleneAiCopilotModal({
  isOpen,
  onClose,
  onInsertCode,
  onOpenLicenseVault,
}: SeleneAiCopilotModalProps) {
  const [category, setCategory] = useState<CopilotCategory>("ui");
  const [stack, setStack] = useState("tsx");
  const [diagramType, setDiagramType] = useState("flowchart");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [vaultKeyConfigured, setVaultKeyConfigured] = useState(false);
  const [noteMessage, setNoteMessage] = useState<string | null>(null);

  // Check vault status on open
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/vault/keys")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const gemini = data.find((k) => k.provider === "gemini");
          setVaultKeyConfigured(!!gemini?.configured);
        }
      })
      .catch(() => setVaultKeyConfigured(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setNoteMessage(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          category,
          stack,
          diagramType,
        }),
      });

      const data = await res.json();
      if (data.success && data.generatedContent) {
        setGeneratedOutput(data.generatedContent);
        if (data.note) setNoteMessage(data.note);
      } else {
        setGeneratedOutput(`// Error: ${data.message || "Failed to generate"}`);
      }
    } catch (err) {
      setGeneratedOutput(`// Network Error: ${String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (!generatedOutput) return;
    onInsertCode(generatedOutput);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-sky-500/30 bg-[#090d1c] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0c1226]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Selene AI Canvas Copilot</span>
                {vaultKeyConfigured ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Vault Connected
                  </span>
                ) : (
                  <button
                    onClick={onOpenLicenseVault}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-2.5 h-2.5" />
                    <span>Setup Vault Key</span>
                  </button>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">Generate diagrams, formulas, and multi-stack UI snippets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center px-5 pt-3 gap-2 border-b border-slate-800/80 bg-[#070b18]">
          <button
            type="button"
            onClick={() => setCategory("ui")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              category === "ui"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>UI Snippet</span>
          </button>
          <button
            type="button"
            onClick={() => setCategory("diagram")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              category === "diagram"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Vector Diagram</span>
          </button>
          <button
            type="button"
            onClick={() => setCategory("math")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              category === "math"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sigma className="w-3.5 h-3.5" />
            <span>Math Formula</span>
          </button>
          <button
            type="button"
            onClick={() => setCategory("freeform")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              category === "freeform"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Free-form Prompt</span>
          </button>
        </div>

        {/* Content & Inputs */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Target Framework / Diagram Sub-selection */}
          {category === "ui" && (
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Target Framework & Stack
              </label>
              <div className="flex flex-wrap gap-1.5">
                {UI_STACK_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStack(opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      stack === opt.id
                        ? "bg-sky-500/20 border-sky-500/60 text-sky-300 shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {category === "diagram" && (
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Diagram Format
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DIAGRAM_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDiagramType(opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      diagramType === opt.id
                        ? "bg-sky-500/20 border-sky-500/60 text-sky-300 shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Textarea */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Describe what you want to generate
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A mission telemetry card with glowing status metrics, memory stats, and interactive button..."
                className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none font-sans"
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="absolute right-3 bottom-3 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isGenerating ? "Generating..." : "Generate"}</span>
              </button>
            </div>
          </div>

          {/* Quick suggestions */}
          <div>
            <span className="text-[10px] font-mono text-slate-500 block mb-1">Quick ideas:</span>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_SUGGESTIONS[category].map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-400 hover:text-sky-300 hover:border-slate-700 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Output Preview */}
          {generatedOutput && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Generated Snippet Preview
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleInsert}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow transition-all active:scale-95 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Insert into Canvas</span>
                  </button>
                </div>
              </div>

              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-200 overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                {generatedOutput}
              </pre>

              {noteMessage && (
                <p className="text-[11px] text-amber-400/90 font-mono">
                  {noteMessage}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
