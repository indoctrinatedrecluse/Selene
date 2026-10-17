"use client";

import React, { useState, useRef } from "react";
import { DocumentItem } from "@/lib/workspace-store";
import {
  Plus,
  Trash2,
  Search,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Upload,
  History,
} from "lucide-react";
import { SeleneTitanLogo } from "@/components/brand/SeleneTitanLogo";

interface WorkspaceSidebarProps {
  documents: DocumentItem[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  onCreateDoc: () => void;
  onImportDoc: (title: string, content: string) => void;
  onDeleteDoc: (id: string) => void;
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
  onOpenRevisions,
  isCollapsed,
  onToggleCollapse,
}: WorkspaceSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const title = file.name.replace(/\.[^/.]+$/, "");
      onImportDoc(title, content);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-slate-800 bg-slate-900/60 flex flex-col items-center py-3 gap-3 shrink-0">
        <SeleneTitanLogo size="xs" glow={true} className="mb-0.5" />
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Expand Workspace Sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onCreateDoc}
          className="p-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-all active:scale-95"
          title="Create New Document"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Import Markdown File"
        >
          <Upload className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenRevisions}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
    <aside className="w-64 border-r border-slate-800 bg-slate-900/80 flex flex-col shrink-0 transition-all">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <SeleneTitanLogo size="xs" glow={false} />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Workspace
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Import Markdown (.md)"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCreateDoc}
            className="flex items-center gap-1 px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-medium shadow-sm transition-all"
            title="Create New Document"
          >
            <Plus className="w-3 h-3" />
            <span>New</span>
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2.5 border-b border-slate-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Documents ({filteredDocs.length})</span>
          <Sparkles className="w-3 h-3 text-sky-400" />
        </div>

        {filteredDocs.map((doc) => {
          const isActive = doc.id === activeDocId;
          return (
            <div
              key={doc.id}
              className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                isActive
                  ? "bg-sky-500/15 border border-sky-500/30 text-sky-200 font-medium"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent"
              }`}
              onClick={() => onSelectDoc(doc.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs shrink-0">{doc.icon || "📄"}</span>
                <span className="text-xs truncate">{doc.title}</span>
              </div>

              {documents.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDoc(doc.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 text-slate-500 transition-opacity"
                  title="Delete Document"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-2.5 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between bg-slate-950/40">
        <button
          onClick={onOpenRevisions}
          className="flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors"
          title="Open Revisions Drawer"
        >
          <History className="w-3.5 h-3.5" />
          <span>Version History</span>
        </button>
        <span className="font-mono text-emerald-400">● SQLite/DB</span>
      </div>
    </aside>
  );
}
