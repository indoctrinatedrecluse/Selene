"use client";

import React, { useState, useMemo } from "react";
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
  CheckCircle2,
} from "lucide-react";
import { DocumentItem, STARTER_TEMPLATES } from "@/lib/workspace-store";
import { saveChronosSnapshot, computeSemanticDiff, DiffLine } from "@/lib/chronos-store";

export interface GitFileStatus {
  path: string;
  status: "modified" | "added" | "deleted" | "untracked";
  staged: boolean;
  oldContent?: string;
  newContent?: string;
  docId?: string;
}

interface GitBaseline {
  [docId: string]: {
    content: string;
    title: string;
    commitHash: string;
    timestamp: number;
  };
}

interface GitSourceControlDrawerProps {
  branchName?: string;
  documents?: DocumentItem[];
  onCommit?: (message: string, stagedPaths: string[]) => Promise<boolean>;
  onPush?: () => Promise<boolean>;
  className?: string;
}

const BASELINES_KEY = "selene_git_baselines";

function loadBaselines(): GitBaseline {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(BASELINES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveBaselines(baselines: GitBaseline): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BASELINES_KEY, JSON.stringify(baselines));
  } catch (err) {
    console.error("Failed to persist git baselines", err);
  }
}

export function GitSourceControlDrawer({
  branchName = "main",
  documents = [],
  onCommit,
  onPush,
  className = "",
}: GitSourceControlDrawerProps) {
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [commitSuccessText, setCommitSuccessText] = useState<string | null>(null);
  const [selectedFileForDiff, setSelectedFileForDiff] = useState<GitFileStatus | null>(null);
  const [stagedPaths, setStagedPaths] = useState<Set<string>>(new Set());
  const [baselines, setBaselines] = useState<GitBaseline>(() => loadBaselines());

  // Compute live file statuses from active workspace documents
  const files: GitFileStatus[] = useMemo(() => {
    if (!documents || documents.length === 0) return [];

    const computed: GitFileStatus[] = [];

    for (const doc of documents) {
      const canonicalStarter = STARTER_TEMPLATES.find((s) => s.id === doc.id);
      const baseline = baselines[doc.id];
      const folder = doc.folder || "documents";
      const docPath = `${folder}/${doc.title}`;

      if (baseline) {
        // Document has a committed baseline: compare against it
        if (doc.content !== baseline.content || doc.title !== baseline.title) {
          computed.push({
            path: docPath,
            status: "modified",
            staged: stagedPaths.has(docPath),
            oldContent: baseline.content,
            newContent: doc.content,
            docId: doc.id,
          });
        }
      } else if (canonicalStarter) {
        // Document is a starter template without custom commits
        if (doc.content !== canonicalStarter.content || doc.title !== canonicalStarter.title) {
          computed.push({
            path: docPath,
            status: "modified",
            staged: stagedPaths.has(docPath),
            oldContent: canonicalStarter.content,
            newContent: doc.content,
            docId: doc.id,
          });
        }
      } else {
        // Newly created user document
        computed.push({
          path: docPath,
          status: "added",
          staged: stagedPaths.has(docPath),
          oldContent: "",
          newContent: doc.content,
          docId: doc.id,
        });
      }
    }

    return computed;
  }, [documents, baselines, stagedPaths]);

  const stagedFiles = useMemo(() => files.filter((f) => f.staged), [files]);
  const unstagedFiles = useMemo(() => files.filter((f) => !f.staged), [files]);

  const toggleStageFile = (filePath: string) => {
    setStagedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  };

  const stageAll = () => {
    setStagedPaths(new Set(files.map((f) => f.path)));
  };

  const unstageAll = () => {
    setStagedPaths(new Set());
  };

  const handleCommitAction = async () => {
    if (!commitMessage.trim() || stagedFiles.length === 0) return;
    setIsCommitting(true);
    try {
      const commitHash = Math.random().toString(16).substring(2, 9);

      // Create Chronos snapshot milestones for each staged document
      const updatedBaselines = { ...baselines };
      for (const staged of stagedFiles) {
        if (!staged.docId) continue;
        const targetDoc = documents.find((d) => d.id === staged.docId);
        if (targetDoc) {
          saveChronosSnapshot(targetDoc.id, targetDoc.title, targetDoc.content, {
            tag: `[git:${commitHash}] ${commitMessage.trim()}`,
            isMilestone: true,
            isManual: true,
          });
          updatedBaselines[targetDoc.id] = {
            content: targetDoc.content,
            title: targetDoc.title,
            commitHash,
            timestamp: Date.now(),
          };
        }
      }

      saveBaselines(updatedBaselines);
      setBaselines(updatedBaselines);

      if (onCommit) {
        await onCommit(commitMessage, stagedFiles.map((f) => f.path));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setStagedPaths(new Set());
      setCommitMessage("");
      setCommitSuccessText(`[${branchName} ${commitHash}] ${commitMessage.slice(0, 20)}...`);
      setTimeout(() => setCommitSuccessText(null), 3500);
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
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    } finally {
      setIsPushing(false);
    }
  };

  // Compute visual diff lines for the selected file
  const diffSummary = useMemo(() => {
    if (!selectedFileForDiff) return null;
    return computeSemanticDiff(
      selectedFileForDiff.oldContent || "",
      selectedFileForDiff.newContent || ""
    );
  }, [selectedFileForDiff]);

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
            {commitSuccessText ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-emerald-300 truncate">{commitSuccessText}</span>
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
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Push commits to remote origin"
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
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
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
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
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
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Stage all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {unstagedFiles.length === 0 && files.length === 0 ? (
            <div className="p-4 text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto opacity-75" />
              <p className="text-xs text-slate-300 font-semibold">Working tree clean</p>
              <p className="text-[10px] text-slate-500">
                All workspace documents match committed baselines.
              </p>
            </div>
          ) : unstagedFiles.length === 0 ? (
            <p className="px-2 py-1 text-[11px] text-slate-500 italic">All changes are staged</p>
          ) : null}

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
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
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
      {selectedFileForDiff && diffSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <FileDiff className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-bold text-white font-mono">
                  {selectedFileForDiff.path}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  +{diffSummary.added}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  -{diffSummary.removed}
                </span>
              </div>
              <button
                onClick={() => setSelectedFileForDiff(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-0.5 bg-slate-950">
              {diffSummary.lines.map((line: DiffLine, idx: number) => {
                if (line.type === "add") {
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 px-2 py-0.5 bg-emerald-950/40 border-l-2 border-emerald-500 text-emerald-300"
                    >
                      <span className="w-8 shrink-0 select-none text-[10px] text-emerald-500/70 text-right">
                        +{line.newLineNumber}
                      </span>
                      <pre className="whitespace-pre-wrap break-all flex-1">{line.content}</pre>
                    </div>
                  );
                }
                if (line.type === "remove") {
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 px-2 py-0.5 bg-rose-950/40 border-l-2 border-rose-500 text-rose-300"
                    >
                      <span className="w-8 shrink-0 select-none text-[10px] text-rose-500/70 text-right">
                        -{line.oldLineNumber}
                      </span>
                      <pre className="whitespace-pre-wrap break-all flex-1">{line.content}</pre>
                    </div>
                  );
                }
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 px-2 py-0.5 text-slate-400 hover:bg-slate-900/40"
                  >
                    <span className="w-8 shrink-0 select-none text-[10px] text-slate-600 text-right">
                      {line.newLineNumber || line.oldLineNumber}
                    </span>
                    <pre className="whitespace-pre-wrap break-all flex-1">{line.content}</pre>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedFileForDiff(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
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
