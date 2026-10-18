"use client";

import React, { useState, useRef, useMemo } from "react";
import { DocumentItem, getDocumentFolder } from "@/lib/workspace-store";
import {
  Plus,
  Trash2,
  Search,
  PanelLeftClose,
  PanelLeft,
  Upload,
  History,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  RotateCcw,
  X,
  Edit2,
  Check,
  FileCode2,
} from "lucide-react";
import { SeleneTitanLogo } from "@/components/brand/SeleneTitanLogo";

interface WorkspaceSidebarProps {
  documents: DocumentItem[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  onCreateDoc: (folder?: string) => void;
  onImportDoc: (title: string, content: string, folder?: string) => void;
  onDeleteDoc: (id: string) => void;
  onRenameDoc?: (id: string, newTitle: string) => void;
  onRestoreSamples?: () => void;
  onOpenRevisions: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function WorkspaceSidebar({
  documents,
  activeDocId,
  onSelectDoc,
  onCreateDoc,
  onImportDoc,
  onDeleteDoc,
  onRenameDoc,
  onRestoreSamples,
  onOpenRevisions,
  isCollapsed,
  onToggleCollapse,
}: WorkspaceSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetImportFolderRef = useRef<string>("documents");

  // Track expanded folder state (default: all expanded)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    samples: true,
    documents: true,
  });

