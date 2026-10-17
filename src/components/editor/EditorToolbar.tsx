"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  SquareCode,
  Sparkles,
  GitGraph,
  Sigma,
  AlertCircle,
  Minus,
  Undo,
  Redo,
  Copy,
  Check,
  FileDown,
  Presentation,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
  isCopied?: boolean;
  onInsertLiveSandbox: () => void;
  onInsertMermaid: () => void;
  onInsertMath: () => void;
  onExportMarkdown: () => void;
  onCopyMarkdown: () => void;
  onOpenPublishModal?: () => void;
  onLaunchSlides?: () => void;
}

export function EditorToolbar({
  editor,
  isCopied = false,
  onInsertLiveSandbox,
  onInsertMermaid,
  onInsertMath,
  onExportMarkdown,
  onCopyMarkdown,
  onOpenPublishModal,
  onLaunchSlides,
}: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-1.5 p-2 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
      {/* Formatting Tools */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Undo / Redo */}
        <div className="flex items-center border-r border-slate-800 pr-1.5 mr-1 gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center border-r border-slate-800 pr-1.5 mr-1 gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-sky-500/20 text-sky-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-sky-500/20 text-sky-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-sky-500/20 text-sky-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Inline Marks */}
        <div className="flex items-center border-r border-slate-800 pr-1.5 mr-1 gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("bold")
                ? "bg-sky-500/20 text-sky-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("italic")
                ? "bg-sky-500/20 text-sky-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("strike")
                ? "bg-sky-500/20 text-sky-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("code")
                ? "bg-sky-500/20 text-sky-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center border-r border-slate-800 pr-1.5 mr-1 gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("bulletList")
                ? "bg-sky-500/20 text-sky-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("orderedList")
                ? "bg-sky-500/20 text-sky-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("taskList")
                ? "bg-sky-500/20 text-sky-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="Task List"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
        </div>

        {/* Technical Blocks & Sandboxes */}
        <div className="flex items-center gap-1">
          {/* Live Web Sandbox */}
          <button
            type="button"
            onClick={onInsertLiveSandbox}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-300 hover:text-sky-200 hover:border-sky-400 text-xs font-medium transition-all"
            title="Insert Live React / Tailwind Sandbox"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Live Sandbox</span>
          </button>

          {/* Code Block */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("codeBlock")
                ? "bg-sky-500/20 text-sky-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="Code Block"
          >
            <SquareCode className="w-4 h-4" />
          </button>

          {/* Mermaid Diagram */}
          <button
            type="button"
            onClick={onInsertMermaid}
            className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
            title="Insert Mermaid Diagram"
          >
            <GitGraph className="w-4 h-4" />
          </button>

          {/* Math Formula */}
          <button
            type="button"
            onClick={onInsertMath}
            className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition-colors"
            title="Insert Math Equation"
          >
            <Sigma className="w-4 h-4" />
          </button>

          {/* Callout */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setCallout({ type: "note" }).run()}
            className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition-colors"
            title="Insert Callout Note"
          >
            <AlertCircle className="w-4 h-4" />
          </button>

          {/* Horizontal Rule */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="Horizontal Divider"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Export & Actions */}
      <div className="flex items-center gap-1.5">
        {onLaunchSlides && (
          <button
            type="button"
            onClick={onLaunchSlides}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-sky-300 text-xs font-medium transition-colors border border-slate-700/60"
            title="Launch Interactive Slide Deck"
          >
            <Presentation className="w-3.5 h-3.5 text-sky-400" />
            <span>Deck Mode</span>
          </button>
        )}

        <button
          type="button"
          onClick={onCopyMarkdown}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          title="Copy as Markdown"
        >
          {isCopied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>{isCopied ? "Copied!" : "Copy MD"}</span>
        </button>

        <button
          type="button"
          onClick={onOpenPublishModal || onExportMarkdown}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors shadow-sm"
          title="Publish & Export Document (PDF, HTML, Deck)"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Publish / Export</span>
        </button>
      </div>
    </div>
  );
}
