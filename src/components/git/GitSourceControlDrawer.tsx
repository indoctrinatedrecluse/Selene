"use client";

import React, { useState } from "react";
import {
  GitBranch,
  GitCommit,
  Check,
  Plus,
  Minus,
  RotateCcw,
  FileCode,
  FileDiff,
  X,
  UploadCloud,
} from "lucide-react";

export interface GitFileStatus {
  path: string;
  status: "modified" | "added" | "deleted" | "untracked";
  staged: boolean;
  oldContent?: string;
  newContent?: string;
}

interface GitSourceControlDrawerProps {
  branchName?: string;
  onCommit?: (message: string) => Promise<boolean>;
  onPush?: () => Promise<boolean>;
  className?: string;
}

export function GitSourceControlDrawer({
  branchName = "main",
  onCommit,
  onPush,
  className = "",
}: GitSourceControlDrawerProps) {
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [selectedFileForDiff, setSelectedFileForDiff] = useState<GitFileStatus | null>(null);

  // Simulated live git working tree status for workspace files
  const [files, setFiles] = useState<GitFileStatus[]>([
    {
      path: "src/components/render-engine/DeclarativeChartRenderer.tsx",
      status: "added",
      staged: true,
      oldContent: "",
      newContent: `export function DeclarativeChartRenderer() {\n  return <svg viewBox="0 0 800 360">...</svg>;\n}`,
    },
    {
      path: "src/components/render-engine/DuckDbStudioRenderer.tsx",
      status: "added",
      staged: true,
      oldContent: "",
      newContent: `export function DuckDbStudioRenderer() {\n  // In-Browser Vector OLAP Engine\n}`,
    },
    {
      path: "src/lib/workspace-store.ts",
      status: "modified",
      staged: false,
      oldContent: `const STORAGE_KEY = "selene_documents_v11";`,
      newContent: `const STORAGE_KEY = "selene_documents_v12";\n// Added Declarative Chart & DuckDB starter templates`,
    },
    {
      path: "docs/architecture-v0.4.0.md",
      status: "untracked",
      staged: false,
      oldContent: "",
      newContent: `# Selene Deep Analytical Computing Architecture`,
    },
  ]);

  const stagedFiles = files.filter((f) => f.staged);
  const unstagedFiles = files.filter((f) => !f.staged);

  const toggleStageFile = (filePath: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === filePath ? { ...f, staged: !f.staged } : f))
    );
  };

  const stageAll = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, staged: true })));
  };

  const unstageAll = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, staged: false })));
  };

  const handleCommitAction = async () => {
    if (!commitMessage.trim() || stagedFiles.length === 0) return;
    setIsCommitting(true);
    try {
      if (onCommit) {
        await onCommit(commitMessage);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      setFiles((prev) => prev.filter((f) => !f.staged));
      setCommitMessage("");
      setCommitSuccess(true);
      setTimeout(() => setCommitSuccess(false), 2500);
    } finally {
      setIsCommitting(false);
    }
  };

  const handlePushAction = async () => {
    setIsPushing(true);
    try {
      if (onPush) {
        await onPush();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#080d1b] text-slate-300 select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 bg-[#0a1024]">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">Source Control</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-mono">
          <span>{branchName}</span>
        </div>
      </div>

      {/* Commit Authoring Box */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/40 space-y-2">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Message (Ctrl+Enter to commit)"
          rows={3}
          className="w-full rounded-xl bg-slate-900/90 p-2.5 font-mono text-xs text-slate-200 placeholder-slate-500 border border-slate-800 focus:border-sky-500 focus:outline-none resize-none leading-relaxed"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              handleCommitAction();
            }
          }}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleCommitAction}
            disabled={!commitMessage.trim() || stagedFiles.length === 0 || isCommitting}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            {commitSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-emerald-300">Committed!</span>
              </>
            ) : isCommitting ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Committing...</span>
              </>
            ) : (
              <>
                <GitCommit className="w-3.5 h-3.5" />
                <span>Commit ({stagedFiles.length})</span>
              </>
            )}
          </button>

          <button
            onClick={handlePushAction}
            disabled={isPushing}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Push commits to origin/main"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Staged and Changes Lists */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 text-xs">
        {/* Staged Changes */}
        <div className="p-2 space-y-1">
          <div className="flex items-center justify-between px-1 py-1 text-[11px] font-semibold text-slate-400">
            <span className="uppercase tracking-wider">Staged Changes ({stagedFiles.length})</span>
            {stagedFiles.length > 0 && (
              <button
                onClick={unstageAll}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                title="Unstage all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {stagedFiles.length === 0 && (
            <p className="px-2 py-1 text-[11px] text-slate-500 italic">No staged changes</p>
          )}

          {stagedFiles.map((file) => (
            <div
              key={file.path}
              className="group flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-900/60 transition-colors cursor-pointer"
              onClick={() => setSelectedFileForDiff(file)}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate text-slate-200 text-xs font-mono">
                  {file.path.split("/").pop()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono truncate">
                  {file.path.split("/").slice(0, -1).join("/")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                  {file.status[0]}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStageFile(file.path);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  title="Unstage"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Unstaged Changes */}
        <div className="p-2 space-y-1">
          <div className="flex items-center justify-between px-1 py-1 text-[11px] font-semibold text-slate-400">
            <span className="uppercase tracking-wider">Changes ({unstagedFiles.length})</span>
            {unstagedFiles.length > 0 && (
              <button
                onClick={stageAll}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                title="Stage all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {unstagedFiles.length === 0 && (
            <p className="px-2 py-1 text-[11px] text-slate-500 italic">Working tree clean</p>
          )}

          {unstagedFiles.map((file) => (
            <div
              key={file.path}
              className="group flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-900/60 transition-colors cursor-pointer"
              onClick={() => setSelectedFileForDiff(file)}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate text-slate-200 text-xs font-mono">
                  {file.path.split("/").pop()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono truncate">
                  {file.path.split("/").slice(0, -1).join("/")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                  {file.status[0]}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStageFile(file.path);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  title="Stage"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Diff Modal if a file is clicked */}
      {selectedFileForDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <FileDiff className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-bold text-white font-mono">
                  {selectedFileForDiff.path}
                </span>
              </div>
              <button
                onClick={() => setSelectedFileForDiff(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 bg-slate-950/80">
              {selectedFileForDiff.oldContent && (
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300">
                  <div className="text-[10px] uppercase font-bold text-rose-400 mb-1">
                    --- Original
                  </div>
                  <pre className="whitespace-pre-wrap">{selectedFileForDiff.oldContent}</pre>
                </div>
              )}
              {selectedFileForDiff.newContent && (
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">
                    +++ Modified (Working Tree)
                  </div>
                  <pre className="whitespace-pre-wrap">{selectedFileForDiff.newContent}</pre>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedFileForDiff(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
