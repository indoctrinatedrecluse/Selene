"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Code2,
  Columns,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import katex from "katex";
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

interface TypstRendererProps {
  initialCode: string;
  className?: string;
  onCodeChange?: (newCode: string) => void;
}

export type TypstViewMode = "split" | "typeset" | "code";

const DEFAULT_TYPST_SAMPLE = `#set page(paper: "a4", margin: (x: 2cm, y: 2.5cm))
#set text(font: "Crimson Pro", size: 11pt, lang: "en")

= Principles of Celestial Orbital Dynamics
== Selene Academic Working Paper • Series 2026.IV
_Athena Research Laboratory for Astronautical Computation_

The trajectory of an unperturbed lunar orbiter in a central gravitational field is governed by Newton's law of universal gravitation:

$ frac(d^2 bold(r), d t^2) + frac(mu, r^3) bold(r) = bold(0) $

Where $mu = G(M + m) approx 4.9048 times 10^12 space "m"^3 "s"^(-2)$ represents the selenocentric gravitational parameter.

== Conservation of Specific Orbital Energy

The vis-viva equation relates orbital velocity $v$ and radius vector $r$ to semi-major axis $a$:

$ v^2 = mu (frac(2, r) - frac(1, a)) $

#rect(fill: luma(240), stroke: 1pt + rgb("38bdf8"), radius: 4pt)[
  *Theorem 1.1 (Orbital Invariant)*: For any closed elliptic lunar trajectory, the specific angular momentum vector $bold(h) = bold(r) times bold(v)$ remains strictly constant over the epoch $[t_0, t_f]$.
]

== Orbital Parameterization Matrix

#table(
  columns: (1fr, 1.5fr, 1fr),
  [ *Parameter* ], [ *Symbolic Formulation* ], [ *Canonical Unit* ],
  [ Eccentricity ], [ $e = sqrt(1 - frac(b^2, a^2))$ ], [ Dimensionless ],
  [ Orbital Period ], [ $T = 2 pi sqrt(frac(a^3, mu))$ ], [ Seconds (s) ],
  [ Escape Velocity ], [ $v_e = sqrt(frac(2 mu, r))$ ], [ km / s ],
)
`;

