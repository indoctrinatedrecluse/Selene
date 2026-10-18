"use client";

import React, { useState } from "react";
import {
  X,
  FileDown,
  Printer,
  Globe,
  Presentation,
  FileText,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { exportDocumentToPdf } from "@/lib/pdf-export";
import { exportStandaloneHtml } from "@/lib/html-export";
import { exportMarkdownToIpynb } from "@/lib/ipynb-bridge";
import { parseMarkdownToSlides } from "@/components/presentation/SlideDeckViewer";

interface PublishExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  markdownContent: string;
  onLaunchSlideDeck: () => void;
}

type PublishTab = "pdf" | "html" | "slides" | "markdown" | "ipynb";

export function PublishExportModal({
  isOpen,
  onClose,
  documentTitle,
  markdownContent,
  onLaunchSlideDeck,
}: PublishExportModalProps) {
  const [activeTab, setActiveTab] = useState<PublishTab>("pdf");

  // PDF options
  const [pdfTheme, setPdfTheme] = useState<"clean-print" | "lunar-dark">("clean-print");
  const [pdfPageSize, setPdfPageSize] = useState<"A4" | "Letter">("A4");
  const [pdfOrientation, setPdfOrientation] = useState<"portrait" | "landscape">("portrait");

  // HTML options
  const [htmlTheme, setHtmlTheme] = useState<"midnight" | "slate" | "white">("midnight");

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const slidesCount = parseMarkdownToSlides(markdownContent, documentTitle).length;

  const handleExportPdf = () => {
    exportDocumentToPdf({
      title: documentTitle,
      markdown: markdownContent,
      theme: pdfTheme,
      pageSize: pdfPageSize,
      orientation: pdfOrientation,
    });
  };

  const handleExportHtml = () => {
    exportStandaloneHtml({
      title: documentTitle,
      markdown: markdownContent,
      theme: htmlTheme,
    });
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${documentTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportIpynb = () => {
    const ipynbContent = exportMarkdownToIpynb(markdownContent, documentTitle);
    const blob = new Blob([ipynbContent], { type: "application/x-ipynb+json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${documentTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ipynb`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyIpynb = () => {
    const ipynbContent = exportMarkdownToIpynb(markdownContent, documentTitle);
    navigator.clipboard.writeText(ipynbContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-base shadow-md">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Publish & Export Suite
              </h2>
              <p className="text-xs text-sky-400 font-mono">
                {documentTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-6 gap-2 text-xs">
          <button
            onClick={() => setActiveTab("pdf")}
            className={`flex items-center gap-2 py-3 border-b-2 font-medium transition-all ${
              activeTab === "pdf"
                ? "border-sky-400 text-sky-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Publication PDF</span>
          </button>
          <button
            onClick={() => setActiveTab("html")}
            className={`flex items-center gap-2 py-3 border-b-2 font-medium transition-all ${
              activeTab === "html"
                ? "border-sky-400 text-sky-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Standalone HTML</span>
          </button>
          <button
            onClick={() => setActiveTab("slides")}
            className={`flex items-center gap-2 py-3 border-b-2 font-medium transition-all ${
              activeTab === "slides"
                ? "border-sky-400 text-sky-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>Slide Deck Mode</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/10 text-sky-400 font-mono">
              {slidesCount} Slides
            </span>
          </button>
          <button
            onClick={() => setActiveTab("markdown")}
            className={`flex items-center gap-2 py-3 border-b-2 font-medium transition-all ${
              activeTab === "markdown"
                ? "border-sky-400 text-sky-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Markdown Source</span>
          </button>
          <button
            onClick={() => setActiveTab("ipynb")}
            className={`flex items-center gap-2 py-3 border-b-2 font-medium transition-all ${
              activeTab === "ipynb"
                ? "border-amber-400 text-amber-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Jupyter (.ipynb)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* --- TAB 1: PDF PUBLICATION --- */}
          {activeTab === "pdf" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Printer className="w-4 h-4 text-sky-400" />
                  <span>High-Fidelity Vector PDF Export</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Renders KaTeX formulas, high-DPI Mermaid SVGs, and syntax-highlighted code with print-optimized page breaks (`break-inside-avoid`).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Print Theme */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Document Palette</label>
                  <select
                    value={pdfTheme}
                    onChange={(e) => setPdfTheme(e.target.value as "clean-print" | "lunar-dark")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="clean-print">Clean Print (White Paper)</option>
                    <option value="lunar-dark">Lunar Celestial (Dark Mode)</option>
                  </select>
                </div>

                {/* Page Format */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Paper Format</label>
                  <select
                    value={pdfPageSize}
                    onChange={(e) => setPdfPageSize(e.target.value as "A4" | "Letter")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="A4">A4 (Standard ISO)</option>
                    <option value="Letter">US Letter</option>
                  </select>
                </div>

                {/* Orientation */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Orientation</label>
                  <select
                    value={pdfOrientation}
                    onChange={(e) => setPdfOrientation(e.target.value as "portrait" | "landscape")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-all shadow-lg shadow-sky-500/20 active:scale-98 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Generate Publication PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* --- TAB 2: STANDALONE HTML --- */}
          {activeTab === "html" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Portable Single-File HTML Document</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Generates an offline-ready single HTML bundle with embedded Tailwind runtime, KaTeX math typesetting, and Mermaid.js diagram initialization. Can be emailed, shared, or published anywhere with zero server setup.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Visual Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "midnight", label: "Midnight Lunar", desc: "Deep dark cosmic" },
                    { id: "slate", label: "Slate Gray", desc: "Balanced dark" },
                    { id: "white", label: "Clean White", desc: "Light paper" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setHtmlTheme(t.id as "midnight" | "slate" | "white")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        htmlTheme === t.id
                          ? "bg-slate-950 border-emerald-400 text-white shadow-md ring-1 ring-emerald-400/50"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="font-semibold text-xs">{t.label}</div>
                      <div className="text-[10px] text-slate-500">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExportHtml}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-98 cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>Download Standalone HTML (.html)</span>
                </button>
              </div>
            </div>
          )}

          {/* --- TAB 3: SLIDE DECK MODE --- */}
          {activeTab === "slides" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Presentation className="w-4 h-4 text-violet-400" />
                  <span>Full-Screen Interactive Presentation Deck</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Instantly converts headings and dividers into interactive slides. Code blocks run live on the slides during talks and architectural reviews!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-300">⚡ Live Running Sandboxes</span>
                  <p className="text-slate-500">React, Vue, Svelte, Angular, and Flutter run live on screen.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-300">⏱️ Presenter HUD</span>
                  <p className="text-slate-500">Built-in presentation timer, slide thumbnail drawer, and keyboard navigation.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLaunchSlideDeck();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-98 cursor-pointer"
                >
                  <Presentation className="w-4 h-4" />
                  <span>Launch Interactive Slide Deck ({slidesCount} Slides)</span>
                </button>
              </div>
            </div>
          )}

          {/* --- TAB 4: MARKDOWN SOURCE --- */}
          {activeTab === "markdown" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Raw Markdown & Source Code</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Export the clean Markdown source code with all AST code fences intact.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all border border-slate-700 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-all shadow cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download .md File</span>
                </button>
              </div>
            </div>
          )}

          {/* --- TAB 5: JUPYTER NOTEBOOK (.ipynb) --- */}
          {activeTab === "ipynb" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Standard Jupyter Notebook (.ipynb v4)</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Converts your prose, formulas, and Python code blocks into standard Jupyter Notebook JSON format. Fully compatible with Google Colab, JupyterLab, VS Code, and Kaggle.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-400 text-[11px]">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-300">🐍 Python 3 Kernel</span>
                  <p className="text-slate-500">Auto-detects code cells and maps them to standard ipykernel execution blocks.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-300">📐 KaTeX & Math Preservation</span>
                  <p className="text-slate-500">Equations and Markdown formatting are preserved verbatim.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyIpynb}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all border border-slate-700 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied .ipynb JSON!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Notebook JSON</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleExportIpynb}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold transition-all shadow-md cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download .ipynb Notebook</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
