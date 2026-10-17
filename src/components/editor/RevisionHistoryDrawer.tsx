"use client";

import React from "react";
import { History, RotateCcw, X, Clock, FileText } from "lucide-react";

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
  onRestore: (revision: RevisionItem) => void;
}

export function RevisionHistoryDrawer({
  isOpen,
  onClose,
  revisions,
  onRestore,
}: RevisionHistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-sm text-white">Version History</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Revision List */}
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
                      Current
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

                  <button
                    onClick={() => onRestore(rev)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-300 text-[11px] font-medium transition-colors"
                    title="Restore this version"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
