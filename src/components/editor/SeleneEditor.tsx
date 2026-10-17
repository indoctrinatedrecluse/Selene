"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { CustomCodeBlock } from "./extensions/CustomCodeBlock";
import { Callout } from "./extensions/CalloutNode";
import { SlashCommand } from "./extensions/slash-command/SlashCommandExtension";
import { EditorToolbar } from "./EditorToolbar";
import { EditorBubbleMenu } from "./EditorBubbleMenu";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import {
  RevisionHistoryDrawer,
  RevisionItem,
} from "./RevisionHistoryDrawer";
import {
  loadDocuments,
  saveDocuments,
  DocumentItem,
  STARTER_TEMPLATES,
} from "@/lib/workspace-store";
import { createCollabSession, CollabSession, CollabUser } from "@/lib/collaboration";
import { ProjectServerRenderer } from "@/components/render-engine/ProjectServerRenderer";
import {
  FileText,
  Split,
  Eye,
  Code2,
  CheckCircle2,
  Sparkles,
  Users,
  Maximize2,
  Minimize2,
  History,
  Globe,
} from "lucide-react";
import { SeleneTitanLogo } from "@/components/brand/SeleneTitanLogo";
import {
  SeleneLunarBackground,
  LunarBackgroundMode,
} from "@/components/brand/SeleneLunarBackground";
import { SeleneLoreModal } from "@/components/brand/SeleneLoreModal";

export type EditorViewMode = "wysiwyg" | "split" | "project" | "markdown";

