"use client";

import React, { useState, useMemo } from "react";
import {
  History,
  Clock,
  RotateCcw,
  Tag,
  Search,
  Check,
  X,
  Columns,
  List,
  Eye,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";
import {
  ChronosSnapshot,
  DiffSummary,
  loadChronosSnapshots,
  saveChronosSnapshot,
  tagChronosSnapshot,
  deleteChronosSnapshot,
  computeSemanticDiff,
} from "@/lib/chronos-store";

export type DiffViewMode = "unified" | "split" | "preview";
export type FilterType = "all" | "milestones" | "manual";

interface ChronosTimelineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
  currentContent: string;
  onRestoreSnapshot: (restoredContent: string, title?: string) => void;
}

export function ChronosTimelineDrawer({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  currentContent,
  onRestoreSnapshot,
}: ChronosTimelineDrawerProps) {
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [diffMode, setDiffMode] = useState<DiffViewMode>("unified");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // New snapshot / tag inputs
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagEditValue, setTagEditValue] = useState("");

  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);

  // Derive snapshots synchronously from local storage without calling setState in an effect
  const snapshots: ChronosSnapshot[] = useMemo(() => {
    if (!isOpen || !documentId) return [];
    void refreshNonce;
    return loadChronosSnapshots(documentId);
  }, [isOpen, documentId, refreshNonce]);

  // Selected snapshot object (purely derived)
  const selectedSnapshot = useMemo(() => {
    if (selectedSnapshotId) {
      const match = snapshots.find((s) => s.id === selectedSnapshotId);
      if (match) return match;
    }
    return snapshots[0] || null;
  }, [snapshots, selectedSnapshotId]);

  // Compute semantic diff between selected snapshot and current live document
  const diff: DiffSummary | null = useMemo(() => {
    if (!selectedSnapshot) return null;
    return computeSemanticDiff(selectedSnapshot.content, currentContent);
  }, [selectedSnapshot, currentContent]);

  // Filtered snapshot list
  const filteredSnapshots = useMemo(() => {
    return snapshots.filter((s) => {
      // Filter type check
      if (filterType === "milestones" && !s.isMilestone) return false;
      if (filterType === "manual" && !s.isManual) return false;

      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTag = s.tag?.toLowerCase().includes(q);
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesDate = new Date(s.timestamp).toLocaleString().toLowerCase().includes(q);
        return matchesTag || matchesTitle || matchesDate;
      }
      return true;
    });
  }, [snapshots, filterType, searchQuery]);

  // Manual checkpoint creation
  const handleCreateCheckpoint = () => {
    const created = saveChronosSnapshot(documentId, documentTitle, currentContent, {
      tag: newTagInput.trim() || undefined,
      isMilestone: Boolean(newTagInput.trim()),
      isManual: true,
      author: "Cosmic Architect",
    });
    setRefreshNonce((n) => n + 1);
    setSelectedSnapshotId(created.id);
    setNewTagInput("");
    setIsCreatingTag(false);
  };

  // Tag editing
  const handleSaveTag = (snapshotId: string) => {
    tagChronosSnapshot(documentId, snapshotId, tagEditValue);
    setRefreshNonce((n) => n + 1);
    setEditingTagId(null);
    setTagEditValue("");
  };

  // Delete snapshot
  const handleDelete = (e: React.MouseEvent, snapshotId: string) => {
    e.stopPropagation();
    deleteChronosSnapshot(documentId, snapshotId);
    setRefreshNonce((n) => n + 1);
    if (selectedSnapshotId === snapshotId) {
      setSelectedSnapshotId(null);
    }
  };

  // Time-Warp Restore Handler
  const handleTimeWarpRestore = () => {
    if (!selectedSnapshot) return;

    // Safety: Save current live state as an automatic backup before restoring!
    saveChronosSnapshot(documentId, documentTitle, currentContent, {
      tag: `Pre-Rollback Backup (${new Date().toLocaleTimeString()})`,
      isMilestone: true,
      isManual: true,
      author: "Time-Warp Safeguard",
    });

    onRestoreSnapshot(selectedSnapshot.content, selectedSnapshot.title);
    setRestoreNotice(`Time-warped to epoch: "${selectedSnapshot.tag || new Date(selectedSnapshot.timestamp).toLocaleTimeString()}"`);
    setTimeout(() => {
      setRestoreNotice(null);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex h-[90vh] w-full max-w-7xl flex-col rounded-3xl border border-violet-500/30 bg-slate-950/95 shadow-2xl shadow-violet-950/40 backdrop-blur-2xl overflow-hidden text-slate-100 font-sans">
        {/* ⏳ Chronos Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25 text-white">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-wide text-white">⏳ Chronos Timeline</span>
                <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-violet-300">
                  Keeper of Cosmic Epochs
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Document: <span className="font-semibold text-slate-200">{documentTitle}</span> • {snapshots.length} Historical Epochs Recorded
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreatingTag(!isCreatingTag)}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 px-3.5 py-2 text-xs font-semibold text-violet-300 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Epoch Milestone</span>
            </button>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Inline Milestone Creation Bar */}
        {isCreatingTag && (
          <div className="flex items-center gap-3 border-b border-violet-500/20 bg-violet-950/20 px-6 py-3 animate-in slide-in-from-top-2">
            <Tag className="h-4 w-4 text-violet-400" />
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="Enter epoch name or milestone tag (e.g. 'Alpha Architecture Approved', 'Pre-Refactor Backup')..."
              className="flex-1 rounded-xl bg-slate-950 border border-violet-500/30 px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCheckpoint();
              }}
            />
            <button
              onClick={handleCreateCheckpoint}
              className="rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition-all"
            >
              Save Milestone
            </button>
            <button
              onClick={() => setIsCreatingTag(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        )}

        {/* 🧭 Main Two-Column Layout */}
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80 overflow-hidden">
          {/* Left Column: Revision Timeline History (4 cols) */}
          <div className="lg:col-span-4 flex flex-col bg-slate-950/60 overflow-hidden">
            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-800/80 space-y-3 bg-slate-900/30">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search historical epochs..."
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 font-mono"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                <button
                  onClick={() => setFilterType("all")}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    filterType === "all" ? "bg-violet-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({snapshots.length})
                </button>
                <button
                  onClick={() => setFilterType("milestones")}
                  className={`rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 ${
                    filterType === "milestones" ? "bg-violet-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Tag className="h-3 w-3" />
                  Milestones ({snapshots.filter((s) => s.isMilestone).length})
                </button>
                <button
                  onClick={() => setFilterType("manual")}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    filterType === "manual" ? "bg-violet-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Manual Checkpoints
                </button>
              </div>
            </div>

            {/* Snapshots Scrollable List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredSnapshots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                  <Clock className="h-8 w-8 mb-2 stroke-[1.5]" />
                  <p className="text-xs">No historical epochs match current filter.</p>
                </div>
              ) : (
                filteredSnapshots.map((snapshot) => {
                  const isSelected = snapshot.id === selectedSnapshot?.id;
                  const dateObj = new Date(snapshot.timestamp);
                  const formattedTime = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                  const formattedDate = dateObj.toLocaleDateString([], { month: "short", day: "numeric" });

                  return (
                    <div
                      key={snapshot.id}
                      onClick={() => setSelectedSnapshotId(snapshot.id)}
                      className={`group relative rounded-2xl p-3 border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-violet-950/30 border-violet-500/50 shadow-md shadow-violet-900/20"
                          : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${snapshot.isMilestone ? "bg-violet-400 animate-pulse" : "bg-slate-600"}`} />
                          <span className="text-xs font-mono font-semibold text-slate-200">
                            {formattedTime}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">({formattedDate})</span>
                        </div>

                        {/* Milestone Badge or Tag Trigger */}
                        {snapshot.tag && editingTagId !== snapshot.id ? (
                          <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                            {snapshot.tag}
                          </span>
                        ) : null}
                      </div>

                      {/* Tag editor inline */}
                      {editingTagId === snapshot.id ? (
                        <div className="my-2 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={tagEditValue}
                            onChange={(e) => setTagEditValue(e.target.value)}
                            placeholder="Tag milestone..."
                            className="flex-1 rounded-lg bg-slate-950 border border-violet-500/40 px-2 py-1 text-xs text-white"
                          />
                          <button
                            onClick={() => handleSaveTag(snapshot.id)}
                            className="rounded-lg bg-violet-600 px-2 py-1 text-xs text-white"
                          >
                            Save
                          </button>
                        </div>
                      ) : null}

                      {/* Stats Row */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <div className="flex items-center gap-3">
                          <span>{snapshot.wordCount} words</span>
                          <span>{snapshot.lineCount} lines</span>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTagId(snapshot.id);
                              setTagEditValue(snapshot.tag || "");
                            }}
                            className="text-slate-400 hover:text-violet-300 p-0.5"
                            title="Edit milestone tag"
                          >
                            <Tag className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, snapshot.id)}
                            className="text-slate-400 hover:text-rose-400 p-0.5"
                            title="Delete snapshot"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Visual Semantic Diff & Time-Warp Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col bg-slate-950/40 overflow-hidden">
            {/* Diff Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-6 py-3 bg-slate-900/40">
              {/* Diff View Mode Switcher */}
              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs font-medium">
                <button
                  onClick={() => setDiffMode("unified")}
                  className={`rounded-lg px-3 py-1 transition-all flex items-center gap-1.5 ${
                    diffMode === "unified" ? "bg-violet-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Unified Diff
                </button>
                <button
                  onClick={() => setDiffMode("split")}
                  className={`rounded-lg px-3 py-1 transition-all flex items-center gap-1.5 ${
                    diffMode === "split" ? "bg-violet-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Columns className="h-3.5 w-3.5" />
                  Side-by-Side
                </button>
                <button
                  onClick={() => setDiffMode("preview")}
                  className={`rounded-lg px-3 py-1 transition-all flex items-center gap-1.5 ${
                    diffMode === "preview" ? "bg-violet-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Epoch Snapshot
                </button>
              </div>

              {/* Telemetry Diff Badges */}
              {diff && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-400 font-semibold">
                    +{diff.added} lines
                  </span>
                  <span className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-rose-400 font-semibold">
                    -{diff.removed} lines
                  </span>
                  {diff.codeBlocksModified > 0 && (
                    <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-amber-400 font-semibold">
                      Δ {diff.codeBlocksModified} code blocks
                    </span>
                  )}
                </div>
              )}

              {/* Time-Warp Restore Button */}
              <button
                onClick={handleTimeWarpRestore}
                disabled={!selectedSnapshot}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Time-Warp Restore</span>
              </button>
            </div>

            {/* Restore Notification Pill */}
            {restoreNotice && (
              <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-6 py-2.5 text-xs text-emerald-300 font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>{restoreNotice}</span>
              </div>
            )}

            {/* Diff Canvas Contents */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
              {!selectedSnapshot ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                  <FileText className="h-10 w-10 mb-2 stroke-[1.5]" />
                  <p>Select a historical epoch from the left to inspect differences.</p>
                </div>
              ) : diffMode === "preview" ? (
                /* Raw Epoch Snapshot Preview */
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400 text-[11px]">
                    <span>HISTORICAL CONTENT PREVIEW</span>
                    <span>{selectedSnapshot.charCount} characters</span>
                  </div>
                  <pre className="text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    <code>{selectedSnapshot.content}</code>
                  </pre>
                </div>
              ) : diffMode === "split" ? (
                /* Side-by-Side (Split) Diff */
                <div className="grid grid-cols-2 gap-4 h-full">
                  {/* Left: Historical Epoch */}
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3 overflow-auto">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                      <span>HISTORICAL EPOCH</span>
                      <span className="text-violet-400">{new Date(selectedSnapshot.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <pre className="text-slate-300 whitespace-pre-wrap">
                      <code>{selectedSnapshot.content}</code>
                    </pre>
                  </div>

                  {/* Right: Current Live Document */}
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3 overflow-auto">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                      <span>CURRENT LIVE DOCUMENT</span>
                      <span className="text-emerald-400">Now</span>
                    </div>
                    <pre className="text-slate-300 whitespace-pre-wrap">
                      <code>{currentContent}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                /* Unified Color-Coded Line-by-Line Diff */
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden divide-y divide-slate-800/40">
                  {diff?.lines.map((line, idx) => {
                    const isAdd = line.type === "add";
                    const isRemove = line.type === "remove";

                    return (
                      <div
                        key={idx}
                        className={`flex items-start px-3 py-1 font-mono text-xs ${
                          isAdd
                            ? "bg-emerald-950/40 text-emerald-200 border-l-4 border-emerald-500"
                            : isRemove
                            ? "bg-rose-950/40 text-rose-200 border-l-4 border-rose-500 line-through opacity-85"
                            : "text-slate-300 hover:bg-slate-900/50"
                        }`}
                      >
                        {/* Line Number Gutter */}
                        <span className="w-10 select-none text-[10px] text-slate-600 text-right pr-3 font-mono">
                          {isAdd ? `+${line.newLineNumber}` : isRemove ? `-${line.oldLineNumber}` : line.newLineNumber}
                        </span>

                        {/* Line Content */}
                        <span className="flex-1 whitespace-pre-wrap break-all">
                          {line.content || " "}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
