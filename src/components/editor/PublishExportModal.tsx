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
  Share2,
  Code2,
  BookOpen,
  Send,
  ExternalLink,
  Lock,
  Clock,
  Layers,
  Loader2,
} from "lucide-react";
import { exportDocumentToPdf } from "@/lib/pdf-export";
import { exportStandaloneHtml } from "@/lib/html-export";
import { exportMarkdownToIpynb } from "@/lib/ipynb-bridge";
import { parseMarkdownToSlides } from "@/components/presentation/SlideDeckViewer";
import { exportMarkdownToLatex, LatexTemplate } from "@/lib/latex-export";
import { exportMarkdownToSsg, SsgTarget } from "@/lib/ssg-export";
import { exportStandaloneSlideDeck } from "@/lib/slide-deck-export";
import { generateHtmlEmbedCode, generateReactEmbedCode } from "@/lib/embed-generator";
import { generateQrCodeSvg } from "@/lib/qr-code";

interface PublishExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  markdownContent: string;
  onLaunchSlideDeck: () => void;
}

type PublishTab =
  | "pdf"
  | "html"
  | "cloud-share"
  | "embed"
  | "latex"
  | "ssg"
  | "slides"
  | "ipynb"
  | "markdown";

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

  // Cloud Share options
  const [shareAuthor, setShareAuthor] = useState("Selene Author");
  const [sharePassword, setSharePassword] = useState("");
  const [shareExpiresHours, setShareExpiresHours] = useState<number>(0);
  const [isPublishingShare, setIsPublishingShare] = useState(false);
  const [shareResult, setShareResult] = useState<{
    id: string;
    url: string;
    expiresAt: number | null;
    isPasswordProtected: boolean;
  } | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);

  // Embed options
  const [embedWidth, setEmbedWidth] = useState("100%");
  const [embedHeight, setEmbedHeight] = useState("650px");
  const [embedTheme, setEmbedTheme] = useState<"dark" | "light">("dark");
  const [embedSnippetType, setEmbedSnippetType] = useState<"html" | "react">("html");

  // LaTeX options
  const [latexTemplate, setLatexTemplate] = useState<LatexTemplate>("article");
  const [latexAuthor, setLatexAuthor] = useState("Selene Researcher");
  const [latexTwoColumn, setLatexTwoColumn] = useState(false);

  // SSG options
  const [ssgTarget, setSsgTarget] = useState<SsgTarget>("astro");

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

  const handleCreateCloudShare = async () => {
    try {
      setShareError(null);
      setIsPublishingShare(true);
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: documentTitle,
          contentMarkdown: markdownContent,
          author: shareAuthor,
          password: sharePassword.trim() || undefined,
          expiresInHours: shareExpiresHours,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create share link");
      }

      const data = await res.json();
      setShareResult(data);
      const svg = generateQrCodeSvg(data.url, { size: 160, bgColor: "#020617", fgColor: "#38bdf8" });
      setQrSvg(svg);
    } catch (err) {
      console.error(err);
      setShareError(err instanceof Error ? err.message : "Failed to publish document to Selene Cloud.");
    } finally {
      setIsPublishingShare(false);
    }
  };

  const handleExportLatex = () => {
    const tex = exportMarkdownToLatex({
      title: documentTitle,
      markdown: markdownContent,
      template: latexTemplate,
      author: latexAuthor,
      twoColumn: latexTwoColumn,
    });
    const blob = new Blob([tex], { type: "text/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${documentTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.tex`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLatex = () => {
    const tex = exportMarkdownToLatex({
      title: documentTitle,
      markdown: markdownContent,
      template: latexTemplate,
      author: latexAuthor,
      twoColumn: latexTwoColumn,
    });
    navigator.clipboard.writeText(tex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSsg = () => {
    const { filename, content, mimeType } = exportMarkdownToSsg({
      title: documentTitle,
      markdown: markdownContent,
      target: ssgTarget,
    });
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySsg = () => {
    const { content } = exportMarkdownToSsg({
      title: documentTitle,
      markdown: markdownContent,
      target: ssgTarget,
    });
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportStandaloneDeck = () => {
    exportStandaloneSlideDeck({
      title: documentTitle,
      markdown: markdownContent,
    });
  };

  const activeShareUrl = shareResult
    ? shareResult.url
    : typeof window !== "undefined"
    ? `${window.location.origin}/share/preview`
    : "https://selene-h5zdysrkqa-uc.a.run.app/share/preview";

  const embedCode =
    embedSnippetType === "html"
      ? generateHtmlEmbedCode({
          shareUrl: activeShareUrl,
          width: embedWidth,
          height: embedHeight,
          theme: embedTheme,
        })
      : generateReactEmbedCode({
          shareUrl: activeShareUrl,
          width: embedWidth,
          height: embedHeight,
          theme: embedTheme,
        });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-base shadow-md">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {"Hermes' Wings"}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Publishing & Transmutation Sanctuary
                </span>
              </div>
              <p className="text-xs text-slate-400 font-serif italic mt-0.5">
                Transmuting &ldquo;{documentTitle}&rdquo; into immortal technical formats across the cosmos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Scrollable on small screens) */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-6 gap-2 text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab("pdf")}
            className={`flex items-center gap-1.5 py-3 border-b-2 font-medium transition-all ${
              activeTab === "pdf"
                ? "border-sky-400 text-sky-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>📜 Papyrus (PDF)</span>
          </button>

          <button
            onClick={() => setActiveTab("html")}
            className={`flex items-center gap-1.5 py-3 border-b-2 font-medium transition-all ${
              activeTab === "html"
                ? "border-sky-400 text-sky-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>🌐 Olympian HTML</span>
          </button>

          <button
            onClick={() => setActiveTab("cloud-share")}
            className={`flex items-center gap-1.5 py-3 border-b-2 font-medium transition-all ${
              activeTab === "cloud-share"
                ? "border-cyan-400 text-cyan-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>⚡ Caduceus Share</span>
          </button>

          <button
            onClick={() => setActiveTab("embed")}
            className={`flex items-center gap-1.5 py-3 border-b-2 font-medium transition-all ${
              activeTab === "embed"
                ? "border-indigo-400 text-indigo-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>🔮 Delphic Embed</span>
          </button>

          <button
            onClick={() => setActiveTab("latex")}
            className={`flex items-center gap-1.5 py-3 border-b-2 font-medium transition-all ${
              activeTab === "latex"
                ? "border-rose-400 text-rose-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            <span>📐 Pythagorean LaTeX</span>
          </button>

          <button
            onClick={() => setActiveTab("ssg")}
            className={`flex items-center gap-1.5 py-3 border-b-2 font-medium transition-all ${
              activeTab === "ssg"
                ? "border-emerald-400 text-emerald-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>🏛️ Agora SSG</span>
          </button>

          <button
            onClick={() => setActiveTab("slides")}
            className={`flex items-center gap-1.5 py-3 border-b-2 font-medium transition-all ${
              activeTab === "slides"
                ? "border-purple-400 text-purple-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>🎭 Amphitheater Slides ({slidesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("ipynb")}
            className={`flex items-center gap-1.5 py-3 border-b-2 font-medium transition-all ${
              activeTab === "ipynb"
                ? "border-amber-400 text-amber-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>🐍 Promethean Notebook</span>
          </button>

          <button
            onClick={() => setActiveTab("markdown")}
            className={`flex items-center gap-1.5 py-3 border-b-2 font-medium transition-all ${
              activeTab === "markdown"
                ? "border-sky-400 text-sky-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{"✒️ Calliope's Quill"}</span>
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
                  <span>High-Fidelity Vector PDF & Print Engine</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Renders KaTeX formulas, high-DPI Mermaid SVGs, and syntax-highlighted code with print-optimized page breaks (`break-inside-avoid`).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Page Dimensions</label>
                  <select
                    value={pdfPageSize}
                    onChange={(e) => setPdfPageSize(e.target.value as "A4" | "Letter")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="A4">ISO A4 (210 × 297 mm)</option>
                    <option value="Letter">US Letter (8.5 × 11 in)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Page Orientation</label>
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-all shadow-lg cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Generate Publication Print PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* --- TAB 2: STANDALONE HTML --- */}
          {activeTab === "html" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>Zero-Dependency Standalone HTML (&ldquo;Single-File Web App&rdquo;)</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Bundles the entire document, Tailwind styling, KaTeX fonts, Mermaid SVGs, and interactive sandboxes into a self-contained portable HTML file. Runs 100% offline in any browser with zero servers.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Viewer Palette</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setHtmlTheme("midnight")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      htmlTheme === "midnight"
                        ? "border-sky-500 bg-sky-500/10 text-white font-semibold"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    Midnight Celestial
                  </button>
                  <button
                    type="button"
                    onClick={() => setHtmlTheme("slate")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      htmlTheme === "slate"
                        ? "border-sky-500 bg-sky-500/10 text-white font-semibold"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    Slate Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setHtmlTheme("white")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      htmlTheme === "white"
                        ? "border-sky-500 bg-sky-500/10 text-white font-semibold"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    Clean Light
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExportHtml}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-lg cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Standalone HTML Web App</span>
                </button>
              </div>
            </div>
          )}

          {/* --- TAB 3: CLOUD SHARE & GIST --- */}
          {activeTab === "cloud-share" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Selene Cloud Share & Interactive Gists</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Publishes your live interactive technical canvas to a public or password-protected short URL (`/share/[id]`). Includes instant QR code generation for mobile reading!
                </p>
              </div>

              {!shareResult ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">Author Name</label>
                      <input
                        type="text"
                        value={shareAuthor}
                        onChange={(e) => setShareAuthor(e.target.value)}
                        placeholder="Author Name"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-cyan-400" />
                        <span>Optional Passphrase</span>
                      </label>
                      <input
                        type="password"
                        value={sharePassword}
                        onChange={(e) => setSharePassword(e.target.value)}
                        placeholder="None (Public)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>Expiration Timer</span>
                      </label>
                      <select
                        value={shareExpiresHours}
                        onChange={(e) => setShareExpiresHours(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value={0}>Never Expire</option>
                        <option value={1}>1 Hour</option>
                        <option value={24}>24 Hours</option>
                        <option value={168}>7 Days</option>
                      </select>
                    </div>
                  </div>

                  {shareError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                      <span>{shareError}</span>
                      <button
                        type="button"
                        onClick={() => setShareError(null)}
                        className="text-rose-400 hover:text-rose-200 text-xs ml-2 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleCreateCloudShare}
                    disabled={isPublishingShare}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    {isPublishingShare ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{isPublishingShare ? "Publishing to Cloud..." : "Generate Secret Cloud Share Link"}</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      ✓ LIVE ON SELENE CLOUD
                    </span>
                    <button
                      onClick={() => setShareResult(null)}
                      className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Publish New Link
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {qrSvg && (
                      <div
                        className="p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg shrink-0"
                        dangerouslySetInnerHTML={{ __html: qrSvg }}
                      />
                    )}
                    <div className="space-y-2 flex-1 w-full min-w-0">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 truncate">
                        {shareResult.url}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(shareResult.url);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? "Copied Link!" : "Copy Link"}</span>
                        </button>
                        <a
                          href={shareResult.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open</span>
                        </a>
                      </div>

                      {shareResult.isPasswordProtected && (
                        <p className="text-[10px] text-amber-400 font-mono">
                          🔒 Passphrase protection active
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- TAB 4: PUBLIC EMBED --- */}
          {activeTab === "embed" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span>Interactive Public Embed (iframe & React)</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Embed this interactive canvas into Notion, Docusaurus, documentation portals, or custom web apps with responsive dimensions and theme overrides.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Snippet Target</label>
                  <select
                    value={embedSnippetType}
                    onChange={(e) => setEmbedSnippetType(e.target.value as "html" | "react")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="html">Standard HTML (&lt;iframe&gt;)</option>
                    <option value="react">React Component (TSX)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Embed Width</label>
                  <input
                    type="text"
                    value={embedWidth}
                    onChange={(e) => setEmbedWidth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Embed Height</label>
                  <input
                    type="text"
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Theme Override</label>
                  <select
                    value={embedTheme}
                    onChange={(e) => setEmbedTheme(e.target.value as "dark" | "light")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="dark">Celestial Dark</option>
                    <option value="light">Paper Light</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 max-h-32 overflow-y-auto">
                  <pre>{embedCode}</pre>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(embedCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied Embed Code!" : "Copy Embed Snippet"}</span>
                </button>
              </div>
            </div>
          )}

          {/* --- TAB 5: ACADEMIC LATEX --- */}
          {activeTab === "latex" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <BookOpen className="w-4 h-4 text-rose-400" />
                  <span>Publication-Grade Academic LaTeX Manuscript (.tex)</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Translates mathematical formulations, figures, listings, and technical prose into ready-to-compile LaTeX sources conforming to standard academic publisher templates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Publisher Template</label>
                  <select
                    value={latexTemplate}
                    onChange={(e) => setLatexTemplate(e.target.value as LatexTemplate)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="article">Standard Scientific Article</option>
                    <option value="IEEEtran">IEEE Transactions / Conference</option>
                    <option value="acmart">ACM Computing Proceedings</option>
                    <option value="llncs">Springer LNCS</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Author Attribution</label>
                  <input
                    type="text"
                    value={latexAuthor}
                    onChange={(e) => setLatexAuthor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Page Column Layout</label>
                  <select
                    value={latexTwoColumn ? "2" : "1"}
                    onChange={(e) => setLatexTwoColumn(e.target.value === "2")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="1">Single Column</option>
                    <option value="2">Two Column Layout</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyLatex}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied .tex!" : "Copy LaTeX Source"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportLatex}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download .tex File</span>
                </button>
              </div>
            </div>
          )}

          {/* --- TAB 6: STATIC SITE GENERATOR (SSG) --- */}
          {activeTab === "ssg" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Static Site Generator (SSG) Export</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Exports clean markdown/MDX with framework-tailored frontmatter metadata, callouts, and components for popular documentation generators.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Target Framework</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setSsgTarget("astro")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      ssgTarget === "astro"
                        ? "border-emerald-500 bg-emerald-500/10 text-white font-semibold"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    Astro Starlight
                  </button>
                  <button
                    type="button"
                    onClick={() => setSsgTarget("docusaurus")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      ssgTarget === "docusaurus"
                        ? "border-emerald-500 bg-emerald-500/10 text-white font-semibold"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    Docusaurus 3
                  </button>
                  <button
                    type="button"
                    onClick={() => setSsgTarget("nextra")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      ssgTarget === "nextra"
                        ? "border-emerald-500 bg-emerald-500/10 text-white font-semibold"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    Nextra Docs
                  </button>
                  <button
                    type="button"
                    onClick={() => setSsgTarget("hugo")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      ssgTarget === "hugo"
                        ? "border-emerald-500 bg-emerald-500/10 text-white font-semibold"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    Hugo Static
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopySsg}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied SSG Code!" : "Copy to Clipboard"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportSsg}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          )}

          {/* --- TAB 7: SLIDE DECK MODE --- */}
          {activeTab === "slides" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Presentation className="w-4 h-4 text-sky-400" />
                  <span>Interactive Slide Deck & Offline HTML Deck</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Presents your document sections as clean slides with live interactive component execution, keyboard controls, and standalone offline presentation bundle export.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">Total Formatted Slides</span>
                  <p className="text-slate-500 text-[11px]">Calculated from headings and markdown section breaks.</p>
                </div>
                <span className="text-xl font-bold font-mono text-sky-400">{slidesCount}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportStandaloneDeck}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Offline HTML Deck</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLaunchSlideDeck();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Presentation className="w-4 h-4" />
                  <span>Launch In-App Deck</span>
                </button>
              </div>
            </div>
          )}

          {/* --- TAB 8: JUPYTER NOTEBOOK (.ipynb) --- */}
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

          {/* --- TAB 9: RAW MARKDOWN --- */}
          {activeTab === "markdown" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Clean Markdown Source</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Exports clean standard Markdown format. Compatible with GitHub, Obsidian, VS Code, and any Markdown editor.
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
        </div>
      </div>
    </div>
  );
}
