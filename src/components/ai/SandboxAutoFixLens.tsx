"use client";

import React, { useState } from "react";
import { Sparkles, Check, AlertTriangle, ArrowRight, RefreshCw, X } from "lucide-react";

interface SandboxAutoFixLensProps {
  code: string;
  language: string;
  errorMessage: string;
  onApplyFix: (fixedCode: string) => void;
  className?: string;
}

export function SandboxAutoFixLens({
  code,
  language,
  errorMessage,
  onApplyFix,
  className = "",
}: SandboxAutoFixLensProps) {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<{
    explanation: string;
    fixedCode: string;
    changesSummary: string;
  } | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !errorMessage) return null;

  const handleRequestFix = async () => {
    setIsFixing(true);
    try {
      const res = await fetch("/api/ai/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          errorMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFixResult({
          explanation: data.explanation,
          fixedCode: data.fixedCode,
          changesSummary: data.changesSummary,
        });
      }
    } catch (err) {
      console.error("Auto-fix request failed", err);
    } finally {
      setIsFixing(false);
    }
  };

  const handleApply = () => {
    if (fixResult) {
      onApplyFix(fixResult.fixedCode);
      setIsApplied(true);
      setTimeout(() => {
        setIsDismissed(true);
      }, 1200);
    }
  };

  return (
    <div
      className={`rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-xs text-rose-200 shadow-lg backdrop-blur-md transition-all ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <div className="space-y-1">
            <div className="font-semibold text-rose-300">Execution Error in {language.toUpperCase()}</div>
            <div className="max-h-24 overflow-y-auto font-mono text-[11px] text-rose-300/80 leading-relaxed whitespace-pre-wrap">
              {errorMessage}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Dismiss Error"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Auto-Fix Trigger & Action Area */}
      {!fixResult && (
        <div className="mt-3 flex items-center justify-between border-t border-rose-500/20 pt-2.5">
          <span className="text-[11px] text-slate-400">
            Let Selene AI diagnose and patch this error automatically.
          </span>
          <button
            type="button"
            onClick={handleRequestFix}
            disabled={isFixing}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-3 py-1 font-semibold text-white shadow-md hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isFixing ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Diagnosing Bug...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 text-amber-300" />
                <span>Auto-Fix with Copilot</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* AI Diagnosis and Diff Resolution Preview */}
      {fixResult && (
        <div className="mt-3 space-y-2.5 border-t border-sky-500/20 pt-2.5">
          <div className="rounded-lg bg-slate-900/80 border border-sky-500/30 p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-sky-400 text-[11px]">
              <Sparkles className="h-3 w-3" />
              <span>AI Diagnosis: {fixResult.changesSummary}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {fixResult.explanation}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setFixResult(null)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isApplied}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-white shadow-md transition-all cursor-pointer ${
                isApplied
                  ? "bg-emerald-600"
                  : "bg-emerald-500 hover:bg-emerald-400 active:scale-95"
              }`}
            >
              {isApplied ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Fix Applied!</span>
                </>
              ) : (
                <>
                  <span>Apply Fix</span>
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
