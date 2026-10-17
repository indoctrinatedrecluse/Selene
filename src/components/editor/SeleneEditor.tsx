"use client";

import React, { useState, useCallback } from "react";
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
  loadDocuments,
  saveDocuments,
  DocumentItem,
  STARTER_TEMPLATES,
} from "@/lib/workspace-store";
import {
  FileText,
  Split,
  Eye,
  Code2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export type EditorViewMode = "wysiwyg" | "split" | "markdown";

export function SeleneEditor() {
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

  const activeDoc =
    documents.find((d) => d.id === activeDocId) || documents[0] || STARTER_TEMPLATES[0];

  const [docTitle, setDocTitle] = useState(activeDoc.title);
  const [markdownContent, setMarkdownContent] = useState(activeDoc.content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Replaced by CustomCodeBlock
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
        // Auto-save to documents state and localStorage
        setDocuments((prev) => {
          const updated = prev.map((d) =>
            d.id === activeDocId
              ? { ...d, content: md, updatedAt: Date.now() }
              : d
          );
          saveDocuments(updated);
          return updated;
        });
      }
    },
    immediatelyRender: false,
  });

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
  };

  // Handle document creation
  const handleCreateDoc = () => {
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
  };

  // Handle document deletion
  const handleDeleteDoc = (id: string) => {
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
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-md">
            🌙
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Selene
              </span>
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

        {/* View Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("wysiwyg")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === "wysiwyg"
                  ? "bg-slate-800 text-sky-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === "split"
                  ? "bg-slate-800 text-sky-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode("markdown")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === "markdown"
                  ? "bg-slate-800 text-sky-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw MD</span>
            </button>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saved Locally</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Area with Collapsible Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Workspace Documents Sidebar */}
        <WorkspaceSidebar
          documents={documents}
          activeDocId={activeDocId}
          onSelectDoc={handleSelectDoc}
          onCreateDoc={handleCreateDoc}
          onDeleteDoc={handleDeleteDoc}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Editor Column */}
        <div
          className={`flex-1 flex flex-col overflow-y-auto ${
            viewMode === "markdown" ? "hidden" : ""
          }`}
        >
          {/* TipTap Toolbar */}
          <EditorToolbar
            editor={editor}
            isCopied={isCopied}
            onInsertLiveSandbox={handleInsertLiveSandbox}
            onInsertMermaid={handleInsertMermaid}
            onInsertMath={handleInsertMath}
            onExportMarkdown={handleExportMarkdown}
            onCopyMarkdown={handleCopyMarkdown}
          />

          {/* TipTap Document Canvas */}
          <div className="flex-1 max-w-4xl w-full mx-auto pb-24 pt-4">
            <EditorBubbleMenu editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

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

      {/* Bottom Status Footer */}
      <footer className="flex items-center justify-between px-6 py-2 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Polymorphic Engine: Sandpack + Mermaid + KaTeX</span>
          </div>
          <span>•</span>
          <span>Zero CSS Bleed Isolation</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{markdownContent.split(/\s+/).filter(Boolean).length} words</span>
          <span>•</span>
          <span>{markdownContent.length} characters</span>
        </div>
      </footer>
    </div>
  );
}