export function SeleneEditor() {
  const [lunarMode, setLunarMode] = useState<LunarBackgroundMode>("titan-aura");
  const [isLoreModalOpen, setIsLoreModalOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (typeof window !== "undefined") {
      return loadDocuments();
    }
    return STARTER_TEMPLATES;
  });
  const [activeDocId, setActiveDocId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const loaded = loadDocuments();
      return loaded[0]?.id || STARTER_TEMPLATES[0].id;
    }
    return STARTER_TEMPLATES[0].id;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<EditorViewMode>("wysiwyg");
  const [isCopied, setIsCopied] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [isSavingDb, setIsSavingDb] = useState(false);

  // Collaboration State
  const [isCollabActive, setIsCollabActive] = useState(false);
  const [collabUser, setCollabUser] = useState<CollabUser | null>(null);
  const [peerCount, setPeerCount] = useState(1);
  const collabSessionRef = useRef<CollabSession | null>(null);

  const activeDoc =
    documents.find((d) => d.id === activeDocId) || documents[0] || STARTER_TEMPLATES[0];

  const [docTitle, setDocTitle] = useState(activeDoc.title);
  const [markdownContent, setMarkdownContent] = useState(activeDoc.content);

  // Sync from DB on mount
  useEffect(() => {
    async function syncFromDb() {
      try {
        const res = await fetch("/api/documents");
        if (res.ok) {
          const dbDocs = await res.json();
          if (Array.isArray(dbDocs) && dbDocs.length > 0) {
            const mapped: DocumentItem[] = dbDocs.map(
              (d: {
                id: string;
                title: string;
                contentMarkdown: string;
                icon?: string | null;
                createdAt: number;
                updatedAt: number;
              }) => ({
                id: d.id,
                title: d.title,
                content: d.contentMarkdown,
                icon: d.icon || "📄",
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
              })
            );
            setDocuments(mapped);
            saveDocuments(mapped);
          }
        }
      } catch (err) {
        console.warn("Using local storage documents (DB sync offline)", err);
      }
    }
    syncFromDb();
  }, []);

  // Fetch revisions when active document changes
  const loadRevisions = useCallback(async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.revisions) {
          setRevisions(data.revisions);
        }
      }
    } catch {
      // Revisions fallback
    }
  }, []);

  // TipTap Editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CustomCodeBlock,
      Callout,
      SlashCommand,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands or start writing technical documentation...",
      }),
    ],
    content: activeDoc.content,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[500px] px-8 py-6 prose prose-invert max-w-none text-slate-200",
      },
    },
    onUpdate: ({ editor }) => {
      const md = (editor.storage as { markdown?: { getMarkdown: () => string } }).markdown?.getMarkdown();
      if (md) {
        setMarkdownContent(md);
        // Auto-save to local state
        setDocuments((prev) => {
          const updated = prev.map((d) =>
            d.id === activeDocId
              ? { ...d, content: md, updatedAt: Date.now() }
              : d
          );
          saveDocuments(updated);
          return updated;
        });

        // Trigger debounced cloud save
        debounceDbSave(activeDocId, docTitle, md);
      }
    },
    immediatelyRender: false,
  });

  // Debounced DB persistence
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceDbSave = useCallback((id: string, title: string, content: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSavingDb(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/documents/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, contentMarkdown: content }),
        });
      } catch {
        // Fallback to local storage
      } finally {
        setIsSavingDb(false);
      }
    }, 800);
  }, []);

  // Handle document selection
  const handleSelectDoc = (id: string) => {
    const target = documents.find((d) => d.id === id);
    if (!target) return;
    setActiveDocId(id);
    setDocTitle(target.title);
    setMarkdownContent(target.content);
    if (editor) {
      editor.commands.setContent(target.content);
    }
    loadRevisions(id);
  };

  // Handle document creation
  const handleCreateDoc = async () => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: "Untitled Document",
      icon: "📄",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: `# Untitled Technical Canvas\n\nType \`/\` to insert live sandboxes, diagrams, or math formulas.\n`,
    };

    const nextDocs = [newDoc, ...documents];
    setDocuments(nextDocs);
    saveDocuments(nextDocs);
    setActiveDocId(newDoc.id);
    setDocTitle(newDoc.title);
    setMarkdownContent(newDoc.content);
    if (editor) {
      editor.commands.setContent(newDoc.content);
    }

    try {
      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc),
      });
    } catch {
      // Local storage fallback
    }
  };

  // Handle file import
  const handleImportDoc = async (title: string, content: string) => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title,
      icon: "📥",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content,
    };

    const nextDocs = [newDoc, ...documents];
    setDocuments(nextDocs);
    saveDocuments(nextDocs);
    setActiveDocId(newDoc.id);
    setDocTitle(title);
    setMarkdownContent(content);
    if (editor) {
      editor.commands.setContent(content);
    }

    try {
      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc),
      });
    } catch {
      // Local fallback
    }
  };

  // Handle document deletion
  const handleDeleteDoc = async (id: string) => {
    if (documents.length <= 1) return;
    const nextDocs = documents.filter((d) => d.id !== id);
    setDocuments(nextDocs);
    saveDocuments(nextDocs);
    if (activeDocId === id) {
      const nextActive = nextDocs[0];
      setActiveDocId(nextActive.id);
      setDocTitle(nextActive.title);
      setMarkdownContent(nextActive.content);
      if (editor) {
        editor.commands.setContent(nextActive.content);
      }
    }

    try {
      await fetch(`/api/documents/${id}`, { method: "DELETE" });
    } catch {
      // Local fallback
    }
  };

  // Handle title rename
  const handleTitleChange = (newTitle: string) => {
    setDocTitle(newTitle);
    setDocuments((prev) => {
      const updated = prev.map((d) =>
        d.id === activeDocId ? { ...d, title: newTitle } : d
      );
      saveDocuments(updated);
      return updated;
    });
    debounceDbSave(activeDocId, newTitle, markdownContent);
  };

  // Handle version restore
  const handleRestoreRevision = (rev: RevisionItem) => {
    setMarkdownContent(rev.contentMarkdown);
    if (editor) {
      editor.commands.setContent(rev.contentMarkdown);
    }
    setShowRevisions(false);
  };

  // Toggle Live Collaboration (Webrtc CRDT)
  const toggleCollaboration = () => {
    if (isCollabActive) {
      collabSessionRef.current?.provider.destroy();
      collabSessionRef.current = null;
      setIsCollabActive(false);
      setCollabUser(null);
    } else {
      const session = createCollabSession(activeDocId);
      collabSessionRef.current = session;
      setCollabUser(session.currentUser);
      setIsCollabActive(true);

      session.provider.awareness.on("change", () => {
        const states = Array.from(session.provider.awareness.getStates().values());
        setPeerCount(states.length);
      });
    }
  };

  const handleInsertLiveSandbox = useCallback(() => {
    if (!editor) return;
    const sampleComponent = `\`\`\`tsx
export function MyWidget() {
  return (
    <div className="p-4 bg-sky-950/60 rounded-xl border border-sky-500/30 text-sky-200">
      <h4 className="font-bold text-white">Live Component</h4>
      <p className="text-sm">Tailwind classes render isolated here.</p>
    </div>
  );
}
\`\`\``;
    editor.chain().focus().insertContent(sampleComponent).run();
  }, [editor]);

  const handleInsertMermaid = useCallback(() => {
    if (!editor) return;
    const sampleDiagram = `\`\`\`mermaid
flowchart LR
    A[Markdown Input] --> B(TipTap Engine)
    B --> C{Polymorphic Pipeline}
    C -->|Web Code| D[Sandpack Tailwind]
    C -->|Diagram| E[Mermaid SVG]
    C -->|Formulas| F[KaTeX Engine]
\`\`\``;
    editor.chain().focus().insertContent(sampleDiagram).run();
  }, [editor]);

  const handleInsertMath = useCallback(() => {
    if (!editor) return;
    const sampleMath = `\`\`\`math
f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi
\`\`\``;
    editor.chain().focus().insertContent(sampleMath).run();
  }, [editor]);

  const handleExportMarkdown = useCallback(() => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }, [markdownContent, docTitle]);

  const handleCopyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(markdownContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [markdownContent]);

  return (
    <div className="relative flex flex-col h-screen bg-[#070A14] text-slate-100 overflow-hidden">
      {/* Selene Ambient Lunar Background */}
      <SeleneLunarBackground mode={lunarMode} />

      {/* Top Navigation Bar */}
      {!isZenMode && (
        <header className="relative z-10 flex items-center justify-between px-4 py-2 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLoreModalOpen(true)}
              className="flex items-center justify-center p-0.5 rounded-lg hover:bg-slate-800/80 transition-all cursor-pointer group"
              title="Selene the Moon Titan — Mythology, Heritage & Canvas Ambiance"
            >
              <SeleneTitanLogo size="md" glow={true} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
                  Selene
                </span>
                <button
                  onClick={() => setIsLoreModalOpen(true)}
                  className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono transition-all cursor-pointer"
                  title="View Moon Titan Lore & Canvas Themes"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>Titan Lore</span>
                </button>
                <span className="text-slate-600">/</span>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="bg-transparent font-medium text-slate-200 text-sm focus:outline-none hover:bg-slate-800/60 focus:bg-slate-800 px-2 py-0.5 rounded transition-colors"
                  placeholder="Document Title"
                />
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Live Multiplayer Collab Toggle */}
            <button
              onClick={toggleCollaboration}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isCollabActive
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
              }`}
              title="Toggle WebRTC Real-Time Collaboration"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isCollabActive ? `Live Collab (${peerCount})` : "Share Collab"}</span>
              {isCollabActive && collabUser && (
                <span className="text-xs">{collabUser.avatar}</span>
              )}
            </button>

            {/* Version History Toggle */}
            <button
              onClick={() => {
                loadRevisions(activeDocId);
                setShowRevisions(true);
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
              title="Version History"
            >
              <History className="w-3.5 h-3.5" />
            </button>

            {/* Lunar Ambiance & Lore Toggle */}
            <button
              onClick={() => setIsLoreModalOpen(true)}
              className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-sky-400 hover:text-sky-300 border border-indigo-500/20 transition-colors cursor-pointer"
              title="Lunar Titan Ambiance & Lore"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            {/* Zen Mode Toggle */}
            <button
              onClick={() => setIsZenMode(true)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
              title="Zen Focus Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode("wysiwyg")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "wysiwyg"
                    ? "bg-slate-800 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Canvas</span>
              </button>
              <button
                onClick={() => setViewMode("project")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "project"
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Live Project Dev Server Preview with HMR"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Project</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "split"
                    ? "bg-slate-800 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Split MD</span>
              </button>
              <button
                onClick={() => setViewMode("markdown")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "markdown"
                    ? "bg-slate-800 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw MD</span>
              </button>
            </div>

            {/* Saved Status Indicator */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>{isSavingDb ? "Syncing..." : "Synced"}</span>
            </div>
          </div>
        </header>
      )}

      {/* Zen Mode Exit Button */}
      {isZenMode && (
        <button
          onClick={() => setIsZenMode(false)}
          className="fixed top-4 right-4 z-50 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white shadow-2xl backdrop-blur-md text-xs font-medium"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Zen</span>
        </button>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Workspace Documents Sidebar */}
        {!isZenMode && (
          <WorkspaceSidebar
            documents={documents}
            activeDocId={activeDocId}
            onSelectDoc={handleSelectDoc}
            onCreateDoc={handleCreateDoc}
            onImportDoc={handleImportDoc}
            onDeleteDoc={handleDeleteDoc}
            onOpenRevisions={() => {
              loadRevisions(activeDocId);
              setShowRevisions(true);
            }}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        {/* Editor Column */}
        <div
          className={`flex-1 flex flex-col overflow-y-auto ${
            viewMode === "markdown" ? "hidden" : ""
          }`}
        >
          {/* TipTap Toolbar */}
          {!isZenMode && (
            <EditorToolbar
              editor={editor}
              isCopied={isCopied}
              onInsertLiveSandbox={handleInsertLiveSandbox}
              onInsertMermaid={handleInsertMermaid}
              onInsertMath={handleInsertMath}
              onExportMarkdown={handleExportMarkdown}
              onCopyMarkdown={handleCopyMarkdown}
            />
          )}

          {/* TipTap Document Canvas */}
          <div className="flex-1 max-w-4xl w-full mx-auto pb-24 pt-4">
            <EditorBubbleMenu editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Right Pane: Live Project Render */}
        {viewMode === "project" && (
          <div className="border-l border-slate-800 bg-slate-900/60 flex flex-col w-1/2 overflow-hidden">
            <ProjectServerRenderer
              currentFilePath={activeDoc.title}
              defaultRoute="/"
              className="border-none !rounded-none h-full"
            />
          </div>
        )}

        {/* Split Raw Markdown Pane */}
        {(viewMode === "split" || viewMode === "markdown") && (
          <div
            className={`border-l border-slate-800 bg-slate-900/60 flex flex-col ${
              viewMode === "split" ? "w-1/2" : "w-full"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Raw Markdown (GFM Stream)</span>
              </div>
              <span className="text-[11px] text-slate-500">Live Bi-directional Sync</span>
            </div>
            <textarea
              value={markdownContent}
              onChange={(e) => {
                const val = e.target.value;
                setMarkdownContent(val);
                if (editor) {
                  editor.commands.setContent(val);
                }
              }}
              className="flex-1 p-6 bg-transparent font-mono text-xs text-slate-300 resize-none focus:outline-none leading-relaxed overflow-y-auto selection:bg-sky-500/30"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Revision History Drawer */}
      <RevisionHistoryDrawer
        isOpen={showRevisions}
        onClose={() => setShowRevisions(false)}
        revisions={revisions}
        onRestore={handleRestoreRevision}
      />

      {/* Selene Mythological Lore & Ambiance Modal */}
      <SeleneLoreModal
        isOpen={isLoreModalOpen}
        onClose={() => setIsLoreModalOpen(false)}
        backgroundMode={lunarMode}
        onBackgroundModeChange={setLunarMode}
      />

      {/* Bottom Status Footer */}
      {!isZenMode && (
        <footer className="relative z-10 flex items-center justify-between px-6 py-2 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLoreModalOpen(true)}
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition-colors cursor-pointer"
              title="Learn about Selene, Titaness of the Moon"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Selene Titan of the Moon</span>
            </button>
            <span>•</span>
            <span>Polymorphic Engine Active</span>
            <span>•</span>
            <span>Zero CSS Bleed Isolation</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">Drizzle ORM + LibSQL</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{markdownContent.split(/\s+/).filter(Boolean).length} words</span>
            <span>•</span>
            <span>{markdownContent.length} characters</span>
          </div>
        </footer>
      )}
    </div>
  );
}
