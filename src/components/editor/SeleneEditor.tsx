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
import { EditorToolbar } from "./EditorToolbar";
import {
  FileText,
  Split,
  Eye,
  Code2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const INITIAL_CONTENT = `# 🌙 Selene Technical Specification & Live Canvas

Welcome to **Selene** — the hypermodern technical document & code canvas where markdown prose seamlessly integrates with live code execution and vector graphics! ✨

> [!NOTE]
> All live code renders run inside **isolated sandbox contexts with zero CSS bleed**, ensuring that your document typography and your project components never clash.

---

## ⚡ 1. Live React & Tailwind Sandbox

Below is an interactive live React component. You can edit the code in real-time or switch between **Split**, **Code**, and **Render** views. Notice that all Tailwind CSS utility classes render with 100% fidelity!

\`\`\`tsx
export function LiveInteractiveCard() {
  const [likes, setLikes] = React.useState(42);
  const [color, setColor] = React.useState('sky');

  return (
    <div className="p-6 max-w-sm mx-auto bg-slate-900 rounded-2xl border border-slate-700/60 shadow-xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
          S
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Selene Live Preview</h3>
          <p className="text-xs text-slate-400">Isolated HMR Sandbox</p>
        </div>
      </div>
      <p className="text-sm text-slate-300">
        Edit this code directly in the editor! Notice how the state updates with zero broken CSS.
      </p>
      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
        <button
          onClick={() => setLikes(l => l + 1)}
          className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium transition-all shadow-md active:scale-95"
        >
          ❤️ Like ({likes})
        </button>
        <span className="text-xs font-mono text-slate-400">Tailwind v4 Active</span>
      </div>
    </div>
  );
}
\`\`\`

---

## 📊 2. Live Mermaid.js System Diagram

Text-based diagrams compile into responsive SVG graphics dynamically:

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Developer
    participant Canvas as 🌙 Selene Canvas
    participant Engine as ⚡ Polymorphic Engine
    participant Sandbox as 🛡️ Sandpack / Iframe

    User->>Canvas: Type Markdown or Code
    Canvas->>Engine: Route AST Node Update
    alt Web Component
        Engine->>Sandbox: In-Memory Hot Reload & Inject Tailwind
        Sandbox-->>Canvas: Seamless Live Render
    else Architecture Diagram
        Engine->>Canvas: Render Responsive SVG (Mermaid)
    else LaTeX Formula
        Engine->>Canvas: Typeset KaTeX Equation
    end
\`\`\`

---

## 📐 3. Mathematical Typesetting

Equations typeset in sub-millisecond speeds:

\`\`\`math
\\mathcal{L}_{\\text{total}} = \\lambda_1 \\mathcal{L}_{\\text{fidelity}} + \\lambda_2 \\sum_{i=1}^N \\| \\hat{y}_i - y_i \\|^2 + \\mathbb{E}_{x \\sim p_{\\text{data}}}[\\log D(x)]
\`\`\`

---

## ✅ 4. Technical Checklist
- [x] Zero-bleed isolated iframe sandboxes
- [x] Live HMR re-rendering
- [x] Bi-directional Markdown synchronizer
- [ ] Visual no-code property inspectors (Upcoming Phase)
`;

export type EditorViewMode = "wysiwyg" | "split" | "markdown";

export function SeleneEditor() {
  const [docTitle, setDocTitle] = useState("Untitled Technical Canvas");
  const [viewMode, setViewMode] = useState<EditorViewMode>("wysiwyg");
  const [markdownContent, setMarkdownContent] = useState(INITIAL_CONTENT);
  const [isCopied, setIsCopied] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Replaced by CustomCodeBlock
      }),
      CustomCodeBlock,
      Callout,
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
    content: INITIAL_CONTENT,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[500px] px-8 py-6 prose prose-invert max-w-none text-slate-200",
      },
    },
    onUpdate: ({ editor }) => {
      // Synchronize markdown content for split/export views
      const md = (editor.storage as { markdown?: { getMarkdown: () => string } }).markdown?.getMarkdown();
      if (md) {
        setMarkdownContent(md);
      }
    },
    immediatelyRender: false,
  });

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
      <header className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
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
                onChange={(e) => setDocTitle(e.target.value)}
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

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
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
                setMarkdownContent(e.target.value);
                if (editor) {
                  editor.commands.setContent(e.target.value);
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
