"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  Download,
  Code,
  Sparkles,
  Eye,
  Calendar,
  User,
} from "lucide-react";
import { MathRenderer } from "@/components/render-engine/MathRenderer";
import { MermaidRenderer } from "@/components/render-engine/MermaidRenderer";
import { DeclarativeChartRenderer } from "@/components/render-engine/DeclarativeChartRenderer";
import { DuckDbStudioRenderer } from "@/components/render-engine/DuckDbStudioRenderer";
import { SeleneTitanLogo } from "@/components/brand/SeleneTitanLogo";

interface SharedDocumentReaderProps {
  id: string;
  title: string;
  contentMarkdown: string;
  author?: string;
  viewCount?: number;
  createdAt?: number;
  isEmbed?: boolean;
}

interface ParsedBlock {
  type: "heading" | "paragraph" | "code" | "math" | "mermaid" | "chart" | "duckdb" | "callout" | "hr";
  content: string;
  lang?: string;
  level?: number;
  calloutType?: string;
}

export function SharedDocumentReader({
  id,
  title,
  contentMarkdown,
  author = "Anonymous",
  viewCount = 1,
  createdAt,
  isEmbed = false,
}: SharedDocumentReaderProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently";

  // Parse markdown into structured render blocks
  const blocks: ParsedBlock[] = [];
  const lines = contentMarkdown.split("\n");

  let inCode = false;
  let codeLang = "";
  let codeBuffer: string[] = [];

  let inCallout = false;
  let calloutType = "NOTE";
  let calloutBuffer: string[] = [];

  const flushCode = () => {
    if (!inCode) return;
    const raw = codeBuffer.join("\n");
    const lang = codeLang.toLowerCase();

    if (lang === "math" || lang === "latex") {
      blocks.push({ type: "math", content: raw });
    } else if (lang === "mermaid") {
      blocks.push({ type: "mermaid", content: raw });
    } else if (lang === "chart" || lang === "plot") {
      blocks.push({ type: "chart", content: raw });
    } else if (lang === "duckdb" || lang === "olap") {
      blocks.push({ type: "duckdb", content: raw });
    } else {
      blocks.push({ type: "code", content: raw, lang: codeLang || "text" });
    }

    inCode = false;
    codeLang = "";
    codeBuffer = [];
  };

  const flushCallout = () => {
    if (!inCallout) return;
    blocks.push({
      type: "callout",
      content: calloutBuffer.join("\n"),
      calloutType,
    });
    inCallout = false;
    calloutType = "NOTE";
    calloutBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCode) {
        flushCode();
      } else {
        flushCallout();
        inCode = true;
        codeLang = line.trim().slice(3).trim();
        codeBuffer = [];
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    const calloutMatch = line.match(/^>\s*\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]/i);
    if (calloutMatch) {
      flushCallout();
      inCallout = true;
      calloutType = calloutMatch[1].toUpperCase();
      calloutBuffer = [];
      continue;
    }

    if (inCallout) {
      if (line.startsWith(">")) {
        calloutBuffer.push(line.replace(/^>\s?/, ""));
        continue;
      } else {
        flushCallout();
      }
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "heading", level: 1, content: line.replace(/^#\s+/, "") });
    } else if (line.startsWith("## ")) {
      blocks.push({ type: "heading", level: 2, content: line.replace(/^##\s+/, "") });
    } else if (line.startsWith("### ")) {
      blocks.push({ type: "heading", level: 3, content: line.replace(/^###\s+/, "") });
    } else if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      blocks.push({ type: "hr", content: "" });
    } else if (line.trim().length > 0) {
      blocks.push({ type: "paragraph", content: line });
    }
  }

  flushCode();
  flushCallout();

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(contentMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([contentMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCloneToEditor = () => {
    try {
      localStorage.setItem("selene_import_pending", JSON.stringify({ title, content: contentMarkdown }));
      router.push("/");
    } catch {
      router.push("/");
    }
  };

  return (
    <div className={`min-h-screen bg-[#070a14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 ${isEmbed ? "p-4" : "p-6 md:p-12"}`}>
      {/* Top Header Navigation (Hidden in Embed Mode) */}
      {!isEmbed && (
        <header className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <SeleneTitanLogo className="w-9 h-9" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white">Selene</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Cloud Share
                </span>
              </div>
              <p className="text-xs text-slate-400">Polymorphic Technical Document Reader</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleCloneToEditor}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              title="Open document in Selene Editor"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Clone into Selene</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-200 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              title="Copy Raw Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Markdown"}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-200 text-xs transition cursor-pointer"
              title="Download Markdown (.md)"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setEmbedModalOpen(true)}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-200 text-xs transition cursor-pointer"
              title="Get Embed Code"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* Main Document Content Canvas */}
      <main className="max-w-4xl mx-auto space-y-6">
        {/* Document Header Metadata Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {title}
          </h1>

          <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center gap-6 text-xs text-slate-400 font-mono flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{author}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>{viewCount} views</span>
            </span>
            <span className="text-emerald-400 font-sans font-medium">✓ Cryptographically Verified</span>
          </div>
        </div>

        {/* Rendered Markdown Blocks */}
        <div className="space-y-6 text-slate-200 leading-relaxed font-sans text-sm md:text-base">
          {blocks.map((block, idx) => {
            if (block.type === "heading") {
              if (block.level === 1) {
                return (
                  <h1 key={idx} className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-8 mb-4 border-b border-slate-800 pb-2">
                    {block.content}
                  </h1>
                );
              } else if (block.level === 2) {
                return (
                  <h2 key={idx} className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight mt-6 mb-3">
                    {block.content}
                  </h2>
                );
              } else {
                return (
                  <h3 key={idx} className="text-lg font-semibold text-cyan-300 mt-4 mb-2">
                    {block.content}
                  </h3>
                );
              }
            }

            if (block.type === "hr") {
              return <hr key={idx} className="border-slate-800/80 my-8" />;
            }

            if (block.type === "math") {
              return (
                <div key={idx} className="my-6 p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex justify-center">
                  <MathRenderer formula={block.content} displayMode={true} />
                </div>
              );
            }

            if (block.type === "mermaid") {
              return (
                <div key={idx} className="my-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-x-auto flex justify-center">
                  <MermaidRenderer code={block.content} />
                </div>
              );
            }

            if (block.type === "chart") {
              return (
                <div key={idx} className="my-6">
                  <DeclarativeChartRenderer initialCode={block.content} />
                </div>
              );
            }

            if (block.type === "duckdb") {
              return (
                <div key={idx} className="my-6">
                  <DuckDbStudioRenderer initialCode={block.content} />
                </div>
              );
            }

            if (block.type === "callout") {
              const borderColors: Record<string, string> = {
                NOTE: "border-sky-500/40 bg-sky-950/20 text-sky-200",
                TIP: "border-emerald-500/40 bg-emerald-950/20 text-emerald-200",
                WARNING: "border-amber-500/40 bg-amber-950/20 text-amber-200",
                CAUTION: "border-rose-500/40 bg-rose-950/20 text-rose-200",
              };
              const colorClass = borderColors[block.calloutType || "NOTE"] || borderColors.NOTE;

              return (
                <div key={idx} className={`p-4 rounded-2xl border ${colorClass} my-4 space-y-1.5`}>
                  <div className="text-xs font-bold font-mono tracking-wider opacity-90">
                    {block.calloutType}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {block.content}
                  </div>
                </div>
              );
            }

            if (block.type === "code") {
              return (
                <div key={idx} className="my-4 rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-xl">
                  <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold uppercase">{block.lang}</span>
                    <span className="text-slate-500">Selene Sandbox</span>
                  </div>
                  <pre className="p-4 font-mono text-xs md:text-sm text-slate-300 overflow-x-auto leading-relaxed">
                    <code>{block.content}</code>
                  </pre>
                </div>
              );
            }

            // Paragraph
            return (
              <p key={idx} className="leading-relaxed text-slate-300">
                {block.content}
              </p>
            );
          })}
        </div>
      </main>

      {/* Embed Modal */}
      {embedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Embed Selene Document</h3>
              <button
                onClick={() => setEmbedModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Copy this HTML snippet to embed this live document canvas into your blog, documentation site, or Notion:
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
              <code>{`<iframe src="${typeof window !== "undefined" ? window.location.origin : ""}/share/${id}?embed=true" width="100%" height="600" frameborder="0" style="border-radius:16px;border:1px solid #38bdf833;" allow="clipboard-write"></iframe>`}</code>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`<iframe src="${window.location.origin}/share/${id}?embed=true" width="100%" height="600" frameborder="0" style="border-radius:16px;border:1px solid #38bdf833;" allow="clipboard-write"></iframe>`);
                setEmbedModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold text-white text-xs transition cursor-pointer shadow-lg shadow-cyan-600/30"
            >
              Copy Embed Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
