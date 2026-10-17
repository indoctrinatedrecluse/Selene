"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { AlertCircle, Check, Copy } from "lucide-react";

interface MermaidRendererProps {
  code: string;
  className?: string;
}

let diagramCounter = 0;

export function MermaidRenderer({ code, className = "" }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        darkColor: "#0f172a",
        primaryColor: "#0284c7",
        primaryTextColor: "#f8fafc",
        primaryBorderColor: "#38bdf8",
        lineColor: "#64748b",
        secondaryColor: "#1e293b",
        tertiaryColor: "#090d16",
      },
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    });

    let isMounted = true;
    const renderDiagram = async () => {
      try {
        const id = `mermaid-diag-${++diagramCounter}`;
        const { svg } = await mermaid.render(id, code);
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden shadow-xl my-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-mono font-medium text-slate-300">Mermaid Diagram</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
          title="Copy diagram source"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Render Area */}
      <div className="p-6 flex items-center justify-center min-h-[160px] overflow-x-auto">
        {error ? (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono max-w-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <div className="font-semibold text-red-200 mb-1">Diagram Syntax Error</div>
              <div className="opacity-80 line-clamp-3">{error}</div>
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
}
