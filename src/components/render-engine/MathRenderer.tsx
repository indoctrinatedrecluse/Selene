"use client";

import React, { useMemo } from "react";
import katex from "katex";
import { AlertCircle } from "lucide-react";

interface MathRendererProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export function MathRenderer({
  formula,
  displayMode = true,
  className = "",
}: MathRendererProps) {
  const { html, error } = useMemo(() => {
    try {
      const rendered = katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
      });
      return { html: rendered, error: null };
    } catch (err: unknown) {
      return {
        html: "",
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }, [formula, displayMode]);

  if (error) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-300 border border-red-500/20 text-xs font-mono">
        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
        <span>LaTeX Error: {error}</span>
      </span>
    );
  }

  if (displayMode) {
    return (
      <div
        className={`my-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60 overflow-x-auto text-center ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block px-1 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