  // Track new folder creation input
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Track inline document renaming
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Group documents by folder
  const { folderMap, folderNames } = useMemo(() => {
    const map = new Map<string, DocumentItem[]>();

    // Guarantee samples and documents folders always exist
    map.set("samples", []);
    map.set("documents", []);

    for (const doc of documents) {
      const folder = getDocumentFolder(doc);
      if (!map.has(folder)) {
        map.set(folder, []);
      }
      map.get(folder)!.push(doc);
    }

    // Sort order: samples first, then documents, then any custom user folders
    const names = Array.from(map.keys()).sort((a, b) => {
      if (a === "samples") return -1;
      if (b === "samples") return 1;
      if (a === "documents") return -1;
      if (b === "documents") return 1;
      return a.localeCompare(b);
    });

    return { folderMap: map, folderNames: names };
  }, [documents]);

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folder]: prev[folder] === undefined ? false : !prev[folder],
    }));
  };

  const handleToggleAllFolders = () => {
    const allExpanded = folderNames.every((f) => expandedFolders[f] !== false);
    const next: Record<string, boolean> = {};
    for (const f of folderNames) {
      next[f] = !allExpanded;
    }
    setExpandedFolders(next);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const title = file.name.replace(/\.[^/.]+$/, "");
      onImportDoc(title, content, targetImportFolderRef.current);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleTriggerImport = (folder: string = "documents") => {
    targetImportFolderRef.current = folder;
    fileInputRef.current?.click();
  };

  const handleConfirmNewFolder = () => {
    const trimmed = newFolderName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    if (trimmed) {
      setExpandedFolders((prev) => ({ ...prev, [trimmed]: true }));
      onCreateDoc(trimmed);
      setNewFolderName("");
      setIsCreatingFolder(false);
    }
  };

  const handleStartRename = (doc: DocumentItem) => {
    setRenamingDocId(doc.id);
    setRenameValue(doc.title);
  };

  const handleSaveRename = (id: string) => {
    if (renameValue.trim() && onRenameDoc) {
      onRenameDoc(id, renameValue.trim());
    }
    setRenamingDocId(null);
  };

  // Filter documents by search
  const isSearching = searchQuery.trim().length > 0;
  const filteredDocCount = useMemo(() => {
    if (!isSearching) return documents.length;
    return documents.filter((d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).length;
  }, [documents, searchQuery, isSearching]);

  // Collapsed Sidebar View
  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-slate-800 bg-slate-900/80 flex flex-col items-center py-3 gap-3 shrink-0">
        <SeleneTitanLogo size="xs" glow={true} className="mb-0.5" />
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Expand Workspace Explorer"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onCreateDoc("documents")}
          className="p-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-all active:scale-95 cursor-pointer"
          title="Create New Document in Workspace"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleTriggerImport("documents")}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Import Markdown File"
        >
          <Upload className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenRevisions}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Version History"
        >
          <History className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <aside className="w-72 border-r border-slate-800/90 bg-slate-900/90 flex flex-col shrink-0 transition-all select-none">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Explorer Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <SeleneTitanLogo size="xs" glow={false} />
          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <span>Explorer</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCreateDoc("documents")}
            className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="New File (in documents/)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleTriggerImport("documents")}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Import Markdown (.md)"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleToggleAllFolders}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle Expand All Folders"
          >
            <Folder className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-2 border-b border-slate-800/80 bg-slate-950/30">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents & samples..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-slate-400 hover:text-white"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        {isSearching && (
          <div className="px-1 pt-1 text-[10px] text-slate-400 flex justify-between items-center">
            <span>Found {filteredDocCount} matching file{filteredDocCount === 1 ? "" : "s"}</span>
            <span className="text-sky-400 font-mono">Filtered</span>
          </div>
        )}
      </div>

      {/* Inline New Folder Input */}
      {isCreatingFolder && (
        <div className="px-3 py-2 border-b border-slate-800 bg-amber-500/10 flex items-center gap-1.5">
          <FolderPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmNewFolder();
              if (e.key === "Escape") setIsCreatingFolder(false);
            }}
            placeholder="folder-name..."
            autoFocus
            className="flex-1 bg-slate-900 border border-amber-500/40 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
          />
          <button
            onClick={handleConfirmNewFolder}
            className="p-1 text-emerald-400 hover:text-emerald-300"
            title="Create Folder"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsCreatingFolder(false)}
            className="p-1 text-slate-400 hover:text-slate-200"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hierarchical Folder & Document Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {folderNames.map((folderName) => {
          const docsInFolder = folderMap.get(folderName) || [];
          const filteredDocs = isSearching
            ? docsInFolder.filter((doc) =>
                doc.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : docsInFolder;

          // If searching and this folder has no matches, hide it
          if (isSearching && filteredDocs.length === 0) {
            return null;
          }

          const isExpanded = isSearching || expandedFolders[folderName] !== false;
          const isSamplesFolder = folderName === "samples";

          return (
            <div key={folderName} className="space-y-0.5">
              {/* Folder Header */}
              <div
                onClick={() => toggleFolder(folderName)}
                className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0 flex items-center gap-1.5 pr-1">
                  <span className="text-slate-500 group-hover:text-slate-300 transition-colors shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <span className="text-amber-400/90 group-hover:text-amber-300 shrink-0">
                    {isExpanded ? (
                      <FolderOpen className="w-3.5 h-3.5" />
                    ) : (
                      <Folder className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate flex-1 min-w-0">
                    {folderName}/
                  </span>
                  {isSamplesFolder && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium shrink-0">
                      Showcase
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {filteredDocs.length}
                  </span>
                  {/* Quick New File in this folder */}
                  {!isSamplesFolder && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateDoc(folderName);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-opacity"
                      title={`Create file in ${folderName}/`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                  {isSamplesFolder && onRestoreSamples && docsInFolder.length < 5 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestoreSamples();
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-sky-400 hover:text-sky-300 hover:bg-sky-500/20 transition-opacity"
                      title="Restore Showcase Samples"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Files in this Folder */}
              {isExpanded && (
                <div className="pl-4 space-y-0.5 border-l border-slate-800/80 ml-3.5 mt-0.5">
                  {filteredDocs.length === 0 ? (
                    <div className="py-2 px-2 text-[11px] text-slate-500 italic">
                      Empty folder. Click + to add a file.
                    </div>
                  ) : (
                    filteredDocs.map((doc) => {
                      const isActive = doc.id === activeDocId;
                      const isRenaming = renamingDocId === doc.id;

                      return (
                        <div
                          key={doc.id}
                          className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                            isActive
                              ? "bg-sky-500/20 border border-sky-400/40 text-sky-100 font-medium shadow-sm shadow-sky-500/10"
                              : "text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent"
                          }`}
                          onClick={() => {
                            if (!isRenaming) {
                              onSelectDoc(doc.id);
                            }
                          }}
                        >
                          {/* File Icon & Title (Full width with flex-1 to guarantee it never collapses) */}
                          <div className="flex-1 min-w-0 flex items-center gap-2 pr-1">
                            <span className="text-xs shrink-0 select-none">
                              {doc.icon ? doc.icon : <FileCode2 className="w-3.5 h-3.5 text-sky-400" />}
                            </span>

                            {isRenaming ? (
                              <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveRename(doc.id);
                                  if (e.key === "Escape") setRenamingDocId(null);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                                className="flex-1 min-w-0 bg-slate-950 border border-sky-400 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                              />
                            ) : (
                              <span
                                className={`text-xs font-medium truncate flex-1 min-w-0 block select-none ${
                                  isActive ? "text-sky-200 font-semibold" : "text-slate-200 group-hover:text-white"
                                }`}
                                title={doc.title}
                              >
                                {doc.title}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons on Hover */}
                          <div className="flex items-center gap-0.5 shrink-0 ml-1">
                            {isRenaming ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveRename(doc.id);
                                }}
                                className="p-1 rounded text-emerald-400 hover:bg-emerald-500/20"
                                title="Save name"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            ) : (
                              <>
                                {onRenameDoc && !isSamplesFolder && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartRename(doc);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-opacity"
                                    title="Rename File"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                )}
                                {documents.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteDoc(doc.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 text-slate-500 transition-opacity"
                                    title="Delete File"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Explorer Footer Bar */}
      <div className="px-3 py-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between bg-slate-950/60">
        <button
          onClick={onOpenRevisions}
          className="flex items-center gap-1.5 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
          title="Open Revisions Drawer"
        >
          <History className="w-3.5 h-3.5 text-sky-400" />
          <span>History</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SQLite</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{documents.length} files</span>
        </div>
      </div>
    </aside>
  );
}
