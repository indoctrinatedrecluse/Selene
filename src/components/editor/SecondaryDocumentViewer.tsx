"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Eye,
  Code2,
  Columns,
  Rows,
  ArrowLeftRight,
  X,
  Link2,
  Link2Off,
  Sparkles,
} from "lucide-react";
import { DocumentItem } from "@/lib/workspace-store";
import { MathRenderer } from "@/components/render-engine/MathRenderer";
import { MermaidRenderer } from "@/components/render-engine/MermaidRenderer";
import { DeclarativeChartRenderer } from "@/components/render-engine/DeclarativeChartRenderer";
import { DuckDbStudioRenderer } from "@/components/render-engine/DuckDbStudioRenderer";

interface SecondaryDocumentViewerProps {
  documents: DocumentItem[];
  secondaryDocId: string;
  onSelectDoc: (id: string) => void;
  onClose: () => void;
  onSwapDocuments: () => void;
  onUpdateDocumentContent: (id: string, content: string) => void;
  splitOrientation: "vertical" | "horizontal";
  onToggleOrientation: () => void;
  isSyncScroll: boolean;
  onToggleSyncScroll: () => void;
  primaryScrollProgress?: number;
  onScrollProgressChange?: (progress: number) => void;
}

interface ParsedBlock {
  type: "heading" | "paragraph" | "code" | "math" | "mermaid" | "chart" | "duckdb" | "callout" | "hr";
  content: string;
  lang?: string;
  level?: number;
  calloutType?: string;
}

