"use client";

import React, { useState, useMemo } from "react";
import {
  History,
  RotateCcw,
  X,
  Clock,
  FileText,
  GitCompare,
  Columns,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { computeLineDiff } from "@/lib/diff-engine";

export interface RevisionItem {
  id: string;
  documentId: string;
  contentMarkdown: string;
  summary?: string | null;
  createdAt: number;
}

interface RevisionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  revisions: RevisionItem[];
  currentContent?: string;
  onRestore: (revision: RevisionItem) => void;
}

export function RevisionHistoryDrawer({
  isOpen,
  onClose,
  revisions,
  currentContent = "",
  onRestore,
}: RevisionHistoryDrawerProps) {
  const [selectedRev, setSelectedRev] = useState<RevisionItem | null>(null);
  const [diffMode, setDiffMode] = useState<"unified" | "split">("unified");
  const [compareTarget, setCompareTarget] = useState<"current" | "previous">("current");

  // Determine comparison texts
  const diffData = useMemo(() => {
    if (!selectedRev) return null;

    let baseText = "";
    if (compareTarget === "current") {
      baseText = selectedRev.contentMarkdown;
      return computeLineDiff(baseText, currentContent);
    } else {
      // Find previous revision index
      const idx = revisions.findIndex((r) => r.id === selectedRev.id);
      const prevRev = idx >= 0 && idx + 1 < revisions.length ? revisions[idx + 1] : null;
      baseText = prevRev ? prevRev.contentMarkdown : "";
      return computeLineDiff(baseText, selectedRev.contentMarkdown);
    }
  }, [selectedRev, compareTarget, currentContent, revisions]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 ${
        selectedRev ? "w-[720px] max-w-full" : "w-80"
      } bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#090e1e]">
        <div className="flex items-center gap-2">
          {selectedRev ? (
            <button
              onClick={() => setSelectedRev(null)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
              title="Back to Revisions List"
            >
              <ArrowLeft className="w-4 h-4 text-sky-400" />
              <span>Back</span>
            </button>
          ) : (
            <History className="w-4 h-4 text-sky-400" />
          )}
          <span className="font-semibold text-sm text-white">
            {selectedRev ? "Visual Diff Inspector" : "Version History"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Body */}
      {selectedRev && diffData ? (
        /* ================= VISUAL DIFF INSPECTOR VIEW ================= */
        <div className="flex-1 flex flex-col overflow-hidden bg-[#050811]">
          {/* Diff Controls Sub-header */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 gap-2">
            {/* Left: Stats */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                +{diffData.additions} added
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                -{diffData.deletions} removed
              </span>
              <span className="text-slate-500 text-[11px]">
                {diffData.unchanged} unchanged
              </span>
            </div>

            {/* Right: Compare Switcher & View Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setCompareTarget("current")}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                    compareTarget === "current"
                      ? "bg-slate-800 text-sky-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  vs Current
                </button>
                <button
                  type="button"
                  onClick={() => setCompareTarget("previous")}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                    compareTarget === "previous"
                      ? "bg-slate-800 text-sky-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  vs Previous
                </button>
              </div>

              <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setDiffMode("unified")}
                  className={`p-1.5 rounded-md ${
                    diffMode === "unified" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-white"
                  }`}
                  title="Unified Diff View"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDiffMode("split")}
                  className={`p-1.5 rounded-md ${
                    diffMode === "split" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-white"
                  }`}
                  title="Side-by-Side Split View"
                >
                  <Columns className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onRestore(selectedRev);
                  setSelectedRev(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
                title="Restore this revision"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore</span>
              </button>
            </div>
          </div>

          {/* Diff Content Viewport */}
          <div className="flex-1 overflow-auto font-mono text-xs leading-relaxed">
            {diffMode === "unified" ? (
              /* UNIFIED VIEW */
              <div className="divide-y divide-slate-900">
                {diffData.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start px-3 py-0.5 ${
                      line.type === "added"
                        ? "bg-emerald-950/40 text-emerald-300"
                        : line.type === "removed"
                        ? "bg-rose-950/40 text-rose-300"
                        : "text-slate-400 hover:bg-slate-900/40"
                    }`}
                  >
                    <span className="w-10 select-none text-[10px] text-slate-600 text-right pr-2">
                      {line.oldLineNumber ?? ""}
                    </span>
                    <span className="w-10 select-none text-[10px] text-slate-600 text-right pr-2">
                      {line.newLineNumber ?? ""}
                    </span>
                    <span className="w-4 select-none font-bold text-center">
                      {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all pl-2">
                      {line.content || " "}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              /* SIDE-BY-SIDE SPLIT VIEW */
              <div className="grid grid-cols-2 divide-x divide-slate-800">
                {/* Left: Original / Old */}
                <div className="p-3 overflow-x-auto divide-y divide-slate-900/60 bg-[#070b16]">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 pb-1 border-b border-slate-800">
                    {compareTarget === "current" ? "Selected Revision" : "Previous Version"}
                  </div>
                  {diffData.lines
                    .filter((l) => l.type !== "added")
                    .map((line, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start px-2 py-0.5 ${
                          line.type === "removed"
                            ? "bg-rose-950/40 text-rose-300"
                            : "text-slate-400"
                        }`}
                      >
                        <span className="w-8 select-none text-[10px] text-slate-600 pr-2">
                          {line.oldLineNumber ?? ""}
                        </span>
                        <span className="flex-1 whitespace-pre-wrap break-all">
                          {line.content || " "}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Right: New / Current */}
                <div className="p-3 overflow-x-auto divide-y divide-slate-900/60 bg-[#070b16]">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 pb-1 border-b border-slate-800">
                    {compareTarget === "current" ? "Current Document" : "Selected Revision"}
                  </div>
                  {diffData.lines
                    .filter((l) => l.type !== "removed")
                    .map((line, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start px-2 py-0.5 ${
                          line.type === "added"
                            ? "bg-emerald-950/40 text-emerald-300"
                            : "text-slate-400"
                        }`}
                      >
                        <span className="w-8 select-none text-[10px] text-slate-600 pr-2">
                          {line.newLineNumber ?? ""}
                        </span>
                        <span className="flex-1 whitespace-pre-wrap break-all">
                          {line.content || " "}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= REVISION LIST VIEW ================= */
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {revisions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No revisions recorded yet. Revisions are created automatically as you make changes.
            </div>
          ) : (
            revisions.map((rev, index) => {
              const date = new Date(rev.createdAt);
              const formattedTime = date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
              const formattedDate = date.toLocaleDateString([], {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={rev.id}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formattedTime}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{formattedDate}</span>
                    </div>
                    {index === 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono">
                        Latest
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-2 truncate">
                    {rev.summary || "Auto-saved snapshot"}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{rev.contentMarkdown.length} chars</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Inspect Diff Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedRev(rev)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-medium transition-colors cursor-pointer"
                        title="Inspect visual diff against current document"
                      >
                        <GitCompare className="w-3 h-3" />
                        <span>Diff</span>
                      </button>

                      {/* Restore Button */}
                      <button
                        type="button"
                        onClick={() => onRestore(rev)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                        title="Restore this version"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
