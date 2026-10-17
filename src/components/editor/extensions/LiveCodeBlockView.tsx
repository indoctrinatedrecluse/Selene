"use client";

import React, { useState } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { LiveSandboxRenderer } from "@/components/render-engine/LiveSandboxRenderer";
import { MermaidRenderer } from "@/components/render-engine/MermaidRenderer";
import { MathRenderer } from "@/components/render-engine/MathRenderer";
import { Check, Copy, Terminal, Eye } from "lucide-react";

const LIVE_WEB_LANGUAGES = ["tsx", "jsx", "react", "vue", "svelte", "html", "static"];

export function LiveCodeBlockView(props: NodeViewProps) {
  const { node, updateAttributes } = props;
  const language = (node.attrs.language || "typescript").toLowerCase();
  const rawCode = node.textContent;

  const [copied, setCopied] = useState(false);
  const [showLiveRender, setShowLiveRender] = useState(true);

  const isLiveWeb = LIVE_WEB_LANGUAGES.includes(language);
  const isMermaid = language === "mermaid";
  const isMath = language === "math" || language === "latex";

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If it's a web stack snippet and live render is enabled, render the Sandpack Live Engine!
  if (isLiveWeb && showLiveRender) {
    return (
      <NodeViewWrapper className="live-code-block my-4">
        <LiveSandboxRenderer
          initialCode={rawCode}
          language={language}
          className="shadow-2xl"
        />
      </NodeViewWrapper>
    );
  }

  // If it's a Mermaid diagram
  if (isMermaid) {
    return (
      <NodeViewWrapper className="mermaid-block my-4">
        <MermaidRenderer code={rawCode} />
      </NodeViewWrapper>
    );
  }

  // If it's a LaTeX Math block
  if (isMath) {
    return (
      <NodeViewWrapper className="math-block my-4">
        <MathRenderer formula={rawCode} displayMode={true} />
      </NodeViewWrapper>
    );
  }

  // Standard high-performance code block
  return (
    <NodeViewWrapper className="relative my-4 rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <select
            value={language}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            className="bg-transparent border-none text-slate-300 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="typescript">typescript</option>
            <option value="javascript">javascript</option>
            <option value="tsx">tsx (live)</option>
            <option value="jsx">jsx (live)</option>
            <option value="html">html (live)</option>
            <option value="vue">vue (live)</option>
            <option value="svelte">svelte (live)</option>
            <option value="mermaid">mermaid (diagram)</option>
            <option value="latex">latex (math)</option>
            <option value="python">python</option>
            <option value="rust">rust</option>
            <option value="json">json</option>
            <option value="css">css</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {LIVE_WEB_LANGUAGES.includes(language) && (
            <button
              onClick={() => setShowLiveRender(true)}
              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-200 leading-relaxed">
        <code className={`language-${language}`}>{rawCode}</code>
      </pre>
    </NodeViewWrapper>
  );
}