export function TypstRenderer({
  initialCode,
  className = "",
  onCodeChange,
}: TypstRendererProps) {
  const [code, setCode] = useState(initialCode || DEFAULT_TYPST_SAMPLE);
  const [viewMode, setViewMode] = useState<TypstViewMode>("typeset");
  const [fontSize, setFontSize] = useState<"compact" | "normal" | "large">("normal");
  const [parseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Typst Document AST & Token Parser
  const parsedDoc = useMemo(() => {
    const lines = code.split("\n");
    let title = "";
    let subtitle = "";
    let institution = "";
    const blocks: Array<{
      type: "h1" | "h2" | "h3" | "p" | "math_display" | "theorem" | "table" | "list";
      content: string;
      items?: string[];
      tableData?: string[][];
    }> = [];

    let currentTableRows: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Metadata setters
      if (line.startsWith("#set ")) continue;

      // Headings
      if (line.startsWith("= ")) {
        const text = line.substring(2).trim();
        if (!title) {
          title = text;
        } else {
          blocks.push({ type: "h1", content: text });
        }
        continue;
      }
      if (line.startsWith("== ")) {
        const text = line.substring(3).trim();
        if (!subtitle && title && blocks.length === 0) {
          subtitle = text;
        } else {
          blocks.push({ type: "h2", content: text });
        }
        continue;
      }
      if (line.startsWith("=== ")) {
        blocks.push({ type: "h3", content: line.substring(4).trim() });
        continue;
      }

      // Subtitle / Institution italics
      if (line.startsWith("_") && line.endsWith("_") && !institution && subtitle) {
        institution = line.substring(1, line.length - 1).trim();
        continue;
      }

      // Display Math: $ ... $
      if (line.startsWith("$") && line.endsWith("$") && line.length > 2) {
        let mathRaw = line.substring(1, line.length - 1).trim();
        // Convert typst common math tokens to KaTeX
        mathRaw = mathRaw
          .replace(/frac\(([^,]+),\s*([^)]+)\)/g, "\\frac{$1}{$2}")
          .replace(/sqrt\(([^)]+)\)/g, "\\sqrt{$1}")
          .replace(/bold\(([^)]+)\)/g, "\\mathbf{$1}")
          .replace(/times/g, "\\times")
          .replace(/approx/g, "\\approx")
          .replace(/pi/g, "\\pi")
          .replace(/mu/g, "\\mu")
          .replace(/space/g, "\\;");
        blocks.push({ type: "math_display", content: mathRaw });
        continue;
      }

      // Theorem / Callout: #rect(...) [...]
      if (line.includes("#rect(") || line.includes("#theorem")) {
        const fullBlock = lines.slice(i).join("\n");
        const match = fullBlock.match(/\[([\s\S]*?)\]/);
        if (match) {
          blocks.push({ type: "theorem", content: match[1].trim() });
          // Skip lines
          const lineCount = match[0].split("\n").length;
          i += Math.max(0, lineCount - 1);
          continue;
        }
      }

      // Table: #table(...)
      if (line.startsWith("#table(")) {
        currentTableRows = [];
        const tableLines = lines.slice(i).join("\n");
        const cellMatches = [...tableLines.matchAll(/\[(.*?)\]/g)];
        if (cellMatches.length > 0) {
          const cells = cellMatches.map((m) => m[1].trim());
          const cols = 3;
          for (let c = 0; c < cells.length; c += cols) {
            currentTableRows.push(cells.slice(c, c + cols));
          }
          blocks.push({ type: "table", content: "", tableData: currentTableRows });
          // Skip table
          const closingIndex = tableLines.indexOf(")");
          if (closingIndex !== -1) {
            const consumed = tableLines.substring(0, closingIndex).split("\n").length;
            i += Math.max(0, consumed - 1);
          }
        }
        continue;
      }

      // List: + or -
      if (line.startsWith("+ ") || line.startsWith("- ")) {
        blocks.push({ type: "list", content: line.substring(2).trim() });
        continue;
      }

      // Normal paragraph
      blocks.push({ type: "p", content: line });
    }

    return { title, subtitle, institution, blocks };
  }, [code]);

  // Render inline formatting (math, bold, code)
  const renderFormattedText = (text: string) => {
    // Math inline: $...$
    const parts = text.split(/(\$[^$]+\$|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("$") && part.endsWith("$")) {
        let math = part.slice(1, -1);
        math = math
          .replace(/frac\(([^,]+),\s*([^)]+)\)/g, "\\frac{$1}{$2}")
          .replace(/sqrt\(([^)]+)\)/g, "\\sqrt{$1}")
          .replace(/bold\(([^)]+)\)/g, "\\mathbf{$1}")
          .replace(/times/g, "\\times")
          .replace(/approx/g, "\\approx")
          .replace(/mu/g, "\\mu");
        try {
          const rendered = katex.renderToString(math, { throwOnError: false });
          return (
            <span
              key={idx}
              className="inline-block px-1"
              dangerouslySetInnerHTML={{ __html: rendered }}
            />
          );
        } catch {
          return <span key={idx} className="font-mono text-sky-400">{part}</span>;
        }
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <strong key={idx} className="font-semibold text-slate-100">{part.slice(1, -1)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950/95 overflow-hidden shadow-2xl backdrop-blur-xl ${className}`}
    >
      {/* Top Banner Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-100 tracking-wide">
                Athena Academic Typesetter
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Typst • Sub-20ms
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Publication-grade academic typesetting with vector mathematical typography
            </p>
          </div>
        </div>

        {/* View mode toggle & actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("typeset")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === "typeset"
                  ? "bg-sky-500 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Typeset Parchment View"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Typeset</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === "split"
                  ? "bg-sky-500 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Split Code & Typeset View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === "code"
                  ? "bg-sky-500 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Source Code View"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Typst Source</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Font scale buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setFontSize("compact")}
              className={`px-2 py-0.5 rounded ${fontSize === "compact" ? "bg-slate-800 text-sky-400 font-medium" : "text-slate-400"}`}
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => setFontSize("normal")}
              className={`px-2 py-0.5 rounded ${fontSize === "normal" ? "bg-slate-800 text-sky-400 font-medium" : "text-slate-400"}`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setFontSize("large")}
              className={`px-2 py-0.5 rounded ${fontSize === "large" ? "bg-slate-800 text-sky-400 font-medium" : "text-slate-400"}`}
            >
              Large
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title="Copy Typst source"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`grid ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} min-h-[460px]`}>
        {/* Code Editor Pane (for split or code view) */}
        {(viewMode === "split" || viewMode === "code") && (
          <div className="relative border-r border-slate-800/80 bg-slate-950 flex flex-col">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/60 text-[11px] text-slate-400 font-mono">
              <span>main.typ</span>
              <span>UTF-8</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="flex-1 w-full p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-sky-500/50 selection:bg-sky-500/30"
              spellCheck={false}
              rows={20}
            />
          </div>
        )}

        {/* Typeset Parchment Canvas */}
        {(viewMode === "typeset" || viewMode === "split") && (
          <div className="p-6 md:p-8 bg-gradient-to-b from-slate-900/40 via-slate-950 to-slate-900/60 overflow-y-auto max-h-[700px] flex justify-center">
            {/* The Academic Parchment Sheet */}
            <div
              className={`w-full max-w-2xl bg-[#0f172a] text-slate-200 border border-slate-700/60 rounded-xl shadow-2xl p-8 md:p-12 transition-all ${
                fontSize === "compact" ? "text-xs" : fontSize === "large" ? "text-base" : "text-sm"
              }`}
              style={{
                fontFamily: "var(--font-serif, 'Crimson Pro', Georgia, serif)",
              }}
            >
              {/* Paper Header / Running Header */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800 pb-3 mb-6 font-mono tracking-wider uppercase">
                <span>Selene Working Papers in Astronautics</span>
                <span>Page 1 of 1</span>
              </div>

              {/* Title & Metadata */}
              {parsedDoc.title && (
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-50 font-serif mb-2 leading-tight">
                    {parsedDoc.title}
                  </h1>
                  {parsedDoc.subtitle && (
                    <div className="text-sm md:text-base text-sky-300 font-medium tracking-wide">
                      {parsedDoc.subtitle}
                    </div>
                  )}
                  {parsedDoc.institution && (
                    <div className="text-xs text-slate-400 italic mt-1 font-serif">
                      {parsedDoc.institution}
                    </div>
                  )}
                  <div className="w-16 h-0.5 bg-sky-500/50 mx-auto mt-4 rounded-full" />
                </div>
              )}

              {/* Document Blocks */}
              <div className="space-y-4 leading-relaxed text-slate-300 font-serif">
                {parsedDoc.blocks.map((block, idx) => {
                  switch (block.type) {
                    case "h1":
                      return (
                        <h2 key={idx} className="text-xl font-bold text-slate-100 mt-6 mb-2 border-b border-slate-800 pb-1">
                          {block.content}
                        </h2>
                      );
                    case "h2":
                      return (
                        <h3 key={idx} className="text-lg font-semibold text-sky-200 mt-5 mb-2">
                          {block.content}
                        </h3>
                      );
                    case "h3":
                      return (
                        <h4 key={idx} className="text-base font-semibold text-slate-200 mt-4 mb-1">
                          {block.content}
                        </h4>
                      );
                    case "math_display":
                      try {
                        const html = katex.renderToString(block.content, {
                          displayMode: true,
                          throwOnError: false,
                        });
                        return (
                          <div
                            key={idx}
                            className="my-4 py-3 px-4 rounded-lg bg-slate-900/80 border border-slate-800/80 text-center overflow-x-auto shadow-inner"
                            dangerouslySetInnerHTML={{ __html: html }}
                          />
                        );
                      } catch {
                        return (
                          <div key={idx} className="font-mono text-center text-sky-400 my-3">
                            ${block.content}$
                          </div>
                        );
                      }
                    case "theorem":
                      return (
                        <div
                          key={idx}
                          className="my-5 p-4 rounded-lg bg-sky-950/30 border-l-4 border-sky-400 text-slate-200 shadow-sm leading-relaxed"
                        >
                          {renderFormattedText(block.content)}
                        </div>
                      );
                    case "table":
                      if (!block.tableData || block.tableData.length === 0) return null;
                      return (
                        <div key={idx} className="my-5 overflow-x-auto">
                          <table className="w-full border-collapse border border-slate-800 text-left text-xs">
                            <tbody>
                              {block.tableData.map((row, rIdx) => (
                                <tr
                                  key={rIdx}
                                  className={rIdx === 0 ? "bg-slate-800/70 text-slate-100 font-semibold" : "border-t border-slate-800/60 hover:bg-slate-900/40"}
                                >
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-2.5 border border-slate-800">
                                      {renderFormattedText(cell)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    case "list":
                      return (
                        <li key={idx} className="ml-5 list-disc text-slate-300">
                          {renderFormattedText(block.content)}
                        </li>
                      );
                    case "p":
                    default:
                      return <p key={idx}>{renderFormattedText(block.content)}</p>;
                  }
                })}
              </div>

              {/* Colophon & Seal */}
              <div className="mt-12 pt-6 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Typeset with Athena Typst Compiler v0.12.1</span>
                <span>Selene Lunar Framework</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Lens Integration */}
      <SandboxAutoFixLens
        code={code}
        language="typst"
        errorMessage={parseError || ""}
        onApplyFix={(fixed) => handleCodeChange(fixed)}
      />
    </div>
  );
}