export function SecondaryDocumentViewer({
  documents,
  secondaryDocId,
  onSelectDoc,
  onClose,
  onSwapDocuments,
  onUpdateDocumentContent,
  splitOrientation,
  onToggleOrientation,
  isSyncScroll,
  onToggleSyncScroll,
  primaryScrollProgress,
  onScrollProgressChange,
}: SecondaryDocumentViewerProps) {
  const [viewSubMode, setViewSubMode] = useState<"canvas" | "markdown">("canvas");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const activeDoc =
    documents.find((d) => d.id === secondaryDocId) ||
    documents.find((d) => d.id !== secondaryDocId) ||
    documents[0];

  // Synchronize scroll from primary if active
  useEffect(() => {
    if (!isSyncScroll || primaryScrollProgress === undefined) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll > 0) {
      container.scrollTop = primaryScrollProgress * maxScroll;
    }
  }, [primaryScrollProgress, isSyncScroll]);

  const handleScroll = () => {
    if (!isSyncScroll || !onScrollProgressChange) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll > 0) {
      const progress = container.scrollTop / maxScroll;
      onScrollProgressChange(progress);
    }
  };

  // Parse markdown content into structured blocks for live rendered view
  const blocks: ParsedBlock[] = [];
  if (activeDoc) {
    const lines = activeDoc.content.split("\n");
    let inCodeBlock = false;
    let codeLang = "";
    let codeBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.replace("```", "").trim();
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const fullCode = codeBuffer.join("\n");
          if (codeLang === "math" || codeLang === "latex" || codeLang === "katex") {
            blocks.push({ type: "math", content: fullCode });
          } else if (codeLang === "mermaid") {
            blocks.push({ type: "mermaid", content: fullCode });
          } else if (codeLang === "chart" || codeLang === "plot") {
            blocks.push({ type: "chart", content: fullCode });
          } else if (
            codeLang === "duckdb" ||
            codeLang === "parquet" ||
            codeLang === "olap"
          ) {
            blocks.push({ type: "duckdb", content: fullCode });
          } else {
            blocks.push({ type: "code", content: fullCode, lang: codeLang });
          }
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      if (line.startsWith("# ")) {
        blocks.push({ type: "heading", level: 1, content: line.substring(2) });
      } else if (line.startsWith("## ")) {
        blocks.push({ type: "heading", level: 2, content: line.substring(3) });
      } else if (line.startsWith("### ")) {
        blocks.push({ type: "heading", level: 3, content: line.substring(4) });
      } else if (line.startsWith("#### ")) {
        blocks.push({ type: "heading", level: 4, content: line.substring(5) });
      } else if (line.startsWith("> [!")) {
        const match = line.match(/>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
        const calloutType = match ? match[1].toLowerCase() : "note";
        const calloutLines: string[] = [];
        while (i + 1 < lines.length && lines[i + 1].startsWith(">")) {
          i++;
          calloutLines.push(lines[i].replace(/^>\s?/, ""));
        }
        blocks.push({
          type: "callout",
          calloutType,
          content: calloutLines.join("\n"),
        });
      } else if (line.trim() === "---" || line.trim() === "***") {
        blocks.push({ type: "hr", content: "" });
      } else if (line.trim().length > 0) {
        blocks.push({ type: "paragraph", content: line });
      }
    }
  }

  return (
    <div
      className={`border-l border-slate-800 bg-[#070914] flex flex-col h-full min-w-0 ${
        splitOrientation === "vertical" ? "w-1/2" : "w-full h-1/2 border-t border-l-0"
      }`}
    >
      {/* Secondary Pane Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs gap-2 shrink-0">
        {/* Left: Document Picker */}
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-[10px] uppercase font-mono font-bold text-slate-500 hidden sm:inline">
            Pane 2:
          </span>
          <select
            value={activeDoc?.id || ""}
            onChange={(e) => onSelectDoc(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 font-medium text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500 max-w-[180px] sm:max-w-[240px] truncate"
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Dual View Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Submode Switcher (Canvas / Raw MD) */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setViewSubMode("canvas")}
              className={`px-2 py-0.5 rounded font-medium transition cursor-pointer flex items-center gap-1 ${
                viewSubMode === "canvas"
                  ? "bg-slate-800 text-cyan-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Rendered Canvas View"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden md:inline">Canvas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewSubMode("markdown")}
              className={`px-2 py-0.5 rounded font-medium transition cursor-pointer flex items-center gap-1 ${
                viewSubMode === "markdown"
                  ? "bg-slate-800 text-cyan-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Raw Markdown Editor"
            >
              <Code2 className="w-3 h-3" />
              <span className="hidden md:inline">MD</span>
            </button>
          </div>

          {/* Sync Scroll Toggle */}
          <button
            type="button"
            onClick={onToggleSyncScroll}
            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
              isSyncScroll
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
            }`}
            title={
              isSyncScroll
                ? "Synchronized Scrolling: Enabled"
                : "Synchronized Scrolling: Disabled"
            }
          >
            {isSyncScroll ? <Link2 className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5" />}
          </button>

          {/* Split Orientation Switcher */}
          <button
            type="button"
            onClick={onToggleOrientation}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title={
              splitOrientation === "vertical"
                ? "Switch to Horizontal Split (Stacked)"
                : "Switch to Vertical Split (Side-by-Side)"
            }
          >
            {splitOrientation === "vertical" ? (
              <Rows className="w-3.5 h-3.5" />
            ) : (
              <Columns className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Swap Documents */}
          <button
            type="button"
            onClick={onSwapDocuments}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Swap Panes (Switch Primary & Secondary Docs)"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          {/* Close Dual View */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition cursor-pointer"
            title="Close Split View"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Secondary Pane Body */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0 p-4 md:p-6"
      >
        {!activeDoc ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No document selected for secondary pane.
          </div>
        ) : viewSubMode === "markdown" ? (
          <div className="h-full flex flex-col">
            <textarea
              value={activeDoc.content}
              onChange={(e) => onUpdateDocumentContent(activeDoc.id, e.target.value)}
              className="w-full flex-1 bg-transparent border-none text-slate-200 font-mono text-xs leading-relaxed focus:outline-none resize-none"
              placeholder="Author markdown in secondary pane..."
            />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4 pb-16">
            <div className="border-b border-slate-800 pb-3">
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                {activeDoc.title}
              </h1>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Dual-View Reference Pane • Live Markdown Render
              </p>
            </div>

            {blocks.map((block, idx) => {
              if (block.type === "heading") {
                if (block.level === 1) {
                  return (
                    <h1 key={idx} className="text-lg font-bold text-white pt-2">
                      {block.content}
                    </h1>
                  );
                }
                if (block.level === 2) {
                  return (
                    <h2 key={idx} className="text-base font-bold text-cyan-300 pt-2 border-b border-slate-800/60 pb-1">
                      {block.content}
                    </h2>
                  );
                }
                if (block.level === 3) {
                  return (
                    <h3 key={idx} className="text-sm font-semibold text-slate-200 pt-1">
                      {block.content}
                    </h3>
                  );
                }
                return (
                  <h4 key={idx} className="text-xs font-semibold text-slate-300">
                    {block.content}
                  </h4>
                );
              }

              if (block.type === "paragraph") {
                return (
                  <p key={idx} className="text-xs text-slate-300 leading-relaxed">
                    {block.content}
                  </p>
                );
              }

              if (block.type === "code") {
                return (
                  <div key={idx} className="my-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    {block.lang && (
                      <div className="px-3 py-1 bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                        {block.lang}
                      </div>
                    )}
                    <pre className="p-3 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                      <code>{block.content}</code>
                    </pre>
                  </div>
                );
              }

              if (block.type === "math") {
                return (
                  <div key={idx} className="my-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <MathRenderer formula={block.content} displayMode={true} />
                  </div>
                );
              }

              if (block.type === "mermaid") {
                return (
                  <div key={idx} className="my-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <MermaidRenderer code={block.content} />
                  </div>
                );
              }

              if (block.type === "chart") {
                return (
                  <div key={idx} className="my-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <DeclarativeChartRenderer initialCode={block.content} />
                  </div>
                );
              }

              if (block.type === "duckdb") {
                return (
                  <div key={idx} className="my-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <DuckDbStudioRenderer initialCode={block.content} />
                  </div>
                );
              }

              if (block.type === "callout") {
                const borderClass =
                  block.calloutType === "warning" || block.calloutType === "caution"
                    ? "border-amber-500/40 bg-amber-500/5 text-amber-200"
                    : block.calloutType === "tip"
                    ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-200"
                    : "border-cyan-500/40 bg-cyan-500/5 text-cyan-200";

                return (
                  <div key={idx} className={`my-2.5 p-3 rounded-xl border ${borderClass} text-xs space-y-1`}>
                    <div className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>{block.calloutType}</span>
                    </div>
                    <div className="text-[11px] opacity-90 leading-relaxed whitespace-pre-wrap">
                      {block.content}
                    </div>
                  </div>
                );
              }

              if (block.type === "hr") {
                return <hr key={idx} className="border-slate-800 my-4" />;
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
